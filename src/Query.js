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
const escapeRegExp = /([.*+?^=!:${}()|[\]/\\])/g
const percentRegExp = /%/g
const underscoreRegExp = /_/g
const escape = function (pattern) {
  return pattern.replace(escapeRegExp, '\\$1')
}

/**
 * A class used by the {@link Collection} class to build queries to be executed
 * against the collection's data. An instance of `Query` is returned by
 * {@link Collection#query}. Query instances are typically short-lived, and you
 * shouldn't have to create them yourself. Just use {@link Collection#query}.
 *
 * ```javascript
 * import {Query} from 'js-data'
 * ```
 *
 * @example
 * const store = new JSData.DataStore()
 * store.defineMapper('post')
 * const posts = [
 *   { author: 'John', age: 30, status: 'published', id: 1 },
 *   { author: 'Sally', age: 31, status: 'draft', id: 2 },
 *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
 *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
 *   { author: 'Adam', age: 33, status: 'draft', id: 5 }
 * ]
 * store.add('post', posts)
 * const drafts = store.query('post').filter({ status: 'draft' }).limit(2).run()
 * console.log(drafts)
 *
 * @class Query
 * @extends Component
 * @param {Collection} collection The collection on which this query operates.
 * @since 3.0.0
 */
function Query (collection) {
  utils.classCallCheck(this, Query)

  /**
   * The {@link Collection} on which this query operates.
   *
   * @name Query#collection
   * @since 3.0.0
   * @type {Collection}
   */
  this.collection = collection

  /**
   * The current data result of this query.
   *
   * @name Query#data
   * @since 3.0.0
   * @type {Array}
   */
  this.data = null
}

