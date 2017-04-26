import utils from './utils'
import Component from './Component'
import Query from './Query'
import Record from './Record'
import Index from '../lib/mindex/index'

const { noValidatePath } = Record

const DOMAIN = 'Collection'

const COLLECTION_DEFAULTS = {
  /**
   * Whether to call {@link Record#commit} on records that are added to the
   * collection and already exist in the collection.
   *
   * @name Collection#commitOnMerge
   * @type {boolean}
   * @default true
   */
  commitOnMerge: true,

  /**
   * Whether record events should bubble up and be emitted by the collection.
   *
   * @name Collection#emitRecordEvents
   * @type {boolean}
   * @default true
   */
  emitRecordEvents: true,

  /**
   * Field to be used as the unique identifier for records in this collection.
   * Defaults to `"id"` unless {@link Collection#mapper} is set, in which case
   * this will default to {@link Mapper#idAttribute}.
   *
   * @name Collection#idAttribute
   * @type {string}
   * @default "id"
   */
  idAttribute: 'id',

  /**
   * What to do when inserting a record into this Collection that shares a
   * primary key with a record already in this Collection.
   *
   * Possible values:
   * merge
   * replace
   * skip
   *
   * Merge:
   *
   * Recursively shallow copy properties from the new record onto the existing
   * record.
   *
   * Replace:
   *
   * Shallow copy top-level properties from the new record onto the existing
   * record. Any top-level own properties of the existing record that are _not_
   * on the new record will be removed.
   *
   * Skip:
   *
   * Ignore new record, keep existing record.
   *
   * @name Collection#onConflict
   * @type {string}
   * @default "merge"
   */
  onConflict: 'merge'
}

/**
 * An ordered set of {@link Record} instances.
 *
 * @example <caption>Collection#constructor</caption>
 * // import {Collection, Record} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Collection, Record} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * const user1 = new Record({ id: 1 })
 * const user2 = new Record({ id: 2 })
 * const UserCollection = new Collection([user1, user2])
 * console.log(UserCollection.get(1) === user1)
 *
 * @class Collection
 * @extends Component
 * @param {Array} [records] Initial set of records to insert into the
 * collection.
 * @param {Object} [opts] Configuration options.
 * @param {string} [opts.commitOnMerge] See {@link Collection#commitOnMerge}.
 * @param {string} [opts.idAttribute] See {@link Collection#idAttribute}.
 * @param {string} [opts.onConflict="merge"] See {@link Collection#onConflict}.
 * @param {string} [opts.mapper] See {@link Collection#mapper}.
 * @since 3.0.0
 */
function Collection (records, opts) {
  utils.classCallCheck(this, Collection)
  Component.call(this, opts)

  if (records && !utils.isArray(records)) {
    opts = records
    records = []
  }
  if (utils.isString(opts)) {
    opts = { idAttribute: opts }
  }

  // Default values for arguments
  records || (records = [])
  opts || (opts = {})

  Object.defineProperties(this, {
    /**
     * Default Mapper for this collection. Optional. If a Mapper is provided, then
     * the collection will use the {@link Mapper#idAttribute} setting, and will
     * wrap records in {@link Mapper#recordClass}.
     *
     * @example <caption>Collection#mapper</caption>
     * // Normally you would do: import {Collection, Mapper} from 'js-data'
     * const JSData = require('js-data@3.0.0-rc.4')
     * const {Collection, Mapper} = JSData
     * console.log('Using JSData v' + JSData.version.full)
     *
     * class MyMapperClass extends Mapper {
     *   foo () { return 'bar' }
     * }
     * const myMapper = new MyMapperClass({ name: 'myMapper' })
     * const collection = new Collection(null, { mapper: myMapper })
     *
     * @name Collection#mapper
     * @type {Mapper}
     * @default null
     * @since 3.0.0
     */
    mapper: {
      value: undefined,
      writable: true
    },
    // Query class used by this collection
    queryClass: {
      value: undefined,
      writable: true
    }
  })

  // Apply user-provided configuration
  utils.fillIn(this, opts)
  // Fill in any missing options with the defaults
  utils.fillIn(this, utils.copy(COLLECTION_DEFAULTS))

  if (!this.queryClass) {
    this.queryClass = Query
  }

  const idAttribute = this.recordId()

  Object.defineProperties(this, {
    /**
     * The main index, which uses @{link Collection#recordId} as the key.
     *
     * @name Collection#index
     * @type {Index}
     */
    index: {
      value: new Index([idAttribute], {
        hashCode (obj) {
          return utils.get(obj, idAttribute)
        }
      })
    },

    /**
     * Object that holds the secondary indexes of this collection.
     *
     * @name Collection#indexes
     * @type {Object.<string, Index>}
     */
    indexes: {
      value: {}
    }
  })

  // Insert initial data into the collection
  if (utils.isObject(records) || (utils.isArray(records) && records.length)) {
    this.add(records)
  }
}

