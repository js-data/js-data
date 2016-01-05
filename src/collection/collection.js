import {Query} from './query'
import {
  addHiddenPropsToTarget,
  classCallCheck,
  eventify,
  forOwn,
  get,
  isArray,
  isFunction,
  isString
} from '../utils'
import {Index} from '../../lib/mindex/index'

/**
 * @class Collection
 * @param {Array} [data=[]] - Initial set of entities to insert into the
 * collection.
 * @param {string} [idAttribute='id'] - Field to use as the unique identifier
 * of each entity in the collection.
 */
export function Collection (data = [], idAttribute = 'id') {
  classCallCheck(this, Collection)
  if (!isArray(data)) {
    throw new TypeError(`new Collection([data]): data: Expected array. Found ${typeof data}`)
  }
  /**
   * Field to use as the unique identifier for each entity in this collection.
   * @type {string}
   */
  this.idAttribute = idAttribute

  /**
   * The main index, which uses @{link Collection#idAttribute} as the key.
   * @type {Index}
   */
  this.index = new Index([idAttribute], {
    hashCode (obj) {
      return get(obj, idAttribute)
    }
  })
  /**
   * Object that holds the other secondary indexes of this collection.
   * @type {Object.<string, Index>}
   */
  this.indexes = {}
  data.forEach(record => {
    this.index.insertRecord(record)
    if (record && isFunction(record.on)) {
      record.on('all', this._onModelEvent, this)
    }
  })
}

