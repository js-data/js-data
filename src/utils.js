/**
 * @module utils
 * @memberof module:js-data
 */

/**
 * Return whether the provided value is an array.
 * @method
 * @param {*} [value] - The value to test.
 */
export const isArray = Array.isArray
/**
 * Return whether the provided value is an object type.
 * @param {*} [value] - The value to test.
 */
export function isObject (value) {
  return toString.call(value) === '[object Object]' || false
}
function isPlainObject (value) {
  return (!!value && typeof value === 'object' && value.constructor === Object)
}
/**
 * Return whether the provided value is a regular expression type.
 * @param {*} [value] - The value to test.
 */
export function isRegExp (value) {
  return toString.call(value) === '[object RegExp]' || false
}
/**
 * Return whether the provided value is a string type.
 * @param {*} [value] - The value to test.
 */
export function isString (value) {
  return typeof value === 'string' || (value && typeof value === 'object' && toString.call(value) === '[object String]') || false
}
/**
 * Return whether the provided value is a date type.
 * @param {*} [value] - The value to test.
 */
export function isDate (value) {
  return (value && typeof value === 'object' && toString.call(value) === '[object Date]') || false
}
/**
 * Return whether the provided value is a number type.
 * @param {*} [value] - The value to test.
 */
export function isNumber (value) {
  const type = typeof value
  return type === 'number' || (value && type === 'object' && toString.call(value) === '[object Number]') || false
}
/**
 * Return whether the provided value is a boolean type.
 * @param {*} [value] - The value to test.
 */
export function isBoolean (value) {
  return toString.call(value) === '[object Boolean]'
}
/**
 * Return whether the provided value is a function.
 * @param {*} [value] - The value to test.
 */
export function isFunction (value) {
  return typeof value === 'function' || (value && toString.call(value) === '[object Function]') || false
}
/**
 * Return whether the provided value is a string or a number.
 * @param {*} [value] - The value to test.
 */
export function isSorN (value) {
  return isString(value) || isNumber(value)
}
/**
 * Get the value at the provided key or path.
 * @param {Object} object - The object from which to retrieve a property.
 * @param {string} prop - The key or path to the property.
 */
export function get (object, prop) {
  if (!prop) {
    return
  }
  const parts = prop.split('.')
  const last = parts.pop()

  while (prop = parts.shift()) {
    object = object[prop]
    if (object == null) return
  }

  return object[last]
}
/**
 * Unset the value at the provided key or path.
 * @param {Object} object - The object on which to unset a property.
 * @param {string} prop - The key or path to the property.
 */
export function unset (object, prop) {
  const parts = prop.split('.')
  const last = parts.pop()

  while (prop = parts.shift()) {
    object = object[prop]
    if (object == null) return
  }

  delete object[last]
}
function mkdirP (object, path) {
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
 * @param {Object} object - The object on which to set a property.
 * @param {(string|Object)} path - The key or path to the property. Can also
 * pass in an object of path/value pairs, which will all be set on the target
 * object.
 * @param {*} [value] - The value to set.
 */
export function set (object, path, value) {
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
 * @param {Object} object - The object whose properties are to be enumerated.
 * @param {Function} fn - Iteration function.
 * @param {Object} [thisArg] - Content to which to bind `fn`.
 */
export function forOwn (obj, fn, thisArg) {
  const keys = Object.keys(obj)
  const len = keys.length
  let i
  for (i = 0; i < len; i++) {
    fn.call(thisArg, obj[keys[i]], keys[i], obj)
  }
}
/**
 * Recursively shallow copy own enumberable properties from `source` to `dest`.
 * @param {Object} dest - The destination object.
 * @param {Object} source - The source object.
 */
export function deepMixIn (dest, source) {
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
 * @param {*} [value] - Value with which to resolve the Promise.
 * @return {Promise} Promise resolved with `value`.
 */
export function resolve (value) {
  return Promise.resolve(value)
}
/**
 * Proxy for `Promise.reject`.
 * @param {*} [value] - Value with which to reject the Promise.
 * @return {Promise} Promise reject with `value`.
 */
export function reject (value) {
  return Promise.reject(value)
}
/**
 * Shallow copy own enumerable non-function properties from `Model` to `opts`.
 * @param {Model} Model - The source Model.
 * @param {Object} opts - The target object.
 */
export function _ (Model, opts) {
  for (var key in Model) {
    let value = Model[key]
    if (opts[key] === undefined && !isFunction(value)) {
      opts[key] = value
    }
  }
}
/**
 * Return the intersection of two arrays.
 * @param {Array} array1 - First array.
 * @param {Array} array2 - Second array.
 * @return {Array} Array of elements common to both arrays.
 */
export function intersection (array1, array2) {
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
 * @param {Object} dest - The destination object.
 * @param {Object} source - The source object.
 */
export function fillIn (dest, src) {
  forOwn(src, function (value, key) {
    if (dest[key] === undefined) {
      dest[key] = value
    }
  })
}
/**
 * Return whether `prop` is matched by any string or regular expression in `bl`.
 * @param {string} prop - The name of a property.
 * @param {Array} bl - Array of strings and regular expressions.
 * @return {boolean} Whether `prop` was matched.
 */
export function isBlacklisted (prop, bl) {
  if (!bl || !bl.length) {
    return false
  }
  let matches
  for (var i = 0; i < bl.length; i++) {
    if ((Object.prototype.toString.call(bl[i]) === '[object RegExp]' && bl[i].test(prop)) || bl[i] === prop) {
      matches = prop
      return matches
    }
  }
  return !!matches
}
/**
 * Proxy for `JSON.parse`.
 * @param {string} json - JSON to parse.
 * @return {Object} Parsed object.
 */
export function fromJson (json) {
  return isString(json) ? JSON.parse(json) : json
}
/**
 * Proxy for `JSON.stringify`.
 * @method
 * @param {*} value - Value to serialize to JSON.
 * @return {string} JSON string.
 */
export const toJson = JSON.stringify
/**
 * Deep copy a value.
 * @param {*} from - Value to deep copy.
 * @return {*} Deep copy of `from`.
 */
export function copy (from, to, stackFrom, stackTo, blacklist) {
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
const SPLIT = /\s+/
const NON_ALPHA = /[^A-Za-z]/g
const PASCAL_CASE = /(\w)(\w*)/g
function pascalize (g0, g1, g2) {
  return `${g1.toUpperCase()}${g2.toLowerCase()}`
}
function mapToPascal (x) {
  return x.replace(NON_ALPHA, '').replace(PASCAL_CASE, pascalize)
}
/**
 * Convert a string to pascalcase.
 * @param {string} str - String to convert.
 * @return {string} Converted string.
 */
export function pascalCase (str) {
  return str
    .split(SPLIT)
    .map(mapToPascal)
    .join('')
}
/**
 * Convert a string to camelcase.
 * @param {string} str - String to convert.
 * @return {string} Converted string.
 */
export function camelCase (str) {
  str = pascalCase(str)
  if (str) {
    return str.charAt(0).toLowerCase() + str.slice(1)
  }
  return str
}
/**
 * Add eventing capabilities into the target object.
 * @param {Object} target - Target object.
 * @param {Function} [getter] - Custom getter for retrieving the object's event
 * listeners.
 * @param {Function} [setter] - Custom setter for setting the object's event
 * listeners.
 */
export function eventify (target, getter, setter) {
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
