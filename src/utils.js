/**
 * Utility methods used by JSData.
 *
 * @example
 * import {utils} from 'js-data'
 * console.log(utils.isString('foo')) // true
 *
 * @namespace utils
 * @type {Object}
 */

const DOMAIN = 'utils'

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

const ERRORS = {
  '400' () { return `expected: ${arguments[0]}, found: ${arguments[2] ? arguments[1] : typeof arguments[1]}` },
  '404' () { return `${arguments[0]} not found` }
}

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
   * Reference to the Promise constructor used by JSData. Defaults to
   * `window.Promise` or `global.Promise`.
   *
   * @example <caption>Make JSData use a different `Promise` constructor</caption>
   * import Promise from 'bluebird'
   * import {utils} from 'js-data'
   * utils.Promise = Promise
   *
   * @name utils.Promise
   * @since 3.0.0
   * @type {Function}
   */
  Promise: Promise,

  /**
   * Shallow copy properties that meet the following criteria from `src` to
   * `dest`:
   *
   * - own enumerable
   * - not a function
   * - does not start with "_"
   *
   * @name utils._
   * @param {Object} dest Destination object.
   * @param {Object} src Source object.
   * @private
   * @since 3.0.0
   */
  _ (dest, src) {
    utils.forOwn(src, function (value, key) {
      if (key && utils.isUndefined(dest[key]) && !utils.isFunction(value) && key.indexOf('_') !== 0) {
        dest[key] = value
      }
    })
  },

  /**
   * TODO
   *
   * @name utils._forRelation
   * @private
   */
  _forRelation (opts, def, fn, ctx) {
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
   * @name utils._getIndex
   * @private
   */
  _getIndex (list, relation) {
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
   * Define hidden (non-enumerable), writable properties on `target` from the
   * provided `props`.
   *
   * @name utils.addHiddenPropsToTarget
   * @param {Object} target That to which `props` should be added.
   * @param {Object} props Properties to be added to `target`.
   */
  addHiddenPropsToTarget (target, props) {
    const map = {}
    Object.keys(props).forEach(function (propName) {
      const descriptor = Object.getOwnPropertyDescriptor(props, propName)

      descriptor.enumerable = false
      map[propName] = descriptor
    })
    Object.defineProperties(target, map)
  },

  /**
   * TODO
   *
   * @ignore
   */
  areDifferent (a, b, opts) {
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
  classCallCheck (instance, ctor) {
    if (!(instance instanceof ctor)) {
      throw utils.err(`${ctor.name}`)(500, 'Cannot call a class as a function')
    }
  },

  /**
   * Deep copy a value.
   *
   * @ignore
   * @param {*} from Value to deep copy.
   * @returns {*} Deep copy of `from`.
   */
  copy (from, to, stackFrom, stackTo, blacklist, plain) {
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
        throw utils.err(`${DOMAIN}.copy`)(500, 'Cannot copy! Source and destination are identical.')
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
  deepFillIn (dest, source) {
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
  deepMixIn (dest, source) {
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
   * @returns {Object} Diff.
   */
  diffObjects (a, b, opts) {
    opts || (opts = {})
    let equalsFn = opts.equalsFn
    let bl = opts.ignore
    const diff = {
      added: {},
      changed: {},
      removed: {}
    }
    if (!utils.isFunction(equalsFn)) {
      equalsFn = utils.deepEqual
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
   */
  equal (a, b) {
    return a == b // eslint-disable-line
  },

  /**
   * TODO
   */
  err (domain, target) {
    return function (code) {
      const prefix = `[${domain}:${target}] `
      let message = ERRORS[code].apply(null, Array.prototype.slice.call(arguments, 1))
      message = `${prefix}${message}\nhttp://www.js-data.io/v3.0/docs/errors#${code}`
      return new Error(message)
    }
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
  eventify (target, getter, setter) {
    target = target || this
    let _events = {}
    if (!getter && !setter) {
      getter = function () { return _events }
      setter = function (value) { _events = value }
    }
    Object.defineProperties(target, {
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
      on: {
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
  extend (props, classProps) {
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
        superClass.apply(this, args)
      }
    }

    // Setup inheritance of instance members
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        configurable: true,
        enumerable: false,
        value: subClass,
        writable: true
      }
    })

    const obj = Object
    // Setup inheritance of static members
    if (obj.setPrototypeOf) {
      obj.setPrototypeOf(subClass, superClass)
    } else if (classProps.strictEs6Class) {
      subClass.__proto__ = superClass // eslint-disable-line
    } else {
      utils.forOwn(superClass, function (value, key) {
        subClass[key] = value
      })
    }
    if (!subClass.hasOwnProperty('__super__')) {
      Object.defineProperty(subClass, '__super__', {
        configurable: true,
        value: superClass
      })
    }

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
  fillIn (dest, src) {
    utils.forOwn(src, function (value, key) {
      if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
        dest[key] = value
      }
    })
    return dest
  },

  /**
   * Find the last index of something according to the given checker function.
   *
   * @ignore
   * @param {Array} array The array to search.
   * @param {Function} fn Checker function.
   * @param {number} Index if found or -1 if not found.
   */
  findIndex (array, fn) {
    let index = -1
    if (!array) {
      return index
    }
    array.forEach(function (record, i) {
      if (fn(record)) {
        index = i
        return false
      }
    })
    return index
  },

  /**
   * TODO
   *
   * @ignore
   */
  forEachRelation (mapper, opts, fn, ctx) {
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
  forOwn (obj, fn, thisArg) {
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
   * @returns {Object} Parsed object.
   */
  fromJson (json) {
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
  getSuper (instance, isCtor) {
    const ctor = isCtor ? instance : instance.constructor
    if (ctor.hasOwnProperty('__super__')) {
      return ctor.__super__
    }
    return Object.getPrototypeOf(ctor) || ctor.__proto__ // eslint-disable-line
  },

  /**
   * Return the intersection of two arrays.
   *
   * @ignore
   * @param {Array} array1 First array.
   * @param {Array} array2 Second array.
   * @returns {Array} Array of elements common to both arrays.
   */
  intersection (array1, array2) {
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
   * @returns {boolean} Whether `prop` was matched.
   */
  isBlacklisted (prop, bl) {
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
  isBoolean (value) {
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
  isDate (value) {
    return (value && typeof value === 'object' && toStr(value) === DATE_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isFunction (value) {
    return typeof value === 'function' || (value && toStr(value) === FUNC_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isInteger (value) {
    return toStr(value) === NUMBER_TAG && value == toInteger(value) // eslint-disable-line
  },

  /**
   * TODO
   *
   * @ignore
   */
  isNull (value) {
    return value === null
  },

  /**
   * TODO
   *
   * @ignore
   */
  isNumber (value) {
    const type = typeof value
    return type === 'number' || (value && type === 'object' && toStr(value) === NUMBER_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isObject (value) {
    return toStr(value) === OBJECT_TAG
  },

  /**
   * TODO
   *
   * @ignore
   */
  isRegExp (value) {
    return toStr(value) === REGEXP_TAG
  },

  /**
   * TODO
   *
   * @ignore
   */
  isSorN (value) {
    return utils.isString(value) || utils.isNumber(value)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isString (value) {
    return typeof value === 'string' || (value && typeof value === 'object' && toStr(value) === STRING_TAG)
  },

  /**
   * TODO
   *
   * @ignore
   */
  isUndefined (value) {
    return value === undefined
  },

  /**
   * TODO
   *
   * @ignore
   */
  logify (target) {
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
  noDupeAdd (array, record, fn) {
    if (!array) {
      return
    }
    const index = this.findIndex(array, fn)
    if (index < 0) {
      array.push(record)
    }
  },

  /**
   * TODO
   *
   * @ignore
   */
  omit (props, keys) {
    // Remove relations
    const _props = {}
    utils.forOwn(props, function (value, key) {
      if (keys.indexOf(key) === -1) {
        _props[key] = value
      }
    })
    return _props
  },

  pick (props, keys) {
    const _props = {}
    utils.forOwn(props, function (value, key) {
      if (keys.indexOf(key) !== -1) {
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
  plainCopy (from) {
    return utils.copy(from, undefined, undefined, undefined, undefined, true)
  },

  /**
   * Proxy for `Promise.reject`.
   *
   * @ignore
   * @param {*} [value] Value with which to reject the Promise.
   * @returns {Promise} Promise reject with `value`.
   */
  reject (value) {
    return utils.Promise.reject(value)
  },

  /**
   * Remove the last item found in array according to the given checker function.
   *
   * @ignore
   * @param {Array} array The array to search.
   * @param {Function} fn Checker function.
   */
  remove (array, fn) {
    if (!array || !array.length) {
      return
    }
    const index = this.findIndex(array, fn)
    if (index >= 0) {
      array.splice(index, 1)
    }
  },

  /**
   * Proxy for `Promise.resolve`.
   *
   * @ignore
   * @param {*} [value] Value with which to resolve the Promise.
   * @returns {Promise} Promise resolved with `value`.
   */
  resolve (value) {
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
  deepEqual (a, b) {
    if (a === b) {
      return true
    }
    let _equal = true
    if (utils.isObject(a) && utils.isObject(b)) {
      utils.forOwn(a, function (value, key) {
        _equal = _equal && utils.deepEqual(value, b[key])
      })
      if (!_equal) {
        return _equal
      }
      utils.forOwn(b, function (value, key) {
        _equal = _equal && utils.deepEqual(value, a[key])
      })
    } else if (utils.isArray(a) && utils.isArray(b)) {
      a.forEach(function (value, i) {
        _equal = _equal && utils.deepEqual(value, b[i])
        if (!_equal) {
          return false
        }
      })
    } else {
      return false
    }
    return _equal
  },

  /**
   * Proxy for `JSON.stringify`.
   *
   * @ignore
   * @param {*} value Value to serialize to JSON.
   * @returns {string} JSON string.
   */
  toJson: JSON.stringify,

  /**
   * Unset the value at the provided key or path.
   *
   * @ignore
   * @param {Object} object The object from which to delete the property.
   * @param {string} path The key or path to the property.
   */
  unset (object, path) {
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
