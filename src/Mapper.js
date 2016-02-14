import {
  _,
  addHiddenPropsToTarget,
  classCallCheck,
  copy,
  eventify,
  extend,
  fillIn,
  forEachRelation,
  forOwn,
  get,
  getSuper,
  isArray,
  isString,
  isUndefined,
  plainCopy,
  resolve,
  set
} from './utils'
import {
  belongsTo,
  hasMany,
  hasOne
} from './decorators'
import Record from './Record'
import Schema from './Schema'

// These strings are cached for optimal performance of the change detection
const changingPath = 'changing'
const changedPath = 'changed'
const creatingPath = 'creating'
const eventIdPath = 'eventId'
const noValidatePath = 'noValidate'
const silentPath = 'silent'
const validationFailureMsg = 'validation failed'

/**
 * Assemble a property descriptor which will be added to the prototype of
 * {@link Mapper#RecordClass}. This method is called when
 * {@link Mapper#applySchema} is set to `true`.
 *
 * @ignore
 */
const makeDescriptor = function (prop, schema) {
  const descriptor = {
    // These properties are enumerable by default, but regardless of their
    // enumerability, they won't be "own" properties of individual records
    enumerable: isUndefined(schema.enumerable) ? true : !!schema.enumerable
  }
  // Cache a few strings for optimal performance
  const keyPath = `props.${prop}`
  const previousPath = `previous.${prop}`
  const changesPath = `changes.${prop}`

  descriptor.get = function () {
    return this._get(keyPath)
  }
  descriptor.set = function (value) {
    const self = this
    // These are accessed a lot
    const _get = self._get
    const _set = self._set
    const _unset = self._unset

    // Optionally check that the new value passes validation
    if (!_get(noValidatePath)) {
      const errors = schema.validate(value)
      if (errors) {
        // Immediately throw an error, preventing the record from getting into
        // an invalid state
        const error = new Error(validationFailureMsg)
        error.errors = errors
        throw error
      }
    }
    // TODO: Make it so tracking can be turned on for all properties instead of
    // only per-property
    if (schema.track && !_get(creatingPath)) {
      const previous = _get(previousPath)
      const current = _get(keyPath)
      let changing = _get(changingPath)
      let changed = _get(changedPath)

      if (!changing) {
        // Track properties that are changing in the current event loop
        changed = []
      }

      // Add changing properties to this array once at most
      const index = changed.indexOf(prop)
      if (current !== value && index === -1) {
        changed.push(prop)
      }
      if (previous !== value) {
        // Value has changed
        _set(changesPath, value)
      } else {
        // Value is back to original, so "un-track" this property
        _unset(changesPath)
        if (index >= 0) {
          changed.splice(index, 1)
        }
      }
      // No changes in current event loop
      if (!changed.length) {
        changing = false
        _unset(changingPath)
        _unset(changedPath)
        // Cancel pending change event
        if (_get(eventIdPath)) {
          clearTimeout(_get(eventIdPath))
          _unset(eventIdPath)
        }
      }
      // Changes detected in current event loop
      if (!changing && changed.length) {
        _set(changedPath, changed)
        _set(changingPath, true)
        // Saving the timeout id allows us to batch all changes in the same
        // event loop into a single "change"
        // TODO: Optimize
        _set(eventIdPath, setTimeout(() => {
          // Previous event loop where changes were gathered has ended, so
          // notify any listeners of those changes and prepare for any new
          // changes
          _unset(changedPath)
          _unset(eventIdPath)
          _unset(changingPath)
          // TODO: Optimize
          if (!_get(silentPath)) {
            let i
            for (i = 0; i < changed.length; i++) {
              self.emit('change:' + changed[i], self, get(self, changed[i]))
            }
            self.emit('change', self, _get('changes'))
          }
          _unset(silentPath)
        }, 0))
      }
    }
    _set(keyPath, value)
    return value
  }

  return descriptor
}

/**
 * This changes properties defined in {@link Mapper#schema} from plain
 * properties to ES5 getter/setter properties, which makes possible change
 * tracking and validation on property assignment.
 *
 * @ignore
 */
const applySchema = function (schema, target) {
  const properties = schema.properties || {}
  forOwn(properties, function (schema, prop) {
    Object.defineProperty(
      target,
      prop,
      makeDescriptor(prop, schema)
    )
  })
}

