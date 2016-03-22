/**
 * @name utils
 * @memberof module:js-data
 * @type {Object}
 * @property {Function} addHiddenPropsToTarget TODO
 * @property {Function} classCallCheck TODO
 * @property {Function} copy TODO
 * @property {Function} deepMixIn TODO
 * @property {Function} eventify TODO
 * @property {Function} extend TODO
 * @property {Function} fillIn TODO
 * @property {Function} fromJson TODO
 * @property {Function} get TODO
 * @property {Function} getSuper TODO
 * @property {Function} intersection TODO
 * @property {Function} isArray TODO
 * @property {Function} isBlacklisted TODO
 * @property {boolean} isBrowser TODO
 * @property {Function} isBoolean TODO
 * @property {Function} isFunction TODO
 * @property {Function} isInteger TODO
 * @property {Function} isNull TODO
 * @property {Function} isNumber TODO
 * @property {Function} isObject TODO
 * @property {Function} isRegExp TODO
 * @property {Function} isSorN TODO
 * @property {Function} isString TODO
 * @property {Function} isUndefined TODO
 * @property {Function} possibleConstructorReturn TODO
 * @property {Function} reject TODO
 * @property {Function} resolve TODO
 * @property {Function} set TODO
 * @property {Function} toJson TODO
 */

const INFINITY = 1 / 0
const MAX_INTEGER = 1.7976931348623157e+308
const BOOL_TAG = '[object Boolean]'
const DATE_TAG = '[object Date]'
const FUNC_TAG = '[object Function]'
const NUMBER_TAG = '[object Number]'
const OBJECT_TAG = '[object Object]'
const REGEXP_TAG = '[object RegExp]'
const STRING_TAG = '[object String]'
const objToString = Object.prototype.toString
const PATH = /^(.+)\.(.+)$/

const toInteger = function (value) {
  if (!value) {
    return 0
  }
  // Coerce to number
  value = +value
  if (value === INFINITY || value === -INFINITY) {
    const sign = (value < 0 ? -1 : 1)
    return sign * MAX_INTEGER
  }
  const remainder = value % 1
  return value === value ? (remainder ? value - remainder : value) : 0 // eslint-disable-line
}

const toStr = function (value) {
  return objToString.call(value)
}

const isPlainObject = function (value) {
  return (!!value && typeof value === 'object' && value.constructor === Object)
}

const mkdirP = function (object, path) {
  if (!path) {
    return object
  }
  const parts = path.split('.')
  parts.forEach(function (key) {
    if (!object[key]) {
      object[key] = {}
    }
    object = object[key]
  })
  return object
}