export default Component.extend({
  constructor: Query,

  _applyWhereFromObject (where) {
    const fields = []
    const ops = []
    const predicates = []
    utils.forOwn(where, (clause, field) => {
      if (!utils.isObject(clause)) {
        clause = {
          '==': clause
        }
      }
      utils.forOwn(clause, (expr, op) => {
        fields.push(field)
        ops.push(op)
        predicates.push(expr)
      })
    })
    return {
      fields,
      ops,
      predicates
    }
  },

  _applyWhereFromArray (where) {
    const groups = []
    where.forEach((_where, i) => {
      if (utils.isString(_where)) {
        return
      }
      const prev = where[i - 1]
      const parser = utils.isArray(_where) ? this._applyWhereFromArray : this._applyWhereFromObject
      const group = parser.call(this, _where)
      if (prev === 'or') {
        group.isOr = true
      }
      groups.push(group)
    })
    groups.isArray = true
    return groups
  },

  _testObjectGroup (keep, first, group, item) {
    let i
    const fields = group.fields
    const ops = group.ops
    const predicates = group.predicates
    const len = ops.length
    for (i = 0; i < len; i++) {
      let op = ops[i]
      const isOr = op.charAt(0) === '|'
      op = isOr ? op.substr(1) : op
      const expr = this.evaluate(utils.get(item, fields[i]), op, predicates[i])
      if (expr !== undefined) {
        keep = first ? expr : (isOr ? keep || expr : keep && expr)
      }
      first = false
    }
    return { keep, first }
  },

  _testArrayGroup (keep, first, groups, item) {
    let i
    const len = groups.length
    for (i = 0; i < len; i++) {
      const group = groups[i]
      const parser = group.isArray ? this._testArrayGroup : this._testObjectGroup
      const result = parser.call(this, true, true, group, item)
      if (groups[i - 1]) {
        if (group.isOr) {
          keep = keep || result.keep
        } else {
          keep = keep && result.keep
        }
      } else {
        keep = result.keep
      }
      first = result.first
    }
    return { keep, first }
  },

  /**
   * Find all entities between two boundaries.
   *
   * @example <caption>Get the users ages 18 to 30.</caption>
   * const store = new JSData.DataStore()
   * store.defineMapper('user')
   * const users = [
   *   { name: 'Peter', age: 25, id: 1 },
   *   { name: 'Jim', age: 19, id: 2 },
   *   { name: 'Mike', age: 17, id: 3 },
   *   { name: 'Alan', age: 29, id: 4 },
   *   { name: 'Katie', age: 33, id: 5 }
   * ]
   * store.add('post', posts)
   * const filteredUsers = store.query('user').between(18, 30, { index: 'age' }).run()
   * console.log(filteredUsers)
   *
   * @example <caption>Same as above.</caption>
   * const store = new JSData.DataStore()
   * store.defineMapper('user')
   * const users = [
   *   { name: 'Peter', age: 25, id: 1 },
   *   { name: 'Jim', age: 19, id: 2 },
   *   { name: 'Mike', age: 17, id: 3 },
   *   { name: 'Alan', age: 29, id: 4 },
   *   { name: 'Katie', age: 33, id: 5 }
   * ]
   * store.add('post', posts)
   * const filteredUsers = store.query('user').between([18], [30], { index: 'age' }).run()
   * console.log(filteredUsers)
   *
   * @method Query#between
   * @param {Array} leftKeys Keys defining the left boundary.
   * @param {Array} rightKeys Keys defining the right boundary.
   * @param {Object} [opts] Configuration options.
   * @param {string} [opts.index] Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @param {boolean} [opts.leftInclusive=true] Whether to include entities
   * on the left boundary.
   * @param {boolean} [opts.rightInclusive=false] Whether to include entities
   * on the left boundary.
   * @param {boolean} [opts.limit] Limit the result to a certain number.
   * @param {boolean} [opts.offset] The number of resulting entities to skip.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
   */
  between (leftKeys, rightKeys, opts) {
    opts || (opts = {})
    if (this.data) {
      throw utils.err(`${DOMAIN}#between`)(500, 'Cannot access index')
    }
    this.data = this.collection.getIndex(opts.index).between(leftKeys, rightKeys, opts)
    return this
  },

  /**
   * The comparison function used by the {@link Query} class.
   *
   * @method Query#compare
   * @param {Array} orderBy An orderBy clause used for sorting and sub-sorting.
   * @param {number} index The index of the current orderBy clause being used.
   * @param {*} a The first item in the comparison.
   * @param {*} b The second item in the comparison.
   * @returns {number} -1 if `b` should preceed `a`. 0 if `a` and `b` are equal.
   * 1 if `a` should preceed `b`.
   * @since 3.0.0
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
   * Predicate evaluation function used by the {@link Query} class.
   *
   * @method Query#evaluate
   * @param {*} value The value to evaluate.
   * @param {string} op The operator to use in this evaluation.
   * @param {*} predicate The predicate to use in this evaluation.
   * @returns {boolean} Whether the value passed the evaluation or not.
   * @since 3.0.0
   */
  evaluate (value, op, predicate) {
    const ops = this.constructor.ops
    if (ops[op]) {
      return ops[op](value, predicate)
    }
    if (op.indexOf('like') === 0) {
      return this.like(predicate, op.substr(4)).exec(value) !== null
    } else if (op.indexOf('notLike') === 0) {
      return this.like(predicate, op.substr(7)).exec(value) === null
    }
  },

  /**
   * Find the record or records that match the provided query or are accepted by
   * the provided filter function.
   *
   * @example <caption>Get the draft posts by authors younger than 30</caption>
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'published', id: 2 },
   *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'published', id: 5 }
   *   { author: 'Peter', age: 25, status: 'deleted', id: 6 },
   *   { author: 'Sally', age: 21, status: 'draft', id: 7 },
   *   { author: 'Jim', age: 27, status: 'draft', id: 8 },
   *   { author: 'Jim', age: 27, status: 'published', id: 9 },
   *   { author: 'Jason', age: 55, status: 'published', id: 10 }
   * ]
   * store.add('post', posts)
   * let results = store.query('post').filter({
   *   where: {
   *     status: {
   *       '==': 'draft'
   *     },
   *     age: {
   *       '<': 30
   *     }
   *   }
   * }).run()
   * console.log(results)
   *
   * @example <caption>Use a custom filter function</caption>
   * const posts = query.filter(function (post) {
   *   return post.isReady()
   * }).run()
   *
   * @method Query#filter
   * @param {(Object|Function)} [queryOrFn={}] Selection query or filter
   * function.
   * @param {Function} [thisArg] Context to which to bind `queryOrFn` if
   * `queryOrFn` is a function.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
   */
  filter (query, thisArg) {
    /**
     * Selection query as defined by JSData's [Query Syntax][querysyntax].
     *
     * [querysyntax]: http://www.js-data.io/v3.0/docs/query-syntax
     *
     * @example <caption>Empty "findAll" query</caption>
     * const store = new JSData.DataStore()
     * store.defineMapper('post')
     * store.findAll('post').then((posts) => {
     *   console.log(posts) // [...]
     * })
     *
     * @example <caption>Empty "filter" query</caption>
     * const store = new JSData.DataStore()
     * store.defineMapper('post')
     * const posts = store.filter('post')
     * console.log(posts) // [...]
     *
     * @example <caption>Complex "filter" query</caption>
     * const PAGE_SIZE = 2
     * let currentPage = 3
     *
     * const store = new JSData.DataStore()
     * store.defineMapper('post')
     * const posts = [
     *   { author: 'John', age: 30, status: 'published', id: 1 },
     *   { author: 'Sally', age: 31, status: 'published', id: 2 },
     *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
     *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
     *   { author: 'Adam', age: 33, status: 'published', id: 5 }
     *   { author: 'Peter', age: 25, status: 'deleted', id: 6 },
     *   { author: 'Sally', age: 21, status: 'draft', id: 7 },
     *   { author: 'Jim', age: 27, status: 'draft', id: 8 },
     *   { author: 'Jim', age: 27, status: 'published', id: 9 },
     *   { author: 'Jason', age: 55, status: 'published', id: 10 }
     * ]
     * store.add('post', posts)
     * // Retrieve a filtered page of blog posts
     * // Would typically replace filter with findAll
     * store.filter('post', {
     *   where: {
     *     status: {
     *       // WHERE status = 'published'
     *       '==': 'published'
     *     },
     *     author: {
     *       // AND author IN ('bob', 'alice')
     *       'in': ['bob', 'alice'],
     *       // OR author IN ('karen')
     *       '|in': ['karen']
     *     }
     *   },
     *   orderBy: [
     *     // ORDER BY date_published DESC,
     *     ['date_published', 'DESC'],
     *     // ORDER BY title ASC
     *     ['title', 'ASC']
     *   ],
     *   // LIMIT 2
     *   limit: PAGE_SIZE,
     *   // SKIP 4
     *   offset: PAGE_SIZE * (currentPage - 1)
     * })
     *
     * @namespace query
     * @property {number} [limit] See {@link query.limit}.
     * @property {number} [offset] See {@link query.offset}.
     * @property {string|Array[]} [orderBy] See {@link query.orderBy}.
     * @property {number} [skip] Alias for {@link query.offset}.
     * @property {string|Array[]} [sort] Alias for {@link query.orderBy}.
     * @property {Object} [where] See {@link query.where}.
     * @since 3.0.0
     * @tutorial ["http://www.js-data.io/v3.0/docs/query-syntax","JSData's Query Syntax"]
     */
    query || (query = {})
    this.getData()
    if (utils.isObject(query)) {
      let where = {}

      /**
       * Filtering criteria. Records that do not meet this criteria will be exluded
       * from the result.
       *
       * @example <caption>Return posts where author is at least 32 years old</caption>
       * const store = new JSData.DataStore()
       * store.defineMapper('post')
       * const posts = [
       *   { author: 'John', age: 30, id: 5 },
       *   { author: 'Sally', age: 31, id: 6 },
       *   { author: 'Mike', age: 32, id: 7 },
       *   { author: 'Adam', age: 33, id: 8 },
       *   { author: 'Adam', age: 33, id: 9 }
       * ]
       * store.add('post', posts)
       * store.filter('post', {
       *   where: {
       *     age: {
       *       '>=': 30
       *     }
       *   }
       * })
       * console.log(results)
       *
       * @name query.where
       * @type {Object}
       * @see http://www.js-data.io/v3.0/docs/query-syntax
       * @since 3.0.0
       */
      if (utils.isObject(query.where) || utils.isArray(query.where)) {
        where = query.where
      }
      utils.forOwn(query, function (value, key) {
        if (!(key in reserved) && !(key in where)) {
          where[key] = {
            '==': value
          }
        }
      })
      let groups

      // Apply filter for each field
      if (utils.isObject(where) && Object.keys(where).length !== 0) {
        groups = this._applyWhereFromArray([where])
      } else if (utils.isArray(where)) {
        groups = this._applyWhereFromArray(where)
      }

      if (groups) {
        this.data = this.data.filter((item, i) => this._testArrayGroup(true, true, groups, item).keep)
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

      /**
       * Determines how records should be ordered in the result.
       *
       * @example <caption>Order posts by `author` then by `id` descending </caption>
       * const store = new JSData.DataStore()
       * store.defineMapper('post')
       * const posts = [
       *   { author: 'John', age: 30, id: 5 },
       *   { author: 'Sally', age: 31, id: 6 },
       *   { author: 'Mike', age: 32, id: 7 },
       *   { author: 'Adam', age: 33, id: 8 },
       *   { author: 'Adam', age: 33, id: 9 }
       * ]
       * store.add('post', posts)
       * store.filter('post', {
       *     orderBy:[['author','ASC'],['id','DESC']]
       * })
       * console.log(results)
       *
       * @name query.orderBy
       * @type {string|Array[]}
       * @see http://www.js-data.io/v3.0/docs/query-syntax
       * @since 3.0.0
       */
      if (orderBy) {
        let index = 0
        orderBy.forEach(function (def, i) {
          if (utils.isString(def)) {
            orderBy[i] = [def, 'ASC']
          }
        })
        this.data.sort((a, b) => this.compare(orderBy, index, a, b))
      }

      /**
       * Number of records to skip.
       *
       * @example <caption>Retrieve the first "page" of blog posts using findAll</caption>
       * const PAGE_SIZE = 10
       * let currentPage = 1
       * PostMapper.findAll({
       *   offset: PAGE_SIZE * (currentPage 1)
       *   limit: PAGE_SIZE
       * })
       *
       * @example <caption>Retrieve the last "page" of blog posts using filter</caption>
       * const PAGE_SIZE = 5
       * let currentPage = 2
       * const store = new JSData.DataStore()
       * store.defineMapper('post')
       * const posts = [
       *   { author: 'John', age: 30, id: 1 },
       *   { author: 'Sally', age: 31, id: 2 },
       *   { author: 'Mike', age: 32, id: 3 },
       *   { author: 'Adam', age: 33, id: 4 },
       *   { author: 'Adam', age: 33, id: 5 },
       *   { author: 'Peter', age: 25, id: 6 },
       *   { author: 'Sally', age: 21, id: 7 },
       *   { author: 'Jim', age: 27, id: 8 },
       *   { author: 'Jim', age: 27, id: 9 },
       *   { author: 'Jason', age: 55, id: 10 }
       * ]
       * store.add('post', posts)
       * store.filter('post', {
       *   offset: PAGE_SIZE * (currentPage 1)
       *   limit: PAGE_SIZE
       * })
       *
       * console.log(results)
       *
       * @name query.offset
       * @type {number}
       * @see http://www.js-data.io/v3.0/docs/query-syntax
       * @since 3.0.0
       */
      if (utils.isNumber(query.skip)) {
        this.skip(query.skip)
      } else if (utils.isNumber(query.offset)) {
        this.skip(query.offset)
      }

      /**
       * Maximum number of records to retrieve.
       *
       * @example <caption>Retrieve the first "page" of blog posts using findAll</caption>
       * const PAGE_SIZE = 10
       * let currentPage = 1
       * PostMapper.findAll({
       *   offset: PAGE_SIZE * (currentPage 1)
       *   limit: PAGE_SIZE
       * })
       *
       * @example <caption>Retrieve the last "page" of blog posts using filter</caption>
       * const PAGE_SIZE = 5
       * let currentPage = 2
       * const store = new JSData.DataStore()
       * store.defineMapper('post')
       * const posts = [
       *   { author: 'John', age: 30, id: 1 },
       *   { author: 'Sally', age: 31, id: 2 },
       *   { author: 'Mike', age: 32, id: 3 },
       *   { author: 'Adam', age: 33, id: 4 },
       *   { author: 'Adam', age: 33, id: 5 },
       *   { author: 'Peter', age: 25, id: 6 },
       *   { author: 'Sally', age: 21, id: 7 },
       *   { author: 'Jim', age: 27, id: 8 },
       *   { author: 'Jim', age: 27, id: 9 },
       *   { author: 'Jason', age: 55, id: 10 }
       * ]
       * store.add('post', posts)
       * store.filter('post', {
       *   offset: PAGE_SIZE * (currentPage 1)
       *   limit: PAGE_SIZE
       * })
       *
       * console.log(results)
       * @name query.limit
       * @type {number}
       * @see http://www.js-data.io/v3.0/docs/query-syntax
       * @since 3.0.0
       */
      if (utils.isNumber(query.limit)) {
        this.limit(query.limit)
      }
    } else if (utils.isFunction(query)) {
      this.data = this.data.filter(query, thisArg)
    }
    return this
  },

  /**
   * Iterate over all entities.
   *
   * @method Query#forEach
   * @param {Function} forEachFn Iteration function.
   * @param {*} [thisArg] Context to which to bind `forEachFn`.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
   */
  forEach (forEachFn, thisArg) {
    this.getData().forEach(forEachFn, thisArg)
    return this
  },

  /**
   * Find the entity or entities that match the provided key.
   *
   * @example <caption>Get the entity whose primary key is 25.</caption>
   * const entities = query.get(25).run()
   *
   * @example <caption>Same as above.</caption>
   * const entities = query.get([25]).run()
   *
   * @example <caption>Get all users who are active and have the "admin" role.</caption>
   * const activeAdmins = query.get(['active', 'admin'], {
   *   index: 'activityAndRoles'
   * }).run()
   *
   * @example <caption>Get all entities that match a certain weather condition.</caption>
   * const niceDays = query.get(['sunny', 'humid', 'calm'], {
   *   index: 'weatherConditions'
   * }).run()
   *
   * @method Query#get
   * @param {Array} keyList Key(s) defining the entity to retrieve. If
   * `keyList` is not an array (i.e. for a single-value key), it will be
   * wrapped in an array.
   * @param {Object} [opts] Configuration options.
   * @param {string} [opts.string] Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
   */
  get (keyList, opts) {
    keyList || (keyList = [])
    opts || (opts = {})
    if (this.data) {
      throw utils.err(`${DOMAIN}#get`)(500, INDEX_ERR)
    }
    if (keyList && !utils.isArray(keyList)) {
      keyList = [keyList]
    }
    if (!keyList.length) {
      this.getData()
      return this
    }
    this.data = this.collection.getIndex(opts.index).get(keyList)
    return this
  },

  /**
   * Find the entity or entities that match the provided keyLists.
   *
   * @example <caption>Get the posts where "status" is "draft" or "inReview".</caption>
   * const posts = query.getAll('draft', 'inReview', { index: 'status' }).run()
   *
   * @example <caption>Same as above.</caption>
   * const posts = query.getAll(['draft'], ['inReview'], { index: 'status' }).run()
   *
   * @method Query#getAll
   * @param {...Array} [keyList] Provide one or more keyLists, and all
   * entities matching each keyList will be retrieved. If no keyLists are
   * provided, all entities will be returned.
   * @param {Object} [opts] Configuration options.
   * @param {string} [opts.index] Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
   */
  getAll (...args) {
    let opts = {}
    if (this.data) {
      throw utils.err(`${DOMAIN}#getAll`)(500, INDEX_ERR)
    }
    if (!args.length || (args.length === 1 && utils.isObject(args[0]))) {
      this.getData()
      return this
    } else if (args.length && utils.isObject(args[args.length - 1])) {
      opts = args[args.length - 1]
      args.pop()
    }
    const collection = this.collection
    const index = collection.getIndex(opts.index)
    this.data = []
    args.forEach((keyList) => {
      this.data = this.data.concat(index.get(keyList))
    })
    return this
  },

  /**
   * Return the current data result of this query.
   *
   * @method Query#getData
   * @returns {Array} The data in this query.
   * @since 3.0.0
   */
  getData () {
    if (!this.data) {
      this.data = this.collection.index.getAll()
    }
    return this.data
  },

  /**
   * Implementation used by the `like` operator. Takes a pattern and flags and
   * returns a `RegExp` instance that can test strings.
   *
   * @method Query#like
   * @param {string} pattern Testing pattern.
   * @param {string} flags Flags for the regular expression.
   * @returns {RegExp} Regular expression for testing strings.
   * @since 3.0.0
   */
  like (pattern, flags) {
    return new RegExp(`^${(escape(pattern).replace(percentRegExp, '.*').replace(underscoreRegExp, '.'))}$`, flags)
  },

  /**
   * Limit the result.
   *
   * @example <caption>Get only the first 2 posts.</caption>
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'draft', id: 2 },
   *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'draft', id: 5 }
   * ]
   * store.add('post', posts)
   * const results = store.query('post').limit(2).run()
   * console.log(results)
   *
   * @method Query#limit
   * @param {number} num The maximum number of entities to keep in the result.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
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
   * @example
   * // Return the age of all users
   * const store = new JSData.DataStore()
   * store.defineMapper('user')
   * const users = [
   *   { name: 'Peter', age: 25, id: 1 },
   *   { name: 'Jim', age: 19, id: 2 },
   *   { name: 'Mike', age: 17, id: 3 },
   *   { name: 'Alan', age: 29, id: 4 },
   *   { name: 'Katie', age: 33, id: 5 }
   * ]
   * store.add('post', posts)
   * const ages = store.query('user').map((user) => {
   *   return user.age
   * }).run()
   * console.log(ages)
   *
   * @method Query#map
   * @param {Function} mapFn Mapping function.
   * @param {*} [thisArg] Context to which to bind `mapFn`.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
   */
  map (mapFn, thisArg) {
    this.data = this.getData().map(mapFn, thisArg)
    return this
  },

  /**
   * Return the result of calling the specified function on each item in this
   * collection's main index.
   *
   * @example
   * const stringAges = UserCollection.query().mapCall('toString').run()
   *
   * @method Query#mapCall
   * @param {string} funcName Name of function to call
   * @parama {...*} [args] Remaining arguments to be passed to the function.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
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
   * @method Query#run
   * @returns {Array} The result of executing this query.
   * @since 3.0.0
   */
  run () {
    const data = this.data
    this.data = null
    return data
  },

  /**
   * Skip a number of results.
   *
   * @example <caption>Get all but the first 2 posts.</caption>
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'draft', id: 2 },
   *   { author: 'Mike', age: 32, status: 'draft', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'draft', id: 5 }
   * ]
   * store.add('post', posts)
   * const results = store.query('post').skip(2).run()
   * console.log(results)
   *
   * @method Query#skip
   * @param {number} num The number of entities to skip.
   * @returns {Query} A reference to itself for chaining.
   * @since 3.0.0
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
   * The filtering operators supported by {@link Query#filter}, and which are
   * implemented by adapters (for the most part).
   *
   * @example <caption>Variant 1</caption>
   *
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'published', id: 2 },
   *   { author: 'Mike', age: 32, status: 'published', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'published', id: 5 }
   * ]
   * store.add('post', posts)
   *
   * const publishedPosts = store.filter('post', {
   *   status: 'published',
   *   limit: 2
   * })
   *
   * console.log(publishedPosts)
   *
   *
   * @example <caption>Variant 2</caption>
   *
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'published', id: 2 },
   *   { author: 'Mike', age: 32, status: 'published', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'published', id: 5 }
   * ]
   * store.add('post', posts)
   *
   * const publishedPosts = store.filter('post', {
   *   where: {
   *     status: {
   *       '==': 'published'
   *     }
   *   },
   *   limit: 2
   * })
   *
   * console.log(publishedPosts)
   *
   * @example <caption>Variant 3</caption>
   *
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'published', id: 2 },
   *   { author: 'Mike', age: 32, status: 'published', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'published', id: 5 }
   * ]
   * store.add('post', posts)
   *
   * const publishedPosts = store.query('post').filter({
   *   status: 'published'
   * }).limit(2).run()
   *
   * console.log(publishedPosts)
   *
   * @example <caption>Variant 4</caption>
   *
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'published', id: 2 },
   *   { author: 'Mike', age: 32, status: 'published', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'published', id: 5 }
   * ]
   * store.add('post', posts)
   *
   * const publishedPosts = store.query('post').filter({
   *   where: {
   *     status: {
   *       '==': 'published'
   *     }
   *   }
   * }).limit(2).run()
   *
   * console.log(publishedPosts)
   *
   * @example <caption>Multiple operators</caption>
   *
   * const store = new JSData.DataStore()
   * store.defineMapper('post')
   * const posts = [
   *   { author: 'John', age: 30, status: 'published', id: 1 },
   *   { author: 'Sally', age: 31, status: 'published', id: 2 },
   *   { author: 'Mike', age: 32, status: 'published', id: 3 },
   *   { author: 'Adam', age: 33, status: 'deleted', id: 4 },
   *   { author: 'Adam', age: 33, status: 'published', id: 5 }
   * ]
   * store.add('post', posts)
   *
   * const myPublishedPosts = store.filter('post', {
   *   where: {
   *     status: {
   *       '==': 'published'
   *     },
   *     user_id: {
   *       '==': currentUser.id
   *     }
   *   }
   * })
   *
   * console.log(myPublishedPosts)
   *
   * @name Query.ops
   * @property {Function} == Equality operator.
   * @property {Function} != Inequality operator.
   * @property {Function} > Greater than operator.
   * @property {Function} >= Greater than (inclusive) operator.
   * @property {Function} < Less than operator.
   * @property {Function} <= Less than (inclusive) operator.
   * @property {Function} isectEmpty Operator that asserts that the intersection
   * between two arrays is empty.
   * @property {Function} isectNotEmpty Operator that asserts that the
   * intersection between two arrays is __not__ empty.
   * @property {Function} in Operator that asserts whether a value is in an
   * array.
   * @property {Function} notIn Operator that asserts whether a value is __not__
   * in an array.
   * @property {Function} contains Operator that asserts whether an array
   * contains a value.
   * @property {Function} notContains Operator that asserts whether an array
   * does __not__ contain a value.
   * @since 3.0.0
   * @type {Object}
   */
  ops: {
    '=': function (value, predicate) {
      return value == predicate // eslint-disable-line
    },
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

/**
 * Create a subclass of this Query:
 * @example <caption>Query.extend</caption>
 * // Normally you would do: import {Query} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Query} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomQueryClass extends Query {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customQuery = new CustomQueryClass()
 * console.log(customQuery.foo())
 * console.log(CustomQueryClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherQueryClass = Query.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherQuery = new OtherQueryClass()
 * console.log(otherQuery.foo())
 * console.log(OtherQueryClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherQueryClass (collection) {
 *   Query.call(this, collection)
 *   this.created_at = new Date().getTime()
 * }
 * Query.extend({
 *   constructor: AnotherQueryClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherQuery = new AnotherQueryClass()
 * console.log(anotherQuery.created_at)
 * console.log(anotherQuery.foo())
 * console.log(AnotherQueryClass.beep())
 *
 * @method Query.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Query class.
 * @since 3.0.0
 */
