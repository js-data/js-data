export const isArray = Array.isArray
export function forOwn (obj, fn, thisArg) {
  const keys = Object.keys(obj)
  const len = keys.length
  let i
  for (i = 0; i < len; i++) {
    fn.call(thisArg, obj[keys[i]], keys[i], obj)
  }
}
export function isRegExp (value) {
  return toString.call(value) === '[object RegExp]' || false
}
export function isString (value) {
  return typeof value === 'string' || (value && typeof value === 'object' && toString.call(value) === '[object String]') || false
}
export function isObject (value) {
  return toString.call(value) === '[object Object]' || false
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
export function resolve (value) {
  return Promise.resolve(value)
}
export function reject (value) {
  return Promise.reject(value)
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

export function sort (a, b, field) {
  // Short-curcuit comparison if a and b are strictly equal
  // This is absolutely necessary for indexed objects that
  // don't have the idAttribute field
  if (a === b) {
    return 0
  }
  if (field) {
    a = a[field]
    b = b[field]
  }
  if (a === null && b === null) {
    return 0
  }

  if (a === null) {
    return -1
  }

  if (b === null) {
    return 1
  }

  if (a < b) {
    return -1
  }

  if (a > b) {
    return 1
  }

  return 0
}

export function insertAt (array, index, value) {
  array.splice(index, 0, value)
  return array
}

export function removeAt (array, index) {
  array.splice(index, 1)
  return array
}

export function binarySearch (array, value, field) {
  let lo = 0
  let hi = array.length
  let compared
  let mid

  while (lo < hi) {
    mid = ((lo + hi) / 2) | 0
    compared = sort(value, array[mid], field)
    if (compared === 0) {
      return {
        found: true,
        index: mid
      }
    } else if (compared < 0) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }

  return {
    found: false,
    index: hi
  }
}
