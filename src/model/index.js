import * as utils from '../utils'
import {
  belongsTo,
  configure,
  hasMany,
  hasOne,
  setSchema,
  registerAdapter
} from '../decorators/index'
import * as validate from '../validate/index'

const {
  resolve
} = utils

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

/**
 * js-data's Model class.
 * @class Model
 * @example {@lang javascript}class User extends Model {}
 *
 * @abstract
 * @param {Object} [props] The initial properties of the new instance.
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
 * initial properties.
 */
export function Model (props, opts) {
  const self = this
  utils.classCallCheck(self, Model)

  props || (props = {})
  opts || (opts = {})
  const _props = {}
  Object.defineProperties(self, {
    _get: {
      value (key) {
        return utils.get(_props, key)
      }
    },
    _set: {
      value (key, value) {
        return utils.set(_props, key, value)
      }
    },
    _unset: {
      value (key) {
        return utils.unset(_props, key)
      }
    }
  })
  self._set('creating', true)
  if (opts.noValidate) {
    self._set('noValidate', true)
  }
  utils.fillIn(self, props)
  self._unset('creating')
  self._set('changes', {})
  self._unset('noValidate')
  self._set('previous', utils.copy(props))
}

/**
 * Instance members
 */
utils.addHiddenPropsToTarget(Model.prototype, {
  schema (key) {
    let _schema = this.constructor.schema
    return key ? _schema[key] : _schema
  },

  validate (obj, value) {
    let errors = []
    let _schema = this.schema()
    if (!obj) {
      obj = this
    } else if (utils.isString(obj)) {
      const prop = _schema[obj]
      if (prop) {
        errors = validate.validate(prop, value) || []
      }
    } else {
      utils.forOwn(_schema, function (prop, key) {
        errors = errors.concat(validate.validate(prop, utils.get(obj, key)) || [])
      })
    }
    return errors.length ? errors : undefined
  },

  /**
   * @param {Object} [opts] Configuration options. @see {@link Model.create}.
   */
  create (opts) {
    return this.constructor.create(this, opts)
  },

  beforeSave () {},
  save (opts) {
    let op, adapter
    const self = this
    const Ctor = self.constructor

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeSave lifecycle hook
    op = opts.op = 'beforeSave'
    return resolve(self[op](opts)).then(function () {
      // Now delegate to the adapter
      op = opts.op = 'save'
      Ctor.dbg(op, self, opts)
      return self.getAdapter(adapter)[op](Ctor, self, opts)
    }).then(function (data) {
      // afterSave lifecycle hook
      op = opts.op = 'afterSave'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          self.set(data.data)
          data.data = self
        } else {
          self.set(data)
        }
        return Ctor.end(data, opts)
      })
    })
  },
  afterSave () {},

  beforeLoadRelations () {},
  loadRelations (relations, opts) {
    let op
    const self = this
    const Ctor = self.constructor
    const relationList = Ctor.relationList || []

    // Default values for arguments
    relations || (relations = [])
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(Ctor, opts)
    opts.adapter = Ctor.getAdapterName(opts)

    // beforeLoadRelations lifecycle hook
    op = opts.op = 'beforeLoadRelations'
    return resolve(self[op](relations, opts)).then(function () {
      if (utils.isString(relations)) {
        relations = [relations]
      }
      // Now delegate to the adapter
      op = opts.op = 'loadRelations'
      Ctor.dbg(op, self, relations, opts)
      return Promise.all(relationList.map(function (def) {
        if (utils.isFunction(def.load)) {
          return def.load(Ctor, def, self, opts)
        }
        let task
        if (def.type === 'hasMany' && def.foreignKey) {
          // hasMany
          task = def.Relation.findAll({
            [def.foreignKey]: utils.get(self, Ctor.idAttribute)
          }, opts)
        } else if (def.foreignKey) {
          // belongsTo or hasOne
          const key = utils.get(self, def.foreignKey)
          if (utils.isSorN(key)) {
            task = def.Relation.find(key, opts)
          }
        } else if (def.localKeys) {
          // hasMany
          task = def.Relation.findAll({
            [def.Relation.idAttribute]: {
              'in': utils.get(self, def.localKeys)
            }
          }, opts)
        } else if (def.foreignKeys) {
          // hasMany
          task = def.Relation.findAll({
            [def.Relation.idAttribute]: {
              'contains': utils.get(self, Ctor.idAttribute)
            }
          }, opts)
        }
        if (task) {
          task = task.then(function (data) {
            if (opts.raw) {
              data = data.data
            }
            utils.set(self, def.localField, def.type === 'hasOne' ? (data.length ? data[0] : undefined) : data)
          })
        }
        return task
      }))
    }).then(function () {
      // afterLoadRelations lifecycle hook
      op = opts.op = 'afterLoadRelations'
      return resolve(self[op](relations, opts)).then(function () {
        return self
      })
    })
  },
  afterLoadRelations () {},

  /**
   * @param {Object} [opts] Configuration options. @see {@link Model.destroy}.
   */
  destroy (opts) {
    // TODO: move actual destroy logic here
    const Ctor = this.constructor
    return Ctor.destroy(utils.get(this, Ctor.idAttribute), opts)
  },

  // TODO: move logic for single-item async operations onto the instance.

  /**
   * Return the value at the given path for this instance.
   *
   * @param {string} key - Path of value to retrieve.
   * @return {*} Value at path.
   */
  get: function (key) {
    return utils.get(this, key)
  },

  /**
   * Set the value for a given key, or the values for the given keys if "key" is
   * an object.
   *
   * @param {(string|Object)} key - Key to set or hash of key-value pairs to set.
   * @param {*} [value] - Value to set for the given key.
   * @param {Object} [opts] - Optional configuration.
   * @param {boolean} [opts.silent=false] - Whether to trigger change events.
   */
  set: function (key, value, opts) {
    const self = this
    if (utils.isObject(key)) {
      opts = value
    }
    opts || (opts = {})
    if (opts.silent) {
      self._set('silent', true)
    }
    utils.set(self, key, value)
    if (!self._get('eventId')) {
      self._unset('silent')
    }
  },

  /**
   * Unset the value for a given key.
   *
   * @param {string} key - Key to unset.
   * @param {Object} [opts] - Optional configuration.
   * @param {boolean} [opts.silent=false] - Whether to trigger change events.
   */
  unset (key, opts) {
    opts || (opts = {})
    if (opts.silent) {
      this._set('silent', true)
    }
    utils.unset(this, key)
    if (!this._get('eventId')) {
      this._unset('silent')
    }
  },

  hashCode () {
    return utils.get(this, this.constructor.idAttribute)
  },

  changes (key) {
    if (key) {
      return this._get(`changes.${key}`)
    }
    return this._get('changes')
  },

  hasChanges () {
    return !!(this._get('changed') || []).length
  },

  commit () {
    this._unset('changed')
    this._set('changes', {})
    this._set('previous', utils.copy(this))
    return this
  },

  previous (key) {
    if (key) {
      return this._get(`previous.${key}`)
    }
    return this._get('previous')
  },

  revert (opts) {
    const previous = this._get('previous') || {}
    opts || (opts = {})
    opts.preserve || (opts.preserve = [])
    utils.forOwn(this, (value, key) => {
      if (key !== this.constructor.idAttribute && !previous.hasOwnProperty(key) && this.hasOwnProperty(key) && opts.preserve.indexOf(key) === -1) {
        delete this[key]
      }
    })
    utils.forOwn(previous, (value, key) => {
      if (opts.preserve.indexOf(key) === -1) {
        this[key] = value
      }
    })
    this.commit()
    return this
  },

  toJSON (opts) {
    return this.constructor.toJSON(this, opts)
  }
})