const utils = {
  /**
   * TODO
   *
   * @ignore
   */
  Promise: Promise,

  /**
   * Shallow copy properties from src to dest that meet the following criteria:
   * - own enumerable
   * - not a function
   * - does not start with "_"
   *
   * @ignore
   * @param {Object} dest Destination object.
   * @param {Object} src Source object.
   */
  _: function (dest, src) {
    for (var key in dest) {
      let value = dest[key]
      if (src[key] === undefined && !utils.isFunction(value) && key && key.indexOf('_') !== 0) {
        src[key] = value
      }
    }
  },

  /**
   * TODO
   *
   * @ignore
   */
  _forRelation: function (opts, def, fn, ctx) {
    const relationName = def.relation
    let containedName = null
    let index
    opts || (opts = {})
    opts.with || (opts.with = [])

    if ((index = utils._getIndex(opts.with, relationName)) >= 0) {
      containedName = relationName
    } else if ((index = utils._getIndex(opts.with, def.localField)) >= 0) {
      containedName = def.localField
    }

    if (opts.withAll) {
      fn.call(ctx, def, {})
      return
    } else if (!containedName) {
      return
    }
    let optsCopy = {}
    utils.fillIn(optsCopy, def.getRelation())
    utils.fillIn(optsCopy, opts)
    optsCopy.with = opts.with.slice()
    optsCopy._activeWith = optsCopy.with.splice(index, 1)[0]
    optsCopy.with.forEach(function (relation, i) {
      if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
        optsCopy.with[i] = relation.substr(containedName.length + 1)
      } else {
        optsCopy.with[i] = ''
      }
    })
    fn.call(ctx, def, optsCopy)
  },

  /**
   * TODO
   *
   * @ignore
   */
  _getIndex: function (list, relation) {
    let index = -1
    list.forEach(function (_relation, i) {
      if (_relation === relation) {
        index = i
        return false
      } else if (utils.isObject(_relation)) {
        if (_relation.relation === relation) {
          index = i
          return false
        }
      }
    })
    return index
  },

  /**
   * TODO
   *
   * @ignore
   */
  addHiddenPropsToTarget: function (target, props) {
    const map = {}
    utils.forOwn(props, function (value, key) {
      map[key] = {
        writable: true,
        value
      }
    })
    Object.defineProperties(target, map)
  },

  /**
   * TODO
   *
   * @ignore
   */
  areDifferent: function (a, b, opts) {
    opts || (opts = {})
    const diff = utils.diffObjects(a, b, opts)
    const diffCount = Object.keys(diff.added).length +
      Object.keys(diff.removed).length +
      Object.keys(diff.changed).length
    return diffCount > 0
  },

  /**
   * TODO
   *
   * @ignore
   */
  classCallCheck: function (instance, ctor) {
    if (!(instance instanceof ctor)) {
      throw new TypeError('Cannot call a class as a function')
    }
  },

  /**
   * Deep copy a value.
   *
   * @ignore
   * @param {*} from Value to deep copy.
   * @return {*} Deep copy of `from`.
   */
  copy: function (from, to, stackFrom, stackTo, blacklist, plain) {
    if (!to) {
      to = from
      if (from) {
        if (utils.isArray(from)) {
          to = utils.copy(from, [], stackFrom, stackTo, blacklist, plain)
        } else if (utils.isDate(from)) {
          to = new Date(from.getTime())
        } else if (utils.isRegExp(from)) {
          to = new RegExp(from.source, from.toString().match(/[^\/]*$/)[0])
          to.lastIndex = from.lastIndex
        } else if (utils.isObject(from)) {
          if (plain) {
            to = utils.copy(from, {}, stackFrom, stackTo, blacklist, plain)
          } else {
            to = utils.copy(from, Object.create(Object.getPrototypeOf(from)), stackFrom, stackTo, blacklist, plain)
          }
        }
      }
    } else {
      if (from === to) {
        throw new Error('Cannot copy! Source and destination are identical.')
      }

      stackFrom = stackFrom || []
      stackTo = stackTo || []

      if (utils.isObject(from)) {
        let index = stackFrom.indexOf(from)
        if (index !== -1) {
          return stackTo[index]
        }

        stackFrom.push(from)
        stackTo.push(to)
      }

      let result
      if (utils.isArray(from)) {
        let i
        to.length = 0
        for (i = 0; i < from.length; i++) {
          result = utils.copy(from[i], null, stackFrom, stackTo, blacklist, plain)
          if (utils.isObject(from[i])) {
            stackFrom.push(from[i])
            stackTo.push(result)
          }
          to.push(result)
        }
      } else {
        if (utils.isArray(to)) {
          to.length = 0
        } else {
          utils.forOwn(to, function (value, key) {
            delete to[key]
          })
        }
        for (var key in from) {
          if (from.hasOwnProperty(key)) {
            if (utils.isBlacklisted(key, blacklist)) {
              continue
            }
            result = utils.copy(from[key], null, stackFrom, stackTo, blacklist, plain)
            if (utils.isObject(from[key])) {
              stackFrom.push(from[key])
              stackTo.push(result)
            }
            to[key] = result
          }
        }
      }
    }
    return to
  },

  /**
   * Recursively shallow fill in own enumberable properties from `source` to `dest`.
   *
   * @ignore
   * @param {Object} dest The destination object.
   * @param {Object} source The source object.
   */
  deepFillIn: function (dest, source) {
    if (source) {
      utils.forOwn(source, function (value, key) {
        const existing = dest[key]
        if (isPlainObject(value) && isPlainObject(existing)) {
          utils.deepFillIn(existing, value)
        } else if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
          dest[key] = value
        }
      })
    }
    return dest
  },

  /**
   * Recursively shallow copy own enumberable properties from `source` to `dest`.
   *
   * @ignore
   * @param {Object} dest The destination object.
   * @param {Object} source The source object.
   */
  deepMixIn: function (dest, source) {
    if (source) {
      utils.forOwn(source, function (value, key) {
        const existing = dest[key]
        if (isPlainObject(value) && isPlainObject(existing)) {
          utils.deepMixIn(existing, value)
        } else {
          dest[key] = value
        }
      })
    }
    return dest
  },

  /**
   * @param {Object} a Base object.
   * @param {Object} b Comparison object.
   * @return {Object} Diff.
   */
  diffObjects: function (a, b, opts) {
    opts || (opts = {})
    let equalsFn = opts.equalsFn
    let bl = opts.ignore
    const diff = {
      added: {},
      changed: {},
      removed: {}
    }
    if (!utils.isFunction(equalsFn)) {
      equalsFn = utils.strictEqual
    }

    utils.forOwn(b, function (oldValue, key) {
      const newValue = a[key]

      if (utils.isBlacklisted(key, bl) || equalsFn(newValue, oldValue)) {
        return
      }

      if (utils.isUndefined(newValue)) {
        diff.removed[key] = undefined
      } else if (!equalsFn(newValue, oldValue)) {
        diff.changed[key] = newValue
      }
    })

    utils.forOwn(a, function (newValue, key) {
      if (!utils.isUndefined(b[key]) || utils.isBlacklisted(key, bl)) {
        return
      }
      diff.added[key] = newValue
    })

    return diff
  },

  /**
   * TODO
   *
   * @ignore
   */
  equal: function (a, b) {
    return a == b // eslint-disable-line
  },

  /**
   * Add eventing capabilities into the target object.
   *
   * @ignore
   * @param {Object} target Target object.
   * @param {Function} [getter] Custom getter for retrieving the object's event
   * listeners.
   * @param {Function} [setter] Custom setter for setting the object's event
   * listeners.
   */
  eventify: function (target, getter, setter, enumerable) {
    target = target || this
    let _events = {}
    if (!getter && !setter) {
      getter = function () {
        return _events
      }
      setter = function (value) {
        _events = value
      }
    }
    Object.defineProperties(target, {
      emit: {
        enumerable: !!enumerable,
        value (...args) {
          const events = getter.call(this) || {}
          const type = args.shift()
          let listeners = events[type] || []
          let i
          for (i = 0; i < listeners.length; i++) {
            listeners[i].f.apply(listeners[i].c, args)
          }
          listeners = events.all || []
          args.unshift(type)
          for (i = 0; i < listeners.length; i++) {
            listeners[i].f.apply(listeners[i].c, args)
          }
        }
      },
      off: {
        enumerable: !!enumerable,
        value (type, func) {
          const events = getter.call(this)
          const listeners = events[type]
          if (!listeners) {
            setter.call(this, {})
          } else if (func) {
            for (let i = 0; i < listeners.length; i++) {
              if (listeners[i].f === func) {
                listeners.splice(i, 1)
                break
              }
            }
          } else {
            listeners.splice(0, listeners.length)
          }
        }
      },
      on: {
        enumerable: !!enumerable,
        value (type, func, ctx) {
          if (!getter.call(this)) {
            setter.call(this, {})
          }
          const events = getter.call(this)
          events[type] = events[type] || []
          events[type].push({
            c: ctx,
            f: func
          })
        }
      }
    })
  },

  /**
   * TODO
   *
   * @ignore
   */
  extend: function (props, classProps) {
    const superClass = this
    let subClass

    props || (props = {})
    classProps || (classProps = {})

    if (props.hasOwnProperty('constructor')) {
      subClass = props.constructor
      delete props.constructor
    } else {
      subClass = function (...args) {
        utils.classCallCheck(this, subClass)
        const _this = utils.possibleConstructorReturn(this, (subClass.__super__ || Object.getPrototypeOf(subClass)).apply(this, args))
        return _this
      }
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        configurable: true,
        enumerable: false,
        value: subClass,
        writable: true
      }
    })

    const obj = Object
    if (obj.setPrototypeOf) {
      obj.setPrototypeOf(subClass, superClass)
    } else if (classProps.strictEs6Class) {
      subClass.__proto__ = superClass // eslint-disable-line
    } else {
      utils.forOwn(superClass, function (value, key) {
        subClass[key] = value
      })
    }
    Object.defineProperty(subClass, '__super__', {
      configurable: true,
      value: superClass
    })

    utils.addHiddenPropsToTarget(subClass.prototype, props)
    utils.fillIn(subClass, classProps)

    return subClass
  },

  /**
   * Shallow copy own enumerable properties from `src` to `dest` that are on `src`
   * but are missing from `dest.
   *
   * @ignore
   * @param {Object} dest The destination object.
   * @param {Object} source The source object.
   */
  fillIn: function (dest, src) {
    utils.forOwn(src, function (value, key) {
      if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
        dest[key] = value
      }
    })
  },

  /**
   * TODO
   *
   * @ignore
   */
  forEachRelation: function (mapper, opts, fn, ctx) {
    const relationList = mapper.relationList || []
    if (!relationList.length) {
      return
    }
    relationList.forEach(function (def) {
      utils._forRelation(opts, def, fn, ctx)
    })
  },

  /**
   * Iterate over an object's own enumerable properties.
   *
   * @ignore
   * @param {Object} object The object whose properties are to be enumerated.
   * @param {Function} fn Iteration function.
   * @param {Object} [thisArg] Content to which to bind `fn`.
   */
  forOwn: function (obj, fn, thisArg) {
    const keys = Object.keys(obj)
    const len = keys.length
    let i
    for (i = 0; i < len; i++) {
      fn.call(thisArg, obj[keys[i]], keys[i], obj)
    }
  },

  /**
   * Proxy for `JSON.parse`.
   *
   * @ignore
   * @param {string} json JSON to parse.
   * @return {Object} Parsed object.
   */
  fromJson: function (json) {
    return utils.isString(json) ? JSON.parse(json) : json
  },

  /**
   * TODO
   *
   * @ignore
   */
  'get': function (object, prop) {
    if (!prop) {
      return
    }
    const parts = prop.split('.')
    const last = parts.pop()

    while (prop = parts.shift()) { // eslint-disable-line
      object = object[prop]
      if (object == null) { // eslint-disable-line
        return
      }
    }

    return object[last]
  },

  /**
   * TODO
   *
   * @ignore
   */
  getSuper: function (instance, isCtor) {
    const ctor = isCtor ? instance : instance.constructor
    return (ctor.__super__ || Object.getPrototypeOf(ctor) || ctor.__proto__) // eslint-disable-line
  },

  /**
   * Return the intersection of two arrays.
   *
   * @ignore
   * @param {Array} array1 First array.
   * @param {Array} array2 Second array.
   * @return {Array} Array of elements common to both arrays.
   */
  intersection: function (array1, array2) {
    if (!array1 || !array2) {
      return []
    }
    const result = []
    let item
    let i
    const len = array1.length
    for (i = 0; i < len; i++) {
      item = array1[i]
      if (result.indexOf(item) !== -1) {
        continue
      }
      if (array2.indexOf(item) !== -1) {
        result.push(item)
      }
    }
    return result
  },

  /**
   * TODO
   *
   * @ignore
   */
  isArray: Array.isArray,

  /**
   * Return whether `prop` is matched by any string or regular expression in `bl`.
   *
   * @ignore
   * @param {string} prop The name of a property.
   * @param {Array} bl Array of strings and regular expressions.
   * @return {boolean} Whether `prop` was matched.
   */
  isBlacklisted: function (prop, bl) {
    if (!bl || !bl.length) {
      return false
    }
    let matches
    for (var i = 0; i < bl.length; i++) {
      if ((toStr(bl[i]) === REGEXP_TAG && bl[i].test(prop)) || bl[i] === prop) {
        matches = prop
        return matches
      }
    }
    return !!matches
  },

  /**
   * TODO
   *
   * @ignore
   */
  isBoolean: function (value) {
    return toStr(value) === BOOL_TAG
  },

  /**
   * TODO
   *
   * @ignore
   */
  isBrowser: false,

  /**
   * TODO
   *
   * @ignore
   */
  isDate: function (value) {
    return (value && typeof value === 'object' && toStr(value) === DATE_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isFunction: function (value) {
    return typeof value === 'function' || (value && toStr(value) === FUNC_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isInteger: function (value) {
    return toStr(value) === NUMBER_TAG && value == toInteger(value) // eslint-disable-line
  },

  /**
   * TODO
   *
   * @ignore
   */
  isNull: function (value) {
    return value === null
  },

  /**
   * TODO
   *
   * @ignore
   */
  isNumber: function (value) {
    const type = typeof value
    return type === 'number' || (value && type === 'object' && toStr(value) === NUMBER_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isObject: function (value) {
    return toStr(value) === OBJECT_TAG
  },

  /**
   * TODO
   *
   * @ignore
   */
  isRegExp: function (value) {
    return toStr(value) === REGEXP_TAG
  },

  /**
   * TODO
   *
   * @ignore
   */
  isSorN: function (value) {
    return utils.isString(value) || utils.isNumber(value)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isString: function (value) {
    return typeof value === 'string' || (value && typeof value === 'object' && toStr(value) === STRING_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isUndefined: function (value) {
    return value === undefined
  },

  /**
   * TODO
   *
   * @ignore
   */
  logify: function (target) {
    utils.addHiddenPropsToTarget(target, {
      dbg (...args) {
        this.log('debug', ...args)
      },
      log (level, ...args) {
        if (level && !args.length) {
          args.push(level)
          level = 'debug'
        }
        if (level === 'debug' && !this.debug) {
          return
        }
        const prefix = `${level.toUpperCase()}: (${this.name || this.constructor.name})`
        if (console[level]) {
          console[level](prefix, ...args)
        } else {
          console.log(prefix, ...args)
        }
      }
    })
  },

  /**
   * TODO
   *
   * @ignore
   */
  omit: function (props, keys) {
    // Remove relations
    const _props = {}
    utils.forOwn(props, function (value, key) {
      if (keys.indexOf(key) === -1) {
        _props[key] = value
      }
    })
    return _props
  },

  /**
   * TODO
   *
   * @ignore
   */
  plainCopy: function (from) {
    return utils.copy(from, undefined, undefined, undefined, undefined, true)
  },

  /**
   * TODO
   *
   * @ignore
   */
  possibleConstructorReturn: function (self, call) {
    if (!self) {
      throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }

    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
  },

  /**
   * Proxy for `Promise.reject`.
   *
   * @ignore
   * @param {*} [value] Value with which to reject the Promise.
   * @return {Promise} Promise reject with `value`.
   */
  reject: function (value) {
    return utils.Promise.reject(value)
  },

  /**
   * Proxy for `Promise.resolve`.
   *
   * @ignore
   * @param {*} [value] Value with which to resolve the Promise.
   * @return {Promise} Promise resolved with `value`.
   */
  resolve: function (value) {
    return utils.Promise.resolve(value)
  },

  /**
   * Set the value at the provided key or path.
   *
   * @ignore
   * @param {Object} object The object on which to set a property.
   * @param {(string|Object)} path The key or path to the property. Can also
   * pass in an object of path/value pairs, which will all be set on the target
   * object.
   * @param {*} [value] The value to set.
   */
  set: function (object, path, value) {
    if (utils.isObject(path)) {
      utils.forOwn(path, function (value, _path) {
        utils.set(object, _path, value)
      })
    } else {
      const parts = PATH.exec(path)
      if (parts) {
        mkdirP(object, parts[1])[parts[2]] = value
      } else {
        object[path] = value
      }
    }
  },

  /**
   * TODO
   *
   * @ignore
   */
  strictEqual: function (a, b) {
    let _equal = a === b
    if (!_equal) {
      if (utils.isObject(a) && utils.isObject(b)) {
        utils.forOwn(a, function (value, key) {
          _equal = _equal && utils.strictEqual(value, b[key])
        })
        utils.forOwn(b, function (value, key) {
          _equal = _equal && utils.strictEqual(value, a[key])
        })
      } else if (utils.isArray(a) && utils.isArray(b)) {
        a.forEach(function (value, i) {
          _equal = _equal && utils.strictEqual(value, b[i])
        })
      }
    }
    return _equal
  },

  /**
   * Proxy for `JSON.stringify`.
   *
   * @ignore
   * @param {*} value Value to serialize to JSON.
   * @return {string} JSON string.
   */
  toJson: JSON.stringify,

  /**
   * Unset the value at the provided key or path.
   *
   * @ignore
   * @param {Object} object The object from which to delete the property.
   * @param {string} path The key or path to the property.
   */
  unset: function (object, path) {
    const parts = path.split('.')
    const last = parts.pop()

    while (path = parts.shift()) { // eslint-disable-line
      object = object[path]
      if (object == null) { // eslint-disable-line
        return
      }
    }

    object[last] = undefined
  }
}

// Attempt to detect whether we are in the browser.
try {
  utils.isBrowser = !!window
} catch (e) {
  utils.isBrowser = false
}

export default utils
