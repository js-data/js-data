import {
  addHiddenPropsToTarget,
  classCallCheck,
  forOwn,
  get,
  intersection,
  isArray,
  isFunction,
  isNumber,
  isObject,
  isString
} from '../utils'

/**
 * A class used by the @{link Collection} class to build queries to be executed
 * against the collection's data. An instance of `Query` is returned by
 * {@link Model.query} and {@link Collection.query}.
 * @class Query
 * @param {Collection} collection - The collection on which this query operates.
 */
export function Query (collection) {
  classCallCheck(this, Query)

  /**
   * The collection on which this query operates.
   * @type {Collection}
   */
  this.collection = collection
  /**
   * The data result of this query.
   * @type {Array}
   */
  this.data = null
}

const reserved = {
  skip: '',
  offset: '',
  where: '',
  limit: '',
  orderBy: '',
  sort: ''
}

const escapeRegExp = /([.*+?^=!:${}()|[\]\/\\])/g
const percentRegExp = /%/g
const underscoreRegExp = /_/g

function escape (pattern) {
  return pattern.replace(escapeRegExp, '\\$1')
}

Query.ops = {
  '==': function (value, predicate) {
    return value == predicate // eslint-disable-line
  },
  '===': function (value, predicate) {
    return value === predicate
  },
  '!=': function (value, predicate) {
    return value != predicate // eslint-disable-line
  },
  '!==': function (value, predicate) {
    return value !== predicate
  },
  '>': function (value, predicate) {
    return value > predicate
  },
  '>=': function (value, predicate) {
    return value >= predicate
  },
  '<': function (value, predicate) {
    return value < predicate
  },
  '<=': function (value, predicate) {
    return value <= predicate
  },
  'isectEmpty': function (value, predicate) {
    return !intersection((value || []), (predicate || [])).length
  },
  'isectNotEmpty': function (value, predicate) {
    return intersection((value || []), (predicate || [])).length
  },
  'in': function (value, predicate) {
    return predicate.indexOf(value) !== -1
  },
  'notIn': function (value, predicate) {
    return predicate.indexOf(value) === -1
  },
  'contains': function (value, predicate) {
    return (value || []).indexOf(predicate) !== -1
  },
  'notContains': function (value, predicate) {
    return (value || []).indexOf(predicate) === -1
  }
}

