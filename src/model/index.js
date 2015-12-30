import * as utils from '../utils'
import {
  belongsTo,
  configure,
  hasMany,
  hasOne,
  setSchema,
  registerAdapter
} from '../decorators/index'
import {Collection} from '../collection/index'
import * as validate from '../validate/index'

const {
  resolve
} = utils
const keysToSkip = {
  length: 1,
  name: 1,
  arguments: 1,
  prototype: 1,
  caller: 1,
  __super__: 1
}

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

const handleResponse = function handleResponse (model, data, opts, adapterName) {
  if (opts.raw) {
    data.adapter = adapterName
    if (opts.autoInject) {
      data.data = model.inject(data.data)
    }
    return data
  } else if (opts.autoInject) {
    data = model.inject(data)
  }
  return data
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
  utils.classCallCheck(this, Model)
  props || (props = {})
  opts || (opts = {})
  const _props = {}
  Object.defineProperties(this, {
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
  this._set('creating', true)
  if (opts.noValidate) {
    this._set('noValidate', true)
  }
  utils.fillIn(this, props)
  this._unset('creating')
  this._set('changes', {})
  this._unset('noValidate')
  this._set('previous', utils.copy(props))
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

  save (opts) {
    // TODO: move actual save logic here
    const Ctor = this.constructor

    const adapterName = Ctor.getAdapterName(opts)
    return Ctor.getAdapter(adapterName)
      .update(Ctor, utils.get(this, Ctor.idAttribute), this, opts)
  },

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
    if (utils.isObject(key)) {
      opts = value
    }
    opts || (opts = {})
    if (opts.silent) {
      this._set('silent', true)
    }
    utils.set(this, key, value)
    if (!this._get('eventId')) {
      this._unset('silent')
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

  changed () {
    return this._get('changed')
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

  /**
   * Return a plain object representation of this instance.
   *
   * @param {Object} [opts] - Configuration options.
   * @param {string[]} [opts.with] - Array of relation names or relation fields
   * to include in the representation.
   * @return {Object} Plain object representation of instance.
   */
  toJSON (opts) {
    opts || (opts = {})
    const Ctor = this.constructor
    let json = this
    if (this instanceof Model) {
      json = {}
      for (var key in this) {
        json[key] = this[key]
      }
      if (Ctor && Ctor.relationList && opts.with) {
        if (utils.isString(opts.with)) {
          opts.with = [opts.with]
        }
        Ctor.relationList.forEach(def => {
          let containedName
          if (opts.with.indexOf(def.relation) !== -1) {
            containedName = def.relation
          } else if (opts.with.indexOf(def.localField) !== -1) {
            containedName = def.localField
          }
          if (containedName) {
            const optsCopy = { with: opts.with.slice() }
            optsCopy.with.splice(optsCopy.with.indexOf(containedName), 1)
            optsCopy.with.forEach((relation, i) => {
              if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                optsCopy.with[i] = relation.substr(containedName.length + 1)
              } else {
                optsCopy.with[i] = ''
              }
            })
            const relationData = utils.get(this, def.localField)
            if (relationData) {
              if (utils.isArray(relationData)) {
                utils.set(json, def.localField, relationData.map(item => def.Relation.prototype.toJSON.call(item, optsCopy)))
              } else {
                utils.set(json, def.localField, def.Relation.prototype.toJSON.call(relationData, optsCopy))
              }
            }
          }
        })
      }
    }
    return json
  }
})

/**
 * Static members
 */
utils.fillIn(Model, {
  /**
   * Whether {@link Model.destroy} and {@link Model.destroyAll} should
   * automatically eject the specified item(s) from the Model's collection on
   * success.
   *
   * @memberof Model
   * @type {boolean}
   * @default true
   */
  autoEject: true,

  /**
   * Whether {@link Model.create}, {@link Model.createMany},
   * {@link Model.update}, {@link Model.updateAll}, and {@link Model.updateMany}
   * should automatically inject the specified item(s) returned by the adapter
   * into the the Model's collection on success.
   *
   * __Defaults to `true` in the Browser.__
   *
   * __Defaults to `false` in Node.js__
   *
   * @memberof Model
   * @type {boolean}
   */
  autoInject: isBrowser,
  bypassCache: false,

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
  eagerEject: false,

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
   * Whether to add property accessors to the prototype of {@link Model} for
   * each of the Model's relations. For each relation, the property accessor
   * will be added as the field specified by the `localField` option of the
   * relation definition. A relation property accessor returns related data by
   * accessing the related Model. If the related Model's collection is empty,
   * then the property accessors won't return anything.
   *
   * __Defaults to `true` in the Browser.__
   *
   * __Defaults to `false` in Node.js__
   *
   * @memberof Model
   * @type {boolean}
   */
  linkRelations: isBrowser,

  /**
   * What to do when injecting an item into the Model's collection that shares a
   * primary key with an item already in the Model's collection.
   *
   * Possible values:
   * - merge
   * - replace
   *
   * Merge:
   *
   * Recursively shallow copy properties from the new item onto the existing
   * item.
   *
   * Replace:
   *
   * Shallow copy top-level properties from the new item onto the existing item.
   * Any top-level own properties of the existing item that are _not_ on the new
   * item will be removed.
   *
   * @memberof Model
   * @type {string}
   * @default merge
   */
  onConflict: 'merge',

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
   * Whether {@link Model.create}, {@link Model.createMany},
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
   * Whether {@link Model.create}, {@link Model.createMany},
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
  upsert: true,

  /**
   * Create a new secondary index in the Collection instance of this Model.
   *
   * @param {string} name - The name of the new secondary index
   * @param {string[]} keyList - The list of keys to be used to create the index.
   */
  createIndex (name, keyList) {
    this.dbg('createIndex', 'name:', name, 'keyList:', keyList)
    this.collection.createIndex(name, keyList)
  },

  /**
   * Create a new instance of this Model from the provided properties.
   *
   * @param {Object} props - The initial properties of the new instance.
   * @return {Model} The instance.
   */
  createInstance (props) {
    let Ctor = this
    // Check to make sure "props" is not already an instance of this Model.
    return props instanceof Ctor ? props : new Ctor(props)
  },

  /**
   * Check whether "instance" is actually an instance of this Model.
   *
   * @param {Model} The instance to check.
   * @return {boolean} Whether "instance" is an instance of this Model.
   */
  is (instance) {
    return instance instanceof this
  },

  getAutoPkItems () {
    return this.getAll().filter(function (item) {
      return item._get('autoPk')
    })
  },

  changes (id, key) {
    this.dbg('changes', 'id:', id)
    const instance = this.get(id)
    if (instance) {
      return instance.changes(key)
    }
  },

  changed (id) {
    this.dbg('changed', 'id:', id)
    const instance = this.get(id)
    if (instance) {
      return instance.changed()
    }
  },

  hasChanges (id) {
    this.dbg('hasChanges', 'id:', id)
    const instance = this.get(id)
    if (instance) {
      return instance.hasChanges()
    }
  },

  /**
   * Insert the provided item or items into the Collection instance of this
   * Model.
   *
   * If an item is already in the collection then the provided item will either
   * merge with or replace the existing item based on the value of the
   * "onConflict" option.
   *
   * The collection's secondary indexes will be updated as each item is visited.
   *
   * @param {(Object|Object[]|Model|Model[])} items - The item or items to insert.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.onConflict] - What to do when an item is already in
   * the Collection instance. Possible values are `merge` or `replace`.
   * @return {(Model|Model[])} The injected entity or entities.
   */
  inject (items, opts) {
    const _this = this
    const op = 'inject'
    _this.dbg(op, 'item(s):', items, 'opts:', opts)
    opts || (opts = {})
    opts.op = op
    let singular = false
    const collection = _this.collection
    const idAttribute = _this.idAttribute
    const relationList = _this.relationList || []
    if (!utils.isArray(items)) {
      items = [items]
      singular = true
    }
    const timestamp = new Date().getTime()
    items = items.map(function (props) {
      let id = utils.get(props, idAttribute)
      let autoPk = false
      if (!utils.isSorN(id)) {
        if (opts.autoPk || (opts.autoPk === undefined && _this.autoPk)) {
          id = utils.uuid()
          utils.set(props, idAttribute, id)
          autoPk = true
        } else {
          throw new TypeError(`User#${idAttribute}: Expected string or number, found ${typeof id}!`)
        }
      }
      const existing = _this.get(id)
      if (props === existing) {
        return existing
      }

      relationList.forEach(function (def) {
        const Relation = def.Relation
        const relationIdAttribute = Relation.idAttribute
        const foreignKey = def.foreignKey

        let toInject = utils.get(props, def.localField)

        if (utils.isFunction(def.inject)) {
          def.inject(_this, def, props)
        } else if (toInject && def.inject !== false) {
          if (utils.isArray(toInject)) {
            toInject = toInject.map(function (toInjectItem) {
              if (toInjectItem !== Relation.get(utils.get(toInjectItem, relationIdAttribute))) {
                try {
                  if (foreignKey) {
                    utils.set(toInjectItem, foreignKey, id)
                  }
                  toInjectItem = Relation.inject(toInjectItem)
                } catch (err) {
                  throw new Error(`Failed to inject ${def.type} relation: "${def.relation}"! ${err.message}`)
                }
              }
              return toInjectItem
            })
            if (def.localKeys) {
              utils.set(props, def.localKeys, toInject.map(function (injected) {
                return utils.get(injected, relationIdAttribute)
              }))
            }
          } else {
            // handle injecting belongsTo and hasOne relations
            if (toInject !== Relation.get(utils.get(toInject, relationIdAttribute))) {
              try {
                if (def.localKey) {
                  utils.set(props, def.localKey, utils.get(toInject, Relation.idAttribute))
                }
                if (foreignKey) {
                  utils.set(toInject, def.foreignKey, utils.get(props, idAttribute))
                }
                toInject = Relation.inject(toInject)
              } catch (err) {
                throw new Error(`Failed to inject ${def.type} relation: "${def.relation}"!`)
              }
            }
          }
        }
        // remove relation properties from the item, since those relations have been injected by now
        if (def.link || (def.link === undefined && _this.linkRelations)) {
          utils.unset(props, def.localField)
        } else {
          utils.set(props, def.localField, toInject)
        }
      })

      if (existing) {
        const onConflict = opts.onConflict || _this.onConflict
        if (onConflict === 'merge') {
          utils.deepMixIn(existing, props)
        } else if (onConflict === 'replace') {
          utils.forOwn(existing, (value, key) => {
            if (key !== idAttribute && !props.hasOwnProperty(key)) {
              delete existing[key]
            }
          })
          existing.set(props)
        }
        props = existing
        collection.update(props)
      } else {
        props = _this.createInstance(props)
        if (autoPk) {
          props._set('autoPk', autoPk)
        }
        collection.insert(props)
      }
      props._set('$', timestamp)
      return props
    })
    return singular ? (items.length ? items[0] : undefined) : items
  },

  /**
   * Remove the instance with the given primary key from the Collection instance
   * of this Model.
   *
   * @param {(string|number)} id - The primary key of the instance to be removed.
   * @return {Model} The removed item, if any.
   */
  eject (id, opts) {
    const op = 'eject'
    this.dbg(op, 'id:', id, 'opts:', opts)
    opts || (opts = {})
    opts.op = op
    const item = this.get(id)
    if (item) {
      item._unset('$')
      this.collection.remove(item)
    }
    return item
  },

  /**
   * Remove the instances selected by "query" from the Collection instance of
   * this Model.
   *
   * @param {Object} [query] - The query used to select instances to remove.
   * @return {Model[]} The removed instances, if any.
   */
  ejectAll (params, opts) {
    const op = 'ejectAll'
    this.dbg(op, 'params:', params, 'opts:', opts)
    opts || (opts = {})
    opts.op = op
    const items = this.filter(params)
    const collection = this.collection
    items.forEach(function (item) {
      collection.remove(item)
    })
    return items
  },

  /**
   * Return the instance in the Collection instance of this Model that has
   * the given primary key, if such an instance can be found.
   *
   * @param {(string|number)} id - Primary key of the instance to retrieve.
   * @return {Model} The instance or undefined.
   */
  get: function (id) {
    this.dbg('get', 'id:', id)
    const instances = this.collection.get(id)
    return instances.length ? instances[0] : undefined
  },

  /**
   * Proxy for Collection#between
   */
  between (...args) {
    return this.collection.between(...args)
  },

  /**
   * Proxy for Collection#getAll
   */
  getAll (...args) {
    return this.collection.getAll(...args)
  },

  /**
   * Proxy for Collection#filter
   */
  filter (query, opts) {
    opts || (opts = {})
    return this.collection.filter(query, opts)
  },

  /**
  * Proxy for `Model.collection.query()`.
   * @return {Query}
   */
  query () {
    return this.collection.query()
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @param {string} [name]- The name of the adapter to retrieve.
   * @return {Adapter} The adapter, if any.
   */
  getAdapter (name) {
    this.dbg('getAdapter', 'name:', name)
    const adapter = this.getAdapterName(name)
    if (!adapter) {
      throw new ReferenceError(`${adapter} not found!`)
    }
    return this.adapters[adapter]
  },

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided
   *
   * @param {Object} [opts] - The options, if any.
   * @return {string} The name of the adapter.
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  },

  /**
   * Lifecycle hook. Called by `Model.create` after `Model.create` checks
   * whether it can do an upsert and before `Model.create` calls the `create`
   * method of an adapter.
   *
   * `Model.beforeCreate` will receive the same arguments that are passed to
   * `Model.create`. If `Model.beforeCreate` returns a promise, `Model.create`
   * will wait for the promise to resolve before continuing. If the promise
   * rejects, then the promise returned by `Model.create` will reject. If
   * `Model.beforeCreate` does not return a promise, `Model.create` will resume
   * execution immediately.
   *
   * @param {Object} props - Properties object that was passed to `Model.create`.
   * @param {Object} opts - Options object that was passed to `Model.create`.
   */
  beforeCreate () {},

  /**
   * The "C" in "CRUD", `Model.create` creates a single entity using the
   * `create` method of an adapter. If the `props` passed to `Model.create`
   * contain a primary key as configured by `Model.idAttribute` and
   * `opts.upsert` is `true` of `Model.upsert` is `true` and `opts.upsert` is
   * not `false`, then `Model.update` will be called instead.
   *
   * 1. `Model.beforeCreate` is called and passed the same arguments passed to
   * `Model.create`.
   * 1. `props` and `opts` are passed to the `create` method of the adapter
   * specified by `opts.adapter` or `Model.defaultAdapter`.
   * 1. `Model.afterCreate` is called with the `data` argument returned by the
   * adapter's `create` method and the `opts` argument passed to `Model.create`.
   * 1. If `opts.raw` is `true` or `Model.raw` is `true` and `opts.raw` is not
   * `false`, then a result object is returned that contained the created entity
   * and some metadata about the operation and its result. Otherwise, the
   * promise returned by `Model.create` resolves with the created entity.
   *
   * @param {Object} props - The properties from which to create the new entity.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.adapter] - The name of the registered adapter to use.
   * @param {boolean} [opts.raw] - The name of the registered adapter to use.
   * @param {boolean} [opts.upsert] - Whether to call {@link Model.update}
   * instead if `props` has a primary key.
   * @return {Object} The created entity, or if `raw` is `true` then a result
   * object.
   */
  create (props, opts) {
    const op = 'create'
    this.dbg(op, 'props:', props, 'opts:', opts)
    let adapterName

    props || (props = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    if (opts.upsert && utils.get(props, this.idAttribute) && (!this.is(props) || !props._get('autoPk'))) {
      return this.update(utils.get(props, this.idAttribute), props, opts)
    }
    return resolve(this.beforeCreate(props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .create(this, this.prototype.toJSON.call(props, opts), opts)
      })
      .then(data => {
        return resolve(this.afterCreate(data, opts))
          .then(() => {
            if (this.is(props) && props._get('$')) {
              this.eject(utils.get(props, this.idAttribute))
            }
            return handleResponse(this, data, opts, adapterName)
          })
      })
  },

  /**
   * Lifecycle hook. Called by `Model.create` after `Model.create` call the
   * `create` method of an adapter.
   *
   * `Model.afterCreate` will receive the `data` argument returned by the
   * adapter's `create` method and the `opts` argument passed to `Model.create`.
   * If `Model.afterCreate` returns a promise, `Model.create` will wait for the
   * promise to resolve before continuing. If the promise rejects, then the
   * promise returned by `Model.create` will reject. If `Model.afterCreate` does
   * not return a promise, `Model.create` will resume execution immediately.
   *
   * @param {Object} data - Data object returned by the adapter's `create` method.
   * @param {Object} opts - Options object that was passed to `Model.create`.
   */
  afterCreate () {},

  beforeCreateMany () {},
  createMany (items, opts) {
    const op = 'createMany'
    this.dbg(op, 'items:', items, 'opts:', opts)
    let adapterName

    items || (items = [])
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    if (opts.upsert) {
      let hasId = true
      items.forEach(item => {
        hasId = hasId && utils.get(item, this.idAttribute) && (!utils.isFunction(item._get) || !item._get('autoPk'))
      })
      if (hasId) {
        return this.updateMany(items, opts)
      }
    }

    return resolve(this.beforeCreateMany(items, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .createMany(this, items.map(item => this.prototype.toJSON.call(item, opts)), opts)
      })
      .then(data => {
        return resolve(this.afterCreateMany(data, opts))
          .then(() => {
            items.forEach(item => {
              if (this.is(item) && item._get('$')) {
                this.eject(utils.get(item, this.idAttribute))
              }
            })
            return handleResponse(this, data, opts, adapterName)
          })
      })
  },
  afterCreateMany () {},

  beforeFind () {},
  find (id, opts) {
    const op = 'find'
    this.dbg(op, 'id:', id, 'opts:', opts)
    let adapterName

    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeFind(id, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .find(this, id, opts)
      })
      .then(data => {
        return resolve(this.afterFind(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  },
  afterFind () {},

  beforeFindAll () {},
  findAll (query, opts) {
    const op = 'findAll'
    this.dbg(op, 'query:', query, 'opts:', opts)
    let adapterName

    query || (query = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeFindAll(query, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .findAll(this, query, opts)
      })
      .then(data => {
        return resolve(this.afterFindAll(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  },
  afterFindAll () {},

  beforeUpdate () {},
  update (id, props, opts) {
    const op = 'update'
    this.dbg(op, 'id:', id, 'props:', props, 'opts:', opts)
    let adapterName

    props || (props = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeUpdate(id, props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .update(this, id, this.prototype.toJSON.call(props, opts), opts)
      })
      .then(data => {
        return resolve(this.afterUpdate(id, data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  },
  afterUpdate () {},

  beforeUpdateMany () {},
  updateMany (items, opts) {
    const op = 'updateMany'
    this.dbg(op, 'items:', items, 'opts:', opts)
    let adapterName

    items || (items = [])
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeUpdateMany(items, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .updateMany(this, items.map(item => this.prototype.toJSON.call(item, opts)), opts)
      })
      .then(data => {
        return resolve(this.afterUpdateMany(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  },
  afterUpdateMany () {},

  beforeUpdateAll () {},
  /**
   * @param {Object} query={} - Selection query.
   * @param {Object} props - Update to apply to selected entities.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.raw=false] TODO
   */
  updateAll (query, props, opts) {
    const op = 'updateAll'
    this.dbg(op, 'query:', query, 'props:', props, 'opts:', opts)
    let adapterName

    query || (query = {})
    props || (props = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeUpdateAll(query, props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .updateAll(this, query, props, opts)
      })
      .then(data => {
        return resolve(this.afterUpdateAll(query, data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  },
  afterUpdateAll () {},

  beforeDestroy () {},

  /**
   * @param {(string|number)} id
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.raw=false] TODO
   */
  destroy (id, opts) {
    const op = 'destroy'
    this.dbg(op, 'id:', id, 'opts:', opts)
    let adapterName

    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeDestroy(id, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .destroy(this, id, opts)
      })
      .then(data => {
        return resolve(this.afterDestroy(id, opts))
          .then(() => {
            if (opts.raw) {
              data.adapter = adapterName
              if (opts.autoEject) {
                data.data = this.eject(id, opts)
              }
              return data
            } else if (opts.autoEject) {
              data = this.eject(id, opts)
            }
            return data
          })
      })
  },
  afterDestroy () {},

  beforeDestroyAll () {},
  destroyAll (query, opts) {
    const op = 'destroyAll'
    this.dbg(op, 'query:', query, 'opts:', opts)
    let adapterName

    query || (query = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeDestroyAll(query, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .destroyAll(this, query, opts)
      })
      .then(data => {
        return resolve(this.afterDestroyAll(query, opts))
          .then(() => {
            if (opts.raw) {
              data.adapter = adapterName
              if (opts.autoEject) {
                data.data = this.ejectAll(query, opts)
              }
              return data
            } else if (opts.autoEject) {
              data = this.ejectAll(query, opts)
            }
            return data
          })
      })
  },
  afterDestroyAll () {},

  beforeLoadRelations () {},
  loadRelations (id, relations, opts) {
    const _this = this
    let instance = _this.is(id) ? id : undefined
    id = instance ? utils.get(instance, _this.idAttribute) : id
    const op = 'loadRelations'
    _this.dbg(op, 'id:', id, 'relations:', relations, 'opts:', opts)
    relations || (relations = [])
    opts || (opts = {})
    const relationList = _this.relationList || []
    utils._(_this, opts)
    opts.op = op
    return resolve(_this.beforeLoadRelations(id, relations, opts))
      .then(() => {
        if (utils.isSorN(id) && !instance) {
          instance = _this.get(instance)
        }
        if (!instance) {
          throw new Error('You passed an id of an instance not found in the collection of the Model!')
        }
        if (utils.isString(relations)) {
          relations = [relations]
        }
        return Promise.all(relationList.map(function (def) {
          if (utils.isFunction(def.load)) {
            return def.load(_this, def, instance, opts)
          }
          let task
          if (def.foreignKey) {
            task = def.Relation.findAll({
              [def.foreignKey]: id
            }, opts)
          } else if (def.localKey) {
            const key = utils.get(instance, def.localKey)
            if (utils.isSorN(key)) {
              task = def.Relation.find(key, opts)
            }
          } else if (def.localKeys) {
            task = def.Relation.findAll({
              [def.Relation.idAttribute]: {
                'in': utils.get(instance, def.localKeys)
              }
            }, opts)
          } else if (def.foreignKeys) {
            task = def.Relation.findAll({
              [def.Relation.idAttribute]: {
                'contains': utils.get(instance, _this.idAttribute)
              }
            }, opts)
          }
          if (task) {
            task = task.then(function (data) {
              if (opts.raw) {
                data = data.data
              }
              utils.set(instance, def.localField, def.type === 'hasOne' ? (data.length ? data[0] : undefined) : data)
            })
          }
          return task
        }))
      })
      .then(() => {
        return resolve(this.afterLoadRelations(instance, relations, opts))
          .then(() => instance)
      })
  },
  afterLoadRelations () {},

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

    if (Parent && classProps.strictEs6Class) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(Child, Parent)
      } else {
        Child.__proto__ = Parent // eslint-disable-line
      }
    } else {
      const keys = Object.getOwnPropertyNames(Parent)
      keys.forEach(function (key) {
        if (keysToSkip[key]) {
          return
        }
        Object.defineProperty(Child, key, Object.getOwnPropertyDescriptor(Parent, key))
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

Object.defineProperties(Model, {
  /**
   * @ignore
   */
  __events: {
    configurable: true,
    value: {}
  },

  /**
   * Create a property where a Model's registered listeners can be stored.
   * @ignore
   */
  _events: {
    get () {
      // Make sure that a Model always has _its own_ set of registered listeners.
      // This check has to be made because ES6 class inheritance shallow copies
      // static properties, which means a child model would only have a reference
      // to the parent model's listeners.
      if (this.__events === (this.__super__ ? this.__super__ : Object.getPrototypeOf(this)).__events) {
        Object.defineProperty(this, '__events', {
          value: {}
        })
      }
      return this.__events
    }
  },

  /**
   * @ignore
   */
  _adapters: {
    configurable: true,
    value: {}
  },

  /**
   * Hash of adapters registered with this Model.
   *
   * @name adapters
   * @memberof Model
   * @type {Object}
   */
  adapters: {
    get () {
      const parentAdapters = (this.__super__ ? this.__super__ : Object.getPrototypeOf(this))._adapters
      // Make sure that a Model always has _its own_ set of registered adapters.
      // This check has to be made because ES6 class inheritance shallow copies
      // static properties, which means a child model would only have a reference
      // to the parent model's adapters.
      if (this._adapters === parentAdapters) {
        Object.defineProperty(this, '_adapters', {
          value: {}
        })
        utils.fillIn(this._adapters, parentAdapters)
      }
      return this._adapters
    }
  },

  /**
   * @ignore
   */
  _collection: {
    configurable: true,
    value: new Collection([], 'id')
  },

  /**
   * This Model's {@link Collection} instance. This is where instances of the
   * Model are stored if {@link Model.autoInject} is `true`.
   *
   * __You should use {@link Model.inject}, {@link Model.eject}, and
   * {@link Model.ejectAll} if you need to manually get data in and out of this
   * collection.__
   *
   * @name collection
   * @memberof Model
   * @type {Collection}
   */
  collection: {
    get () {
      // Make sure that a Model always has _its own_ collection. This check has to
      // be made because ES6 class inheritance shallow copies static properties,
      // which means a child Model would only have a reference to the parent
      // Model's collection.
      if (this._collection === (this.__super__ ? this.__super__ : Object.getPrototypeOf(this))._collection) {
        Object.defineProperty(this, '_collection', {
          value: new Collection([], this.idAttribute)
        })
        this._collection.on('all', this.emit, this)
        this._collection.createIndex('lastInjected', ['$'], {
          fieldGetter (obj) {
            return obj._get('$')
          }
        })
      }
      return this._collection
    }
  }
})

/**
 * Allow Models themselves emit events. Any events emitted on a Model's
 * collection will also be emitted on the Model itself.
 *
 * A Model's registered listeners are stored on the Model's `__events` property.
 */
utils.eventify(
  Model,
  function () {
    return this._events
  },
  function (value) {
    this._events = value
  }
)

/**
 * Allow instancess to emit events. Any events emitted instances in a Model's
 * collection will also be emitted on the collection itself, and hence, on the
 * Model as well.
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