export default Component.extend({
  constructor: Collection,

  /**
   * Used to bind to events emitted by records in this Collection.
   *
   * @method Collection#_onRecordEvent
   * @since 3.0.0
   * @private
   * @param {...*} [arg] Args passed to {@link Collection#emit}.
   */
  _onRecordEvent (...args) {
    if (this.emitRecordEvents) {
      this.emit(...args)
    }
  },

  /**
   * Insert the provided record or records.
   *
   * If a record is already in the collection then the provided record will
   * either merge with or replace the existing record based on the value of the
   * `onConflict` option.
   *
   * The collection's secondary indexes will be updated as each record is
   * visited.
   *
   * @method Collection#add
   * @since 3.0.0
   * @param {(Object|Object[]|Record|Record[])} data The record or records to insert.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.commitOnMerge=true] See {@link Collection#commitOnMerge}.
   * @param {boolean} [opts.noValidate] See {@link Record#noValidate}.
   * @param {string} [opts.onConflict] See {@link Collection#onConflict}.
   * @returns {(Object|Object[]|Record|Record[])} The added record or records.
   */
  add (records, opts) {
    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Collection's configuration
    utils._(opts, this)
    records = this.beforeAdd(records, opts) || records

    // Track whether just one record or an array of records is being inserted
    let singular = false
    const idAttribute = this.recordId()
    if (!utils.isArray(records)) {
      if (utils.isObject(records)) {
        records = [records]
        singular = true
      } else {
        throw utils.err(`${DOMAIN}#add`, 'records')(400, 'object or array', records)
      }
    }

    // Map the provided records to existing records.
    // New records will be inserted. If any records map to existing records,
    // they will be merged into the existing records according to the onConflict
    // option.
    records = records.map((record) => {
      let id = this.recordId(record)
      // Grab existing record if there is one
      const existing = id === undefined ? id : this.get(id)
      // If the currently visited record is just a reference to an existing
      // record, then there is nothing to be done. Exit early.
      if (record === existing) {
        return existing
      }

      if (existing) {
        // Here, the currently visited record corresponds to a record already
        // in the collection, so we need to merge them
        const onConflict = opts.onConflict || this.onConflict
        if (onConflict !== 'merge' && onConflict !== 'replace' && onConflict !== 'skip') {
          throw utils.err(`${DOMAIN}#add`, 'opts.onConflict')(400, 'one of (merge, replace, skip)', onConflict, true)
        }
        const existingNoValidate = existing._get(noValidatePath)
        if (opts.noValidate) {
          // Disable validation
          existing._set(noValidatePath, true)
        }
        if (onConflict === 'merge') {
          utils.deepMixIn(existing, record)
        } else if (onConflict === 'replace') {
          utils.forOwn(existing, (value, key) => {
            if (key !== idAttribute && record[key] === undefined) {
              existing[key] = undefined
            }
          })
          existing.set(record)
        } // else if(onConflict === 'skip'){ do nothing }

        if (opts.noValidate) {
          // Restore previous `noValidate` value
          existing._set(noValidatePath, existingNoValidate)
        }
        record = existing
        if (opts.commitOnMerge && utils.isFunction(record.commit)) {
          record.commit()
        }
        // Update all indexes in the collection
        this.updateIndexes(record)
      } else {
        // Here, the currently visted record does not correspond to any record
        // in the collection, so (optionally) instantiate this record and insert
        // it into the collection
        record = this.mapper ? this.mapper.createRecord(record, opts) : record
        this.index.insertRecord(record)
        utils.forOwn(this.indexes, function (index, name) {
          index.insertRecord(record)
        })
        if (record && utils.isFunction(record.on)) {
          record.on('all', this._onRecordEvent, this)
        }
      }
      return record
    })
    // Finally, return the inserted data
    const result = singular ? records[0] : records
    if (!opts.silent) {
      this.emit('add', result)
    }
    return this.afterAdd(records, opts, result) || result
  },

  /**
   * Lifecycle hook called by {@link Collection#add}. If this method returns a
   * value then {@link Collection#add} will return that same value.
   *
   * @method Collection#method
   * @since 3.0.0
   * @param {(Object|Object[]|Record|Record[])} result The record or records
   * that were added to this Collection by {@link Collection#add}.
   * @param {Object} opts The `opts` argument passed to {@link Collection#add}.
   */
  afterAdd () {},

  /**
   * Lifecycle hook called by {@link Collection#remove}. If this method returns
   * a value then {@link Collection#remove} will return that same value.
   *
   * @method Collection#afterRemove
   * @since 3.0.0
   * @param {(string|number)} id The `id` argument passed to {@link Collection#remove}.
   * @param {Object} opts The `opts` argument passed to {@link Collection#remove}.
   * @param {Object} record The result that will be returned by {@link Collection#remove}.
   */
  afterRemove () {},

  /**
   * Lifecycle hook called by {@link Collection#removeAll}. If this method
   * returns a value then {@link Collection#removeAll} will return that same
   * value.
   *
   * @method Collection#afterRemoveAll
   * @since 3.0.0
   * @param {Object} query The `query` argument passed to {@link Collection#removeAll}.
   * @param {Object} opts The `opts` argument passed to {@link Collection#removeAll}.
   * @param {Object} records The result that will be returned by {@link Collection#removeAll}.
   */
  afterRemoveAll () {},

  /**
   * Lifecycle hook called by {@link Collection#add}. If this method returns a
   * value then the `records` argument in {@link Collection#add} will be
   * re-assigned to the returned value.
   *
   * @method Collection#beforeAdd
   * @since 3.0.0
   * @param {(Object|Object[]|Record|Record[])} records The `records` argument passed to {@link Collection#add}.
   * @param {Object} opts The `opts` argument passed to {@link Collection#add}.
   */
  beforeAdd () {},

  /**
   * Lifecycle hook called by {@link Collection#remove}.
   *
   * @method Collection#beforeRemove
   * @since 3.0.0
   * @param {(string|number)} id The `id` argument passed to {@link Collection#remove}.
   * @param {Object} opts The `opts` argument passed to {@link Collection#remove}.
   */
  beforeRemove () {},

  /**
   * Lifecycle hook called by {@link Collection#removeAll}.
   *
   * @method Collection#beforeRemoveAll
   * @since 3.0.0
   * @param {Object} query The `query` argument passed to {@link Collection#removeAll}.
   * @param {Object} opts The `opts` argument passed to {@link Collection#removeAll}.
   */
  beforeRemoveAll () {},

  /**
   * Find all records between two boundaries.
   *
   * Shortcut for `collection.query().between(18, 30, { index: 'age' }).run()`
   *
   * @example
   * // Get all users ages 18 to 30
   * const users = collection.between(18, 30, { index: 'age' })
   *
   * @example
   * // Same as above
   * const users = collection.between([18], [30], { index: 'age' })
   *
   * @method Collection#between
   * @since 3.0.0
   * @param {Array} leftKeys Keys defining the left boundary.
   * @param {Array} rightKeys Keys defining the right boundary.
   * @param {Object} [opts] Configuration options.
   * @param {string} [opts.index] Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @param {boolean} [opts.leftInclusive=true] Whether to include records
   * on the left boundary.
   * @param {boolean} [opts.rightInclusive=false] Whether to include records
   * on the left boundary.
   * @param {boolean} [opts.limit] Limit the result to a certain number.
   * @param {boolean} [opts.offset] The number of resulting records to skip.
   * @returns {Object[]|Record[]} The result.
   */
  between (leftKeys, rightKeys, opts) {
    return this.query().between(leftKeys, rightKeys, opts).run()
  },

  /**
   * Create a new secondary index on the contents of the collection.
   *
   * @example
   * // Index users by age
   * collection.createIndex('age')
   *
   * @example
   * // Index users by status and role
   * collection.createIndex('statusAndRole', ['status', 'role'])
   *
   * @method Collection#createIndex
   * @since 3.0.0
   * @param {string} name The name of the new secondary index.
   * @param {string[]} [fieldList] Array of field names to use as the key or
   * compound key of the new secondary index. If no fieldList is provided, then
   * the name will also be the field that is used to index the collection.
   */
  createIndex (name, fieldList, opts) {
    if (utils.isString(name) && fieldList === undefined) {
      fieldList = [name]
    }
    opts || (opts = {})
    opts.hashCode || (opts.hashCode = (obj) => this.recordId(obj))
    const index = this.indexes[name] = new Index(fieldList, opts)
    this.index.visitAll(index.insertRecord, index)
  },

  /**
   * Find the record or records that match the provided query or pass the
   * provided filter function.
   *
   * Shortcut for `collection.query().filter(queryOrFn[, thisArg]).run()`
   *
   * @example <caption>Collection#filter</caption>
   * // Normally you would do: import {Collection} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Collection} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const collection = new Collection([
   *   { id: 1, status: 'draft', created_at_timestamp: new Date().getTime() }
   * ])
   *
   * // Get the draft posts created less than three months ago
   * let posts = collection.filter({
   *   where: {
   *     status: {
   *       '==': 'draft'
   *     },
   *     created_at_timestamp: {
   *       '>=': (new Date().getTime() - (1000 \* 60 \* 60 \* 24 \* 30 \* 3)) // 3 months ago
   *     }
   *   }
   * })
   * console.log(posts)
   *
   * // Use a custom filter function
   * posts = collection.filter(function (post) {
   *   return post.id % 2 === 0
   * })
   *
   * @method Collection#filter
   * @param {(Object|Function)} [queryOrFn={}] Selection query or filter
   * function.
   * @param {Object} [thisArg] Context to which to bind `queryOrFn` if
   * `queryOrFn` is a function.
   * @returns {Array} The result.
   * @see query
   * @since 3.0.0
   */
  filter (query, thisArg) {
    return this.query().filter(query, thisArg).run()
  },

  /**
   * Iterate over all records.
   *
   * @example
   * collection.forEach(function (record) {
   *   // do something
   * })
   *
   * @method Collection#forEach
   * @since 3.0.0
   * @param {Function} forEachFn Iteration function.
   * @param {*} [thisArg] Context to which to bind `forEachFn`.
   * @returns {Array} The result.
   */
  forEach (cb, thisArg) {
    this.index.visitAll(cb, thisArg)
  },

  /**
   * Get the record with the given id.
   *
   * @method Collection#get
   * @since 3.0.0
   * @param {(string|number)} id The primary key of the record to get.
   * @returns {(Object|Record)} The record with the given id.
   */
  get (id) {
    const instances = id === undefined ? [] : this.query().get(id).run()
    return instances.length ? instances[0] : undefined
  },

  /**
   * Find the record or records that match the provided keyLists.
   *
   * Shortcut for `collection.query().getAll(keyList1, keyList2, ...).run()`
   *
   * @example
   * // Get the posts where "status" is "draft" or "inReview"
   * const posts = collection.getAll('draft', 'inReview', { index: 'status' })
   *
   * @example
   * // Same as above
   * const posts = collection.getAll(['draft'], ['inReview'], { index: 'status' })
   *
   * @method Collection#getAll
   * @since 3.0.0
   * @param {...Array} [keyList] Provide one or more keyLists, and all
   * records matching each keyList will be retrieved. If no keyLists are
   * provided, all records will be returned.
   * @param {Object} [opts] Configuration options.
   * @param {string} [opts.index] Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @returns {Array} The result.
   */
  getAll (...args) {
    return this.query().getAll(...args).run()
  },

  /**
   * Return the index with the given name. If no name is provided, return the
   * main index. Throws an error if the specified index does not exist.
   *
   * @method Collection#getIndex
   * @since 3.0.0
   * @param {string} [name] The name of the index to retrieve.
   */
  getIndex (name) {
    const index = name ? this.indexes[name] : this.index
    if (!index) {
      throw utils.err(`${DOMAIN}#getIndex`, name)(404, 'index')
    }
    return index
  },

  /**
   * Limit the result.
   *
   * Shortcut for `collection.query().limit(maximumNumber).run()`
   *
   * @example
   * const posts = collection.limit(10)
   *
   * @method Collection#limit
   * @since 3.0.0
   * @param {number} num The maximum number of records to keep in the result.
   * @returns {Array} The result.
   */
  limit (num) {
    return this.query().limit(num).run()
  },

  /**
   * Apply a mapping function to all records.
   *
   * @example
   * const names = collection.map(function (user) {
   *   return user.name
   * })
   *
   * @method Collection#map
   * @since 3.0.0
   * @param {Function} mapFn Mapping function.
   * @param {*} [thisArg] Context to which to bind `mapFn`.
   * @returns {Array} The result of the mapping.
   */
  map (cb, thisArg) {
    const data = []
    this.index.visitAll(function (value) {
      data.push(cb.call(thisArg, value))
    })
    return data
  },

  /**
   * Return the result of calling the specified function on each record in this
   * collection's main index.
   *
   * @method Collection#mapCall
   * @since 3.0.0
   * @param {string} funcName Name of function to call
   * @parama {...*} [args] Remaining arguments to be passed to the function.
   * @returns {Array} The result.
   */
  mapCall (funcName, ...args) {
    const data = []
    this.index.visitAll(function (record) {
      data.push(record[funcName](...args))
    })
    return data
  },

  /**
   * Return all "unsaved" (not uniquely identifiable) records in this colleciton.
   *
   * @method Collection#prune
   * @param {Object} [opts] Configuration options, passed to {@link Collection#removeAll}.
   * @since 3.0.0
   * @returns {Array} The removed records, if any.
   */
  prune (opts) {
    return this.removeAll(this.unsaved(), opts)
  },

  /**
   * Create a new query to be executed against the contents of the collection.
   * The result will be all or a subset of the contents of the collection.
   *
   * @example
   * // Grab page 2 of users between ages 18 and 30
   * collection.query()
   *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
   *   .skip(10) // second page
   *   .limit(10) // page size
   *   .run()
   *
   * @method Collection#query
   * @since 3.0.0
   * @returns {Query} New query object.
   */
  query () {
    const Ctor = this.queryClass
    return new Ctor(this)
  },

  /**
   * Return the primary key of the given, or if no record is provided, return the
   * name of the field that holds the primary key of records in this Collection.
   *
   * @method Collection#recordId
   * @since 3.0.0
   * @param {(Object|Record)} [record] The record whose primary key is to be
   * returned.
   * @returns {(string|number)} Primary key or name of field that holds primary
   * key.
   */
  recordId (record) {
    if (record) {
      return utils.get(record, this.recordId())
    }
    return this.mapper ? this.mapper.idAttribute : this.idAttribute
  },

  /**
   * Reduce the data in the collection to a single value and return the result.
   *
   * @example
   * const totalVotes = collection.reduce(function (prev, record) {
   *   return prev + record.upVotes + record.downVotes
   * }, 0)
   *
   * @method Collection#reduce
   * @since 3.0.0
   * @param {Function} cb Reduction callback.
   * @param {*} initialValue Initial value of the reduction.
   * @returns {*} The result.
   */
  reduce (cb, initialValue) {
    const data = this.getAll()
    return data.reduce(cb, initialValue)
  },

  /**
   * Remove the record with the given id from this Collection.
   *
   * @method Collection#remove
   * @since 3.0.0
   * @param {(string|number|object|Record)} idOrRecord The primary key of the
   * record to be removed, or a reference to the record that is to be removed.
   * @param {Object} [opts] Configuration options.
   * @returns {Object|Record} The removed record, if any.
   */
  remove (idOrRecord, opts) {
    // Default values for arguments
    opts || (opts = {})
    this.beforeRemove(idOrRecord, opts)
    let record = utils.isSorN(idOrRecord) ? this.get(idOrRecord) : idOrRecord

    // The record is in the collection, remove it
    if (utils.isObject(record)) {
      record = this.index.removeRecord(record)
      if (record) {
        utils.forOwn(this.indexes, function (index, name) {
          index.removeRecord(record)
        })
        if (utils.isFunction(record.off)) {
          record.off('all', this._onRecordEvent, this)
          if (!opts.silent) {
            this.emit('remove', record)
          }
        }
      }
    }
    return this.afterRemove(idOrRecord, opts, record) || record
  },

  /**
   * Remove from this collection the given records or the records selected by
   * the given "query".
   *
   * @method Collection#removeAll
   * @since 3.0.0
   * @param {Object|Object[]|Record[]} [queryOrRecords={}] Records to be removed or selection query. See {@link query}.
   * @param {Object} [queryOrRecords.where] See {@link query.where}.
   * @param {number} [queryOrRecords.offset] See {@link query.offset}.
   * @param {number} [queryOrRecords.limit] See {@link query.limit}.
   * @param {string|Array[]} [queryOrRecords.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options.
   * @returns {(Object[]|Record[])} The removed records, if any.
   */
  removeAll (queryOrRecords, opts) {
    // Default values for arguments
    opts || (opts = {})
    this.beforeRemoveAll(queryOrRecords, opts)
    let records = utils.isArray(queryOrRecords) ? queryOrRecords.slice() : this.filter(queryOrRecords)

    // Remove each selected record from the collection
    const optsCopy = utils.plainCopy(opts)
    optsCopy.silent = true
    records = records
      .map((record) => this.remove(record, optsCopy))
      .filter((record) => record)
    if (!opts.silent) {
      this.emit('remove', records)
    }
    return this.afterRemoveAll(queryOrRecords, opts, records) || records
  },

  /**
   * Skip a number of results.
   *
   * Shortcut for `collection.query().skip(numberToSkip).run()`
   *
   * @example
   * const posts = collection.skip(10)
   *
   * @method Collection#skip
   * @since 3.0.0
   * @param {number} num The number of records to skip.
   * @returns {Array} The result.
   */
  skip (num) {
    return this.query().skip(num).run()
  },

  /**
   * Return the plain JSON representation of all items in this collection.
   * Assumes records in this collection have a toJSON method.
   *
   * @method Collection#toJSON
   * @since 3.0.0
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Array of relation names or relation fields
   * to include in the representation.
   * @returns {Array} The records.
   */
  toJSON (opts) {
    return this.mapCall('toJSON', opts)
  },

  /**
   * Return all "unsaved" (not uniquely identifiable) records in this colleciton.
   *
   * @method Collection#unsaved
   * @since 3.0.0
   * @returns {Array} The unsaved records, if any.
   */
  unsaved (opts) {
    return this.index.get()
  },

  /**
   * Update a record's position in a single index of this collection. See
   * {@link Collection#updateIndexes} to update a record's position in all
   * indexes at once.
   *
   * @method Collection#updateIndex
   * @since 3.0.0
   * @param {Object} record The record to update.
   * @param {Object} [opts] Configuration options.
   * @param {string} [opts.index] The index in which to update the record's
   * position. If you don't specify an index then the record will be updated
   * in the main index.
   */
  updateIndex (record, opts) {
    opts || (opts = {})
    this.getIndex(opts.index).updateRecord(record)
  },

  /**
   * Updates all indexes in this collection for the provided record. Has no
   * effect if the record is not in the collection.
   *
   * @method Collection#updateIndexes
   * @since 3.0.0
   * @param {Object} record TODO
   */
  updateIndexes (record) {
    this.index.updateRecord(record)
    utils.forOwn(this.indexes, function (index, name) {
      index.updateRecord(record)
    })
  }
})

