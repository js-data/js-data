import * as utils from '../utils'
import {
  action,
  actions,
  belongsTo,
  configure,
  hasMany,
  hasOne,
  initialize,
  setSchema
} from '../decorators'

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

const handleResponse = function handleResponse (resource, data, opts, adapterName) {
  if (opts.raw) {
    data.adapter = adapterName
    if (opts.autoInject) {
      data.data = resource.inject(data.data)
    }
    return data
  } else if (opts.autoInject) {
    data = resource.inject(data)
  }
  return data
}

// This is here so Babel will give us
// the inheritance helpers which we
// can re-use for the "extend" method
class BaseResource {}

export class Resource extends BaseResource {
  constructor (props) {
    super()
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
    configure(props || {})(this)
    this._unset('creating')
    this._set('previous', utils.copy(props))
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
    opts = opts || {}
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
    opts = opts || {}
    const Ctor = this.constructor
    let json = this
    if (this instanceof Resource) {
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
   * Return a reference to the Collection instance of this Resource.
   *
   * Will throw an error if a schema has not been defined for this Resource.
   * When the schema is defined, this method is replaced with one that can
   * return the Collection instance.
   *
   * A schema can be created automatically if .extend is used to create the
   * class, but ES6 or ES7 class definitions will need to use .schema(opts) or
   * @schema(opts) to get the schema initialized.
   *
   * @throws {Error} Schema must already be defined for Resource.
   * @return {Collection} The Collection instance of this Resource.
   */
  static data () {
    throw new Error(`${this.name}.data(): Did you forget to define a schema?`)
  }

  /**
   * Create a new secondary index in the Collection instance of this Resource.
   *
   * @param {string} name - The name of the new secondary index
   * @param {string[]} keyList - The list of keys to be used to create the index.
   */
  static createIndex (name, keyList) {
    this.data().createIndex(name, keyList)
  }

  /**
   * Create a new instance of this Resource from the provided properties.
   *
   * @param {Object} props - The initial properties of the new instance.
   * @return {Resource} The instance.
   */
  static createInstance (props) {
    let Ctor = this
    // Check to make sure "props" is not already an instance of this Resource.
    return props instanceof Ctor ? props : new Ctor(props)
  }

  /**
   * Check whether "instance" is actually an instance of this Resource.
   *
   * @param {Resource} The instance to check.
   * @return {boolean} Whether "instance" is an instance of this Resource.
   */
  static is (instance) {
    return instance instanceof this
  }

  /**
   * Insert the provided item or items into the Collection instance of this
   * Resource.
   *
   * If an item is already in the collection then the provided item will either
   * merge with or replace the existing item based on the value of the
   * "onConflict" option.
   *
   * The collection's secondary indexes will be updated as each item is visited.
   *
   * @param {(Object|Object[]|Resource|Resource[])} items - The item or items to insert.
   * @param {?Object} opts - Optional configuration. Properties:
   *   - {string} onConflict - What to do when an item is already in the Collection instance. May be "merge" or "replace".
   * @return {(Resource|Resource[])} Whether "instance" is an instance of this Resource.
   */
  static inject (items, opts) {
    opts = opts || {}
    const _this = this
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
   * of this Resource.
   *
   * @param {(string|number)} id - The primary key of the instance to be removed.
   * @return {Resource} The removed item, if any.
   */
  static eject (id) {
    const item = this.get(id)
    if (item) {
      item._unset('$')
      this.data().remove(item)
    }
    return item
  }

  /**
   * Remove the instances selected by "query" from the Collection instance of
   * this Resource.
   *
   * @param {?Object} query - The query used to select instances to remove.
   * @return {Resource[]} The removed instances, if any.
   */
  static ejectAll (params) {
    const items = this.filter(params)
    const collection = this.data()
    items.forEach(function (item) {
      collection.remove(item)
    })
    return items
  }

  /**
   * Return the instance in the Collection instance of this Resource that has
   * the given primary key, if such an instance can be found.
   *
   * @param {(string|number)} id - Primary key of the instance to retrieve.
   * @return {?Resource} The instance or undefined.
   */
  static get (id) {
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
    opts = opts || {}
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  }

  static beforeCreate () {}
  static create (props, opts) {
    let adapterName

    props = props || {}
    opts = opts || {}
    utils._(this, opts)
    opts.op = 'create'

    if (opts.upsert && utils.get(props, this.idAttribute)) {
      return this.update(utils.get(props, this.idAttribute), props, opts)
    }
    return Promise.resolve(this.beforeCreate(props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .create(this, this.prototype.toJSON.call(props, opts), opts)
      })
      .then(data => {
        return Promise.resolve(this.afterCreate(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterCreate () {}

  static beforeCreateMany () {}
  static createMany (items, opts) {
    let adapterName

    items = items || []
    opts = opts || {}
    utils._(this, opts)
    opts.op = 'createMany'

    if (opts.upsert) {
      let hasId = true
      items.forEach(function (item) {
        hasId = hasId && utils.get(item, this.idAttribute)
      })
      if (hasId) {
        return this.updateMany(items, opts)
      }
    }

    return Promise.resolve(this.beforeCreateMany(items, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .createMany(this, items.map(item => this.prototype.toJSON.call(item, opts)), opts)
      })
      .then(data => {
        return Promise.resolve(this.afterCreateMany(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterCreateMany () {}

  static beforeFind () {}
  static find (id, opts) {
    let adapterName

    opts = opts || {}
    utils._(this, opts)
    opts.op = 'find'

    return Promise.resolve(this.beforeFind(id, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .find(this, id, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterFind(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterFind () {}

  static beforeFindAll () {}
  static findAll (query, opts) {
    let adapterName

    query = query || {}
    opts = opts || {}
    utils._(this, opts)
    opts.op = 'findAll'

    return Promise.resolve(this.beforeFindAll(query, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .findAll(this, query, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterFindAll(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterFindAll () {}

  static beforeUpdate () {}
  static update (id, props, opts) {
    let adapterName

    props = props || {}
    opts = opts || {}
    utils._(this, opts)
    opts.op = 'update'

    return Promise.resolve(this.beforeUpdate(id, props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .update(this, id, this.prototype.toJSON.call(props, opts), opts)
      })
      .then(data => {
        return Promise.resolve(this.afterUpdate(id, data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterUpdate () {}

  static beforeUpdateMany () {}
  static updateMany (items, opts) {
    let adapterName

    items = items || []
    opts = opts || {}
    utils._(this, opts)
    opts.op = 'updateMany'

    return Promise.resolve(this.beforeUpdateMany(items, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .updateMany(this, items.map(item => this.prototype.toJSON.call(item, opts)), opts)
      })
      .then(data => {
        return Promise.resolve(this.afterUpdateMany(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterUpdateMany () {}

  static beforeUpdateAll () {}
  static updateAll (query, props, opts) {
    let adapterName

    query = query || {}
    props = props || {}
    opts = opts || {}
    utils._(this, opts)
    opts.op = 'updateAll'

    return Promise.resolve(this.beforeUpdateAll(query, props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .updateAll(this, query, props, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterUpdateAll(query, data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  }
  static afterUpdateAll () {}

  static beforeDestroy () {}
  static destroy (id, opts) {
    let adapterName

    opts = opts || {}
    utils._(this, opts)
    opts.op = 'destroy'

    return Promise.resolve(this.beforeDestroy(id, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .destroy(this, id, opts)
      })
      .then(() => this.afterDestroy(id, opts))
      .then(() => this.eject(id, opts))
  }
  static afterDestroy () {}

  static beforeDestroyAll () {}
  static destroyAll (query, opts) {
    let adapterName

    query = query || {}
    opts = opts || {}
    utils._(this, opts)
    opts.op = 'destroyAll'

    return Promise.resolve(this.beforeDestroyAll(query, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .destroyAll(this, query, opts)
      })
      .then(() => this.afterDestroyAll(query, opts))
      .then(() => this.ejectAll(query, opts))
  }
  static afterDestroyAll () {}

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
  static belongsTo (resource, opts) {
    return belongsTo(resource, opts)(this)
  }

  /**
   * Usage:
   *
   * User.hasMany(Post, {
   *   localField: 'my_posts'
   * })
   */
  static hasMany (resource, opts) {
    return hasMany(resource, opts)(this)
  }

  /**
   * Usage:
   *
   * User.hasOne(Profile, {
   *   localField: '_profile'
   * })
   */
  static hasOne (resource, opts) {
    return hasOne(resource, opts)(this)
  }

  static action (name, opts) {
    return action(name, opts)(this)
  }

  static actions (opts) {
    return actions(opts)(this)
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

  /**
   * Usage:
   *
   * var User = JSData.Resource.extend({...}, {...})
   */
  static extend (props, classProps) {
    let Child
    const Parent = this
    props = props || {}
    classProps = classProps || {}

    if (!classProps.name) {
      throw new TypeError(`name: Expected string, found ${typeof classProps.name}!`)
    }
    const _schema = classProps.schema || {
      [classProps.idAttribute]: {}
    }
    const initialize = props.initialize
    delete props.initialize
    _schema[classProps.idAttribute] = _schema[classProps.idAttribute] || {}
    classProps.shortname = classProps.shortname || utils.camelCase(classProps.name)

    if (props.hasOwnProperty('constructor')) {
      Child = props.constructor
      delete props.constructor
    } else {
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
        delete classProps.name
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

    __inherits__(Child, Parent)

    configure(props)(Child.prototype)
    configure(classProps)(Child)

    setSchema(_schema)(Child)

    return Child
  }
}

configure({
  adapters: {},
  autoInject: isBrowser,
  bypassCache: false,
  csp: false,
  defaultAdapter: 'http',
  eagerEject: false,
  idAttribute: 'id',
  linkRelations: isBrowser,
  onConflict: 'merge',
  relationsEnumerable: false,
  raw: false,
  strategy: 'single',
  upsert: true,
  useFilter: true
})(Resource)

utils.Events(
  Resource.prototype,
  function () {
    return this._get('events')
  },
  function (value) {
    this._set('events', value)
  }
)