const notify = function (...args) {
  const self = this
  const opts = args.pop()
  self.dbg(opts.op, ...args)
  if (opts.notify || (opts.notify === undefined && self.notify)) {
    setTimeout(() => {
      self.emit(opts.op, ...args)
    })
  }
}

const MAPPER_DEFAULTS = {
  /**
   * Hash of registered adapters. Don't modify. Use {@link Mapper#registerAdapter}.
   *
   * @name Mapper#_adapters
   * @private
   */
  _adapters: null,

  /**
   * Hash of registered listeners. Don't modify. Use {@link Mapper#on} and
   * {@link Mapper#off}.
   *
   * @name Mapper#_listeners
   * @private
   */
  _listeners: null,

  /**
   * Whether to augment {@link Mapper#RecordClass} with getter/setter property
   * accessors according to the properties defined in {@link Mapper#schema}.
   * This makes possible validation and change tracking on individual properties
   * when using the dot (e.g. `user.name = "Bob"`) operator to modify a
   * property.
   *
   * @name Mapper#applySchema
   * @type {boolean}
   * @default true
   */
  applySchema: true,

  /**
   * The name of the registered adapter that this Mapper should used by default.
   *
   * @name Mapper#defaultAdapter
   * @type {string}
   * @default "http"
   */
  defaultAdapter: 'http',

  /**
   * Whether to enable debug-level logs.
   *
   * @name Mapper#debug
   * @type {boolean}
   * @default false
   */
  debug: false,

  /**
   * The field used as the unique identifier on records handled by this Mapper.
   *
   * @name Mapper#idAttribute
   * @type {string}
   * @default id
   */
  idAttribute: 'id',

  /**
   * Minimum amount of meta information required to start operating against a
   * resource.
   *
   * @name Mapper#name
   * @type {string}
   */
  name: null,

  /**
   * Whether this Mapper should emit operational events.
   *
   * @name Mapper#notify
   * @type {boolean}
   * @default true
   */
  notify: true,

  /**
   * Whether {@link Mapper#create}, {@link Mapper#createMany}, {@link Mapper#save},
   * {@link Mapper#update}, {@link Mapper#updateAll}, {@link Mapper#updateMany},
   * {@link Mapper#find}, {@link Mapper#findAll}, {@link Mapper#destroy}, and
   * {@link Mapper#destroyAll} should return a raw result object that contains
   * both the instance data returned by the adapter _and_ metadata about the
   * operation.
   *
   * The default is to NOT return the result object, and instead return just the
   * instance data.
   *
   * @name Mapper#raw
   * @type {boolean}
   * @default false
   */
  raw: false,

  /**
   * Set the `false` to force the Mapper to work with POJO objects only.
   *
   * ```javascript
   * import {Mapper, Record} from 'js-data'
   * const UserMapper = new Mapper({ RecordClass: false })
   * UserMapper.RecordClass // false
   * const user = UserMapper#createRecord()
   * user instanceof Record // false
   * ```
   *
   * Set to a custom class to have records wrapped in your custom class.
   *
   * ```javascript
   * import {Mapper, Record} from 'js-data'
   *  // Custom class
   * class User {
   *   constructor (props = {}) {
   *     for (var key in props) {
   *       if (props.hasOwnProperty(key)) {
   *         this[key] = props[key]
   *       }
   *     }
   *   }
   * }
   * const UserMapper = new Mapper({ RecordClass: User })
   * UserMapper.RecordClass // function User() {}
   * const user = UserMapper#createRecord()
   * user instanceof Record // false
   * user instanceof User // true
   * ```
   *
   * Extend the {@link Record} class.
   *
   * ```javascript
   * import {Mapper, Record} from 'js-data'
   *  // Custom class
   * class User extends Record {
   *   constructor () {
   *     super(props)
   *   }
   * }
   * const UserMapper = new Mapper({ RecordClass: User })
   * UserMapper.RecordClass // function User() {}
   * const user = UserMapper#createRecord()
   * user instanceof Record // true
   * user instanceof User // true
   * ```
   *
   * @name Mapper#RecordClass
   * @default {@link Record}
   */
  RecordClass: undefined,

  schema: null,

  /**
   * Whether {@link Mapper#create} and {@link Mapper#createMany} should instead
   * call {@link Mapper#update} and {@link Mapper#updateMany} if the provided
   * record(s) already contain a primary key.
   *
   * @name Mapper#upsert
   * @type {boolean}
   * @default true
   */
  upsert: true
}

