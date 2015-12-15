import {Query} from './query'
import {isArray, isString, forOwn} from '../utils'
import {configure} from '../decorators'
import {Index} from '../../lib/mindex'
exports.Query = Query

/**
 * @class Collection
 * @param {Array} [data=[]] - Initial set of entities to insert into the
 * collection.
 * @param {string} [idAttribute='id'] - Field to use as the unique identifier
 * for each entity in the collection.
 */
export function Collection (data = [], idAttribute = 'id') {
  if (!isArray(data)) {
    throw new TypeError('new Collection([data]): data: Expected array. Found ' + typeof data)
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
  this.index = new Index([idAttribute], idAttribute)
  /**
   * Object that holds the other secondary indexes of this collection.
   * @type {Object.<string, Index>}
   */
  this.indexes = {}
  data.forEach(this.index.insertRecord, this.index)
}

configure({
  /**
   * @memberof Collection
   * @instance
   * @param {string} name - The name of the new secondary index.
   * @param {(string|string[])} keyList - Field of array of fields to use as the
   * key for the new secondary index.
   * @return {Collection} A reference to itself for chaining.
   */
  createIndex (name, keyList) {
    if (isString(name) && keyList === undefined) {
      keyList = [name]
    }
    const index = this.indexes[name] = new Index(keyList, this.idAttribute)
    this.index.visitAll(index.insertRecord, index)
    return this
  },

  /**
   * @memberof Collection
   * @instance
   * @return {Query} New query object.
   */
  query () {
    return new Query(this)
  },

  between (...args) {
    return this.query().between(...args).run()
  },

  get (...args) {
    return this.query().get(...args).run()
  },

  getAll (...args) {
    return this.query().getAll(...args).run()
  },

  filter (opts) {
    return this.query().filter(opts).run()
  },

  skip (num) {
    return this.query().skip(num).run()
  },

  limit (num) {
    return this.query().limit(num).run()
  },

  forEach (cb, thisArg) {
    this.index.visitAll(cb, thisArg)
  },

  map (cb, thisArg) {
    const data = []
    this.index.visitAll(function (value) {
      data.push(cb.call(thisArg, value))
    })
    return data
  },

  /**
   * Instead a record into this collection, updating all indexes with the new
   * record. See {@link Collection#insertRecord} to insert a record into only
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
  },

  update (record) {
    this.index.updateRecord(record)
    forOwn(this.indexes, function (index, name) {
      index.updateRecord(record)
    })
  },

  /**
   * @memberof Collection
   * @instance
   * @param {Object} record - The record to be removed.
   */
  remove (record) {
    this.index.removeRecord(record)
    forOwn(this.indexes, function (index, name) {
      index.removeRecord(record)
    })
  },

  /**
   * Instead a record into a single index of this collection. See
   * {@link Collection#insert}
   * to insert a record into all indexes at once.
   * @memberof Collection
   * @instance
   * @param {Object} record - The record to insert.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] The index into which to insert the record. If
   * you don't specify an index then the record will be inserted into the main
   * index.
   */
  insertRecord (record, opts) {
    opts || (opts = {})
    const index = opts.index ? this.indexes[opts.index] : this.index
    index.insertRecord(record)
  },

  updateRecord (record, opts) {
    opts || (opts = {})
    const index = opts.index ? this.indexes[opts.index] : this.index
    index.updateRecord(record)
  },

  removeRecord (record, opts) {
    opts || (opts = {})
    const index = opts.index ? this.indexes[opts.index] : this.index
    index.removeRecord(record)
  }
})(Collection.prototype)
