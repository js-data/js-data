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
 * @property {Function} uuid TODO
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
let isBrowser

// Attempt to detect whether we are in the browser.
try {
  isBrowser = !!window
} catch (e) {
  isBrowser = false
}

export {isBrowser}

const toString = function (value) {
  return objToString.call(value)
}
const toInteger = function (value) {
  if (!value) {
    return value === 0 ? value : 0
  }
  value = +value
  if (value === INFINITY || value === -INFINITY) {
    const sign = (value < 0 ? -1 : 1)
    return sign * MAX_INTEGER
  }
  const remainder = value % 1
  return value === value ? (remainder ? value - remainder : value) : 0 // eslint-disable-line
}
const isPlainObject = function (value) {
  return (!!value && typeof value === 'object' && value.constructor === Object)
}
export const isArray = Array.isArray
export const isDate = function (value) {
  return (value && typeof value === 'object' && toString(value) === DATE_TAG)
}
export const isFunction = function (value) {
  return typeof value === 'function' || (value && toString(value) === FUNC_TAG)
}
export const isInteger = function (value) {
  return toString(value) === NUMBER_TAG && value == toInteger(value) // eslint-disable-line
}
export const isNull = function (value) {
  return value === null
}
export const isNumber = function (value) {
  const type = typeof value
  return type === 'number' || (value && type === 'object' && toString(value) === NUMBER_TAG)
}
export const isObject = function (value) {
  return toString(value) === OBJECT_TAG
}
export const isRegExp = function (value) {
  return toString(value) === REGEXP_TAG
}
export const isSorN = function (value) {
  return isString(value) || isNumber(value)
}
export const isString = function (value) {
  return typeof value === 'string' || (value && typeof value === 'object' && toString(value) === STRING_TAG)
}
export const isUndefined = function (value) {
  return value === undefined
}
export const isBoolean = function (value) {
  return toString(value) === BOOL_TAG
}
export const get = function (object, prop) {
  if (!prop) {
    return
  }
  const parts = prop.split('.')
  const last = parts.pop()

  while (prop = parts.shift()) { // eslint-disable-line
    object = object[prop]
    if (object == null) return
  }

  return object[last]
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
const PATH = /^(.+)\.(.+)$/

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
export const set = function (object, path, value) {
  if (isObject(path)) {
    forOwn(path, function (value, _path) {
      set(object, _path, value)
    })
  } else {
    const parts = PATH.exec(path)
    if (parts) {
      mkdirP(object, parts[1])[parts[2]] = value
    } else {
      object[path] = value
    }
  }
}

/**
 * Iterate over an object's own enumerable properties.
 *
 * @ignore
 * @param {Object} object The object whose properties are to be enumerated.
 * @param {Function} fn Iteration function.
 * @param {Object} [thisArg] Content to which to bind `fn`.
 */
export const forOwn = function (obj, fn, thisArg) {
  const keys = Object.keys(obj)
  const len = keys.length
  let i
  for (i = 0; i < len; i++) {
    fn.call(thisArg, obj[keys[i]], keys[i], obj)
  }
}

/**
 * Recursively shallow copy own enumberable properties from `source` to `dest`.
 *
 * @ignore
 * @param {Object} dest The destination object.
 * @param {Object} source The source object.
 */
export const deepMixIn = function (dest, source) {
  if (source) {
    forOwn(source, function (value, key) {
      const existing = this[key]
      if (isPlainObject(value) && isPlainObject(existing)) {
        deepMixIn(existing, value)
      } else {
        this[key] = value
      }
    }, dest)
  }
  return dest
}

/**
 * Proxy for `Promise.resolve`.
 *
 * @ignore
 * @param {*} [value] Value with which to resolve the Promise.
 * @return {Promise} Promise resolved with `value`.
 */
export const resolve = function (value) {
  return Promise.resolve(value)
}

/**
 * Proxy for `Promise.reject`.
 *
 * @ignore
 * @param {*} [value] Value with which to reject the Promise.
 * @return {Promise} Promise reject with `value`.
 */
export const reject = function (value) {
  return Promise.reject(value)
}

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
export const _ = function (dest, src) {
  for (var key in dest) {
    let value = dest[key]
    if (src[key] === undefined && !isFunction(value) && key && key.indexOf('_') !== 0) {
      src[key] = value
    }
  }
}

/**
 * Return the intersection of two arrays.
 *
 * @ignore
 * @param {Array} array1 First array.
 * @param {Array} array2 Second array.
 * @return {Array} Array of elements common to both arrays.
 */
export const intersection = function (array1, array2) {
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
}

/**
 * Shallow copy own enumerable properties from `src` to `dest` that are on `src`
 * but are missing from `dest.
 *
 * @ignore
 * @param {Object} dest The destination object.
 * @param {Object} source The source object.
 */
export const fillIn = function (dest, src) {
  forOwn(src, function (value, key) {
    if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
      dest[key] = value
    }
  })
}