/**
 * ```javascript
 * import {Mapper} from 'js-data'
 * ```
 *
 * The core of JSData's [ORM/ODM][orm] implementation. Given a minimum amout of
 * meta information about a resource, a Mapper can perform generic CRUD
 * operations against that resource. Apart from its configuration, a Mapper is
 * stateless. The particulars of various persistence layers has been abstracted
 * into adapters, which a Mapper uses to perform its operations.
 *
 * The term "Mapper" comes from the [Data Mapper Pattern][pattern] described in
 * Martin Fowler's [Patterns of Enterprise Application Architecture][book]. A
 * Data Mapper moves data between [in-memory object instances][record] and a
 * relational or document-based database. JSData's Mapper can work with any
 * persistence layer you can write an adapter for.
 *
 * _("Model" is a heavily overloaded term and is avoided in this documentation
 * to prevent confusion.)_
 *
 * [orm]: https://en.wikipedia.org/wiki/Object-relational_mapping
 * [pattern]: https://en.wikipedia.org/wiki/Data_mapper_pattern
 * [book]: http://martinfowler.com/books/eaa.html
 * [record]: Record.html
 *
 * @class Mapper
 * @param {Object} [opts] Configuration options.
 */
export default function Mapper (opts) {
  const self = this
  classCallCheck(self, Mapper)

  opts || (opts = {})
  fillIn(self, opts)
  fillIn(self, copy(MAPPER_DEFAULTS))

  if (!self.name) {
    throw new Error('mapper cannot function without a name!')
  }

  self._adapters || (self._adapters = {})
  self._listeners || (self._listeners = {})

  if (!(self.schema instanceof Schema)) {
    self.schema = new Schema(self.schema || {})
  }

  if (isUndefined(self.RecordClass)) {
    self.RecordClass = Record.extend()
  }

  if (self.RecordClass) {
    self.RecordClass.Mapper = self

    // We can only apply the schema to the prototype of self.RecordClass if the
    // class extends Record
    if (getSuper(self.RecordClass, true) === Record && self.applySchema) {
      applySchema(self.schema, self.RecordClass.prototype)
    }
  }
}

/**
 * Instance members
 */
