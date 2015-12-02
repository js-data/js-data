export const isArray = Array.isArray
export function isObject (value) {
  return toString.call(value) === '[object Object]' || false
}
function isPlainObject (value) {
  return (!!value && typeof value === 'object' && value.constructor === Object)
}
export function isRegExp (value) {
  return toString.call(value) === '[object RegExp]' || false
}
export function isString (value) {
  return typeof value === 'string' || (value && typeof value === 'object' && toString.call(value) === '[object String]') || false
}
export function isDate (value) {
  return (value && typeof value === 'object' && toString.call(value) === '[object Date]') || false
}
export function isNumber (value) {
  let type = typeof value
  return type === 'number' || (value && type === 'object' && toString.call(value) === '[object Number]') || false
}
export function isFunction (value) {
  return typeof value === 'function' || (value && toString.call(value) === '[object Function]') || false
}
export function isSorN (value) {
  return isString(value) || isNumber(value)
}
export function get (object, prop) {
  const parts = prop.split('.')
  const last = parts.pop()

  while (prop = parts.shift()) {
    object = object[prop]
    if (object == null) return
  }

  return object[last]
}
export function unset (object, prop) {
  const parts = prop.split('.')
  const last = parts.pop()

  while (prop = parts.shift()) {
    object = object[prop]
    if (object == null) return
  }

  delete object[last]
}
function mkdirP(object, path) {
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
export function set (object, path, value) {
  const parts = PATH.exec(path)
  if (parts) {
    mkdirP(object, parts[1])[parts[2]] = value
  } else {
    object[path] = value
  }
}
export function forOwn (obj, fn, thisArg) {
  const keys = Object.keys(obj)
  const len = keys.length
  let i
  for (i = 0; i < len; i++) {
    fn.call(thisArg, obj[keys[i]], keys[i], obj)
  }
}
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
export function resolve (value) {
  return Promise.resolve(value)
}
export function reject (value) {
  return Promise.reject(value)
}
export function _ (Resource, opts) {
  for (var key in Resource) {
    let value = Resource[key]
    if (opts[key] === undefined && !isFunction(value)) {
      opts[key] = value
    }
  }
}
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
function isValidString (value) {
  return (value != null && value !== '') // jshint ignore:line
}
function join (items, separator = '') {
  return items.filter(isValidString).join(separator)
}
export function makePath (...args) {
  let result = join(args, '/')
  return result.replace(/([^:\/]|^)\/{2,}/g, '$1/')
}
export function fillIn (dest, src) {
  forOwn(src, function (value, key) {
    if (dest[key] === undefined) {
      dest[key] = value
    }
  })
}
export function makeBefore (target, key) {
  return function (fn) {
    const original = target[key]
    target[key] = function (...args) {
      let result = fn.apply(target, args)
      if (result !== undefined && !isArray(result)) {
        result = [result]
      }
      return original.apply(target, result || args)
    }
    makeBefore(target, key)
  }
}
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
export function omit (obj, bl) {
  let toRemove = []
  forOwn(obj, function (value, key) {
    if (isBlacklisted(key, bl)) {
      toRemove.push(key)
    }
  })
  toRemove.forEach(function (key) {
    delete obj[key]
  })
  return obj
}
export function fromJson (json) {
  return isString(json) ? JSON.parse(json) : json
}
export const toJson = JSON.stringify
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
export function pascalCase (str) {
  return str
    .split(SPLIT)
    .map(mapToPascal)
    .join('')
}
export function camelCase (str) {
  str = pascalCase(str)
  if (str) {
    return str.charAt(0).toLowerCase() + str.slice(1)
  }
  return str
}
