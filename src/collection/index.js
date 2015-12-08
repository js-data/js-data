import {Query} from './query'
import {isArray, isString, forOwn} from '../utils'
import {configure} from '../decorators'
import {Index} from '../../lib/mindex'
exports.Query = Query

export function Collection (data = [], idAttribute = 'id') {
  if (!isArray(data)) {
    throw new TypeError('new Collection([data]): data: Expected array. Found ' + typeof data)
  }
  this.idAttribute = idAttribute
  this.index = new Index([idAttribute], idAttribute)
  this.indexes = {}
  data.forEach(this.index.insertRecord, this.index)
}

configure({
  createIndex (name, keyList) {
    if (isString(name) && keyList === undefined) {
      keyList = [name]
    }
    const index = this.indexes[name] = new Index(keyList, this.idAttribute)
    this.index.visitAll(index.insertRecord, index)
    return this
  },

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

  remove (record) {
    this.index.removeRecord(record)
    forOwn(this.indexes, function (index, name) {
      index.removeRecord(record)
    })
  },

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