/**
 * Static members
 */
utils.fillIn(Model, {
  /**
   * Hash of registered adapters. Don't modify. Use {@link Model.registerAdapter}.
   *
   * @memberOf Model
   * @private
   */
  _adapters: null,

  /**
   * @ignore
   */
  _adaptersOwner: null,

  /**
   * Hash of registered listeners. Don't modify. Use {@link Model.on} and
   * {@link Model.off}.
   *
   * @memberOf Model
   * @private
   */
  _listeners: null,

  /**
   * @ignore
   */
  _listenersOwner: null,

  /**
   * Whether to disallow the use of `new Function` in {@link Model.extend}.
   *
   * You may set this to `true` if you so desire, but the class (constructor
   * function) produced by {@link Model.extend} will not be a named function,
   * which makes for slightly less debuggability.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  csp: false,

  /**
   * The name of the registered adapter that should be used by default by any
   * of the Model's static methods that use an adapter.
   *
   * @memberof Model
   * @type {string}
   * @default http
   */
  defaultAdapter: 'http',

  /**
   * Whether to enable debug-level logs.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  debug: false,

  /**
   * The field on instances of {@link Model} that should be used as the unique
   * identifier for instances of the Model.
   *
   * @memberof Model
   * @type {string}
   * @default id
   */
  idAttribute: 'id',

  /**
   * Whether this Model should emit operational events.
   *
   * @memberof Model
   * @type {boolean}
   * @default true
   */
  notify: true,

  pojo: false,

  /**
   * Whether the relation property accessors should be enumerable. It's
   * recommended that this stay false.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  relationsEnumerable: false,

  /**
   * Whether {@link Model.create}, {@link Model.createMany}, {@link Model.save},
   * {@link Model.update}, {@link Model.updateAll}, {@link Model.updateMany},
   * {@link Model.find}, {@link Model.findAll}, {@link Model.destroy}, and
   * {@link Model.destroyAll} should return a raw result object that contains
   * both the instance data returned by the adapter _and_ metadata about the
   * operation.
   *
   * The default is to NOT return the result object, and instead return just the
   * instance data.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  raw: false,

  /**
   * Whether {@link Model.create} and {@link Model.createMany} should instead
   * call {@link Model.update} and {@link Model.updateMany} if the provided
   * props/entities already contain a primary key.
   *
   * @memberof Model
   * @type {boolean}
   * @default true
   */
  upsert: true,

  /**
   * @memberOf Model
   * @method
   * @private
   */
  _events (value) {
    if (value) {
      this._listeners = value
    } else if (this._listenersOwner !== this) {
      this._listeners = {}
      this._listenersOwner = this
    }
    return this._listeners
  },

  end (data, opts) {
    const self = this
    if (opts.raw) {
      utils._(opts, data)
    }
    if (!opts.pojo) {
      let _data = opts.raw ? data.data : data
      if (utils.isArray(_data)) {
        _data = _data.map(function (item) {
          return self.createInstance(item)
        })
      } else {
        _data = self.createInstance(_data)
      }
      if (opts.raw) {
        data.data = _data
      } else {
        data = _data
      }
    }
    if (opts.notify) {
      setTimeout(function () {
        self.emit(opts.op, data, opts)
      })
    }
    return data
  },

  /**
   * Return new instance of this Model from the given properties. Equivalent to
   * `new Model([props][, opts])`. Returns `props` if `props` is already an
   * instance of this Model.
   *
   * @memberof Model
   * @method
   * @param {Object} props - The initial properties of the new instance.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
   * initial properties.
   * @return {Model} The instance.
   */
  createInstance (props, opts) {
    let Ctor = this
    // Check to make sure "props" is not already an instance of this Model.
    return props instanceof Ctor ? props : new Ctor(props, opts)
  },

  /**
   * Return whether `instance` is an instance of this Model's instance class.
   *
   * @memberof Model
   * @method
   * @param {Object} instance - The instance to check.
   * @return {boolean} Whether `instance` is an instance of this Model's
   * instance class.
   */
  is (instance, modelOnly) {
    const self = this
    return self.instanceClass && !modelOnly ? instance instanceof self.instanceClass : instance instanceof self
  },

  /**
   * Return a plain object representation of the given entity.
   *
   * @memberOf Model
   * @method
   * @param {Object} - Entity of which to return the plain
   * representation.
   * @param {Object} [opts] - Configuration options.
   * @param {string[]} [opts.with] - Array of relation names or relation fields
   * to include in the representation.
   * @return {Object} Plain object representation of instance.
   */
  toJSON (data, opts) {
    const self = this
    opts || (opts = {})
    let json = data
    if (self.is(data)) {
      json = {}
      for (var key in data) {
        json[key] = data[key]
      }
      // The user wants to include relations in the resulting plain object
      // representation
      if (self && self.relationList && opts.with) {
        if (utils.isString(opts.with)) {
          opts.with = [opts.with]
        }
        self.relationList.forEach(def => {
          let containedName
          if (opts.with.indexOf(def.relation) !== -1) {
            containedName = def.relation
          } else if (opts.with.indexOf(def.localField) !== -1) {
            containedName = def.localField
          }
          if (containedName) {
            const optsCopy = { with: opts.with.slice() }

            // Prepare to recurse into deeply nested relations
            optsCopy.with.splice(optsCopy.with.indexOf(containedName), 1)
            optsCopy.with.forEach((relation, i) => {
              if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                optsCopy.with[i] = relation.substr(containedName.length + 1)
              } else {
                optsCopy.with[i] = ''
              }
            })
            const relationData = utils.get(data, def.localField)

            if (relationData) {
              // The actual recursion
              if (utils.isArray(relationData)) {
                utils.set(json, def.localField, relationData.map(item => def.Relation.toJSON(item, optsCopy)))
              } else {
                utils.set(json, def.localField, def.Relation.toJSON(relationData, optsCopy))
              }
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
   * @memberof Model
   * @method
   * @param {string} [name]- The name of the adapter to retrieve.
   * @return {Adapter} The adapter, if any.
   */
  getAdapter (name) {
    this.dbg('getAdapter', 'name:', name)
    const adapter = this.getAdapterName(name)
    if (!adapter) {
      throw new ReferenceError(`${adapter} not found!`)
    }
    return this.getAdapters()[adapter]
  },

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided.
   *
   * @memberof Model
   * @method
   * @param {(Object|string)} [opts] - The name of an adapter or options, if any.
   * @return {string} The name of the adapter.
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  },

  getAdapters () {
    if (this._adaptersOwner !== this) {
      const prevAdapters = this._adapters
      this._adapters = {}
      if (prevAdapters) {
        utils.fillIn(this._adapters, prevAdapters)
      }
      this._adaptersOwner = this
    }
    return this._adapters
  },

  /**
   * Model lifecycle hook called by {@link Model.create}. If this method
   * returns a promise then {@link Model.create} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} props - The `props` argument passed to {@link Model.create}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.create}.
   */
  beforeCreate: notify,

  checkUpsertCreate (props, opts) {
    const self = this
    return (opts.upsert || (opts.upsert === undefined && self.upsert)) &&
          utils.get(props, self.idAttribute)
  },

  /**
   * Using an adapter, create a new the entity from the provided `props`.
   *
   * {@link Model.beforeCreate} will be called before calling the adapter.
   * {@link Model.afterCreate} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {Object} props - The properties from which to create the entity.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * created data. If `true` return a response object that includes the created
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading
   * create if `props` contains nested relations. NOT performed in a transaction.
   */
  create (props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Check whether we should do an upsert instead
    if (self.checkUpsertCreate(props, opts)) {
      return self.update(utils.get(props, self.idAttribute), props, opts)
    }

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
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
      return self.getAdapter(adapter)[op](self, json, opts)
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
   * Model lifecycle hook called by {@link Model.create}. If this method
   * returns a promise then {@link Model.create} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} data - The `data` return by the adapter.
   * @param {Object} opts - The `opts` argument passed to {@link Model.create}.
   */
  afterCreate: notify,

  /**
   * Model lifecycle hook called by {@link Model.createMany}. If this method
   * returns a promise then {@link Model.createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.createMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.createMany}.
   */
  beforeCreateMany: notify,

  checkUpsertCreateMany (entities, opts) {
    const self = this
    if (opts.upsert || (opts.upsert === undefined && self.upsert)) {
      return entities.reduce(function (hasId, item) {
        return hasId && utils.get(item, self.idAttribute)
      }, true)
    }
  },

  /**
   * Given an array of entities, batch create them via an adapter.
   *
   * {@link Model.beforeCreateMany} will be called before calling the adapter.
   * {@link Model.afterCreateMany} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - Array up entities to be created.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading create
   * if the entities to be created have linked/nested relations. NOT performed
   * in a transaction.
   */
  createMany (entities, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    entities || (entities = [])
    opts || (opts = {})

    // Check whether we should do an upsert instead
    if (self.checkUpsertCreateMany(entities, opts)) {
      return self.updateMany(entities, opts)
    }

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeCreateMany lifecycle hook
    op = opts.op = 'beforeCreateMany'
    return resolve(self[op](entities, opts))
      .then(function (_entities) {
        // Allow for re-assignment from lifecycle hook
        entities = _entities || entities
        // Now delegate to the adapter
        op = opts.op = 'createMany'
        const json = entities.map(function (item) {
          return self.toJSON(item, opts)
        })
        self.dbg(op, json, opts)
        return self.getAdapter(adapter)[op](self, json, opts)
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
   * Model lifecycle hook called by {@link Model.createMany}. If this method
   * returns a promise then {@link Model.createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.createMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.createMany}.
   */
  afterCreateMany: notify,

  /**
   * Model lifecycle hook called by {@link Model.find}. If this method
   * returns a promise then {@link Model.find} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.find}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.find}.
   */
  beforeFind: notify,

  /**
   * Retrieve via an adapter the entity with the given primary key.
   *
   * {@link Model.beforeFind} will be called before calling the adapter.
   * {@link Model.afterFind} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to retrieve.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   */
  find (id, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeFind lifecycle hook
    op = opts.op = 'beforeFind'
    return resolve(self[op](id, opts)).then(function (_id) {
      // Allow for re-assignment from lifecycle hook
      id = _id === undefined ? id : _id
      // Now delegate to the adapter
      op = opts.op = 'find'
      self.dbg(op, id, opts)
      return self.getAdapter(adapter)[op](self, id, opts)
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
   * Model lifecycle hook called by {@link Model.find}. If this method
   * returns a promise then {@link Model.find} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.find}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.find}.
   */
  afterFind: notify,

  /**
   * Model lifecycle hook called by {@link Model.findAll}. If this method
   * returns a promise then {@link Model.findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} query - The `query` argument passed to {@link Model.findAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.findAll}.
   */
  beforeFindAll: notify,

  /**
   * Using the `query` argument, select entities to pull from an adapter.
   * Expects back from the adapter the array of selected entities.
   *
   * {@link Model.beforeFindAll} will be called before calling the adapter.
   * {@link Model.afterFindAll} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * resulting data. If `true` return a response object that includes the
   * resulting data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   */
  findAll (query, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeFindAll lifecycle hook
    op = opts.op = 'beforeFindAll'
    return resolve(self[op](query, opts)).then(function (_query) {
      // Allow for re-assignment from lifecycle hook
      query = _query || query
      // Now delegate to the adapter
      op = opts.op = 'findAll'
      self.dbg(op, query, opts)
      return self.getAdapter(adapter)[op](self, query, opts)
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
   * Model lifecycle hook called by {@link Model.findAll}. If this method
   * returns a promise then {@link Model.findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} data - The `data` returned by the adapter.
   * @param {Object} query - The `query` argument passed to {@link Model.findAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.findAll}.
   */
  afterFindAll: notify,

  /**
   * Model lifecycle hook called by {@link Model.update}. If this method
   * returns a promise then {@link Model.update} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.update}.
   * @param {props} props - The `props` argument passed to {@link Model.update}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.update}.
   */
  beforeUpdate: notify,

  /**
   * Using an adapter, update the entity with the primary key specified by the
   * `id` argument.
   *
   * {@link Model.beforeUpdate} will be called before updating the entity.
   * {@link Model.afterUpdate} will be called after updating the entity.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to update.
   * @param {Object} props - The update to apply to the entity.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   */
  update (id, props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
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
      return self.getAdapter(adapter)[op](self, id, json, opts)
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
   * Model lifecycle hook called by {@link Model.update}. If this method
   * returns a promise then {@link Model.update} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.update}.
   * @param {props} props - The `props` argument passed to {@link Model.update}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.update}.
   */
  afterUpdate: notify,

  /**
   * Model lifecycle hook called by {@link Model.updateMany}. If this method
   * returns a promise then {@link Model.updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.updateMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateMany}.
   */
  beforeUpdateMany: notify,

  /**
   * Given an array of updates, perform each of the updates via an adapter. Each
   * "update" is a hash of properties with which to update an entity. Each
   * update must contain the primary key to be updated.
   *
   * {@link Model.beforeUpdateMany} will be called before making the update.
   * {@link Model.afterUpdateMany} will be called after making the update.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - Array up entity updates.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if each entity update contains nested updates for relations. NOT
   * performed in a transaction.
   */
  updateMany (entities, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    entities || (entities = [])
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeUpdateMany lifecycle hook
    op = opts.op = 'beforeUpdateMany'
    return resolve(self[op](entities, opts)).then(function (_entities) {
      // Allow for re-assignment from lifecycle hook
      entities = _entities || entities
      // Now delegate to the adapter
      op = opts.op = 'updateMany'
      const json = entities.map(function (item) {
        return self.toJSON(item, opts)
      })
      self.dbg(op, json, opts)
      return self.getAdapter(adapter)[op](self, json, opts)
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
   * Model lifecycle hook called by {@link Model.updateMany}. If this method
   * returns a promise then {@link Model.updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.updateMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateMany}.
   */
  afterUpdateMany: notify,

  /**
   * Model lifecycle hook called by {@link Model.updateAll}. If this method
   * returns a promise then {@link Model.updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} query - The `query` argument passed to {@link Model.updateAll}.
   * @param {Object} props - The `props` argument passed to {@link Model.updateAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateAll}.
   */
  beforeUpdateAll: notify,

  /**
   * Using the `query` argument, perform the a single updated to the selected
   * entities. Expects back from the adapter an array of the updated entities.
   *
   * {@link Model.beforeUpdateAll} will be called before making the update.
   * {@link Model.afterUpdateAll} will be called after making the update.
   *
   * @memberof Model
   * @method
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} props - Update to apply to selected entities.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   */
  updateAll (query, props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
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
      return self.getAdapter(adapter)[op](self, query, json, opts)
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
   * Model lifecycle hook called by {@link Model.updateAll}. If this method
   * returns a promise then {@link Model.updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} query - The `query` argument passed to {@link Model.updateAll}.
   * @param {Object} props - The `props` argument passed to {@link Model.updateAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateAll}.
   */
  afterUpdateAll: notify,

  /**
   * Model lifecycle hook called by {@link Model.destroy}. If this method
   * returns a promise then {@link Model.destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.destroy}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroy}.
   */
  beforeDestroy: notify,

  /**
   * Using an adapter, destroy the entity with the primary key specified by the
   * `id` argument.
   *
   * {@link Model.beforeDestroy} will be called before destroying the entity.
   * {@link Model.afterDestroy} will be called after destroying the entity.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to destroy.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   */
  destroy (id, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeDestroy lifecycle hook
    op = opts.op = 'beforeDestroy'
    return resolve(self[op](id, opts)).then(function (_id) {
      // Allow for re-assignment from lifecycle hook
      id = _id === undefined ? id : _id
      // Now delegate to the adapter
      op = opts.op = 'destroy'
      self.dbg(op, id, opts)
      return self.getAdapter(adapter)[op](self, id, opts)
    }).then(function (data) {
      // afterDestroy lifecycle hook
      op = opts.op = 'afterDestroy'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          utils._(opts, data)
          return data
        }
        return data
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.destroy}. If this method
   * returns a promise then {@link Model.destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.destroy}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroy}.
   */
  afterDestroy: notify,

  /**
   * Model lifecycle hook called by {@link Model.destroyAll}. If this method
   * returns a promise then {@link Model.destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {query} query - The `query` argument passed to {@link Model.destroyAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroyAll}.
   */
  beforeDestroyAll: notify,

  /**
   * Using the `query` argument, destroy the selected entities via an adapter.
   * If no `query` is provided then all entities will be destroyed.
   *
   * {@link Model.beforeDestroyAll} will be called before destroying the entities.
   * {@link Model.afterDestroyAll} will be called after destroying the entities.
   *
   * @memberof Model
   * @method
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   */
  destroyAll (query, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeDestroyAll lifecycle hook
    op = opts.op = 'beforeDestroyAll'
    return resolve(self[op](query, opts)).then(function (_query) {
      // Allow for re-assignment from lifecycle hook
      query = _query || query
      // Now delegate to the adapter
      op = opts.op = 'destroyAll'
      self.dbg(op, query, opts)
      return self.getAdapter(adapter)[op](self, query, opts)
    }).then(function (data) {
      // afterDestroyAll lifecycle hook
      op = opts.op = 'afterDestroyAll'
      return resolve(self[op](data, query, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          utils._(opts, data)
          return data
        }
        return data
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.destroyAll}. If this method
   * returns a promise then {@link Model.destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {*} data - The `data` returned by the adapter.
   * @param {query} query - The `query` argument passed to {@link Model.destroyAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroyAll}.
   */
  afterDestroyAll: notify,

  log (level, ...args) {
    if (level && !args.length) {
      args.push(level)
      level = 'debug'
    }
    if (level === 'debug' && !this.debug) {
      return
    }
    const prefix = `${level.toUpperCase()}: (${this.name})`
    if (console[level]) {
      console[level](prefix, ...args)
    } else {
      console.log(prefix, ...args)
    }
  },

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
   */
  belongsTo (model, opts) {
    return belongsTo(model, opts)(this)
  },

  /**
   * Usage:
   *
   * User.hasMany(Post, {
   *   localField: 'my_posts'
   * })
   */
  hasMany (model, opts) {
    return hasMany(model, opts)(this)
  },

  /**
   * Usage:
   *
   * User.hasOne(Profile, {
   *   localField: '_profile'
   * })
   */
  hasOne (model, opts) {
    return hasOne(model, opts)(this)
  },

  /**
   * Invoke the {@link module:js-data.exports.setSchema setSchema} decorator on
   * this Model.
   * @param {Object} opts - Property configurations.
   * @return {Model} A reference to the Model for chaining.
   */
  setSchema (opts) {
    return setSchema(opts)(this)
  },

  /**
   * Invoke the {@link module:js-data.exports.configure configure} decorator on
   * this Model.
   * @param {Object} opts - Configuration
   * @return {Model} A reference to the Model for chaining.
   */
  configure (opts) {
    return configure(opts)(this)
  },

  /**
   * Invoke the {@link module:js-data.exports.registerAdapter registerAdapter}
   * decorator on this Model.
   * @param {string} name - The name of the adapter to register.
   * @param {Adapter} adapter - The adapter to register.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.default=false] - Whether to make the adapter the
   * default for this Model.
   * @return {Model} A reference to the Model for chaining.
   */
  registerAdapter (name, adapter, opts) {
    return registerAdapter(name, adapter, opts)(this)
  },

  /**
   * Extend this Model and return a new child Model. Static properties on this
   * Model will be shallow copied to the child Model. The child Model's
   * prototype will point to the parent Model.
   *
   * @example
   * var User = JSData.Model.extend({}, { name: 'User' })
   * @param {Object} props={} - Properties to add to the prototype of the class.
   * @param {Function} [props.initialize] - Optional function to invoke during
   * construction of instances of the class. Will receive any arguments passed
   * to the constructor. "this" will refer to the instance being constructed.
   * @param {Object} classProps - Static properties to add to the class.
   * @param {string} classProps.name - Name of the class. Required.
   * @param {string} [classProps.idAttribute='id'] - Field to use as the unique
   * identifier for instances of the class.
   * @param {Object} [classProps.schema] - Value to pass to the {@link Model.setSchema setSchema}
   * method of the class after the class is created.
   */
  extend (props, classProps) {
    const Parent = this
    let Child

    Parent.dbg('extend', 'props:', props, 'classProps:', classProps)

    props || (props = {})
    classProps || (classProps = {})

    const initialize = props.initialize
    delete props.initialize

    if (props.hasOwnProperty('constructor')) {
      Child = props.constructor
      delete props.constructor
    } else {
      if (!classProps.name) {
        throw new TypeError(`name: Expected string, found ${typeof classProps.name}!`)
      }
      if (classProps.csp) {
        Child = function (...args) {
          utils.classCallCheck(this, Child)
          const _this = utils.possibleConstructorReturn(this, (Child.__super__ || Object.getPrototypeOf(Child)).apply(this, args))
          if (initialize) {
            initialize.apply(_this, args)
          }
          return _this
        }
      } else {
        const name = utils.pascalCase(classProps.name)
        const func = `return function ${name}() {
                        classCallCheck(this, ${name})
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                          args[_key] = arguments[_key];
                        }
                        var _this = possibleConstructorReturn(this, (${name}.__super__ || Object.getPrototypeOf(${name})).apply(this, args));
                        if (initialize) {
                          initialize.apply(_this, arguments)
                        }
                        return _this
                      }`
        Child = new Function('classCallCheck', 'possibleConstructorReturn', 'Parent', 'initialize', func)(utils.classCallCheck, utils.possibleConstructorReturn, Parent, initialize) // eslint-disable-line
      }
    }

    classProps.shortname = classProps.shortname || utils.camelCase(Child.name || classProps.name)
    delete classProps.name

    const _schema = classProps.schema
    delete classProps.schema

    Child.prototype = Object.create(Parent && Parent.prototype, {
      constructor: {
        value: Child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    })

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(Child, Parent)
    } else if (classProps.strictEs6Class) {
      Child.__proto__ = Parent // eslint-disable-line
    } else {
      utils.forOwn(Parent, function (value, key) {
        Child[key] = value
      })
    }
    Object.defineProperty(Child, '__super__', {
      configurable: true,
      value: Parent
    })

    configure(props)(Child.prototype)
    configure(classProps)(Child)
    if (_schema) {
      setSchema(_schema)(Child)
    }

    return Child
  }
})

/**
 * Register a new event listener on this Model.
 *
 * @name on
 * @memberOf! Model
 * @method
 */

/**
 * Remove an event listener from this Model.
 *
 * @name off
 * @memberOf! Model
 * @method
 */

/**
 * Trigger an event on this Model.
 *
 * @name emit
 * @memberOf! Model
 * @method
 */

/**
 * Allow Models themselves emit events.
 *
 * A Model's registered listeners are stored on the Model's `__events` property.
 */
utils.eventify(
  Model,
  function () {
    return this._events()
  },
  function (value) {
    this._events(value)
  },
  true
)

/**
 * Allow instancess to emit events.
 *
 * An instance's registered listeners are stored in the instance's private data
 * hash.
 */
utils.eventify(
  Model.prototype,
  function () {
    return this._get('events')
  },
  function (value) {
    this._set('events', value)
  }
)