/**
 * Return whether `prop` is matched by any string or regular expression in `bl`.
 *
 * @ignore
 * @param {string} prop The name of a property.
 * @param {Array} bl Array of strings and regular expressions.
 * @return {boolean} Whether `prop` was matched.
 */
export const isBlacklisted = function (prop, bl) {
  if (!bl || !bl.length) {
    return false
  }
  let matches
  for (var i = 0; i < bl.length; i++) {
    if ((toString(bl[i]) === '[object RegExp]' && bl[i].test(prop)) || bl[i] === prop) {
      matches = prop
      return matches
    }
  }
  return !!matches
}

/**
 * Proxy for `JSON.parse`.
 *
 * @ignore
 * @param {string} json JSON to parse.
 * @return {Object} Parsed object.
 */
export const fromJson = function (json) {
  return isString(json) ? JSON.parse(json) : json
}

/**
 * Proxy for `JSON.stringify`.
 *
 * @ignore
 * @param {*} value Value to serialize to JSON.
 * @return {string} JSON string.
 */
export const toJson = JSON.stringify

/**
 * Deep copy a value.
 *
 * @ignore
 * @param {*} from Value to deep copy.
 * @return {*} Deep copy of `from`.
 */
export const copy = function (from, to, stackFrom, stackTo, blacklist) {
  if (!to) {
    to = from
    if (from) {
      if (isArray(from)) {
        to = copy(from, [], stackFrom, stackTo, blacklist)
      } else if (isDate(from)) {
        to = new Date(from.getTime())
      } else if (isRegExp(from)) {
        to = new RegExp(from.source, from.toString().match(/[^\/]*$/)[0])
        to.lastIndex = from.lastIndex
      } else if (isObject(from)) {
        to = copy(from, Object.create(Object.getPrototypeOf(from)), stackFrom, stackTo, blacklist)
      }
    }
  } else {
    if (from === to) {
      throw new Error('Cannot copy! Source and destination are identical.')
    }

    stackFrom = stackFrom || []
    stackTo = stackTo || []

    if (isObject(from)) {
      let index = stackFrom.indexOf(from)
      if (index !== -1) {
        return stackTo[index]
      }

      stackFrom.push(from)
      stackTo.push(to)
    }

    let result
    if (isArray(from)) {
      let i
      to.length = 0
      for (i = 0; i < from.length; i++) {
        result = copy(from[i], null, stackFrom, stackTo, blacklist)
        if (isObject(from[i])) {
          stackFrom.push(from[i])
          stackTo.push(result)
        }
        to.push(result)
      }
    } else {
      if (isArray(to)) {
        to.length = 0
      } else {
        forOwn(to, function (value, key) {
          delete to[key]
        })
      }
      for (var key in from) {
        if (from.hasOwnProperty(key)) {
          if (isBlacklisted(key, blacklist)) {
            continue
          }
          result = copy(from[key], null, stackFrom, stackTo, blacklist)
          if (isObject(from[key])) {
            stackFrom.push(from[key])
            stackTo.push(result)
          }
          to[key] = result
        }
      }
    }
  }
  return to
}

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
export const eventify = function (target, getter, setter, enumerable) {
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
    on: {
      enumerable: !!enumerable,
      value (type, func, ctx) {
        if (!getter.call(this)) {
          setter.call(this, {})
        }
        const events = getter.call(this)
        events[type] = events[type] || []
        events[type].push({
          f: func,
          c: ctx
        })
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
    }
  })
}

export const classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

export const possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
  }

  return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}

export const addHiddenPropsToTarget = function (target, props) {
  forOwn(props, function (value, key) {
    props[key] = {
      writable: true,
      value
    }
  })
  Object.defineProperties(target, props)
}

export const extend = function (props, classProps) {
  const SuperClass = this
  let SubClass

  props || (props = {})
  classProps || (classProps = {})

  if (props.hasOwnProperty('constructor')) {
    SubClass = props.constructor
    delete props.constructor
  } else {
    SubClass = function (...args) {
      classCallCheck(this, SubClass)
      const _this = possibleConstructorReturn(this, (SubClass.__super__ || Object.getPrototypeOf(SubClass)).apply(this, args))
      return _this
    }
  }

  SubClass.prototype = Object.create(SuperClass && SuperClass.prototype, {
    constructor: {
      value: SubClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  })

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(SubClass, SuperClass)
  } else if (classProps.strictEs6Class) {
    SubClass.__proto__ = SuperClass // eslint-disable-line
  } else {
    forOwn(SuperClass, function (value, key) {
      SubClass[key] = value
    })
  }
  Object.defineProperty(SubClass, '__super__', {
    configurable: true,
    value: SuperClass
  })

  addHiddenPropsToTarget(SubClass.prototype, props)
  fillIn(SubClass, classProps)

  return SubClass
}

export const getSuper = function (instance, isCtor) {
  const Ctor = isCtor ? instance : instance.constructor
  return (Ctor.__super__ || Object.getPrototypeOf(Ctor) || Ctor.__proto__) // eslint-disable-line
}