/**
 * Fired when a record changes. Only works for records that have tracked changes.
 * See {@link Collection~changeListener} on how to listen for this event.
 *
 * @event Collection#change
 * @see Collection~changeListener
 */

/**
 * Callback signature for the {@link Collection#event:change} event.
 *
 * @example
 * function onChange (record, changes) {
 *   // do something
 * }
 * collection.on('change', onChange)
 *
 * @callback Collection~changeListener
 * @param {Record} The Record that changed.
 * @param {Object} The changes.
 * @see Collection#event:change
 * @since 3.0.0
 */

/**
 * Fired when one or more records are added to the Collection. See
 * {@link Collection~addListener} on how to listen for this event.
 *
 * @event Collection#add
 * @see Collection~addListener
 * @see Collection#event:add
 * @see Collection#add
 */

/**
 * Callback signature for the {@link Collection#event:add} event.
 *
 * @example
 * function onAdd (recordOrRecords) {
 *   // do something
 * }
 * collection.on('add', onAdd)
 *
 * @callback Collection~addListener
 * @param {Record|Record[]} The Record or Records that were added.
 * @see Collection#event:add
 * @see Collection#add
 * @since 3.0.0
 */

/**
 * Fired when one or more records are removed from the Collection. See
 * {@link Collection~removeListener} for how to listen for this event.
 *
 * @event Collection#remove
 * @see Collection~removeListener
 * @see Collection#event:remove
 * @see Collection#remove
 * @see Collection#removeAll
 */

/**
 * Callback signature for the {@link Collection#event:remove} event.
 *
 * @example
 * function onRemove (recordsOrRecords) {
 *   // do something
 * }
 * collection.on('remove', onRemove)
 *
 * @callback Collection~removeListener
 * @param {Record|Record[]} Record or Records that were removed.
 * @see Collection#event:remove
 * @see Collection#remove
 * @see Collection#removeAll
 * @since 3.0.0
 */

/**
 * Create a subclass of this Collection:
 * @example <caption>Collection.extend</caption>
 * // Normally you would do: import {Collection} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Collection} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomCollectionClass extends Collection {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customCollection = new CustomCollectionClass()
 * console.log(customCollection.foo())
 * console.log(CustomCollectionClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherCollectionClass = Collection.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherCollection = new OtherCollectionClass()
 * console.log(otherCollection.foo())
 * console.log(OtherCollectionClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherCollectionClass () {
 *   Collection.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * Collection.extend({
 *   constructor: AnotherCollectionClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherCollection = new AnotherCollectionClass()
 * console.log(anotherCollection.created_at)
 * console.log(anotherCollection.foo())
 * console.log(AnotherCollectionClass.beep())
 *
 * @method Collection.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Collection class.
 * @since 3.0.0
 */
