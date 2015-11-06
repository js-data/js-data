let schema = require('./schema')

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
export function configure (options = {}) {
  return function (target) {
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        // TODO: Make deep copy
        target[key] = options[key]
      }
    }
    // See See https://gist.github.com/jmdobry/519a375009cd744b8348#file-schema-js
    schema({
      [target.idAttribute]: {}
    })(target)
  }
}

@basicIndex
@schema({
  $$saved: {
    enumerable: false
  }
})
export class Resource {
  constructor (props) {
    configure(props)(this)
  }

  // Instance properties

  // Instance methods
  touchSaved() {
    let saved = new Date().getTime()
    if (saved === this.$$saved) {
      saved++
    }
    return this.$$saved = saved
  }

  // Class properties
  static idAttribute = 'id'
  static autoInject = true

  // Static methods
  static createInstance (props = {}) {
    let Constructor = this
    return props instanceof Constructor ? props : new Constructor(props)
  }

  static inject (props = {}) {
    if (Array.isArray(props)) {
      props = props.map(this.createInstance)
    } else {
      props = [this.createInstance(props)]
    }
    return props.map(function (instance) {
      let id = instance[this.idAttribute]
      if (!this.$$index[id]) {
        this.$$collection.push(instance)
      }
      this.$$index[id] = instance
      return instance
    }, this)
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
  static belongsTo (Resource, options) {
    // See https://gist.github.com/jmdobry/519a375009cd744b8348#file-belongsto-js
    return belongsTo(Resource, options)(this)
  }

  /**
   * Usage:
   *
   * var User = JSData.Resource.extend({...}, {...})
   */
  static extend (props = {}, classProps = {}) {
    let Child

    // TODO: Port over the "useClass" feature

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