addHiddenPropsToTarget(Collection.prototype, {
  _onModelEvent (...args) {
    this.emit(...args)
  },

  /**
   * Create a new secondary index on the contents of the collection.
   *
   * #### Example
   *
   * Index users by age
   * ```js
   * collection.createIndex('age')
   * ```
   * Index users by status and role
   * ```js
   * collection.createIndex('statusAndRole', ['status', 'role'])
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {string} name - The name of the new secondary index.
   * @param {string[]} [fieldList] - Array of field names to use as the key or
   * compound key of the new secondary index. If no fieldList is provided, then
   * the name will also be the field that is used to index the collection.
   * @return {Collection} A reference to itself for chaining.
   */
  createIndex (name, fieldList, opts) {
    if (isString(name) && fieldList === undefined) {
      fieldList = [name]
    }
    opts || (opts = {})
    const idAttribute = this.idAttribute
    opts.hashCode = opts.hashCode || function (obj) {
      return get(obj, idAttribute)
    }
    const index = this.indexes[name] = new Index(fieldList, opts)
    this.index.visitAll(index.insertRecord, index)
    return this
  },

  /**
   * Create a new query to be executed against the contents of the collection.
   * The result will be all or a subset of the contents of the collection.
   *
   * #### Example
   *
   * Grab page 2 of users between ages 18 and 30
   * ```js
   * collection.query()
   *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
   *   .skip(10) // second page
   *   .limit(10) // page size
   *   .run()
   * ```
   *
   * @memberof Collection
   * @instance
   * @return {Query} New query object.
   */
  query () {
    return new Query(this)
  },

  /**
   * Find all entities between two boundaries.
   *
   * Shortcut for `collection.query().between(18, 30, { index: 'age' }).run()`
   *
   * Get all users ages 18 to 30
   * ```js
   * const users = collection.between(18, 30, { index: 'age' })
   * ```
   * Same as above
   * ```js
   * const users = collection.between([18], [30], { index: 'age' })
   * ```
   *
   * @memberof Collection
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
   * @return {Array} The result.
   */
  between (leftKeys, rightKeys, opts) {
    return this.query().between(leftKeys, rightKeys, opts).run()
  },

  /**
   * Find the entity or entities that match the provided key.
   *
   * Shortcut for `collection.query().get(keyList).run()`
   *
   * #### Example
   *
   * Get the entity whose primary key is 25
   * ```js
   * const entities = collection.get(25)
   * ```
   * Same as above
   * ```js
   * const entities = collection.get([25])
   * ```
   * Get all users who are active and have the "admin" role
   * ```js
   * const activeAdmins = collection.get(['active', 'admin'], {
   *   index: 'activityAndRoles'
   * })
   * ```
   * Get all entities that match a certain weather condition
   * ```js
   * const niceDays = collection.get(['sunny', 'humid', 'calm'], {
   *   index: 'weatherConditions'
   * })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Array} keyList - Key(s) defining the entity to retrieve. If
   * `keyList` is not an array (i.e. for a single-value key), it will be
   * wrapped in an array.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.string] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @return {Array} The result.
   */
  get (keyList, opts) {
    return this.query().get(keyList, opts).run()
  },

  /**
   * Find the entity or entities that match the provided keyLists.
   *
   * Shortcut for `collection.query().getAll(keyList1, keyList2).run()`
   *
   * #### Example
   *
   * Get the posts where "status" is "draft" or "inReview"
   * ```js
   * const posts = collection.getAll('draft', 'inReview', { index: 'status' })
   * ```
   * Same as above
   * ```js
   * const posts = collection.getAll(['draft'], ['inReview'], { index: 'status' })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {...Array} [keyList] - Provide one or more keyLists, and all
   * entities matching each keyList will be retrieved. If no keyLists are
   * provided, all entities will be returned.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @return {Array} The result.
   */
  getAll (...args) {
    return this.query().getAll(...args).run()
  },

  /**
   * Find the entity or entities that match the provided query or pass the
   * provided filter function.
   *
   * Shortcut for `collection.query().filter(queryOrFn[, thisArg]).run()`
   *
   * #### Example
   *
   * Get the draft posts created less than three months
   * ```js
   * const posts = collection.filter({
   *   where: {
   *     status: {
   *       '==': 'draft'
   *     },
   *     created_at_timestamp: {
   *       '>=': (new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 3)) // 3 months ago
   *     }
   *   }
   * })
   * ```
   * Use a custom filter function
   * ```js
   * const posts = collection.filter(function (post) {
   *   return post.isReady()
   * })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {(Object|Function)} [queryOrFn={}] - Selection query or filter
   * function.
   * @param {Object} [thisArg] - Context to which to bind `queryOrFn` if
   * `queryOrFn` is a function.
   * @return {Array} The result.
   */
  filter (query, thisArg) {
    return this.query().filter(query, thisArg).run()
  },

  /**
   * Skip a number of results.
   *
   * Shortcut for `collection.query().skip(numberToSkip).run()`
   *
   * #### Example
   *
   * ```js
   * const posts = collection.skip(10)
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {number} num - The number of entities to skip.
   * @return {Array} The result.
   */
  skip (num) {
    return this.query().skip(num).run()
  },

  /**
   * Limit the result.
   *
   * Shortcut for `collection.query().limit(maximumNumber).run()`
   *
   * #### Example
   *
   * ```js
   * const posts = collection.limit(10)
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {number} num - The maximum number of entities to keep in the result.
   * @return {Array} The result.
   */
  limit (num) {
    return this.query().limit(num).run()
  },

  /**
   * Iterate over all entities.
   *
   * #### Example
   *
   * ```js
   * collection.forEach(function (entity) {
   *   // do something
   * })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Function} forEachFn - Iteration function.
   * @param {*} [thisArg] - Context to which to bind `forEachFn`.
   * @return {Array} The result.
   */
  forEach (cb, thisArg) {
    this.index.visitAll(cb, thisArg)
  },

  /**
   * Reduce the data in the collection to a single value and return the result.
   *
   * #### Example
   *
   * ```js
   * const totalVotes = collection.reduce(function (prev, entity) {
   *   return prev + entity.upVotes + entity.downVotes
   * }, 0)
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Function} cb - Reduction callback.
   * @param {*} initialValue - Initial value of the reduction.
   * @return {*} The result.
   */
  reduce (cb, initialValue) {
    const data = this.getAll()
    return data.reduce(cb, initialValue)
  },

  /**
   * Apply a mapping function to all entities.
   *
   * #### Example
   *
   * ```js
   * const names = collection.map(function (user) {
   *   return user.name
   * })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Function} mapFn - Mapping function.
   * @param {*} [thisArg] - Context to which to bind `mapFn`.
   * @return {Array} The result of the mapping.
   */
  map (cb, thisArg) {
    const data = []
    this.index.visitAll(function (value) {
      data.push(cb.call(thisArg, value))
    })
    return data
  },

  /**
   * Instead a record into this collection, updating all indexes with the new
   * record.
   * one index.
   * @memberof Collection
   * @instance
   * @param {Object} record - The record to insert.
   */
  insert (record) {
    this.index.insertRecord(record)
    forOwn(this.indexes, function (index, name) {
      index.insertRecord(record)
    })
    if (record && isFunction(record.on)) {
      record.on('all', this._onModelEvent, this)
      this.emit('add', record)
    }
  },

  /**
   * Update the given record's position in all indexes of this collection. See
   * {@link Collection#updateRecord} to update a record's in only one of the
   * indexes.
   * @memberof Collection
   * @instance
   * @param {Object} record - The record to update.
   */
  update (record) {
    this.index.updateRecord(record)
    forOwn(this.indexes, function (index, name) {
      index.updateRecord(record)
    })
  },

  /**
   * Remove the given record from all indexes in this collection.
   * @memberof Collection
   * @instance
   * @param {Object} record - The record to be removed.
   */
  remove (record) {
    this.index.removeRecord(record)
    forOwn(this.indexes, function (index, name) {
      index.removeRecord(record)
    })
    if (record && isFunction(record.off)) {
      record.off('all', this._onModelEvent, this)
      this.emit('remove', record)
    }
  },

  /**
   * Update a record's position in a single index of this collection. See
   * {@link Collection#update} to update a record's position in all indexes at
   * once.
   * @memberof Collection
   * @instance
   * @param {Object} record - The record to update.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] The index in which to update the record's
   * position. If you don't specify an index then the record will be updated
   * in the main index.
   */
  updateRecord (record, opts) {
    opts || (opts = {})
    const index = opts.index ? this.indexes[opts.index] : this.index
    index.updateRecord(record)
  },

  /**
   * Return the result of calling the specified function on each item in this
   * collection's main index.
   * @memberof Collection
   * @instance
   * @param {string} funcName - Name of function to call
   * @parama {...*} [args] - Remaining arguments to be passed to the function.
   * @return {Array} The result.
   */
  mapCall (funcName, ...args) {
    const data = []
    this.index.visitAll(function (item) {
      data.push(item[funcName](...args))
    })
    return data
  }
})

eventify(
  Collection.prototype,
  function () {
    return this._events
  },
  function (value) {
    this._events = value
  }
)
