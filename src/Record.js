import utils, { safeSetLink } from './utils'
import Component from './Component'
import Settable from './Settable'
import {
  hasManyType,
  hasOneType
} from './decorators'

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

// Cache these strings
const creatingPath = 'creating'
const noValidatePath = 'noValidate'
const keepChangeHistoryPath = 'keepChangeHistory'
const previousPath = 'previous'

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
 * @example <caption>Record#constructor</caption>
 * // Normally you would do: import {Record} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Record} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Instantiate a plain record
 * let record = new Record()
 * console.log('record: ' + JSON.stringify(record))
 *
 * // You can supply properties on instantiation
 * record = new Record({ name: 'John' })
 * console.log('record: ' + JSON.stringify(record))
 *
 * @example <caption>Record#constructor2</caption>
 * // Normally you would do: import {Mapper} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Mapper} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Instantiate a record that's associated with a Mapper:
 * const UserMapper = new Mapper({ name: 'user' })
 * const User = UserMapper.recordClass
 * const user = UserMapper.createRecord({ name: 'John' })
 * const user2 = new User({ name: 'Sally' })
 * console.log('user: ' + JSON.stringify(user))
 * console.log('user2: ' + JSON.stringify(user2))
 *
 * @example <caption>Record#constructor3</caption>
 * // Normally you would do: import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Container} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * const store = new Container()
 * store.defineMapper('user')
 *
 * // Instantiate a record that's associated with a store's Mapper
 * const user = store.createRecord('user', { name: 'John' })
 * console.log('user: ' + JSON.stringify(user))
 *
 * @example <caption>Record#constructor4</caption>
 * // Normally you would do: import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Container} = JSData
 * console.log('Using JSData v' + JSData.version.full)
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
 *
 * @example <caption>Record#constructor5</caption>
 * // Normally you would do: import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Container} = JSData
 * console.log('Using JSData v' + JSData.version.full)
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
 *
 * @class Record
 * @extends Component
 * @param {Object} [props] The initial properties of the new Record instance.
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
 * initial properties.
 * @param {boolean} [opts.validateOnSet=true] Whether to enable setter
 * validation on properties after the Record has been initialized.
 * @since 3.0.0
 */
