import utils from './utils'
import Component from './Component'

const DOMAIN = 'Record'

const superMethod = function (mapper, name) {
  const store = mapper.datastore
  if (store && store[name]) {
    return function (...args) {
      return store[name](mapper.name, ...args)
    }
  }
  return mapper[name].bind(mapper)
}

/**
 * js-data's Record class.
 *
 * ```javascript
 * import {Record} from 'js-data'
 * ```
 *
 * @class Record
 * @extends Component
 * @param {Object} [props] The initial properties of the new Record instance.
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
 * initial properties.
 * @since 3.0.0
 */
function Record (props, opts) {
  utils.classCallCheck(this, Record)
  props || (props = {})
  opts || (opts = {})
  const _props = {}
  Object.defineProperties(this, {
    _get: { value (key) { return utils.get(_props, key) } },
    _set: { value (key, value) { return utils.set(_props, key, value) } },
    _unset: { value (key) { return utils.unset(_props, key) } }
  })
  const _set = this._set
  // TODO: Optimize these strings
  _set('creating', true)
  if (opts.noValidate) {
    _set('noValidate', true)
  }
  utils.fillIn(this, props)
  _set('creating', false)
  _set('noValidate', false)
  _set('previous', utils.plainCopy(props))
}

export default Component.extend({
  constructor: Record,

  /**
   * Returns the {@link Mapper} paired with this record's class, if any.
   *
   * @private
   * @method Record#_mapper
   * @returns {Mapper} The {@link Mapper} paired with this record's class, if any.
   * @since 3.0.0
   */
  _mapper () {
    const mapper = this.constructor.mapper
    if (!mapper) {
      throw utils.err(`${DOMAIN}#_mapper`, '')(404, 'mapper')
    }
    return mapper
  },

  /**
   * Lifecycle hook.
   *
   * @method Record#afterLoadRelations
   * @param {string[]} relations The `relations` argument passed to {@link Record#loadRelations}.
   * @param {Object} opts The `opts` argument passed to {@link Record#loadRelations}.
   * @since 3.0.0
   */
  afterLoadRelations () {},

  /**
   * Lifecycle hook.
   *
   * @method Record#beforeLoadRelations
   * @param {string[]} relations The `relations` argument passed to {@link Record#loadRelations}.
   * @param {Object} opts The `opts` argument passed to {@link Record#loadRelations}.
   * @since 3.0.0
   */
  beforeLoadRelations () {},

  /**
   * Return changes to this record since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @method Record#changes
   * @param [opts] Configuration options.
   * @param {Function} [opts.equalsFn] Equality function. Default uses `===`.
   * @param {Array} [opts.ignore] Array of strings or RegExp of fields to ignore.
   * @returns {Object} Object describing the changes to this record since it was
   * instantiated or its {@link Record#commit} method was last called.
   * @since 3.0.0
   */
  changes (opts) {
    opts || (opts = {})
    return utils.diffObjects(typeof this.toJSON === 'function' ? this.toJSON(opts) : this, this._get('previous'), opts)
  },

  /**
   * Make the record's current in-memory state it's only state, with any
   * previous property values being set to current values.
   *
   * @method Record#commit
   * @since 3.0.0
   */
  commit () {
    this._set('changed') // unset
    this._set('previous', utils.plainCopy(this))
  },

  /**
   * Call {@link Mapper#destroy} using this record's primary key.
   *
   * @method Record#destroy
   * @param {Object} [opts] Configuration options passed to {@link Mapper#destroy}.
   * @returns {Promise} The result of calling {@link Mapper#destroy} with the
   * primary key of this record.
   * @since 3.0.0
   */
  destroy (opts) {
    opts || (opts = {})
    const mapper = this._mapper()
    return superMethod(mapper, 'destroy')(utils.get(this, mapper.idAttribute), opts)
  },

  /**
   * Return the value at the given path for this instance.
   *
   * @method Record#get
   * @param {string} key Path of value to retrieve.
   * @returns {*} Value at path.
   * @since 3.0.0
   */
  'get' (key) {
    return utils.get(this, key)
  },

  /**
   * Return whether this record has changed since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @method Record#hasChanges
   * @param [opts] Configuration options.
   * @param {Function} [opts.equalsFn] Equality function. Default uses `===`.
   * @param {Array} [opts.ignore] Array of strings or RegExp of fields to ignore.
   * @returns {boolean} Return whether the record has changed since it was
   * instantiated or since its {@link Record#commit} method was called.
   * @since 3.0.0
   */
  hasChanges (opts) {
    const quickHasChanges = !!(this._get('changed') || []).length
    return quickHasChanges || utils.areDifferent(typeof this.toJSON === 'function' ? this.toJSON(opts) : this, this._get('previous'), opts)
  },

  /**
   * Return whether the record in its current state passes validation.
   *
   * @method Record#isValid
   * @param {Object} [opts] Configuration options. Passed to {@link Mapper#validate}.
   * @returns {boolean} Whether the record in its current state passes
   * validation.
   * @since 3.0.0
   */
  isValid (opts) {
    return !this._mapper().validate(this, opts)
  },

  /**
   * Lazy load relations of this record, to be attached to the record once their
   * loaded.
   *
   * @method Record#loadRelations
   * @param {string[]} [relations] List of relations to load.
   * @param {Object} [opts] Configuration options.
   * @returns {Promise} Resolves with the record, with the loaded relations now
   * attached.
   * @since 3.0.0
   */
  loadRelations (relations, opts) {
    let op
    const mapper = this._mapper()

    // Default values for arguments
    relations || (relations = [])
    if (utils.isString(relations)) {
      relations = [relations]
    }
    opts || (opts = {})
    opts.with = relations

    // Fill in "opts" with the Model's configuration
    utils._(opts, mapper)
    opts.adapter = mapper.getAdapterName(opts)

    // beforeLoadRelations lifecycle hook
    op = opts.op = 'beforeLoadRelations'
    return utils.resolve(this[op](relations, opts)).then(() => {
      // Now delegate to the adapter
      op = opts.op = 'loadRelations'
      mapper.dbg(op, this, relations, opts)
      let tasks = []
      let task
      utils.forEachRelation(mapper, opts, (def, optsCopy) => {
        const relatedMapper = def.getRelation()
        optsCopy.raw = false
        if (utils.isFunction(def.load)) {
          task = def.load(mapper, def, this, opts)
        } else if (def.type === 'hasMany' || def.type === 'hasOne') {
          if (def.foreignKey) {
            task = superMethod(relatedMapper, 'findAll')({
              [def.foreignKey]: utils.get(this, mapper.idAttribute)
            }, optsCopy).then(function (relatedData) {
              if (def.type === 'hasOne') {
                return relatedData.length ? relatedData[0] : undefined
              }
              return relatedData
            })
          } else if (def.localKeys) {
            task = superMethod(relatedMapper, 'findAll')({
              where: {
                [relatedMapper.idAttribute]: {
                  'in': utils.get(this, def.localKeys)
                }
              }
            })
          } else if (def.foreignKeys) {
            task = superMethod(relatedMapper, 'findAll')({
              where: {
                [def.foreignKeys]: {
                  'contains': utils.get(this, mapper.idAttribute)
                }
              }
            }, opts)
          }
        } else if (def.type === 'belongsTo') {
          const key = utils.get(this, def.foreignKey)
          if (utils.isSorN(key)) {
            task = superMethod(relatedMapper, 'find')(key, optsCopy)
          }
        }
        if (task) {
          task = task.then((relatedData) => {
            def.setLocalField(this, relatedData)
          })
          tasks.push(task)
        }
      })
      return Promise.all(tasks)
    }).then(() => {
      // afterLoadRelations lifecycle hook
      op = opts.op = 'afterLoadRelations'
      return utils.resolve(this[op](relations, opts)).then(() => this)
    })
  },

  /**
   * Return the properties with which this record was instantiated.
   *
   * @method Record#previous
   * @param {string} [key] If specified, return just the initial value of the
   * given key.
   * @returns {Object} The initial properties of this record.
   * @since 3.0.0
   */
  previous (key) {
    if (key) {
      return this._get(`previous.${key}`)
    }
    return this._get('previous')
  },

  /**
   * Revert changes to this record back to the properties it had when it was
   * instantiated.
   *
   * @method Record#revert
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.preserve] Array of strings or Regular Expressions
   * denoting properties that should not be reverted.
   * @since 3.0.0
   */
  revert (opts) {
    const previous = this._get('previous')
    opts || (opts = {})
    opts.preserve || (opts.preserve = [])
    utils.forOwn(this, (value, key) => {
      if (key !== this._mapper().idAttribute && !previous.hasOwnProperty(key) && this.hasOwnProperty(key) && opts.preserve.indexOf(key) === -1) {
        delete this[key]
      }
    })
    utils.forOwn(previous, (value, key) => {
      if (opts.preserve.indexOf(key) === -1) {
        this[key] = value
      }
    })
    this.commit()
  },

  /**
   * Delegates to {@link Mapper#create} or {@link Mapper#update}.
   *
   * @method Record#save
   * @param {Object} [opts] Configuration options. See {@link Mapper#create} and
   * {@link Mapper#update}.
   * @param {boolean} [opts.changesOnly] Equality function. Default uses `===`.
   * @param {Function} [opts.equalsFn] Passed to {@link Record#changes} when
   * `opts.changesOnly` is `true`.
   * @param {Array} [opts.ignore] Passed to {@link Record#changes} when
   * `opts.changesOnly` is `true`.
   * @returns {Promise} The result of calling {@link Mapper#create} or
   * {@link Mapper#update}.
   * @since 3.0.0
   */
  save (opts) {
    opts || (opts = {})
    const mapper = this._mapper()
    const id = utils.get(this, mapper.idAttribute)
    let props = this
    if (utils.isUndefined(id)) {
      return superMethod(mapper, 'create')(props, opts)
    }
    if (opts.changesOnly) {
      const changes = this.changes(opts)
      props = {}
      utils.fillIn(props, changes.added)
      utils.fillIn(props, changes.changed)
    }
    return superMethod(mapper, 'update')(id, props, opts)
  },

  /**
   * Set the value for a given key, or the values for the given keys if "key" is
   * an object.
   *
   * @method Record#set
   * @param {(string|Object)} key Key to set or hash of key-value pairs to set.
   * @param {*} [value] Value to set for the given key.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.silent=false] Whether to trigger change events.
   * @since 3.0.0
   */
  'set' (key, value, opts) {
    if (utils.isObject(key)) {
      opts = value
    }
    opts || (opts = {})
    if (opts.silent) {
      this._set('silent', true)
    }
    utils.set(this, key, value)
    if (!this._get('eventId')) {
      this._set('silent') // unset
    }
  },

  /**
   * Return a plain object representation of this record. If the class from
   * which this record was created has a Mapper, then {@link Mapper#toJSON} will
   * be called with this record instead.
   *
   * @method Record#toJSON
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Array of relation names or relation fields
   * to include in the representation. Only available as an option if the class
   * from which this record was created has a Mapper and this record resides in
   * an instance of {@link DataStore}.
   * @returns {Object} Plain object representation of this record.
   * @since 3.0.0
   */
  toJSON (opts) {
    const mapper = this.constructor.mapper
    if (mapper) {
      return mapper.toJSON(this, opts)
    } else {
      const json = {}
      utils.forOwn(this, function (prop, key) {
        json[key] = utils.plainCopy(prop)
      })
      return json
    }
  },

  /**
   * Unset the value for a given key.
   *
   * @method Record#unset
   * @param {string} key Key to unset.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.silent=false] Whether to trigger change events.
   * @since 3.0.0
   */
  unset (key, opts) {
    this.set(key, undefined, opts)
  },

  /**
   * Validate this record based on its current properties.
   *
   * @method Record#validate
   * @param {Object} [opts] Configuration options. Passed to {@link Mapper#validate}.
   * @returns {*} Array of errors or `undefined` if no errors.
   * @since 3.0.0
   */
  validate (opts) {
    return this._mapper().validate(this, opts)
  }
})

/**
 * Allow records to emit events.
 *
 * An record's registered listeners are stored in the record's private data.
 */
utils.eventify(
  Record.prototype,
  function () {
    return this._get('events')
  },
  function (value) {
    this._set('events', value)
  }
)

/**
 * Create a subclass of this Record.
 *
 * @example <caption>Extend the class in a cross-browser manner.</caption>
 * import {Record} from 'js-data'
 * const CustomRecordClass = Record.extend({
 *   foo () { return 'bar' }
 * })
 * const customRecord = new CustomRecordClass()
 * console.log(customRecord.foo()) // "bar"
 *
 * @example <caption>Extend the class using ES2015 class syntax.</caption>
 * class CustomRecordClass extends Record {
 *   foo () { return 'bar' }
 * }
 * const customRecord = new CustomRecordClass()
 * console.log(customRecord.foo()) // "bar"
 *
 * @method Record.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Record class.
 * @since 3.0.0
 */
