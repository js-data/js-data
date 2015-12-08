import {
  forOwn,
  get,
  intersection,
  isArray,
  isFunction,
  isNumber,
  isObject,
  isString
} from '../utils'
import {configure} from '../decorators'

export function Query (collection) {
  this.collection = collection
}

const reserved = {
  skip: '',
  offset: '',
  where: '',
  limit: '',
  orderBy: '',
  sort: ''
}

function compare (orderBy, index, a, b) {
  const def = orderBy[index]
  let cA = get(a, def[0])
  let cB = get(b, def[0])
  if (cA && isString(cA)) {
    cA = cA.toUpperCase()
  }
  if (cB && isString(cB)) {
    cB = cB.toUpperCase()
  }
  if (def[1] === 'DESC') {
    if (cB < cA) {
      return -1
    } else if (cB > cA) {
      return 1
    } else {
      if (index < orderBy.length - 1) {
        return compare(orderBy, index + 1, a, b)
      } else {
        return 0
      }
    }
  } else {
    if (cA < cB) {
      return -1
    } else if (cA > cB) {
      return 1
    } else {
      if (index < orderBy.length - 1) {
        return compare(orderBy, index + 1, a, b)
      } else {
        return 0
      }
    }
  }
}

const escapeRegExp = /([.*+?^=!:${}()|[\]\/\\])/g
const percentRegExp = /%/g
const underscoreRegExp = /_/g

function escape (pattern) {
  return pattern.replace(escapeRegExp, '\\$1')
}

function like (pattern, flags) {
  return new RegExp(`^${(escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.'))}$`, flags)
}

function evaluate (value, op, predicate) {
  switch (op) {
    case '==':
      return value == predicate // eslint-disable-line
    case '===':
      return value === predicate
    case '!=':
      return value != predicate // eslint-disable-line
    case '!==':
      return value !== predicate
    case '>':
      return value > predicate
    case '>=':
      return value >= predicate
    case '<':
      return value < predicate
    case '<=':
      return value <= predicate
    case 'isectEmpty':
      return !intersection((value || []), (predicate || [])).length
    case 'isectNotEmpty':
      return intersection((value || []), (predicate || [])).length
    case 'in':
      return predicate.indexOf(value) !== -1
    case 'notIn':
      return predicate.indexOf(value) === -1
    case 'contains':
      return value.indexOf(predicate) !== -1
    case 'notContains':
      return value.indexOf(predicate) === -1
    default:
      if (op.indexOf('like') === 0) {
        return like(predicate, op.substr(4)).exec(value) !== null
      } else if (op.indexOf('notLike') === 0) {
        return like(predicate, op.substr(7)).exec(value) === null
      }
  }
}

configure({
  getData () {
    if (!this.data) {
      this.data = this.collection.index.getAll()
    }
    return this.data
  },

  between (leftKeys, rightKeys, opts) {
    opts || (opts = {})
    const collection = this.collection
    const index = opts.index ? collection.indexes[opts.index] : collection.index
    if (this.data) {
      throw new Error('Cannot access index after first operation!')
    }
    this.data = index.between(leftKeys, rightKeys, opts)
    return this
  },

  get (keyList = [], opts) {
    opts || (opts = {})
    if (this.data) {
      throw new Error('Cannot access index after first operation!')
    }
    if (keyList && !isArray(keyList)) {
      keyList = [keyList]
    }
    if (!keyList.length) {
      this.getData()
      return this
    }
    const collection = this.collection
    const index = opts.index ? collection.indexes[opts.index] : collection.index
    this.data = index.get(keyList)
    return this
  },

  getAll (...args) {
    let opts = {}
    if (this.data) {
      throw new Error('Cannot access index after first operation!')
    }
    if (!args.length || args.length === 1 && isObject(args[0])) {
      this.getData()
      return this
    } else if (args.length && isObject(args[args.length - 1])) {
      opts = args[args.length - 1]
      args.pop()
    }
    const collection = this.collection
    const index = opts.index ? collection.indexes[opts.index] : collection.index
    this.data = []
    args.forEach(keyList => {
      this.data = this.data.concat(index.get(keyList))
    })
    return this
  },

  filter (opts, thisArg) {
    opts || (opts = {})
    this.getData()
    if (isObject(opts)) {
      let where = {}
      // Filter
      if (isObject(opts.where)) {
        where = opts.where
      }
      forOwn(opts, function (value, key) {
        if (!(key in reserved) && !(key in where)) {
          where[key] = {
            '==': value
          }
        }
      })

      const fields = []
      const ops = []
      const predicates = []
      forOwn(where, function (clause, field) {
        if (!isObject(clause)) {
          clause = {
            '==': clause
          }
        }
        forOwn(clause, function (expr, op) {
          fields.push(field)
          ops.push(op)
          predicates.push(expr)
        })
      })
      if (fields.length) {
        let i
        let len = fields.length
        this.data = this.data.filter(function (item) {
          let first = true
          let keep = true

          for (i = 0; i < len; i++) {
            let op = ops[i]
            const isOr = op.charAt(0) === '|'
            op = isOr ? op.substr(1) : op
            const expr = evaluate(get(item, fields[i]), op, predicates[i])
            if (expr !== undefined) {
              keep = first ? expr : (isOr ? keep || expr : keep && expr)
            }
            first = false
          }
          return keep
        })
      }

      // Sort
      let orderBy = opts.orderBy || opts.sort

      if (isString(orderBy)) {
        orderBy = [
          [orderBy, 'ASC']
        ]
      }
      if (!isArray(orderBy)) {
        orderBy = null
      }

      // Apply 'orderBy'
      if (orderBy) {
        let index = 0
        orderBy.forEach(function (def, i) {
          if (isString(def)) {
            orderBy[i] = [def, 'ASC']
          }
        })
        this.data.sort(function (a, b) {
          return compare(orderBy, index, a, b)
        })
      }

      // Skip
      if (isNumber(opts.skip)) {
        this.skip(opts.skip)
      } else if (isNumber(opts.offset)) {
        this.skip(opts.offset)
      }
      // Limit
      if (isNumber(opts.limit)) {
        this.limit(opts.limit)
      }
    } else if (isFunction(opts)) {
      this.data = this.data.filter(opts, thisArg)
    }
    return this
  },

  skip (num) {
    if (!isNumber(num)) {
      throw new TypeError(`skip: Expected number but found ${typeof num}!`)
    }
    const data = this.getData()
    if (num < data.length) {
      this.data = data.slice(num)
    } else {
      this.data = []
    }
    return this
  },

  limit (num) {
    if (!isNumber(num)) {
      throw new TypeError(`limit: Expected number but found ${typeof num}!`)
    }
    const data = this.getData()
    this.data = data.slice(0, Math.min(data.length, num))
    return this
  },

  forEach (cb, thisArg) {
    this.getData().forEach(cb, thisArg)
    return this
  },

  map (cb, thisArg) {
    this.data = this.getData().map(cb, thisArg)
    return this
  },

  run () {
    let data = this.data
    this.data = null
    this.params = null
    return data
  }
})(Query.prototype)
