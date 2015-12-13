import * as utils from '../utils'
import {
  belongsTo,
  configure,
  hasMany,
  hasOne,
  initialize,
  setSchema,
  registerAdapter
} from '../decorators'
import * as validate from '../validate'

const {
  resolve
} = utils

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

// This is here so Babel will give us
// the inheritance helpers which we
// can re-use for the "extend" method
class BaseModel {}

export class Model extends BaseModel {
  constructor (props, opts) {
    super()
    props || (props = {})
    opts || (opts = {})
    const $$props = {}
    Object.defineProperties(this, {
      _get: {
        value: function (key) { return utils.get($$props, key) }
      },
      _set: {
        value: function (key, value) { return utils.set($$props, key, value) }
      },
      _unset: {
        value: function (key) { return utils.unset($$props, key) }
      }
    })
    this._set('creating', true)
    if (opts.noValidate) {
      this._set('noValidate', true)
    }
    configure(props)(this)
    this._unset('creating')
    this._unset('noValidate')
    this._set('previous', utils.copy(props))
  }

  schema (key) {
    let _schema = this.constructor.schema
    return key ? _schema[key] : _schema
  }

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
  }

  // Instance methods
  create (opts) {
    return this.constructor.create(this, opts)
  }

  save (opts) {
    // TODO: move actual save logic here
    const Ctor = this.constructor

    const adapterName = Ctor.getAdapterName(opts)
    return Ctor.getAdapter(adapterName)
      .update(Ctor, utils.get(this, Ctor.idAttribute), this, opts)
  }

  destroy (opts) {
    // TODO: move actual destroy logic here
    const Ctor = this.constructor
    return Ctor.destroy(utils.get(this, Ctor.idAttribute), opts)
  }

  // TODO: move logic for single-item async operations onto the instance.

  /**
   * Return the value at the given path for this instance.
   *
   * @param {string} key - Path of value to retrieve.
   * @return {*} Value at path.
   */
  ['get'] (key) {
    return utils.get(this, key)
  }

  /**
   * Set the value for a given key, or the values for the given keys if "key" is
   * an object.
   *
   * @param {(string|Object)} key - Key to set or hash of key-value pairs to set.
   * @param {?*} value - Value to set for the given key.
   * @param {?Object} - Optional configuration. Properties:
   *   - {boolean=true} silent - Whether to trigger change events.
   */
  ['set'] (key, value, opts) {
    opts || (opts = {})
    // TODO: implement "silent"
    return utils.set(this, key, value)
  }

  /**
   * Return a plain object representation of this instance.
   *
   * @param {?Object} opts - Optional configuration. Properties:
   *   - {string[]} with - Array of relation names or relation fields to include in the representation.
   * @return {Object} Plain object representation of instance.
   */
  toJSON (opts) {
    opts || (opts = {})
    const Ctor = this.constructor
    let json = this
    if (this instanceof Model) {
      json = {}
      utils.set(json, this)
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

  /**
   * Static methods
   */

  /**
   * Return a reference to the Collection instance of this Model.
   *
   * Will throw an error if a schema has not been defined for this Model.
   * When the schema is defined, this method is replaced with one that can
   * return the Collection instance.
   *
   * A schema can be created automatically if .extend is used to create the
   * class, but ES6 or ES7 class definitions will need to use .schema(opts) or
   * @schema(opts) to get the schema initialized.
   *
   * @throws {Error} Schema must already be defined for Model.
   * @return {Collection} The Collection instance of this Model.
   */
  static data () {
    throw new Error(`${this.name}.data(): Did you forget to define a schema?`)
  }

  /**
   * Create a new secondary index in the Collection instance of this Model.
   *
   * @param {string} name - The name of the new secondary index
   * @param {string[]} keyList - The list of keys to be used to create the index.
   */
  static createIndex (name, keyList) {
    this.dbg('createIndex', 'name:', name, 'keyList:', keyList)
    this.data().createIndex(name, keyList)
  }

  /**
   * Create a new instance of this Model from the provided properties.
   *
   * @param {Object} props - The initial properties of the new instance.
   * @return {Model} The instance.
   */
  static createInstance (props) {
    let Ctor = this
    // Check to make sure "props" is not already an instance of this Model.
    return props instanceof Ctor ? props : new Ctor(props)
  }

  /**
   * Check whether "instance" is actually an instance of this Model.
   *
   * @param {Model} The instance to check.
   * @return {boolean} Whether "instance" is an instance of this Model.
   */
  static is (instance) {
    return instance instanceof this
  }

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
   * @param {?Object} opts - Optional configuration. Properties:
   *   - {string} onConflict - What to do when an item is already in the Collection instance. May be "merge" or "replace".
   * @return {(Model|Model[])} Whether "instance" is an instance of this Model.
   */
  static inject (items, opts) {
    const _this = this
    const op = 'inject'
    _this.dbg(op, 'item(s):', items, 'opts:', opts)
    opts || (opts = {})
    opts.op = op
    let singular = false
    const collection = _this.data()
    const idAttribute = _this.idAttribute
    const relationList = _this.relationList || []
    if (!utils.isArray(items)) {
      items = [items]
      singular = true
    }
    items.forEach(function (props) {
      relationList.forEach(function (def) {
        const Relation = def.Relation
        const toInject = utils.get(props, def.localField)
        if (utils.isFunction(def.inject)) {
          def.inject(_this, def, props)
        } else if (toInject && def.inject !== false) {
          if (utils.isArray(toInject)) {
            toInject.forEach(function (toInjectItem) {
              if (toInjectItem !== Relation.get(utils.get(toInjectItem, Relation.idAttribute))) {
                try {
                  if (def.foreignKey) {
                    utils.set(toInjectItem, def.foreignKey, utils.get(props, idAttribute))
                  }
                  Relation.inject(toInjectItem)
                } catch (err) {
                  throw new Error(`Failed to inject ${def.type} relation: "${def.relation}"!`)
                }
              }
            })
            if (def.localKeys) {
              utils.set(toInject, def.localKeys, toInject.map(function (injected) {
                return utils.get(injected, Relation.idAttribute)
              }))
            }
          } else {
            // handle injecting belongsTo and hasOne relations
            if (toInject !== Relation.get(Relation.idAttribute)) {
              try {
                if (def.localKey) {
                  utils.set(props, def.localKey, utils.get(toInject, Relation.idAttribute))
                }
                if (def.foreignKey) {
                  utils.set(toInject, def.foreignKey, utils.get(props, idAttribute))
                }
                Relation.inject(toInject)
              } catch (err) {
                throw new Error(`Failed to inject ${def.type} relation: "${def.relation}"!`)
              }
            }
          }
        }
        // remove relation properties from the item, since those relations have been injected by now
        if (typeof def.link === 'boolean' ? def.link : !!_this.linkRelations) {
          utils.unset(props, def.localField)
        }
      })
    })
    items = items.map(function (props) {
      const id = utils.get(props, idAttribute)
      if (!id) {
        throw new TypeError(`User#${idAttribute}: Expected string or number, found ${typeof id}!`)
      }
      const existing = _this.get(id)

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
      } else {
        props = _this.createInstance(props)
        props._set('$', true)
        collection.index.insertRecord(props)
      }
      utils.forOwn(collection.indexes, function (index) {
        index.updateRecord(props)
      })
      return props
    })
    return singular ? (items.length ? items[0] : undefined) : items
  }

  /**
   * Remove the instance with the given primary key from the Collection instance
   * of this Model.
   *
   * @param {(string|number)} id - The primary key of the instance to be removed.
   * @return {Model} The removed item, if any.
   */
  static eject (id, opts) {
    const op = 'eject'
    this.dbg(op, 'id:', id, 'opts:', opts)
    opts || (opts = {})
    opts.op = op
    const item = this.get(id)
    if (item) {
      item._unset('$')
      this.data().remove(item)
    }
    return item
  }

  /**
   * Remove the instances selected by "query" from the Collection instance of
   * this Model.
   *
   * @param {?Object} query - The query used to select instances to remove.
   * @return {Model[]} The removed instances, if any.
   */
  static ejectAll (params, opts) {
    const op = 'ejectAll'
    this.dbg(op, 'params:', params, 'opts:', opts)
    opts || (opts = {})
    opts.op = op
    const items = this.filter(params)
    const collection = this.data()
    items.forEach(function (item) {
      collection.remove(item)
    })
    return items
  }

  /**
   * Return the instance in the Collection instance of this Model that has
   * the given primary key, if such an instance can be found.
   *
   * @param {(string|number)} id - Primary key of the instance to retrieve.
   * @return {?Model} The instance or undefined.
   */
  static get (id) {
    this.dbg('get', 'id:', id)
    const instances = this.data().get(id)
    return instances.length ? instances[0] : undefined
  }

  /**
   * Proxy for Collection#between
   */
  static between (...args) {
    return this.data().between(...args)
  }

  /**
   * Proxy for Collection#getAll
   */
  static getAll (...args) {
    return this.data().getAll(...args)
  }

  /**
   * Proxy for Collection#filter
   */
  static filter (opts) {
    return this.data().filter(opts)
  }

  /**
   * Proxy for Collection#query
   */
  static query () {
    return this.data().query()
  }

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @param {?string} name - The name of the adapter to retrieve.
   * @return {Adapter} The adapter, if any.
   */
  static getAdapter (name) {
    this.dbg('getAdapter', 'name:', name)
    const adapter = this.getAdapterName(name)
    if (!adapter) {
      throw new ReferenceError(`${adapter} not found!`)
    }
    return this.adapters[adapter]
  }

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided
   *
   * @param {?Object} opts - The options, if any.
   * @return {string} The name of the adapter.
   */
  static getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  }

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
  static beforeCreate () {}

  /**
   * The "C" in "CRUD", `Model.create` creates a single entity using the
   * `create` method of an adapter. If the `props` passed to `Model.create`
   * contain a primary key as configured by `Model.idAttribute` and
   * `opts.upsert` is `true` of `Model.upsert` is `true` and `opts.upsert` is
   * not `false`, then `Model.update` will be called instead.
   *
   * `Model.beforeCreate` is called and passed the same arguments passed to
   * `Model.create.
   *
   * `props` and `opts` are passed to the `create` method of the adapter
   * specified by `opts.adapter` or `Model.defaultAdapter.
   *
   * `Model.afterCreate` is called with the `data` argument returned by the
   * adapter's `create` method and the `opts` argument passed to `Model.create`.
   *
   * If `opts.raw` is `true` or `Model.raw` is `true` and `opts.raw` is not
   * `false`, then a result object is returned that contained the created entity
   * and some metadata about the operation and its result.
   *
   * Otherwise, the promise returned by `Model.create` resolves with the created
   * entity.
   *
   * @param {?Object} props - The properties from which to create the new entity.
   * @param {?Object} opts - Optional configuration. Properties:
   *   - {string} adapter - The name of the registered adapter to use.
   *   - {boolean} raw - The name of the registered adapter to use.
   * @return {Object} The created entity, or if `raw` is `true` then a result object.
   */
  static create (props, opts) {
    const op = 'create'
    this.dbg(op, 'props:', props, 'opts:', opts)
    let adapterName

    props || (props = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    if (opts.upsert && utils.get(props, this.idAttribute)) {
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
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }

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
  static afterCreate () {}

  static beforeCreateMany () {}
  static createMany (items, opts) {
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
        hasId = hasId && utils.get(item, this.idAttribute)
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
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterCreateMany () {}

  static beforeFind () {}
  static find (id, opts) {
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
  }
  static afterFind () {}

  static beforeFindAll () {}
  static findAll (query, opts) {
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
  }
  static afterFindAll () {}

  static beforeUpdate () {}
  static update (id, props, opts) {
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
  }
  static afterUpdate () {}

  static beforeUpdateMany () {}
  static updateMany (items, opts) {
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
  }
  static afterUpdateMany () {}

  static beforeUpdateAll () {}
  static updateAll (query, props, opts) {
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
  }
  static afterUpdateAll () {}

  static beforeDestroy () {}
  static destroy (id, opts) {
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
  }
  static afterDestroy () {}

  static beforeDestroyAll () {}
  static destroyAll (query, opts) {
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
  }
  static afterDestroyAll () {}

  static log (level, ...args) {
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
  }

  static dbg (...args) {
    this.log('debug', ...args)
  }

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
  static belongsTo (model, opts) {
    return belongsTo(model, opts)(this)
  }

  /**
   * Usage:
   *
   * User.hasMany(Post, {
   *   localField: 'my_posts'
   * })
   */
  static hasMany (model, opts) {
    return hasMany(model, opts)(this)
  }

  /**
   * Usage:
   *
   * User.hasOne(Profile, {
   *   localField: '_profile'
   * })
   */
  static hasOne (model, opts) {
    return hasOne(model, opts)(this)
  }

  static initialize (opts) {
    return initialize(opts)(this)
  }

  static setSchema (opts) {
    return setSchema(opts)(this)
  }

  static configure (props) {
    return configure(props)(this)
  }

  static registerAdapter (name, adapter, opts) {
    return registerAdapter(name, adapter, opts)(this)
  }

  /**
   * Usage:
   *
   * var User = JSData.Model.extend({...}, {...})
   */
  static extend (props, classProps) {
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
          __callCheck__(this, Child)
          const _this = __possibleConstructorReturn__(this, Object.getPrototypeOf(Child).apply(this, args))
          if (initialize) {
            initialize.apply(this, args)
          }
          return _this
        }
      } else {
        const name = utils.pascalCase(classProps.name)
        const func = `return function ${name}() {
                        __callCheck__(this, ${name})
                        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(${name}).apply(this, arguments));
                        if (initialize) {
                          initialize.apply(this, arguments)
                        }
                        return _this
                      }`
        Child = new Function('__callCheck__', '__possibleConstructorReturn__', 'Parent', 'initialize', func)(__callCheck__, __possibleConstructorReturn__, Parent, initialize) // eslint-disable-line
      }
    }

    classProps.shortname = classProps.shortname || utils.camelCase(Child.name || classProps.name)
    delete classProps.name

    const _schema = classProps.schema
    delete classProps.schema

    __inherits__(Child, Parent)

    configure(props)(Child.prototype)
    configure(classProps)(Child)
    if (_schema) {
      setSchema(_schema)(Child)
    } else {
      Child.initialize()
    }

    return Child
  }
}

configure({
  adapters: {},
  autoEject: true,
  autoInject: isBrowser,
  bypassCache: false,
  csp: false,
  defaultAdapter: 'http',
  debug: false,
  eagerEject: false,
  idAttribute: 'id',
  linkRelations: isBrowser,
  onConflict: 'merge',
  relationsEnumerable: false,
  raw: false,
  strategy: 'single',
  upsert: true,
  useFilter: true
})(Model)

utils.Events(
  Model.prototype,
  function () {
    return this._get('events')
  },
  function (value) {
    this._set('events', value)
  }
)
