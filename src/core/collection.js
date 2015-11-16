import {isArray, isNumber, isObject} from './utils'
import {Index} from '../../lib/mindex'

class Query {
  constructor (collection) {
    this.collection = collection
  }

  getData () {
    if (!this.data) {
      this.data = this.collection.index.getAll()
    }
    return this.data
  }

  between (leftKeys, rightKeys, opts) {
    const collection = this.collection
    const index = opts.index ? collection.indexes[opts.index] : collection.index
    if (this.data) {
      throw new Error('Cannot access index after first operation!')
    }
    this.data = index.between(leftKeys, rightKeys, opts)
    return this
  }

  get (keyList = [], opts = {}) {
    if (this.data) {
      throw new Error('Cannot access index after first operation!')
    }
    if (!keyList.length) {
      this.getData()
      return this
    }
    const collection = this.collection
    const index = opts.index ? collection.indexes[opts.index] : collection.index
    this.data = index.get(keyList)
    return this
  }

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
  }

  filter (opts = {}) {
    console.log('filter', opts, this.getData().length)
    return this
  }

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
  }

  limit (num) {
    if (!isNumber(num)) {
      throw new TypeError(`limit: Expected number but found ${typeof num}!`)
    }
    const data = this.getData()
    this.data = data.slice(0, Math.min(data.length, num))
    return this
  }

  forEach (cb, thisArg) {
    this.getData().forEach(cb, thisArg)
    return this
  }

  map (cb, thisArg) {
    this.data = this.getData().map(cb, thisArg)
    return this
  }

  run () {
    let data = this.data
    this.data = null
    this.params = null
    return data
  }
}

export class Collection {
  constructor (data = [], idAttribute = 'id') {
    if (!isArray(data)) {
      throw new TypeError('new Collection([data]): data: Expected array. Found ' + typeof data)
    }
    this.idAttribute = idAttribute
    this.index = new Index([idAttribute], idAttribute)
    this.indexes = {}
    data.forEach(this.index.insertRecord, this.index)
  }

  createIndex (name, keyList) {
    const index = this.indexes[name] = new Index(keyList, this.idAttribute)
    this.index.visitAll(index.insertRecord, index)
    return this
  }

  query () {
    return new Query(this)
  }

  between (...args) {
    return this.query().between(...args).run()
  }

  get (...args) {
    return this.query().get(...args).run()
  }

  getAll (...args) {
    return this.query().getAll(...args).run()
  }

  filter (opts) {
    return this.query().filter(opts).run()
  }

  skip (num) {
    return this.query().skip(num).run()
  }

  limit (num) {
    return this.query().limit(num).run()
  }

  forEach (cb, thisArg) {
    this.index.visitAll(cb, thisArg)
  }

  map (cb, thisArg) {
    const data = []
    this.index.visitAll(function (value) {
      data.push(cb.call(thisArg, value))
    })
    return data
  }
}
