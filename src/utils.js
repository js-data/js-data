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
   * @method utils._
   * @param {Object} dest Destination object.
   * @param {Object} src Source object.
   * @private
   * @since 3.0.0
   */
  _ (dest, src) {
    utils.forOwn(src, function (value, key) {
      if (key && dest[key] === undefined && !utils.isFunction(value) && key.indexOf('_') !== 0) {
        dest[key] = value
      }
    })
  },

  /**
   * Recursively iterates over relations found in `opts.with`.
   *
   * @method utils._forRelation
   * @param {Object} opts Configuration options.
   * @param {Relation} def Relation definition.
   * @param {Function} fn Callback function.
   * @param {*} [thisArg] Execution context for the callback function.
   * @private
   * @since 3.0.0
   */
  _forRelation (opts, def, fn, thisArg) {
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
      fn.call(thisArg, def, {})
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
    fn.call(thisArg, def, optsCopy)
  },

  /**
   * Find the index of a relation in the given list
   *
   * @method utils._getIndex
   * @param {string[]} list List to search.
   * @param {string} relation Relation to find.
   * @private
   * @returns {number}
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
   * @example
   * import {utils} from 'js-data'
   * function Cat () {}
   * utils.addHiddenPropsToTarget(Cat.prototype, {
   *   say () {
   *     console.log('meow')
   *   }
   * })
   * const cat = new Cat()
   * cat.say() // "meow"
   *
   * @method utils.addHiddenPropsToTarget
   * @param {Object} target That to which `props` should be added.
   * @param {Object} props Properties to be added to `target`.
   * @since 3.0.0
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
   * Return whether the two objects are deeply different.
   *
   * @example
   * import {utils} from 'js-data'
   * utils.areDifferent({}, {}) // false
   * utils.areDifferent({ a: 1 }, { a: 1 }) // false
   * utils.areDifferent({ foo: 'bar' }, {}) // true
   *
   * @method utils.areDifferent
   * @param {Object} a Base object.
   * @param {Object} b Comparison object.
   * @param {Object} [opts] Configuration options.
   * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
   * @param {Array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
   * @returns {boolean} Whether the two objects are deeply different.
   * @see utils.diffObjects
   * @since 3.0.0
   */
  areDifferent (newObject, oldObject, opts) {
    opts || (opts = {})
    const diff = utils.diffObjects(newObject, oldObject, opts)
    const diffCount = Object.keys(diff.added).length +
    Object.keys(diff.removed).length +
    Object.keys(diff.changed).length
    return diffCount > 0
  },

  /**
   * Verified that the given constructor is being invoked via `new`, as opposed
   * to just being called like a normal function.
   *
   * @example
   * import {utils} from 'js-data'
   * function Cat () {
   *   utils.classCallCheck(this, Cat)
   * }
   * const cat = new Cat() // this is ok
   * Cat() // this throws an error
   *
   * @method utils.classCallCheck
   * @param {*} instance Instance that is being constructed.
   * @param {Constructor} ctor Constructor function used to construct the
   * instance.
   * @since 3.0.0
   * @throws {Error} Throws an error if the constructor is being improperly
   * invoked.
   */
  classCallCheck (instance, ctor) {
    if (!(instance instanceof ctor)) {
      throw utils.err(`${ctor.name}`)(500, 'Cannot call a class as a function')
    }
  },

  /**
   * Deep copy a value.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { foo: { bar: 'baz' } }
   * const b = utils.copy(a)
   * a === b // false
   * utils.areDifferent(a, b) // false
   *
   * @param {*} from Value to deep copy.
   * @param {*} [to] Destination object for the copy operation.
   * @param {*} [stackFrom] For internal use.
   * @param {*} [stackTo] For internal use.
   * @param {string[]|RegExp[]} [blacklist] List of strings or RegExp of
   * properties to skip.
   * @param {boolean} [plain] Whether to make a plain copy (don't try to use
   * original prototype).
   * @returns {*} Deep copy of `from`.
   * @since 3.0.0
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
          to = new RegExp(from.source, from.toString().match(/[^/]*$/)[0])
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
   * Recursively shallow fill in own enumerable properties from `source` to
   * `dest`.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { foo: { bar: 'baz' }, beep: 'boop' }
   * const b = { beep: 'bip' }
   * utils.deepFillIn(b, a)
   * console.log(b) // {"foo":{"bar":"baz"},"beep":"bip"}
   *
   * @method utils.deepFillIn
   * @param {Object} dest The destination object.
   * @param {Object} source The source object.
   * @see utils.fillIn
   * @see utils.deepMixIn
   * @since 3.0.0
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
   * Recursively shallow copy enumerable properties from `source` to `dest`.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { foo: { bar: 'baz' }, beep: 'boop' }
   * const b = { beep: 'bip' }
   * utils.deepFillIn(b, a)
   * console.log(b) // {"foo":{"bar":"baz"},"beep":"boop"}
   *
   * @method utils.deepMixIn
   * @param {Object} dest The destination object.
   * @param {Object} source The source object.
   * @see utils.fillIn
   * @see utils.deepFillIn
   * @since 3.0.0
   */
  deepMixIn (dest, source) {
    if (source) {
      for (var key in source) {
        const value = source[key]
        const existing = dest[key]
        if (isPlainObject(value) && isPlainObject(existing)) {
          utils.deepMixIn(existing, value)
        } else {
          dest[key] = value
        }
      }
    }
    return dest
  },

  /**
   * Return a diff of the base object to the comparison object.
   *
   * @example
   * import {utils} from 'js-data'
   * const oldObject = { foo: 'bar', a: 1234 }
   * const newObject = { beep: 'boop', a: 5678 }
   * const diff = utils.diffObjects(oldObject, newObject)
   * console.log(diff.added) // {"beep":"boop"}
   * console.log(diff.changed) // {"a":5678}
   * console.log(diff.removed) // {"foo":undefined}
   *
   * @method utils.diffObjects
   * @param {Object} newObject Comparison object.
   * @param {Object} oldObject Base object.
   * @param {Object} [opts] Configuration options.
   * @param {Function} [opts.equalsFn={@link utils.deepEqual}] Equality function.
   * @param {Array} [opts.ignore=[]] Array of strings or RegExp of fields to ignore.
   * @returns {Object} The diff from the base object to the comparison object.
   * @see utils.areDifferent
   * @since 3.0.0
   */
  diffObjects (newObject, oldObject, opts) {
    opts || (opts = {})
    let equalsFn = opts.equalsFn
    let blacklist = opts.ignore
    const diff = {
      added: {},
      changed: {},
      removed: {}
    }
    if (!utils.isFunction(equalsFn)) {
      equalsFn = utils.deepEqual
    }

    const newKeys = Object.keys(newObject).filter(function (key) {
      return !utils.isBlacklisted(key, blacklist)
    })
    const oldKeys = Object.keys(oldObject).filter(function (key) {
      return !utils.isBlacklisted(key, blacklist)
    })

    // Check for properties that were added or changed
    newKeys.forEach(function (key) {
      const oldValue = oldObject[key]
      const newValue = newObject[key]
      if (equalsFn(oldValue, newValue)) {
        return
      }
      if (oldValue === undefined) {
        diff.added[key] = newValue
      } else {
        diff.changed[key] = newValue
      }
    })

    // Check for properties that were removed
    oldKeys.forEach(function (key) {
      const oldValue = oldObject[key]
      const newValue = newObject[key]
      if (newValue === undefined && oldValue !== undefined) {
        diff.removed[key] = undefined
      }
    })

    return diff
  },

  /**
   * Return whether the two values are equal according to the `==` operator.
   *
   * @example
   * import {utils} from 'js-data'
   * console.log(utils.equal(1,1)) // true
   * console.log(utils.equal(1,'1')) // true
   * console.log(utils.equal(93, 66)) // false
   *
   * @method utils.equal
   * @param {*} a First value in the comparison.
   * @param {*} b Second value in the comparison.
   * @returns {boolean} Whether the two values are equal according to `==`.
   * @since 3.0.0
   */
  equal (a, b) {
    return a == b // eslint-disable-line
  },

  /**
   * Produce a factory function for making Error objects with the provided
   * metadata. Used throughout the various js-data components.
   *
   * @example
   * import {utils} from 'js-data'
   * const errorFactory = utils.err('domain', 'target')
   * const error400 = errorFactory(400, 'expected type', 'actual type')
   * console.log(error400) // [Error: [domain:target] expected: expected type, found: string
http://www.js-data.io/v3.0/docs/errors#400]
   * @method utils.err
   * @param {string} domain Namespace.
   * @param {string} target Target.
   * @returns {Function} Factory function.
   * @since 3.0.0
   */
  err (domain, target) {
    return function (code) {
      const prefix = `[${domain}:${target}] `
      let message = ERRORS[code].apply(null, Array.prototype.slice.call(arguments, 1))
      message = `${prefix}${message}
http://www.js-data.io/v3.0/docs/errors#${code}`
      return new Error(message)
    }
  },

  /**
   * Add eventing capabilities into the target object.
   *
   * @example
   * import {utils} from 'js-data'
   * const user = { name: 'John' }
   * utils.eventify(user)
   * user.on('foo', () => console.log(arguments))
   * user.emit('foo', 1, 'bar') // should log to console values (1, "bar")
   *
   * @method utils.eventify
   * @param {Object} target Target object.
   * @param {Function} [getter] Custom getter for retrieving the object's event
   * listeners.
   * @param {Function} [setter] Custom setter for setting the object's event
   * listeners.
   * @since 3.0.0
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
        value (type, func, thisArg) {
          if (!getter.call(this)) {
            setter.call(this, {})
          }
          const events = getter.call(this)
          events[type] = events[type] || []
          events[type].push({
            c: thisArg,
            f: func
          })
        }
      }
    })
  },

  /**
   * Used for sublcassing. Invoke this method in the context of a superclass to
   * to produce a subclass based on `props` and `classProps`.
   *
   * @example
   * import {utils} from 'js-data'
   * function Animal () {}
   * Animal.extend = utils.extend
   * const Cat = Animal.extend({
   *   say () {
   *     console.log('meow')
   *   }
   * })
   * const cat = new Cat()
   * cat instanceof Animal // true
   * cat instanceof Cat // true
   * cat.say() // "meow"
   *
   * @method utils.extend
   * @param {Object} props Instance properties for the subclass.
   * @param {Object} [props.constructor] Provide a custom constructor function
   * to use as the subclass.
   * @param {Object} props Static properties for the subclass.
   * @returns {Constructor} A new subclass.
   * @since 3.0.0
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
   * Shallow copy own enumerable properties from `src` to `dest` that are on
   * `src` but are missing from `dest.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { foo: 'bar', beep: 'boop' }
   * const b = { beep: 'bip' }
   * utils.fillIn(b, a)
   * console.log(b) // {"foo":"bar","beep":"bip"}
   *
   * @method utils.fillIn
   * @param {Object} dest The destination object.
   * @param {Object} source The source object.
   * @see utils.deepFillIn
   * @see utils.deepMixIn
   * @since 3.0.0
   */
  fillIn (dest, src) {
    utils.forOwn(src, function (value, key) {
      if (!dest.hasOwnProperty(key) || dest[key] === undefined) {
        dest[key] = value
      }
    })
  },

  /**
   * Find the last index of an item in an array according to the given checker function.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * const john = { name: 'John', age: 20 }
   * const sara = { name: 'Sara', age: 25 }
   * const dan = { name: 'Dan', age: 20 }
   * const users = [john, sara, dan]
   *
   * console.log(utils.findIndex(users, (user) => user.age === 25)) // 1
   * console.log(utils.findIndex(users, (user) => user.age > 19)) // 2
   * console.log(utils.findIndex(users, (user) => user.name === 'John')) // 0
   * console.log(utils.findIndex(users, (user) => user.name === 'Jimmy')) // -1
   *
   * @method utils.findIndex
   * @param {Array} array The array to search.
   * @param {Function} fn Checker function.
   * @returns {number} Index if found or -1 if not found.
   * @since 3.0.0
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
   * Recursively iterate over a {@link Mapper}'s relations according to
   * `opts.with`.
   *
   * @method utils.forEachRelation
   * @param {Mapper} mapper Mapper.
   * @param {Object} opts Configuration options.
   * @param {Function} fn Callback function.
   * @param {*} thisArg Execution context for the callback function.
   * @since 3.0.0
   */
  forEachRelation (mapper, opts, fn, thisArg) {
    const relationList = mapper.relationList || []
    if (!relationList.length) {
      return
    }
    relationList.forEach(function (def) {
      utils._forRelation(opts, def, fn, thisArg)
    })
  },

  /**
   * Iterate over an object's own enumerable properties.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { b: 1, c: 4 }
   * let sum = 0
   * utils.forOwn(a, function (value, key) {
   *   sum += value
   * })
   * console.log(sum) // 5
   *
   * @method utils.forOwn
   * @param {Object} object The object whose properties are to be enumerated.
   * @param {Function} fn Iteration function.
   * @param {Object} [thisArg] Content to which to bind `fn`.
   * @since 3.0.0
   */
  forOwn (obj, fn, thisArg) {
    const keys = Object.keys(obj)
    const len = keys.length
    let i
    for (i = 0; i < len; i++) {
      if (fn.call(thisArg, obj[keys[i]], keys[i], obj) === false) {
        break
      }
    }
  },

  /**
   * Proxy for `JSON.parse`.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * const a = utils.fromJson('{"name" : "John"}')
   * console.log(a) // { name: 'John' }
   *
   * @method utils.fromJson
   * @param {string} json JSON to parse.
   * @returns {Object} Parsed object.
   * @see utils.toJson
   * @since 3.0.0
   */
  fromJson (json) {
    return utils.isString(json) ? JSON.parse(json) : json
  },

  /**
   * Retrieve the specified property from the given object. Supports retrieving
   * nested properties.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { foo: { bar: 'baz' }, beep: 'boop' }
   * console.log(utils.get(a, 'beep')) // "boop"
   * console.log(utils.get(a, 'foo.bar')) // "baz"
   *
   * @method utils.get
   * @param {Object} object Object from which to retrieve a property's value.
   * @param {string} prop Property to retrieve.
   * @returns {*} Value of the specified property.
   * @see utils.set
   * @since 3.0.0
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
   * Return the superclass for the given instance or subclass. If an instance is
   * provided, then finds the parent class of the instance's constructor.
   *
   * @example
   * import {utils} from 'js-data'
   * // using ES2015 classes
   * class Foo {}
   * class Bar extends Foo {}
   * const barInstance = new Bar()
   * let baseType = utils.getSuper(barInstance)
   * console.log(Foo === baseType) // true
   *
   * // using Function constructor with utils.extend
   * function Foo () {}
   * Foo.extend = utils.extend
   * const Bar = Foo.extend()
   * const barInstance = new Bar()
   * let baseType = utils.getSuper(barInstance)
   * console.log(Foo === baseType) // true
   *
   * @method utils.getSuper
   * @param {Object|Function} instance Instance or constructor.
   * @param {boolean} [isCtor=false] Whether `instance` is a constructor.
   * @returns {Constructor} The superclass (grandparent constructor).
   * @since 3.0.0
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
   * @example
   * import {utils} from 'js-data'
   * const arrA = ['green', 'red', 'blue', 'red']
   * const arrB = ['green', 'yellow', 'red']
   * const intersected = utils.intersection(arrA, arrB)
   *
   * console.log(intersected) // ['green', 'red'])
   *
   * @method utils.intersection
   * @param {Array} array1 First array.
   * @param {Array} array2 Second array.
   * @returns {Array} Array of elements common to both arrays.
   * @since 3.0.0
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
   * Proxy for `Array.isArray`.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = [1,2,3,4,5]
   * const b = { foo: "bar" }
   * console.log(utils.isArray(a)) // true
   * console.log(utils.isArray(b)) // false
   *
   * @method utils.isArray
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is an array.
   * @since 3.0.0
   */
  isArray: Array.isArray,

  /**
   * Return whether `prop` is matched by any string or regular expression in
   * `blacklist`.
   *
   * @example
   * import {utils} from 'js-data'
   * const blacklist = [/^\$hashKey/g, /^_/g, 'id']
   * console.log(utils.isBlacklisted("$hashKey", blacklist)) // true
   * console.log(utils.isBlacklisted("id", blacklist)) // true
   * console.log(utils.isBlacklisted("_myProp", blacklist)) // true
   * console.log(utils.isBlacklisted("my_id", blacklist)) // false
   *
   * @method utils.isBlacklisted
   * @param {string} prop The name of a property to check.
   * @param {Array} blacklist Array of strings and regular expressions.
   * @returns {boolean} Whether `prop` was matched.
   * @since 3.0.0
   */
  isBlacklisted (prop, blacklist) {
    if (!blacklist || !blacklist.length) {
      return false
    }
    let matches
    for (var i = 0; i < blacklist.length; i++) {
      if ((toStr(blacklist[i]) === REGEXP_TAG && blacklist[i].test(prop)) || blacklist[i] === prop) {
        matches = prop
        return !!matches
      }
    }
    return !!matches
  },

  /**
   * Return whether the provided value is a boolean.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = true
   * const b = { foo: "bar" }
   * console.log(utils.isBoolean(a)) // true
   * console.log(utils.isBoolean(b)) // false
   *
   * @method utils.isBoolean
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is a boolean.
   * @since 3.0.0
   */
  isBoolean (value) {
    return toStr(value) === BOOL_TAG
  },

  /**
   * Return whether the provided value is a date.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = new Date()
   * const b = { foo: "bar" }
   * console.log(utils.isDate(a)) // true
   * console.log(utils.isDate(b)) // false
   *
   * @method utils.isDate
   * @param {*} value The value to test.
   * @returns {Date} Whether the provided value is a date.
   * @since 3.0.0
   */
  isDate (value) {
    return (value && typeof value === 'object' && toStr(value) === DATE_TAG)
  },

  /**
   * Return whether the provided value is a function.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = function (){ console.log('foo bar')}
   * const b = { foo: "bar" }
   * console.log(utils.isFunction(a)) // true
   * console.log(utils.isFunction(b)) // false
   *
   * @method utils.isFunction
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is a function.
   * @since 3.0.0
   */
  isFunction (value) {
    return typeof value === 'function' || (value && toStr(value) === FUNC_TAG)
  },

  /**
   * Return whether the provided value is an integer.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = 1
   * const b = 1.25
   * const c = '1'
   * console.log(utils.isInteger(a)) // true
   * console.log(utils.isInteger(b)) // false
   * console.log(utils.isInteger(c)) // false
   *
   * @method utils.isInteger
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is an integer.
   * @since 3.0.0
   */
  isInteger (value) {
    return toStr(value) === NUMBER_TAG && value == toInteger(value) // eslint-disable-line
  },

  /**
   * Return whether the provided value is `null`.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = null
   * const b = { foo: "bar" }
   * console.log(utils.isNull(a)) // true
   * console.log(utils.isNull(b)) // false
   *
   * @method utils.isNull
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is `null`.
   * @since 3.0.0
   */
  isNull (value) {
    return value === null
  },

  /**
   * Return whether the provided value is a number.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = 1
   * const b = -1.25
   * const c = '1'
   * console.log(utils.isNumber(a)) // true
   * console.log(utils.isNumber(b)) // true
   * console.log(utils.isNumber(c)) // false
   *
   * @method utils.isNumber
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is a number.
   * @since 3.0.0
   */
  isNumber (value) {
    const type = typeof value
    return type === 'number' || (value && type === 'object' && toStr(value) === NUMBER_TAG)
  },

  /**
   * Return whether the provided value is an object.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { foo: "bar" }
   * const b = 'foo bar'
   * console.log(utils.isObject(a)) // true
   * console.log(utils.isObject(b)) // false
   *
   * @method utils.isObject
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is an object.
   * @since 3.0.0
   */
  isObject (value) {
    return toStr(value) === OBJECT_TAG
  },

  /**
   * Return whether the provided value is a regular expression.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = /^\$.+$/ig
   * const b = new RegExp('^\$.+$', 'ig')
   * const c = { foo: "bar" }
   * console.log(utils.isRegExp(a)) // true
   * console.log(utils.isRegExp(b)) // true
   * console.log(utils.isRegExp(c)) // false
   *
   * @method utils.isRegExp
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is a regular expression.
   * @since 3.0.0
   */
  isRegExp (value) {
    return toStr(value) === REGEXP_TAG
  },

  /**
   * Return whether the provided value is a string or a number.
   *
   * @example
   * import {utils} from 'js-data'
   * console.log(utils.isSorN('')) // true
   * console.log(utils.isSorN(-1.65)) // true
   * console.log(utils.isSorN('my string')) // true
   * console.log(utils.isSorN({})) // false
   * console.log(utils.isSorN([1,2,4])) // false
   *
   * @method utils.isSorN
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is a string or a number.
   * @since 3.0.0
   */
  isSorN (value) {
    return utils.isString(value) || utils.isNumber(value)
  },

  /**
   * Return whether the provided value is a string.
   *
   * @example
   * import {utils} from 'js-data'
   * console.log(utils.isString('')) // true
   * console.log(utils.isString('my string')) // true
   * console.log(utils.isString(100)) // false
   * console.log(utils.isString([1,2,4])) // false
   *
   * @method utils.isString
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is a string.
   * @since 3.0.0
   */
  isString (value) {
    return typeof value === 'string' || (value && typeof value === 'object' && toStr(value) === STRING_TAG)
  },

  /**
   * Return whether the provided value is a `undefined`.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = undefined
   * const b = { foo: "bar"}
   * console.log(utils.isUndefined(a)) // true
   * console.log(utils.isUndefined(b.baz)) // true
   * console.log(utils.isUndefined(b)) // false
   * console.log(utils.isUndefined(b.foo)) // false
   *
   * @method utils.isUndefined
   * @param {*} value The value to test.
   * @returns {boolean} Whether the provided value is a `undefined`.
   * @since 3.0.0
   */
  isUndefined (value) {
    return value === undefined
  },

  /**
   * Mix in logging capabilities to the target.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { foo: "bar"}
   *
   * // Add standard logging to an object
   * utils.logify(a)
   * a.log('info', 'test log info') // output 'test log info' to console.
   *
   * // Toggle debug output of an object
   * a.dbg('test debug output') // does not output because debug is off.
   * a.debug = true
   * a.dbg('test debug output') // output 'test debug output' to console.
   *
   * @method utils.logify
   * @param {*} target The target.
   * @since 3.0.0
   */
  logify (target) {
    utils.addHiddenPropsToTarget(target, {
      dbg (...args) {
        if (utils.isFunction(this.log)) {
          this.log('debug', ...args)
        }
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
        if (utils.isFunction(console[level])) {
          console[level](prefix, ...args)
        } else {
          console.log(prefix, ...args)
        }
      }
    })
  },

  /**
   * Adds the given record to the provided array only if it's not already in the
   * array.
   *
   * @example
   * import {utils} from 'js-data'
   * const colors = ['red', 'green', 'yellow']
   *
   * console.log(colors.length) // 3
   * utils.noDupeAdd(colors, 'red')
   * console.log(colors.length) // 3, red already exists
   *
   * utils.noDupeAdd(colors, 'blue')
   * console.log(colors.length) // 4, blue was added
   *
   * @method utils.noDupeAdd
   * @param {Array} array The array.
   * @param {*} record The value to add.
   * @param {Function} fn Callback function passed to {@link utils.findIndex}.
   * @since 3.0.0
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
   * Return a shallow copy of the provided object, minus the properties
   * specified in `keys`.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { name: 'John', $hashKey: 1214910 }
   *
   * let b = utils.omit(a, ['$hashKey'])
   * console.log(b) // { name: 'John' }
   *
   * @method utils.omit
   * @param {Object} props The object to copy.
   * @param {string[]} keys Array of strings, representing properties to skip.
   * @returns {Object} Shallow copy of `props`, minus `keys`.
   * @since 3.0.0
   */
  omit (props, keys) {
    const _props = {}
    utils.forOwn(props, function (value, key) {
      if (keys.indexOf(key) === -1) {
        _props[key] = value
      }
    })
    return _props
  },

  /**
   * Return a shallow copy of the provided object, but only include the
   * properties specified in `keys`.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { name: 'John', $hashKey: 1214910 }
   *
   * let b = utils.pick(a, ['$hashKey'])
   * console.log(b) // { $hashKey: 1214910 }
   *
   * @method utils.pick
   * @param {Object} props The object to copy.
   * @param {string[]} keys Array of strings, representing properties to keep.
   * @returns {Object} Shallow copy of `props`, but only including `keys`.
   * @since 3.0.0
   */
  pick (props, keys) {
    return keys.reduce((map, key) => {
      map[key] = props[key]
      return map
    }, {})
  },

  /**
   * Return a plain copy of the given value.
   *
   * @example
   * import {utils} from 'js-data'
   * const a = { name: 'John' }
   * let b = utils.plainCopy(a)
   * console.log(a === b) // false
   *
   * @method utils.plainCopy
   * @param {*} value The value to copy.
   * @returns {*} Plain copy of `value`.
   * @see utils.copy
   * @since 3.0.0
   */
  plainCopy (value) {
    return utils.copy(value, undefined, undefined, undefined, undefined, true)
  },

  /**
   * Shortcut for `utils.Promise.reject(value)`.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * utils.reject("Testing static reject").then(function(data) {
   *   // not called
   * }).catch(function(reason) {
   *   console.log(reason); // "Testing static reject"
   * })
   *
   * @method utils.reject
   * @param {*} [value] Value with which to reject the Promise.
   * @returns {Promise} Promise reject with `value`.
   * @see utils.Promise
   * @since 3.0.0
   */
  reject (value) {
    return utils.Promise.reject(value)
  },

  /**
   * Remove the last item found in array according to the given checker function.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * const colors = ['red', 'green', 'yellow', 'red']
   * utils.remove(colors, (color) => color === 'red')
   * console.log(colors) // ['red', 'green', 'yellow']
   *
   * @method utils.remove
   * @param {Array} array The array to search.
   * @param {Function} fn Checker function.
   */
  remove (array, fn) {
    if (!array || !array.length) {
      return
    }
    const index = this.findIndex(array, fn)
    if (index >= 0) {
      array.splice(index, 1) // todo should this be recursive?
    }
  },

  /**
   * Shortcut for `utils.Promise.resolve(value)`.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * utils.resolve("Testing static resolve").then(function(data) {
   *   console.log(data); // "Testing static resolve"
   * }).catch(function(reason) {
   *   // not called
   * })
   *
   * @param {*} [value] Value with which to resolve the Promise.
   * @returns {Promise} Promise resolved with `value`.
   * @see utils.Promise
   * @since 3.0.0
   */
  resolve (value) {
    return utils.Promise.resolve(value)
  },

  /**
   * Set the value at the provided key or path.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * const john = {
   *   name: 'John',
   *   age: 25,
   *   parent: {
   *     name: 'John's Mom',
   *     age: 50
   *   }
   * }
   * // set value by key
   * utils.set(john, 'id', 98)
   * console.log(john.id) // 98
   *
   * // set value by path
   * utils.set(john, 'parent.id', 20)
   * console.log(john.parent.id) // 20
   *
   * // set value by path/value map
   * utils.set(john, {
   *   'id': 1098,
   *   'parent': { id: 1020 },
   *   'parent.age': '55'
   * })
   * console.log(john.id) // 1098
   * console.log(john.parent.id) // 1020
   * console.log(john.parent.age) // 55
   *
   * @method utils.set
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
   * Check whether the two provided objects are deeply equal.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * const objA = {
   *   name: 'John',
   *   id: 27,
   *   nested: {
   *     item: 'item 1',
   *     colors: ['red', 'green', 'blue']
   *   }
   * }
   *
   * const objB = {
   *   name: 'John',
   *   id: 27,
   *   nested: {
   *     item: 'item 1',
   *     colors: ['red', 'green', 'blue']
   *   }
   * }
   *
   * console.log(utils.deepEqual(a,b)) // true
   * objB.nested.colors.add('yellow') // make a change to a nested object's array
   * console.log(utils.deepEqual(a,b)) // false
   *
   * @method utils.deepEqual
   * @param {Object} a First object in the comparison.
   * @param {Object} b Second object in the comparison.
   * @returns {boolean} Whether the two provided objects are deeply equal.
   * @see utils.equal
   * @since 3.0.0
   */
  deepEqual (a, b) {
    if (a === b) {
      return true
    }
    let _equal = true
    if (utils.isArray(a) && utils.isArray(b)) {
      if (a.length !== b.length) {
        return false
      }
      for (let i = a.length; i--;) {
        if (!utils.deepEqual(a[i], b[i])) {
          // Exit loop early
          return false
        }
      }
    } else if (utils.isObject(a) && utils.isObject(b)) {
      utils.forOwn(a, function (value, key) {
        if (!(_equal = utils.deepEqual(value, b[key]))) {
          // Exit loop early
          return false
        }
      })
      if (_equal) {
        utils.forOwn(b, function (value, key) {
          if (!(_equal = utils.deepEqual(value, a[key]))) {
            // Exit loop early
            return false
          }
        })
      }
    } else {
      return false
    }
    return _equal
  },

  /**
   * Proxy for `JSON.stringify`.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * const a = { name: 'John' }
   * let jsonVal = utils.toJson(a)
   * console.log(jsonVal) // '{"name" : "John"}'
   *
   * @method utils.toJson
   * @param {*} value Value to serialize to JSON.
   * @returns {string} JSON string.
   * @see utils.fromJson
   * @since 3.0.0
   */
  toJson: JSON.stringify,

  /**
   * Unset the value at the provided key or path.
   *
   * @example
   * import {utils} from 'js-data'
   *
   * const john = {
   *   name: 'John',
   *   age: 25,
   *   parent: {
   *     name: 'John's Mom',
   *     age: 50
   *   }
   * }
   *
   * utils.unset(john, age)
   * utils.unset(john, parent.age)
   *
   * console.log(john.age) // null
   * console.log(john.parent.age) // null
   *
   * @method utils.unset
   * @param {Object} object The object from which to delete the property.
   * @param {string} path The key or path to the property.
   * @see utils.set
   * @since 3.0.0
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

export const safeSetProp = function (record, field, value) {
  if (record && record._set) {
    record._set(`props.${field}`, value)
  } else {
    utils.set(record, field, value)
  }
}

export const safeSetLink = function (record, field, value) {
  if (record && record._set) {
    record._set(`links.${field}`, value)
  } else {
    utils.set(record, field, value)
  }
}

export default utils
