import * as utils from '../utils'
import {action, actions, configure, schema} from '../decorators'

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

/**
 * Usage:
 *
 * @belongsTo(User, {
 *   localKey: 'myUserId'
 * })
 * class Post extends JSData.Resource {...}
 *
 * @belongsTo(User)
 * @belongsTo(Post, {
 *   localField: '_post'
 * })
 * class Comment extends JSData.Resource {...}
 */
export function belongsTo (relation, opts = {}) {
  return function (target) {
    let localField = opts.localField || relation.name.toLowerCase()
    let localKey = opts.localKey || relation.name.toLowerCase() + '_id'
    let descriptor = {
      enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
      get () {
        return relation.get(this[localKey])
      },
      set (parent) {
        this[localKey] = parent[relation.idAttribute]
      }
    }
    if (opts.link === false || (opts.link === undefined && !target.linkRelations)) {
      delete descriptor.get
      delete descriptor.set
    }
    if (opts.get) {
      let originalGet = descriptor.get
      descriptor.get = function () {
        return opts.get(target, relation, this, originalGet ? (...args) => originalGet.apply(this, args) : undefined)
      }
    }
    if (opts.set) {
      let originalSet = descriptor.set
      descriptor.set = function (parent) {
        return opts.set(target, relation, this, parent, originalSet ? (...args) => originalSet.apply(this, args) : undefined)
      }
    }
    Object.defineProperty(target.prototype, localField, descriptor)
    return target
  }
}

function afterExec (opts, thisArg) {
  return function (data) {
    if (opts.autoInject) {
      data = thisArg.inject(data)
    }
    return data
  }
}

// This is here so Babel will give us
// the inheritance helpers which we
// can re-use for the "extend" method
class BaseResource {}

export class Resource extends BaseResource {
  constructor (props = {}) {
    super()
    Object.defineProperty(this, '$$props', {
      writable: true,
      value: {}
    })
    Object.defineProperty(this, '$$s', {
      writable: true,
      value: false
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

  static inject (props, opts = {}) {
    let singular = false
    if (utils.isArray(props)) {
      props = props.map(this.createInstance, this)
    } else {
      singular = true
      props = [this.createInstance(props)]
    }
    const collection = this.data()
    const idAttribute = this.idAttribute
    props = props.map(instance => {
      const id = instance[idAttribute]
      if (!id) {
        throw new TypeError(`User#${idAttribute}: Expected string or number, found ${typeof id}!`)
      }
      const existing = this.get(id)
      if (existing) {
        const onConflict = opts.onConflict || this.onConflict
        if (onConflict === 'merge') {
          utils.deepMixIn(existing, instance)
        } else if (onConflict === 'replace') {
          utils.forOwn(existing, (value, key) => {
            if (key !== idAttribute) {
              if (!instance.hasOwnProperty(key)) {
                delete existing[key]
              }
            }
          })
          utils.forOwn(instance, (value, key) => {
            if (key !== idAttribute) {
              existing[key] = value
            }
          })
        }
        instance = existing
      } else {
        collection.index.insertRecord(instance)
      }
      instance.$$s = true
      utils.forOwn(collection.indexes, function (index) {
        index.updateRecord(instance)
      })
      return instance
    })
    return singular ? props[0] : props
  }

  static eject (id, opts = {}) {
    const item = this.get(id)
    if (item) {
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

  static create (props = {}, opts = {}) {
    const _this = this
    utils._(_this, opts)

    if (opts.upsert && props[_this.idAttribute]) {
      return _this.update(props[_this.idAttribute], props, opts)
    }
    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .create(_this, utils.omit(props, opts.omit), opts)
      .then(afterExec(opts, _this))
  }

  static createMany (items = [], opts = {}) {
    const _this = this
    utils._(_this, opts)

    if (opts.upsert) {
      let hasId = true
      items.forEach(function (item) {
        hasId = hasId && item[_this.idAttribute]
      })
      if (hasId) {
        return _this.updateMany(items, opts)
      }
    }
    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .createMany(
        _this,
        items.map(function (item) {
          return utils.omit(item, opts.omit)
        }),
        opts
      )
      .then(afterExec(opts, _this))
  }

  static find (id, opts) {
    const _this = this
    utils._(_this, opts)

    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .find(_this, id, opts)
      .then(afterExec(opts, _this))
  }

  static findAll (query, opts) {
    const _this = this
    utils._(_this, opts)

    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .findAll(_this, query, opts)
      .then(afterExec(opts, _this))
  }

  static update (id, props, opts) {
    const _this = this
    utils._(_this, opts)

    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .update(_this, id, props, opts)
      .then(afterExec(opts, _this))
  }

  static updateMany (items, opts) {
    const _this = this
    utils._(_this, opts)

    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .updateMany(_this, items, opts)
      .then(afterExec(opts, _this))
  }

  static updateAll (query, props, opts) {
    const _this = this
    utils._(_this, opts)

    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .updateAll(_this, query, props, opts)
      .then(afterExec(opts, _this))
  }

  static destroy (id, opts) {
    const _this = this
    utils._(_this, opts)

    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .destroy(_this, id, opts)
  }

  static destroyAll (query, props, opts) {
    const _this = this
    utils._(_this, opts)

    const adapterName = _this.getAdapterName(opts)
    return _this.adapters[adapterName]
      .destroyAll(_this, query, opts)
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
  static belongsTo (resource, opts) {
    return belongsTo(resource, opts)(this)
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
  static extend (props = {}, classProps = {}, requireName = true) {
    let Child
    let Parent = this

    if (!classProps.name && requireName) {
      throw new TypeError(`name: Expected string, found ${typeof classProps.name}!`)
    }
    const _schema = classProps.schema || {
      [classProps.idAttribute]: {}
    }
    _schema[classProps.idAttribute] = _schema[classProps.idAttribute] || {}
    classProps.shortname = classProps.shortname || utils.camelCase(classProps.name)

    if (classProps.csp) {
      Child = function (props) {
        __callCheck__(this, Child)
        Parent.call(this, props)
      }
    } else {
      let name = utils.pascalCase(classProps.name)
      delete classProps.name
      let func = `return function ${name}(props) {
                    __callCheck__(this, ${name})
                    Parent.call(this, props)
                  }`
      Child = new Function('__callCheck__', 'Parent', func)(__callCheck__, Parent) // eslint-disable-line
    }

    __inherits__(Child, this)

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
