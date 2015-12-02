import * as utils from '../utils'
import {
  action,
  actions,
  belongsTo,
  configure,
  hasMany,
  hasOne,
  schema
} from '../decorators'

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

function autoInject (resource, data, opts) {
  if (opts.autoInject) {
    return resource.inject(data)
  }
  return data
}

// This is here so Babel will give us
// the inheritance helpers which we
// can re-use for the "extend" method
class BaseResource {}

export class Resource extends BaseResource {
  constructor (props = {}) {
    super()
    Object.defineProperty(this, '$$props', {
      value: {}
    })
    configure(props)(this)
  }

  // Instance methods
  create (opts) {
    const Ctor = this.constructor
    return Ctor.create(this, opts).then(data => {
      // Might need to find a better way to do this
      if (data !== this && data[Ctor.idAttribute]) {
        utils.forOwn(data, (value, key) => {
          this[key] = value
        })
      }
      return this
    })
  }

  save (opts) {
    const Ctor = this.constructor
    const Opts = utils._(Ctor, opts)

    const adapterName = Ctor.getAdapterName(Opts)
    return Ctor.adapters[adapterName]
      .update(Ctor, this[Ctor.idAttribute], this, Opts)
  }

  destroy (opts) {
    const Ctor = this.constructor
    return Ctor.destroy(this[Ctor.idAttribute], opts)
  }

  // Static methods
  static data () {
    throw new Error(`${this.name}: Did you forget to define a schema?`)
  }

  static createIndex (name, keyList) {
    this.data().createIndex(name, keyList)
  }

  static createInstance (props) {
    let Constructor = this
    return props instanceof Constructor ? props : new Constructor(props)
  }

  static is (instance) {
    return instance instanceof this
  }

