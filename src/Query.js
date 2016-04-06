import utils from './utils'
import Component from './Component'

const DOMAIN = 'Query'
const INDEX_ERR = 'Index inaccessible after first operation'

// Reserved words used by JSData's Query Syntax
const reserved = {
  limit: '',
  offset: '',
  orderBy: '',
  skip: '',
  sort: '',
  where: ''
}

// Used by our JavaScript implementation of the LIKE operator
const escapeRegExp = /([.*+?^=!:${}()|[\]\/\\])/g
const percentRegExp = /%/g
const underscoreRegExp = /_/g
const escape = function (pattern) {
  return pattern.replace(escapeRegExp, '\\$1')
}

/**
 * A class used by the {@link Collection} class to build queries to be executed
 * against the collection's data. An instance of `Query` is returned by
 * {@link Collection#query}. Query instances are typically short-lived.
 *
 * ```javascript
 * import {Query} from 'js-data'
 * ```
 *
 * @class Query
 * @extends Component
 * @param {Collection} collection The collection on which this query operates.
 */
export default Component.extend({
  constructor: function Query (collection) {
    const self = this
    utils.classCallCheck(self, Query)

    /**
     * The {@link Collection} on which this query operates.
     *
     * @name Query#collection
     * @type {Collection}
     */
    self.collection = collection

    /**
     * The current data result of this query.
     *
     * @name Query#data
     * @type {Array}
     */
    self.data = null
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
   * @name Query#between
   * @method
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
    const self = this
    opts || (opts = {})
    if (self.data) {
      throw utils.err(`${DOMAIN}#between`)(500, 'Cannot access index')
    }
    self.data = self.collection.getIndex(opts.index).between(leftKeys, rightKeys, opts)
    return self
  },

  /**
   * The comparison function used by the Query class.
   *
   * @name Query#compare
   * @method
   * @param {Array} orderBy An orderBy clause used for sorting and sub-sorting.
   * @param {number} index The index of the current orderBy clause being used.
   * @param {*} a The first item in the comparison.
   * @param {*} b The second item in the comparison.
   * @return {number} -1 if `b` should preceed `a`. 0 if `a` and `b` are equal.
   * 1 if `a` should preceed `b`.
   */
  compare (orderBy, index, a, b) {
    const def = orderBy[index]
    let cA = utils.get(a, def[0])
    let cB = utils.get(b, def[0])
    if (cA && utils.isString(cA)) {
      cA = cA.toUpperCase()
    }
    if (cB && utils.isString(cB)) {
      cB = cB.toUpperCase()
    }
    if (a === undefined) {
      a = null
    }
    if (b === undefined) {
      b = null
    }
    if (def[1].toUpperCase() === 'DESC') {
      const temp = cB
      cB = cA
      cA = temp
    }
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
  },

  /**
   * Predicate evaluation function used by the Query class.
   *
   * @name Query#evaluate
   * @method
   * @param {*} value The value to evaluate.
   * @param {string} op The operator to use in this evaluation.
   * @param {*} predicate The predicate to use in this evaluation.
   * @return {boolean} Whether the value passed the evaluation or not.
   */
  evaluate (value, op, predicate) {
    const ops = this.constructor.ops
    if (ops[op]) {
      return ops[op](value, predicate)
    }
    if (op.indexOf('like') === 0) {
      return !utils.isNull(this.like(predicate, op.substr(4)).exec(value))
    } else if (op.indexOf('notLike') === 0) {
      return utils.isNull(this.like(predicate, op.substr(7)).exec(value))
    }
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
   * @name Query#filter
   * @method
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
    if (utils.isObject(query)) {
      let where = {}
      // Filter
      if (utils.isObject(query.where)) {
        where = query.where
      }
      utils.forOwn(query, function (value, key) {
        if (!(key in reserved) && !(key in where)) {
          where[key] = {
            '==': value
          }
        }
      })

      const fields = []
      const ops = []
      const predicates = []
      utils.forOwn(where, function (clause, field) {
        if (!utils.isObject(clause)) {
          clause = {
            '==': clause
          }
        }
        utils.forOwn(clause, function (expr, op) {
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
            const expr = self.evaluate(utils.get(item, fields[i]), op, predicates[i])
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

      if (utils.isString(orderBy)) {
        orderBy = [
          [orderBy, 'ASC']
        ]
      }
      if (!utils.isArray(orderBy)) {
        orderBy = null
      }

      // Apply 'orderBy'
      if (orderBy) {
        let index = 0
        orderBy.forEach(function (def, i) {
          if (utils.isString(def)) {
            orderBy[i] = [def, 'ASC']
          }
        })
        self.data.sort(function (a, b) {
          return self.compare(orderBy, index, a, b)
        })
      }

      // Skip
      if (utils.isNumber(query.skip)) {
        self.skip(query.skip)
      } else if (utils.isNumber(query.offset)) {
        self.skip(query.offset)
      }
      // Limit
      if (utils.isNumber(query.limit)) {
        self.limit(query.limit)
      }
    } else if (utils.isFunction(query)) {
      self.data = self.data.filter(query, thisArg)
    }
    return self
  },

  /**
   * Iterate over all entities.
   *
   * @name Query#forEach
   * @method
   * @param {Function} forEachFn - Iteration function.
   * @param {*} [thisArg] - Context to which to bind `forEachFn`.
   * @return {Query} A reference to itself for chaining.
   */
  forEach (forEachFn, thisArg) {
    this.getData().forEach(forEachFn, thisArg)
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
   * @name Query#get
   * @method
   * @param {Array} keyList - Key(s) defining the entity to retrieve. If
   * `keyList` is not an array (i.e. for a single-value key), it will be
   * wrapped in an array.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.string] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @return {Query} A reference to itself for chaining.
   */
  get (keyList, opts) {
    const self = this
    keyList || (keyList = [])
    opts || (opts = {})
    if (self.data) {
      throw utils.err(`${DOMAIN}#get`)(500, INDEX_ERR)
    }
    if (keyList && !utils.isArray(keyList)) {
      keyList = [keyList]
    }
    if (!keyList.length) {
      self.getData()
      return self
    }
    self.data = self.collection.getIndex(opts.index).get(keyList)
    return self
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
   * @name Query#getAll
   * @method
   * @param {...Array} [keyList] - Provide one or more keyLists, and all
   * entities matching each keyList will be retrieved. If no keyLists are
   * provided, all entities will be returned.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @return {Query} A reference to itself for chaining.
   */
  getAll (...args) {
    const self = this
    let opts = {}
    if (self.data) {
      throw utils.err(`${DOMAIN}#getAll`)(500, INDEX_ERR)
    }
    if (!args.length || args.length === 1 && utils.isObject(args[0])) {
      self.getData()
      return self
    } else if (args.length && utils.isObject(args[args.length - 1])) {
      opts = args[args.length - 1]
      args.pop()
    }
    const collection = self.collection
    const index = collection.getIndex(opts.index)
    self.data = []
    args.forEach(function (keyList) {
      self.data = self.data.concat(index.get(keyList))
    })
    return self
  },

  /**
   * Return the current data result of this query.
   * @name Query#getData
   * @method
   * @return {Array} The data in this query.
   */
  getData () {
    const self = this
    if (!self.data) {
      self.data = self.collection.index.getAll()
    }
    return self.data
  },

  like (pattern, flags) {
    return new RegExp(`^${(escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.'))}$`, flags)
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
   * @name Query#limit
   * @method
   * @param {number} num - The maximum number of entities to keep in the result.
   * @return {Query} A reference to itself for chaining.
   */
  limit (num) {
    if (!utils.isNumber(num)) {
      throw utils.err(`${DOMAIN}#limit`, 'num')(400, 'number', num)
    }
    const data = this.getData()
    this.data = data.slice(0, Math.min(data.length, num))
    return this
  },

  /**
   * Apply a mapping function to the result data.
   *
   * @name Query#map
   * @method
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
   * @name Query#mapCall
   * @method
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
   * @name Query#run
   * @method
   * @return {Array} The result of executing this query.
   */
  run () {
    const data = this.data
    this.data = null
    return data
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
   * @name Query#skip
   * @method
   * @param {number} num - The number of entities to skip.
   * @return {Query} A reference to itself for chaining.
   */
  skip (num) {
    if (!utils.isNumber(num)) {
      throw utils.err(`${DOMAIN}#skip`, 'num')(400, 'number', num)
    }
    const data = this.getData()
    if (num < data.length) {
      this.data = data.slice(num)
    } else {
      this.data = []
    }
    return this
  }
}, {
  /**
   * TODO
   *
   * @name Query.ops
   * @type {Object}
   */
  ops: {
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
      return !utils.intersection((value || []), (predicate || [])).length
    },
    'isectNotEmpty': function (value, predicate) {
      return utils.intersection((value || []), (predicate || [])).length
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
})