addHiddenPropsToTarget(Query.prototype, {
  compare (orderBy, index, a, b) {
    const def = orderBy[index]
    let cA = get(a, def[0])
    let cB = get(b, def[0])
    if (cA && isString(cA)) {
      cA = cA.toUpperCase()
    }
    if (cB && isString(cB)) {
      cB = cB.toUpperCase()
    }
    a || (a = null)
    b || (b = null)
    if (def[1] === 'DESC') {
      if (cB < cA) {
        return -1
      } else if (cB > cA) {
        return 1
      } else {
        if (index < orderBy.length - 1) {
          return this.compare(orderBy, index + 1, a, b)
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
          return this.compare(orderBy, index + 1, a, b)
        } else {
          return 0
        }
      }
    }
  },

  evaluate (value, op, predicate) {
    if (Query.ops[op]) {
      return Query.ops[op](value, predicate)
    }
    if (op.indexOf('like') === 0) {
      return this.like(predicate, op.substr(4)).exec(value) !== null
    } else if (op.indexOf('notLike') === 0) {
      return this.like(predicate, op.substr(7)).exec(value) === null
    }
  },

  like (pattern, flags) {
    return new RegExp(`^${(escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.'))}$`, flags)
  },

  /**
   * Return the current data result of this query.
   * @memberof Query
   * @instance
   * @return {Array} The data in this query.
   */
  getData () {
    if (!this.data) {
      this.data = this.collection.index.getAll()
    }
    return this.data
  },

  /**
   * Find all entities between two boundaries.
   *
   * Get the users ages 18 to 30
   * ```js
   * const users = query.between(18, 30, { index: 'age' }).run()
   * ```
   * Same as above
   * ```js
   * const users = query.between([18], [30], { index: 'age' }).run()
   * ```
   *
   * @memberof Query
   * @instance
   * @param {Array} leftKeys - Keys defining the left boundary.
   * @param {Array} rightKeys - Keys defining the right boundary.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @param {boolean} [opts.leftInclusive=true] - Whether to include entities
   * on the left boundary.
   * @param {boolean} [opts.rightInclusive=false] - Whether to include entities
   * on the left boundary.
   * @param {boolean} [opts.limit] - Limit the result to a certain number.
   * @param {boolean} [opts.offset] - The number of resulting entities to skip.
   * @return {Query} A reference to itself for chaining.
   */
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

  /**
   * Find the entity or entities that match the provided key.
   *
   * #### Example
   *
   * Get the entity whose primary key is 25
   * ```js
   * const entities = query.get(25).run()
   * ```
   * Same as above
   * ```js
   * const entities = query.get([25]).run()
   * ```
   * Get all users who are active and have the "admin" role
   * ```js
   * const activeAdmins = query.get(['active', 'admin'], {
   *   index: 'activityAndRoles'
   * }).run()
   * ```
   * Get all entities that match a certain weather condition
   * ```js
   * const niceDays = query.get(['sunny', 'humid', 'calm'], {
   *   index: 'weatherConditions'
   * }).run()
   * ```
   *
   * @memberof Query
   * @instance
   * @param {Array} keyList - Key(s) defining the entity to retrieve. If
   * `keyList` is not an array (i.e. for a single-value key), it will be
   * wrapped in an array.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.string] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @return {Query} A reference to itself for chaining.
   */
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

  /**
   * Find the entity or entities that match the provided keyLists.
   *
   * #### Example
   *
   * Get the posts where "status" is "draft" or "inReview"
   * ```js
   * const posts = query.getAll('draft', 'inReview', { index: 'status' }).run()
   * ```
   * Same as above
   * ```js
   * const posts = query.getAll(['draft'], ['inReview'], { index: 'status' }).run()
   * ```
   *
   * @memberof Query
   * @instance
   * @param {...Array} [keyList] - Provide one or more keyLists, and all
   * entities matching each keyList will be retrieved. If no keyLists are
   * provided, all entities will be returned.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @return {Query} A reference to itself for chaining.
   */
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

  /**
   * Find the entity or entities that match the provided query or pass the
   * provided filter function.
   *
   * #### Example
   *
   * Get the draft posts created less than three months
   * ```js
   * const posts = query.filter({
   *   where: {
   *     status: {
   *       '==': 'draft'
   *     },
   *     created_at_timestamp: {
   *       '>=': (new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 3)) // 3 months ago
   *     }
   *   }
   * }).run()
   * ```
   * Use a custom filter function
   * ```js
   * const posts = query.filter(function (post) {
   *   return post.isReady()
   * }).run()
   * ```
   *
   * @memberof Query
   * @instance
   * @param {(Object|Function)} [queryOrFn={}] - Selection query or filter
   * function.
   * @param {Function} [thisArg] - Context to which to bind `queryOrFn` if
   * `queryOrFn` is a function.
   * @return {Query} A reference to itself for chaining.
   */
  filter (query, thisArg) {
    const self = this
    query || (query = {})
    self.getData()
    if (isObject(query)) {
      let where = {}
      // Filter
      if (isObject(query.where)) {
        where = query.where
      }
      forOwn(query, function (value, key) {
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
        self.data = self.data.filter(function (item) {
          let first = true
          let keep = true

          for (i = 0; i < len; i++) {
            let op = ops[i]
            const isOr = op.charAt(0) === '|'
            op = isOr ? op.substr(1) : op
            const expr = self.evaluate(get(item, fields[i]), op, predicates[i])
            if (expr !== undefined) {
              keep = first ? expr : (isOr ? keep || expr : keep && expr)
            }
            first = false
          }
          return keep
        })
      }

      // Sort
      let orderBy = query.orderBy || query.sort

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
        self.data.sort(function (a, b) {
          return self.compare(orderBy, index, a, b)
        })
      }

      // Skip
      if (isNumber(query.skip)) {
        self.skip(query.skip)
      } else if (isNumber(query.offset)) {
        self.skip(query.offset)
      }
      // Limit
      if (isNumber(query.limit)) {
        self.limit(query.limit)
      }
    } else if (isFunction(query)) {
      self.data = self.data.filter(query, thisArg)
    }
    return self
  },

  /**
   * Skip a number of results.
   *
   * #### Example
   *
   * Get all but the first 10 draft posts
   * ```js
   * const posts = query.get('draft', { index: 'status' }).skip(10).run()
   * ```
   *
   * @memberof Query
   * @instance
   * @param {number} num - The number of entities to skip.
   * @return {Query} A reference to itself for chaining.
   */
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

  /**
   * Limit the result.
   *
   * #### Example
   *
   * Get only the first 10 draft posts
   * ```js
   * const posts = query.get('draft', { index: 'status' }).limit(10).run()
   * ```
   *
   * @memberof Query
   * @instance
   * @param {number} num - The maximum number of entities to keep in the result.
   * @return {Query} A reference to itself for chaining.
   */
  limit (num) {
    if (!isNumber(num)) {
      throw new TypeError(`limit: Expected number but found ${typeof num}!`)
    }
    const data = this.getData()
    this.data = data.slice(0, Math.min(data.length, num))
    return this
  },

  /**
   * Iterate over all entities.
   *
   * @memberof Query
   * @instance
   * @param {Function} forEachFn - Iteration function.
   * @param {*} [thisArg] - Context to which to bind `forEachFn`.
   * @return {Query} A reference to itself for chaining.
   */
  forEach (forEachFn, thisArg) {
    this.getData().forEach(forEachFn, thisArg)
    return this
  },

  /**
   * Apply a mapping function to the result data.
   *
   * @memberof Query
   * @instance
   * @param {Function} mapFn - Mapping function.
   * @param {*} [thisArg] - Context to which to bind `mapFn`.
   * @return {Query} A reference to itself for chaining.
   */
  map (mapFn, thisArg) {
    this.data = this.getData().map(mapFn, thisArg)
    return this
  },

  /**
   * Return the result of calling the specified function on each item in this
   * collection's main index.
   * @memberof Query
   * @instance
   * @param {string} funcName - Name of function to call
   * @parama {...*} [args] - Remaining arguments to be passed to the function.
   * @return {Query} A reference to itself for chaining.
   */
  mapCall (funcName, ...args) {
    this.data = this.getData().map(function (item) {
      return item[funcName](...args)
    })
    return this
  },

  /**
   * Complete the execution of the query and return the resulting data.
   *
   * @memberof Query
   * @instance
   * @return {Array} The result of executing this query.
   */
  run () {
    const data = this.data
    this.data = null
    return data
  }
})