  static inject (items, opts = {}) {
    const _this = this
    let singular = false
    if (!utils.isArray(items)) {
      items = [items]
      singular = true
    }
    const collection = _this.data()
    const idAttribute = _this.idAttribute
    const relationList = _this.relationList || []
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
            if (key !== idAttribute) {
              if (!props.hasOwnProperty(key)) {
                delete existing[key]
              }
            }
          })
          utils.forOwn(props, (value, key) => {
            if (key !== idAttribute) {
              existing[key] = value
            }
          })
        }
        props = existing
      } else {
        props = _this.createInstance(props)
        props.$$props.$$s = true
        collection.index.insertRecord(props)
      }
      utils.forOwn(collection.indexes, function (index) {
        index.updateRecord(props)
      })
      return props
    })
    return singular ? (items.length ? items[0] : undefined) : items
  }

  static eject (id, opts = {}) {
    const item = this.get(id)
    if (item) {
      delete item.$$props.$$s
      this.data().remove(item)
    }
  }

  static ejectAll (params, opts = {}) {
    const items = this.filter(params)
    const collection = this.data()
    items.forEach(function (item) {
      collection.remove(item)
    })
    return items
  }

  static get (id) {
    let instances = this.data().get(id)
    return instances.length ? instances[0] : undefined
  }

  static between (...args) {
    return this.data().between(...args)
  }

  static getAll (...args) {
    return this.data().getAll(...args)
  }

  static filter (opts) {
    return this.data().filter(opts)
  }

  static query () {
    return this.data().query()
  }

  static getAdapter (opts) {
    return this.adapters[this.getAdapterName(opts)]
  }

  static getAdapterName (opts) {
    utils._(this, opts)
    return opts.adapter || opts.defaultAdapter
  }

  static beforeCreate () {}
  static create (props = {}, opts = {}) {
    utils._(this, opts)

    if (opts.upsert && utils.get(props, this.idAttribute)) {
      return this.update(utils.get(props, this.idAttribute), props, opts)
    }
    return Promise.resolve(this.beforeCreate(props, opts))
      .then(() => {
        const adapterName = this.getAdapterName(opts)
        return this.adapters[adapterName]
          .create(this, utils.omit(props, opts.omit), opts)
      })
      .then(data => {
        return Promise.resolve(this.afterCreate(data, opts))
          .then(() => autoInject(this, data, opts))
      })
  }
  static afterCreate () {}

  static beforeCreateMany () {}
  static createMany (items = [], opts = {}) {
    utils._(this, opts)

    if (opts.upsert) {
      let hasId = true
      items.forEach(function (item) {
        hasId = hasId && utils.get(item, this.idAttribute)
      })
      if (hasId) {
        return this.updateMany(items, opts)
      }
    }
    const adapterName = this.getAdapterName(opts)
    return Promise.resolve(this.beforeCreateMany(items, opts))
      .then(() => {
        return this.adapters[adapterName]
          .createMany(
            this,
            items.map(function (item) {
              return utils.omit(item, opts.omit)
            }),
            opts
          )
      })
      .then(data => {
        return Promise.resolve(this.afterCreateMany(data, opts))
          .then(data => autoInject(this, data, opts))
      })
  }
  static afterCreateMany () {}

  static beforeFind () {}
  static find (id, opts = {}) {
    utils._(this, opts)

    const adapterName = this.getAdapterName(opts)
    return Promise.resolve(this.beforeFind(id, opts))
      .then(() => {
        return this.adapters[adapterName]
          .find(this, id, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterFind(data, opts))
          .then(data => autoInject(this, data, opts))
      })
  }
  static afterFind () {}

  static beforeFindAll () {}
  static findAll (query = {}, opts = {}) {
    utils._(this, opts)

    const adapterName = this.getAdapterName(opts)
    return Promise.resolve(this.beforeFindAll(query, opts))
      .then(() => {
        return this.adapters[adapterName]
          .findAll(this, query, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterFindAll(data, opts))
          .then(data => autoInject(this, data, opts))
      })
  }
  static afterFindAll () {}

  static beforeUpdate () {}
  static update (id, props = {}, opts = {}) {
    utils._(this, opts)

    const adapterName = this.getAdapterName(opts)
    return Promise.resolve(this.beforeUpdate(id, props, opts))
      .then(() => {
        return this.adapters[adapterName]
          .update(this, id, props, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterUpdate(id, data, opts))
          .then(data => autoInject(this, data, opts))
      })
  }
  static afterUpdate () {}

  static beforeUpdateMany () {}
  static updateMany (items = [], opts = {}) {
    utils._(this, opts)

    const adapterName = this.getAdapterName(opts)
    return Promise.resolve(this.beforeUpdateMany(items, opts))
      .then(() => {
        return this.adapters[adapterName]
          .updateMany(this, items, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterUpdateMany(data, opts))
          .then(data => autoInject(this, data, opts))
      })
  }
  static afterUpdateMany () {}

  static beforeUpdateAll () {}
  static updateAll (query = {}, props = {}, opts = {}) {
    utils._(this, opts)

    const adapterName = this.getAdapterName(opts)
    return Promise.resolve(this.beforeUpdateAll(query, props, opts))
      .then(() => {
        return this.adapters[adapterName]
          .updateAll(this, query, props, opts)
      })
      .then(data => {
        return Promise.resolve(this.afterUpdateAll(query, data, opts))
          .then(data => autoInject(this, data, opts))
      })
  }
  static afterUpdateAll () {}

  static beforeDestroy () {}
  static destroy (id, opts = {}) {
    utils._(this, opts)

    const adapterName = this.getAdapterName(opts)
    return Promise.resolve(this.beforeDestroy(id, opts))
      .then(() => {
        return this.adapters[adapterName]
          .destroy(this, id, opts)
      })
      .then(() => this.afterDestroy(id, opts))
      .then(() => this.eject(id, opts))
  }
  static afterDestroy () {}

  static beforeDestroyAll () {}
  static destroyAll (query = {}, opts = {}) {
    utils._(this, opts)

    const adapterName = this.getAdapterName(opts)
    return this.beforeDestroyAll(query, opts)
      .then(() => {
        return this.adapters[adapterName]
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

  static schema (opts) {
    return schema(opts)(this)
  }

  static configure (props) {
    return configure(props)(this)
  }

  /**
   * Usage:
   *
   * var User = JSData.Resource.extend({...}, {...})
   */
  static extend (props, classProps = {}) {
    let Child
    const Parent = this
    props = props || {}

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

    schema(_schema)(Child)

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
  returnMeta: false,
  strategy: 'single',
  useFilter: true
})(Resource)
