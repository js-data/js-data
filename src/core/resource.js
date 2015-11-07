import * as decorators from './decorators'
import * as utils from './utils'
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
export function belongsTo (Resource, options = {}) {
  return function (target) {
    let localField = options.localField || Resource.name.toLowerCase()
    let localKey = options.localKey || Resource.name.toLowerCase() + '_id'
    let descriptor = {
      get () {
        return Resource.get(this[localKey])
      },
      set (parent) {
        this[localKey] = parent[Resource.idAttribute]
      },
      enumerable: options.enumerable !== undefined ? !!options.enumerable : false
    }
    if (options.link === false || (options.link === undefined && !target.linkRelations)) {
      delete descriptor.get
      delete descriptor.set
    }
    if (options.get) {
      let originalGet = descriptor.get
      descriptor.get = function () {
        return options.get(target, Resource, this, originalGet ? (...args) => originalGet.apply(this, args) : undefined)
      }
    }
    if (options.set) {
      let originalSet = descriptor.set
      descriptor.set = function (value) {
        return options.set(target, Resource, this, value, originalSet ? (...args) => originalSet.apply(this, args) : undefined)
      }
    }
    Object.defineProperty(target.prototype, localField, descriptor)
    return target
  }
}

function basicIndex (target) {
  target.$$index = {}
  target.$$collection = []
}

/**
 * Usage:
 *
 * @configure({
 *   idAttribute: '_id'
 * })
 * class User extends JSData.Resource {...}
 */
export function configure (props = {}) {
  return function (target) {
    utils.forOwn(target, function (value, key) {
      target[key] = utils.copy(value)
    })
  }
}

@basicIndex
@configure({
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
})
export class Resource {
  constructor (props) {
    configure(props)(this)
  }

  // Static methods
  static createInstance (props = {}) {
    let Constructor = this
    return props instanceof Constructor ? props : new Constructor(props)
  }

  static inject (props = {}) {
    let singular = false
    if (utils.isArray(props)) {
      props = props.map(this.createInstance)
    } else {
      singular = true
      props = [this.createInstance(props)]
    }
    let instances = props.map(function (instance) {
      let id = instance[this.idAttribute]
      if (!this.$$index[id]) {
        this.$$collection.push(instance)
      }
      this.$$index[id] = instance
      return instance
    }, this)
    return singular ? instances[0] : instances
  }

  static get (id) {
    return this.$$index[id]
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
  static belongsTo (Resource, opts) {
    return belongsTo(Resource, opts)(this)
  }

  static action (name, opts) {
    return decorators.action(name, opts)(this)
  }

  static actions (opts) {
    return decorators.actions(opts)(this)
  }

  static schema (opts) {
    return decorators.schema(opts)(this)
  }

  /**
   * Usage:
   *
   * var User = JSData.Resource.extend({...}, {...})
   */
  static extend (props = {}, classProps = {}) {
    let Child

    let _classProps = {}

    if (classProps.csp) {
      Child = function (props) {
        _classCallCheck(this, Child)

        _get(Object.getPrototypeOf(Child.prototype), 'constructor', this).call(this, props);
      }
    } else {
      // TODO: PascalCase(classProps.name)
      let name = classProps.name
      let func = `return function ${name}(props) {
                    _classCallCheck(this, ${name})
                    _get(Object.getPrototypeOf(${name}.prototype), 'constructor', this).call(this, props)
                  }`
      Child = new Function('_classCallCheck', '_get', func)(_classCallCheck, _get)
    }

    _inherits(Child, this)

    configure(props)(Child.prototype)
    configure(classProps)(Child)

    return Child
  }
}

// TODO: Use Babel's helpers instead of these
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _get = function get(_x3, _x4, _x5) {
  var _again = true;
  _function: while (_again) {
    var object = _x3,
      property = _x4,
      receiver = _x5;
    _again = false;
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);
      if (parent === null) {
        return undefined;
      } else {
        _x3 = parent;
        _x4 = property;
        _x5 = receiver;
        _again = true;
        desc = parent = undefined;
        continue _function;
      }
    } else if ('value' in desc) {
      return desc.value;
    } else {
      var getter = desc.get;
      if (getter === undefined) {
        return undefined;
      }
      return getter.call(receiver);
    }
  }
};

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

