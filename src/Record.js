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
 * js-data's Record class. An instance of `Record` corresponds to an in-memory
 * representation of a single row or document in a database, Firebase,
 * localstorage, etc. Basically, a `Record` instance represents whatever kind of
 * entity in your persistence layer that has a primary key.
 *
 * ```javascript
 * import {Record} from 'js-data'
 * ```
 *
 * <div id="Record#constructor" class="tonic">
 * // Normally you would do: import {Record} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Record} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * // Instantiate a plain record
 * let record = new Record()
 * console.log('record: ' + JSON.stringify(record))
 *
 * // You can supply properties on instantiation
 * record = new Record({ name: 'John' })
 * console.log('record: ' + JSON.stringify(record))
 * </div>
 *
 * Instantiate a record that's associated with a Mapper:
 * <div id="Record#constructor2" class="tonic">
 * // Normally you would do: import {Mapper} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Mapper} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * const UserMapper = new Mapper({ name: 'user' })
 * const User = UserMapper.recordClass
 * const user = UserMapper.createRecord({ name: 'John' })
 * const user2 = new User({ name: 'Sally' })
 * console.log('user: ' + JSON.stringify(user))
 * console.log('user2: ' + JSON.stringify(user2))
 * </div>
 *
 *
 * <div id="Record#constructor3" class="tonic">
 * // Normally you would do: import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Container} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * const store = new Container()
 * store.defineMapper('user')
 *
 * // Instantiate a record that's associated with a store's Mapper
 * const user = store.createRecord('user', { name: 'John' })
 * console.log('user: ' + JSON.stringify(user))
 * </div>
 *
 *
 * <div id="Record#constructor4" class="tonic">
 * // Normally you would do: import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Container} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * const store = new Container()
 * store.defineMapper('user', {
 *   schema: {
 *     properties: {
 *       name: { type: 'string' }
 *     }
 *   }
 * })
 *
 * // Validate on instantiation
 * const user = store.createRecord('user', { name: 1234 })
 * console.log('user: ' + JSON.stringify(user))
 * </div>
 *
 * <div id="Record#constructor5" class="tonic">
 * // Normally you would do: import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Container} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * const store = new Container()
 * store.defineMapper('user', {
 *   schema: {
 *     properties: {
 *       name: { type: 'string' }
 *     }
 *   }
 * })
 *
 * // Skip validation on instantiation
 * const user = store.createRecord('user', { name: 1234 }, { noValidate: true })
 * console.log('user: ' + JSON.stringify(user))
 * console.log('user.isValid(): ' + user.isValid())
 * </div>
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
    /**
     * Get a private property of this Record. Properties defined in
     * {@link Mapper#schema} become private properties for
     * {@link Mapper#recordClass}, though you can still access and set them
     * using the provided ES5 getters and setters.
     *
     * __You shouldn't need to use this method unless you have a special need or
     * unless you're extending the Record class.__
     *
     * @method Record#_get
     * @param {string} key The property to retrieve.
     * @returns {*} The value of the property.
     * @since 3.0.0
     */
    _get: { value (key) { return utils.get(_props, key) } },

    /**
     * Set a private property of this Record. Properties defined in
     * {@link Mapper#schema} become private properties for
     * {@link Mapper#recordClass}, though you can still access and set them
     * using the provided ES5 getters and setters.
     *
     * __You shouldn't need to use this method unless you have a special need or
     * unless you're extending the Record class.__
     *
     * @method Record#_set
     * @param {(string|Object)} key The key or path to the property. Can also
     * pass in an object of key/value pairs, which will all be set on the Record.
     * @param {*} [value] The value to set.
     * @since 3.0.0
     */
    _set: { value (key, value) { return utils.set(_props, key, value) } },

    /**
     * Unset a private property of this Record. Properties defined in
     * {@link Mapper#schema} become private properties for
     * {@link Mapper#recordClass}, though you can still access and set them
     * using the provided ES5 getters and setters.
     *
     * __You shouldn't need to use this method unless you have a special need or
     * unless you're extending the Record class.__
     *
     * @method Record#_unset
     * @param {string} key The property to unset.
     * @since 3.0.0
     */
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
   * <div id="Record#changes" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   *
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user')
   * console.log('user changes: ' + JSON.stringify(user.changes()))
   * user.name = 'John'
   * console.log('user changes: ' + JSON.stringify(user.changes()))
   * </div>
   *
   * @method Record#changes
   * @param [opts] Configuration options.
   * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
   * @param {Array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
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
   * <div id="Record#commit" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   *
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user')
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.name = 'John'
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.commit()
   * console.log('user hasChanges: ' + user.hasChanges())
   * </div>
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
   * @example
   * import {Container} from 'js-data'
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   *
   * const store = new Container()
   * store.registerAdapter('rethink', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('user')
   * store.find('user', 1234).then((user) => {
   *   console.log(user.id) // 1234
   *
   *   // Destroy this user from the database
   *   return user.destroy()
   * })
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
   * <div id="Record#get" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user')
   *
   * const user = store.createRecord('user', { name: 'Bob' })
   * console.log('user.get("name"): ' + user.get('name'))
   * </div>
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
   * <div id="Record#hasChanges" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user')
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.name = 'John'
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.commit()
   * console.log('user hasChanges: ' + user.hasChanges())
   * </div>
   *
   * @method Record#hasChanges
   * @param [opts] Configuration options.
   * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
   * @param {Array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
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
   * <div id="Record#isValid" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' }
   *     }
   *   }
   * })
   * const user = store.createRecord('user', {
   *   name: 1234
   * }, {
   *   noValidate: true // this allows us to put the record into an invalid state
   * })
   * console.log('user isValid: ' + user.isValid())
   * user.name = 'John'
   * console.log('user isValid: ' + user.isValid())
   * </div>
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
   * @example
   * import {Container} from 'js-data'
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   *
   * const store = new Container()
   * store.registerAdapter('rethink', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('user', {
   *   relations: {
   *     hasMany: {
   *       post: {
   *         localField: 'posts',
   *         foreignKey: 'user_id'
   *       }
   *     }
   *   }
   * })
   * store.defineMapper('post', {
   *   relations: {
   *     belongsTo: {
   *       user: {
   *         localField: 'user',
   *         foreignKey: 'user_id'
   *       }
   *     }
   *   }
   * })
   * store.find('user', 1234).then((user) => {
   *   console.log(user.id) // 1234
   *
   *   // Load the user's post relations
   *   return user.loadRelations(['post'])
   * }).then((user) => {
   *   console.log(user.posts) // [{...}, {...}, ...]
   * })
   *
   * @method Record#loadRelations
   * @param {string[]} [relations] List of relations to load. Can use localField
   * names or Mapper names to pick relations.
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
   * <div id="Record#previous" class="tonic">
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user', {
   *   name: 'William'
   * })
   * console.log('user previous: ' + JSON.stringify(user.previous()))
   * user.name = 'Bob'
   * console.log('user previous: ' + JSON.stringify(user.previous()))
   * user.commit()
   * console.log('user previous: ' + JSON.stringify(user.previous()))
   * </div>
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
   * <div id="Record#revert" class="tonic">
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user', {
   *   name: 'William'
   * })
   * console.log('user: ' + JSON.stringify(user))
   * user.name = 'Bob'
   * console.log('user: ' + JSON.stringify(user))
   * user.revert()
   * console.log('user: ' + JSON.stringify(user))
   * </div>
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
   * @example
   * import {Container} from 'js-data'
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   *
   * const store = new Container()
   * store.registerAdapter('rethink', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('session')
   * const session = store.createRecord('session', { topic: 'Node.js' })
   *
   * // Create a new record in the database
   * session.save().then(() => {
   *   console.log(session.id) // 1234
   *
   *   session.skill_level = 'beginner'
   *
   *   // Update the record in the database
   *   return user.save()
   * })
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
    return superMethod(mapper, 'update')(id, props, opts).then((result) => {
      const record = opts.raw ? result.data : result
      if (record) {
        utils.deepMixIn(this, record)
        this.commit()
      }
      return result
    })
  },

  /**
   * Set the value for a given key, or the values for the given keys if "key" is
   * an object. Triggers change events on those properties that have `track: true`
   * in {@link Mapper#schema}.
   *
   * <div id="Record#set" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user')
   *
   * const user = store.createRecord('user')
   * console.log('user: ' + JSON.stringify(user))
   *
   * user.set('name', 'Bob')
   * console.log('user: ' + JSON.stringify(user))
   *
   * user.set({ age: 30, role: 'admin' })
   * console.log('user: ' + JSON.stringify(user))
   * </div>
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
   * <div id="Record#toJSON" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' }
   *     }
   *   }
   * })
   *
   * const user = store.createRecord('user', {
   *   name: 'John',
   *   $$hashKey: '1234'
   * })
   * console.log('user: ' + JSON.stringify(user.toJSON()))
   * console.log('user: ' + JSON.stringify(user.toJSON({ strict: true })))
   * </div>
   *
   * @method Record#toJSON
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.strict] Whether to exclude properties that are not
   * defined in {@link Mapper#schema}.
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
   * Unset the value for a given key. Triggers change events on those properties
   * that have `track: true` in {@link Mapper#schema}.
   *
   * <div id="Record#set" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user')
   *
   * const user = store.createRecord('user', {
   *   name: 'John'
   * })
   * console.log('user: ' + JSON.stringify(user))
   *
   * user.unset('name')
   * console.log('user: ' + JSON.stringify(user))
   * </div>
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
   * <div id="Record#validate" class="tonic">
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.7')
   * const {Container} = JSData
   * console.log(\`Using JSData v${JSData.version.full}\`)
   * const store = new Container()
   * store.defineMapper('user', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' }
   *     }
   *   }
   * })
   * const user = store.createRecord('user', {
   *   name: 1234
   * }, {
   *   noValidate: true // this allows us to put the record into an invalid state
   * })
   * console.log('user validation: ' + JSON.stringify(user.validate()))
   * user.name = 'John'
   * console.log('user validation: ' + user.validate())
   * </div>
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
 * Create a subclass of this Record:
 * <div id="Record.extend" class="tonic">
 * // Normally you would do: import {Record} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Record} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomRecordClass extends Record {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customRecord = new CustomRecordClass()
 * console.log(customRecord.foo())
 * console.log(CustomRecordClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherRecordClass = Record.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherRecord = new OtherRecordClass()
 * console.log(otherRecord.foo())
 * console.log(OtherRecordClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherRecordClass () {
 *   Record.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * Record.extend({
 *   constructor: AnotherRecordClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherRecord = new AnotherRecordClass()
 * console.log(anotherRecord.created_at)
 * console.log(anotherRecord.foo())
 * console.log(AnotherRecordClass.beep())
 * </div>
 *
 * @method Record.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Record class.
 * @since 3.0.0
 */