addHiddenPropsToTarget(Mapper.prototype, {
  /**
   * TODO
   *
   * @name Mapper#end
   * @method
   */
  end (data, opts) {
    const self = this
    if (opts.raw) {
      _(opts, data)
    }
    let _data = opts.raw ? data.data : data
    if (isArray(_data)) {
      _data = _data.map(function (item) {
        return self.createRecord(item)
      })
    } else {
      _data = self.createRecord(_data)
    }
    if (opts.raw) {
      data.data = _data
    } else {
      data = _data
    }
    if (opts.notify) {
      setTimeout(function () {
        self.emit(opts.op, data, opts)
      })
    }
    return data
  },

  /**
   * Create an unsaved, uncached instance of this Mapper's
   * {@link Mapper#RecordClass}.
   *
   * Returns `props` if `props` is already an instance of
   * {@link Mapper#RecordClass}.
   *
   * @name Mapper#createRecord
   * @method
   * @param {Object} props The initial properties of the new unsaved record.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
   * initial properties.
   * @return {Object} The unsaved record.
   */
  createRecord (props, opts) {
    const RecordClass = this.RecordClass
    // Check to make sure "props" is not already an instance of this Mapper.
    return RecordClass ? (props instanceof RecordClass ? props : new RecordClass(props, opts)) : props
  },

  /**
   * Return whether `record` is an instance of this Mappers's RecordClass.
   *
   * @name Mapper#is
   * @method
   * @param {Object} record The record to check.
   * @return {boolean} Whether `record` is an instance of this Mappers's
   * {@ link Mapper#RecordClass}.
   */
  is (record) {
    const RecordClass = this.RecordClass
    return RecordClass ? record instanceof RecordClass : false
  },

  /**
   * Return a plain object representation of the given record.
   *
   * @name Mapper#toJSON
   * @method
   * @param {Object} record Record from which to create a plain object
   * representation.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Array of relation names or relation fields
   * to include in the representation.
   * @return {Object} Plain object representation of the record.
   */
  toJSON (record, opts) {
    const self = this
    opts || (opts = {})
    let json = {}
    let properties
    if (self.schema) {
      properties = self.schema.properties || {}
      // TODO: Make this work recursively
      forOwn(properties, function (opts, prop) {
        json[prop] = plainCopy(record[prop])
      })
    }
    properties || (properties = {})
    if (!opts.strict) {
      forOwn(record, function (value, key) {
        if (!properties[key]) {
          json[key] = plainCopy(value)
        }
      })
    }
    if (self.is(record)) {
      // The user wants to include relations in the resulting plain object
      // representation
      if (self && self.relationList && opts.with) {
        if (isString(opts.with)) {
          opts.with = [opts.with]
        }
        forEachRelation(self, opts, function (def, __opts) {
          const relationData = get(record, def.localField)

          if (relationData) {
            // The actual recursion
            if (isArray(relationData)) {
              set(json, def.localField, relationData.map(function (item) {
                return def.getRelation().toJSON(item, __opts)
              }))
            } else {
              set(json, def.localField, def.getRelation().toJSON(relationData, __opts))
            }
          }
        })
      }
    }
    return json
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @name Mapper#getAdapter
   * @method
   * @param {string} [name] The name of the adapter to retrieve.
   * @return {Adapter} The adapter.
   */
  getAdapter (name) {
    const self = this
    self.dbg('getAdapter', 'name:', name)
    const adapter = self.getAdapterName(name)
    if (!adapter) {
      throw new ReferenceError(`${adapter} not found!`)
    }
    return self.getAdapters()[adapter]
  },

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided.
   *
   * @name Mapper#getAdapterName
   * @method
   * @param {(Object|string)} [opts] The name of an adapter or options, if any.
   * @return {string} The name of the adapter.
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  },

  /**
   * @name Mapper#getAdapters
   * @method
   */
  getAdapters () {
    return this._adapters
  },

  getSchema () {
    return this.schema
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#create}. If this method
   * returns a promise then {@link Mapper#create} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeCreate
   * @method
   * @param {Object} props The `props` argument passed to {@link Mapper#create}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
   */
  beforeCreate: notify,

  checkUpsertCreate (props, opts) {
    const self = this
    return (opts.upsert || (opts.upsert === undefined && self.upsert)) &&
          get(props, self.idAttribute)
  },

  /**
   * Create and save a new the record using the provided `props`.
   *
   * {@link Mapper#beforeCreate} will be called before calling the adapter.
   * {@link Mapper#afterCreate} will be called after calling the adapter.
   *
   * @name Mapper#create
   * @method
   * @param {Object} props The properties for the new record.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * created data. If `true` return a response object that includes the created
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading
   * create if `props` contains nested relations. NOT performed in a transaction.
   * @return {Promise}
   */
  create (props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Check whether we should do an upsert instead
    if (self.checkUpsertCreate(props, opts)) {
      return self.update(get(props, self.idAttribute), props, opts)
    }

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeCreate lifecycle hook
    op = opts.op = 'beforeCreate'
    return resolve(self[op](props, opts)).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = _props || props
      // Now delegate to the adapter
      op = opts.op = 'create'
      const json = self.toJSON(props, opts)
      self.dbg(op, json, opts)
      return resolve(self.getAdapter(adapter)[op](self, json, opts))
    }).then(function (data) {
      // afterCreate lifecycle hook
      op = opts.op = 'afterCreate'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#create}. If this method
   * returns a promise then {@link Mapper#create} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterCreate
   * @method
   * @param {Object} data The `data` return by the adapter.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
   */
  afterCreate: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
   * returns a promise then {@link Mapper#createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeCreateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
   */
  beforeCreateMany: notify,

  checkUpsertCreateMany (records, opts) {
    const self = this
    if (opts.upsert || (opts.upsert === undefined && self.upsert)) {
      return records.reduce(function (hasId, item) {
        return hasId && get(item, self.idAttribute)
      }, true)
    }
  },

  /**
   * Given an array of records, batch create them via an adapter.
   *
   * {@link Mapper#beforeCreateMany} will be called before calling the adapter.
   * {@link Mapper#afterCreateMany} will be called after calling the adapter.
   *
   * @name Mapper#createMany
   * @method
   * @param {Array} records Array of records to be created in one batch.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading create
   * if the records to be created have linked/nested relations. NOT performed
   * in a transaction.
   * @return {Promise}
   */
  createMany (records, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    records || (records = [])
    opts || (opts = {})

    // Check whether we should do an upsert instead
    if (self.checkUpsertCreateMany(records, opts)) {
      return self.updateMany(records, opts)
    }

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeCreateMany lifecycle hook
    op = opts.op = 'beforeCreateMany'
    return resolve(self[op](records, opts))
      .then(function (_records) {
        // Allow for re-assignment from lifecycle hook
        records = _records || records
        // Now delegate to the adapter
        op = opts.op = 'createMany'
        const json = records.map(function (item) {
          return self.toJSON(item, opts)
        })
        self.dbg(op, json, opts)
        return resolve(self.getAdapter(adapter)[op](self, json, opts))
      }).then(function (data) {
        // afterCreateMany lifecycle hook
        op = opts.op = 'afterCreateMany'
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data
          // Possibly inject result and/or formulate result object
          return self.end(data, opts)
        })
      })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
   * returns a promise then {@link Mapper#createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterCreateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
   */
  afterCreateMany: notify,

  /**
   * Mappers lifecycle hook called by {@link Mapper#find}. If this method
   * returns a promise then {@link Mapper#find} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeFind
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
   */
  beforeFind: notify,

  /**
   * Retrieve via an adapter the record with the given primary key.
   *
   * {@link Mapper#beforeFind} will be called before calling the adapter.
   * {@link Mapper#afterFind} will be called after calling the adapter.
   *
   * @name Mapper#find
   * @method
   * @param {(string|number)} id The primary key of the record to retrieve.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   * @return {Promise}
   */
  find (id, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Mappers's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeFind lifecycle hook
    op = opts.op = 'beforeFind'
    return resolve(self[op](id, opts)).then(function (_id) {
      // Allow for re-assignment from lifecycle hook
      id = _id === undefined ? id : _id
      // Now delegate to the adapter
      op = opts.op = 'find'
      self.dbg(op, id, opts)
      return resolve(self.getAdapter(adapter)[op](self, id, opts))
    }).then(function (data) {
      // afterFind lifecycle hook
      op = opts.op = 'afterFind'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#find}. If this method
   * returns a promise then {@link Mapper#find} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterFind
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
   */
  afterFind: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
   * returns a promise then {@link Mapper#findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeFindAll
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
   */
  beforeFindAll: notify,

  /**
   * Using the `query` argument, select records to pull from an adapter.
   * Expects back from the adapter the array of selected records.
   *
   * {@link Mapper#beforeFindAll} will be called before calling the adapter.
   * {@link Mapper#afterFindAll} will be called after calling the adapter.
   *
   * @name Mapper#findAll
   * @method
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * resulting data. If `true` return a response object that includes the
   * resulting data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   * @return {Promise}
   */
  findAll (query, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeFindAll lifecycle hook
    op = opts.op = 'beforeFindAll'
    return resolve(self[op](query, opts)).then(function (_query) {
      // Allow for re-assignment from lifecycle hook
      query = _query || query
      // Now delegate to the adapter
      op = opts.op = 'findAll'
      self.dbg(op, query, opts)
      return resolve(self.getAdapter(adapter)[op](self, query, opts))
    }).then(function (data) {
      // afterFindAll lifecycle hook
      op = opts.op = 'afterFindAll'
      return resolve(self[op](data, query, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
   * returns a promise then {@link Mapper#findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterFindAll
   * @method
   * @param {Object} data The `data` returned by the adapter.
   * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
   */
  afterFindAll: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#update}. If this method
   * returns a promise then {@link Mapper#update} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeUpdate
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
   * @param {props} props The `props` argument passed to {@link Mapper#update}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
   */
  beforeUpdate: notify,

  /**
   * Using an adapter, update the record with the primary key specified by the
   * `id` argument.
   *
   * {@link Mapper#beforeUpdate} will be called before updating the record.
   * {@link Mapper#afterUpdate} will be called after updating the record.
   *
   * @name Mapper#update
   * @method
   * @param {(string|number)} id The primary key of the record to update.
   * @param {Object} props The update to apply to the record.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   * @return {Promise}
   */
  update (id, props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeUpdate lifecycle hook
    op = opts.op = 'beforeUpdate'
    return resolve(self[op](id, props, opts)).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = _props || props
      // Now delegate to the adapter
      op = opts.op = 'update'
      const json = self.toJSON(props, opts)
      self.dbg(op, id, json, opts)
      return resolve(self.getAdapter(adapter)[op](self, id, json, opts))
    }).then(function (data) {
      // afterUpdate lifecycle hook
      op = opts.op = 'afterUpdate'
      return resolve(self[op](id, data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#update}. If this method
   * returns a promise then {@link Mapper#update} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterUpdate
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
   * @param {props} props The `props` argument passed to {@link Mapper#update}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
   */
  afterUpdate: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
   * returns a promise then {@link Mapper#updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeUpdateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
   */
  beforeUpdateMany: notify,

  /**
   * Given an array of updates, perform each of the updates via an adapter. Each
   * "update" is a hash of properties with which to update an record. Each
   * update must contain the primary key to be updated.
   *
   * {@link Mapper#beforeUpdateMany} will be called before making the update.
   * {@link Mapper#afterUpdateMany} will be called after making the update.
   *
   * @name Mapper#updateMany
   * @method
   * @param {Array} records Array up record updates.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if each record update contains nested updates for relations. NOT
   * performed in a transaction.
   * @return {Promise}
   */
  updateMany (records, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    records || (records = [])
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeUpdateMany lifecycle hook
    op = opts.op = 'beforeUpdateMany'
    return resolve(self[op](records, opts)).then(function (_records) {
      // Allow for re-assignment from lifecycle hook
      records = _records || records
      // Now delegate to the adapter
      op = opts.op = 'updateMany'
      const json = records.map(function (item) {
        return self.toJSON(item, opts)
      })
      self.dbg(op, json, opts)
      return resolve(self.getAdapter(adapter)[op](self, json, opts))
    }).then(function (data) {
      // afterUpdateMany lifecycle hook
      op = opts.op = 'afterUpdateMany'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
   * returns a promise then {@link Mapper#updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterUpdateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
   */
  afterUpdateMany: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
   * returns a promise then {@link Mapper#updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeUpdateAll
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
   * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
   */
  beforeUpdateAll: notify,

  /**
   * Using the `query` argument, perform the a single updated to the selected
   * records. Expects back from the adapter an array of the updated records.
   *
   * {@link Mapper#beforeUpdateAll} will be called before making the update.
   * {@link Mapper#afterUpdateAll} will be called after making the update.
   *
   * @name Mapper#updateAll
   * @method
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} props Update to apply to selected records.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   * @return {Promise}
   */
  updateAll (query, props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeUpdateAll lifecycle hook
    op = opts.op = 'beforeUpdateAll'
    return resolve(self[op](query, props, opts)).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = _props || props
      // Now delegate to the adapter
      op = opts.op = 'updateAll'
      const json = self.toJSON(props, opts)
      self.dbg(op, query, json, opts)
      return resolve(self.getAdapter(adapter)[op](self, query, json, opts))
    }).then(function (data) {
      // afterUpdateAll lifecycle hook
      op = opts.op = 'afterUpdateAll'
      return resolve(self[op](query, data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
   * returns a promise then {@link Mapper#updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterUpdateAll
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
   * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
   */
  afterUpdateAll: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
   * returns a promise then {@link Mapper#destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeDestroy
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
   */
  beforeDestroy: notify,

  /**
   * Using an adapter, destroy the record with the primary key specified by the
   * `id` argument.
   *
   * {@link Mapper#beforeDestroy} will be called before destroying the record.
   * {@link Mapper#afterDestroy} will be called after destroying the record.
   *
   * @name Mapper#destroy
   * @method
   * @param {(string|number)} id The primary key of the record to destroy.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   * @return {Promise}
   */
  destroy (id, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeDestroy lifecycle hook
    op = opts.op = 'beforeDestroy'
    return resolve(self[op](id, opts)).then(function (_id) {
      // Allow for re-assignment from lifecycle hook
      id = _id === undefined ? id : _id
      // Now delegate to the adapter
      op = opts.op = 'destroy'
      self.dbg(op, id, opts)
      return resolve(self.getAdapter(adapter)[op](self, id, opts))
    }).then(function (data) {
      // afterDestroy lifecycle hook
      op = opts.op = 'afterDestroy'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          _(opts, data)
          return data
        }
        return data
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
   * returns a promise then {@link Mapper#destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterDestroy
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
   */
  afterDestroy: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
   * returns a promise then {@link Mapper#destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeDestroyAll
   * @method
   * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
   */
  beforeDestroyAll: notify,

  /**
   * Using the `query` argument, destroy the selected records via an adapter.
   * If no `query` is provided then all records will be destroyed.
   *
   * {@link Mapper#beforeDestroyAll} will be called before destroying the records.
   * {@link Mapper#afterDestroyAll} will be called after destroying the records.
   *
   * @name Mapper#destroyAll
   * @method
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   * @return {Promise}
   */
  destroyAll (query, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    _(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeDestroyAll lifecycle hook
    op = opts.op = 'beforeDestroyAll'
    return resolve(self[op](query, opts)).then(function (_query) {
      // Allow for re-assignment from lifecycle hook
      query = _query || query
      // Now delegate to the adapter
      op = opts.op = 'destroyAll'
      self.dbg(op, query, opts)
      return resolve(self.getAdapter(adapter)[op](self, query, opts))
    }).then(function (data) {
      // afterDestroyAll lifecycle hook
      op = opts.op = 'afterDestroyAll'
      return resolve(self[op](data, query, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          _(opts, data)
          return data
        }
        return data
      })
    })
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
   * returns a promise then {@link Mapper#destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterDestroyAll
   * @method
   * @param {*} data The `data` returned by the adapter.
   * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
   */
  afterDestroyAll: notify,

  /**
   * @name Mapper#log
   * @method
   */
  log (level, ...args) {
    if (level && !args.length) {
      args.push(level)
      level = 'debug'
    }
    if (level === 'debug' && !this.debug) {
      return
    }
    const prefix = `${level.toUpperCase()}: (${this.name || 'mapper'})`
    if (console[level]) {
      console[level](prefix, ...args)
    } else {
      console.log(prefix, ...args)
    }
  },

  /**
   * @name Mapper#dbg
   * @method
   */
  dbg (...args) {
    this.log('debug', ...args)
  },

  /**
   * Usage:
   *
   * Post.belongsTo(User, {
   *   localKey: 'myUserId'
   * })
   *
   * Comment.belongsTo(User)
   * Comment.belongsTo(Post, {
   *   localField: '_post'
   * })
   *
   * @name Mapper#belongsTo
   * @method
   */
  belongsTo (RelatedMapper, opts) {
    return belongsTo(RelatedMapper, opts)(this)
  },

  /**
   * Usage:
   *
   * User.hasMany(Post, {
   *   localField: 'my_posts'
   * })
   *
   * @name Mapper#hasMany
   * @method
   */
  hasMany (RelatedMapper, opts) {
    return hasMany(RelatedMapper, opts)(this)
  },

  /**
   * Usage:
   *
   * User.hasOne(Profile, {
   *   localField: '_profile'
   * })
   *
   * @name Mapper#hasOne
   * @method
   */
  hasOne (RelatedMapper, opts) {
    return hasOne(RelatedMapper, opts)(this)
  },

  /**
   * Register an adapter on this mapper under the given name.
   *
   * @name Mapper#registerAdapter
   * @method
   * @param {string} name The name of the adapter to register.
   * @param {Adapter} adapter The adapter to register.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.default=false] Whether to make the adapter the
   * default adapter for this Mapper.
   */
  registerAdapter (name, adapter, opts) {
    const self = this
    opts || (opts = {})
    self.getAdapters()[name] = adapter
    // Optionally make it the default adapter for the target.
    if (opts === true || opts.default) {
      self.defaultAdapter = name
    }
  }
})

/**
 * Create a Mapper subclass.
 *
 * ```javascript
 * var MyMapper = Mapper.extend({
 *   foo: function () { return 'bar' }
 * })
 * var mapper = new MyMapper()
 * mapper.foo() // "bar"
 * ```
 *
 * @name Mapper.extend
 * @method
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @return {Function} Subclass of Mapper.
 */
Mapper.extend = extend

/**
 * Register a new event listener on this Mapper.
 *
 * @name Mapper#on
 * @method
 */

/**
 * Remove an event listener from this Mapper.
 *
 * @name Mapper#off
 * @method
 */

/**
 * Trigger an event on this Mapper.
 *
 * @name Mapper#emit
 * @method
 * @param {string} event Name of event to emit.
 */

/**
 * A Mapper's registered listeners are stored at {@link Mapper#_listeners}.
 */
eventify(
  Mapper.prototype,
  function () {
    return this._listeners
  },
  function (value) {
    this._listeners = value
  }
)