function Record (props, opts) {
  utils.classCallCheck(this, Record)
  Settable.call(this)
  props || (props = {})
  opts || (opts = {})
  const _set = this._set
  const mapper = this.constructor.mapper

  _set(creatingPath, true)
  _set(noValidatePath, !!opts.noValidate)
  _set(keepChangeHistoryPath, opts.keepChangeHistory === undefined ? (mapper ? mapper.keepChangeHistory : true) : opts.keepChangeHistory)

  // Set the idAttribute value first, if it exists.
  const id = mapper ? utils.get(props, mapper.idAttribute) : undefined
  if (id !== undefined) {
    utils.set(this, mapper.idAttribute, id)
  }

  utils.fillIn(this, props)
  _set(creatingPath, false)
  if (opts.validateOnSet !== undefined) {
    _set(noValidatePath, !opts.validateOnSet)
  } else if (mapper && mapper.validateOnSet !== undefined) {
    _set(noValidatePath, !mapper.validateOnSet)
  } else {
    _set(noValidatePath, false)
  }
  _set(previousPath, mapper ? mapper.toJSON(props) : utils.plainCopy(props))
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
   * Return the change history of this record since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @method Record#changeHistory
   * @since 3.0.0
   */
  changeHistory () {
    return (this._get('history') || []).slice()
  },

  /**
   * Return changes to this record since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @example <caption>Record#changes</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user')
   * console.log('user changes: ' + JSON.stringify(user.changes()))
   * user.name = 'John'
   * console.log('user changes: ' + JSON.stringify(user.changes()))
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
   * @example <caption>Record#commit</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user')
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.name = 'John'
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.commit()
   * console.log('user hasChanges: ' + user.hasChanges())
   *
   * @method Record#commit
   * @param {Object} [opts] Configuration options. Passed to {@link Record#toJSON}.
   * @since 3.0.0
   */
  commit (opts) {
    this._set('changed') // unset
    this._set('history', []) // clear history
    this._set('previous', this.toJSON(opts))
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
   * @example <caption>Record#get</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   * const store = new Container()
   * store.defineMapper('user')
   *
   * const user = store.createRecord('user', { name: 'Bob' })
   * console.log('user.get("name"): ' + user.get('name'))
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
   * @example <caption>Record#hasChanges</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user')
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.name = 'John'
   * console.log('user hasChanges: ' + user.hasChanges())
   * user.commit()
   * console.log('user hasChanges: ' + user.hasChanges())
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
   * Return whether the record is unsaved. Records that have primary keys are
   * considered "saved". Records without primary keys are considered "unsaved".
   *
   * @example <caption>Record#isNew</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   * const store = new Container()
   * store.defineMapper('user')
   * const user = store.createRecord('user', {
   *   id: 1234
   * })
   * const user2 = store.createRecord('user')
   * console.log('user isNew: ' + user.isNew()) // false
   * console.log('user2 isNew: ' + user2.isNew()) // true
   *
   * @method Record#isNew
   * @returns {boolean} Whether the record is unsaved.
   * @since 3.0.0
   */
  isNew (opts) {
    return utils.get(this, this._mapper().idAttribute) === undefined
  },

  /**
   * Return whether the record in its current state passes validation.
   *
   * @example <caption>Record#isValid</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
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

  removeInverseRelation (currentParent, id, inverseDef, idAttribute) {
    if (inverseDef.type === hasOneType) {
      safeSetLink(currentParent, inverseDef.localField, undefined)
    } else if (inverseDef.type === hasManyType) {
      // e.g. remove comment from otherPost.comments
      const children = utils.get(currentParent, inverseDef.localField)
      if (id === undefined) {
        utils.remove(children, (child) => child === this)
      } else {
        utils.remove(children, (child) => child === this || id === utils.get(child, idAttribute))
      }
    }
  },

  setupInverseRelation (record, id, inverseDef, idAttribute) {
      // Update (set) inverse relation
    if (inverseDef.type === hasOneType) {
      // e.g. someUser.profile = profile
      safeSetLink(record, inverseDef.localField, this)
    } else if (inverseDef.type === hasManyType) {
      // e.g. add comment to somePost.comments
      const children = utils.get(record, inverseDef.localField)
      if (id === undefined) {
        utils.noDupeAdd(children, this, (child) => child === this)
      } else {
        utils.noDupeAdd(children, this, (child) => child === this || id === utils.get(child, idAttribute))
      }
    }
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
   * @example <caption>Record#previous</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
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
   * @example <caption>Record#revert</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
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
   *   return session.save()
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

    const postProcess = (result) => {
      const record = opts.raw ? result.data : result
      if (record) {
        utils.deepMixIn(this, record)
        this.commit()
      }
      return result
    }

    if (id === undefined) {
      return superMethod(mapper, 'create')(props, opts).then(postProcess)
    }
    if (opts.changesOnly) {
      const changes = this.changes(opts)
      props = {}
      utils.fillIn(props, changes.added)
      utils.fillIn(props, changes.changed)
    }
    return superMethod(mapper, 'update')(id, props, opts).then(postProcess)
  },

  /**
   * Set the value for a given key, or the values for the given keys if "key" is
   * an object. Triggers change events on those properties that have `track: true`
   * in {@link Mapper#schema}.
   *
   * @example <caption>Record#set</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
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
   *
   * @fires Record#change
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
   * @example <caption>Record#toJSON</caption>
   * // Normally you would do: import { Container } from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.8')
   * const { Container } = JSData
   * console.log('Using JSData v' + JSData.version.full)
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
      utils.forOwn(this, (prop, key) => {
        json[key] = utils.plainCopy(prop)
      })
      return json
    }
  },

  /**
   * Unset the value for a given key. Triggers change events on those properties
   * that have `track: true` in {@link Mapper#schema}.
   *
   * @example <caption>Record#unset</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
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
   * @example <caption>Record#validate</caption>
   * // Normally you would do: import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
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
   *
   * @method Record#validate
   * @param {Object} [opts] Configuration options. Passed to {@link Mapper#validate}.
   * @returns {*} Array of errors or `undefined` if no errors.
   * @since 3.0.0
   */
  validate (opts) {
    return this._mapper().validate(this, opts)
  }
}, {
  creatingPath,
  noValidatePath,
  keepChangeHistoryPath,
  previousPath
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
 * Fired when a record changes. Only works for records that have tracked fields.
 * See {@link Record~changeListener} on how to listen for this event.
 *
 * @event Record#change
 * @see Record~changeListener
 */

/**
 * Callback signature for the {@link Record#event:change} event.
 *
 * @example
 * function onChange (record, changes) {
 *   // do something
 * }
 * record.on('change', onChange)
 *
 * @callback Record~changeListener
 * @param {Record} The Record that changed.
 * @param {Object} The changes.
 * @see Record#event:change
 * @since 3.0.0
 */

/**
 * Create a subclass of this Record:
 * @example <caption>Record.extend</caption>
 * // Normally you would do: import {Record} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Record} = JSData
 * console.log('Using JSData v' + JSData.version.full)
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
