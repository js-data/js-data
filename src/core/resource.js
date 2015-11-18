import * as utils from './utils'
import {action, actions, configure, schema} from './decorators'
import {Collection} from './collection'

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

  static inject (props) {
    let singular = false
    if (utils.isArray(props)) {
      props = props.map(this.createInstance, this)
    } else {
      singular = true
      props = [this.createInstance(props)]
    }
    const collection = this.data()
    props.forEach(instance => {
      collection.index.updateRecord(instance)
      instance.$$s = true
      utils.forOwn(collection.indexes, function (index) {
        index.updateRecord(instance)
      })
    })
    return singular ? props[0] : props
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
  static extend (props = {}, classProps = {}) {
    let Child
    let Parent = this

    if (classProps.csp) {
      Child = function (props) {
        __callCheck__(this, Child)
        Parent.call(this, props)
      }
    } else {
      // TODO: PascalCase(classProps.name)
      let name = classProps.name
      let func = `return function ${name}(props) {
                    __callCheck__(this, ${name})
                    Parent.call(this, props)
                  }`
      Child = new Function('__callCheck__', 'Parent', func)(__callCheck__, Parent) // eslint-disable-line
    }

    __inherits__(Child, this)

    configure(props)(Child.prototype)
    configure(classProps)(Child)

    schema({
      [Child.idAttribute]: {}
    })(Child)

    return Child
  }
}

configure({
  autoInject: isBrowser,
  bypassCache: false,
  csp: false,
  defaultAdapter: 'http',
  eagerEject: false,
  idAttribute: 'id',
  linkRelations: isBrowser,
  relationsEnumerable: false,
  returnMeta: false,
  strategy: 'single',
  useFilter: true
})(Resource)
