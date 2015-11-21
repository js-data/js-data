import {isArray, isNumber, isObject} from '../utils'
import {configure} from '../decorators'

export function Query (collection) {
  this.collection = collection
}

configure({
  getData () {
    if (!this.data) {
      this.data = this.collection.index.getAll()
    }
    return this.data
  },

  between (leftKeys, rightKeys, opts = {}) {
    const collection = this.collection
    const index = opts.index ? collection.indexes[opts.index] : collection.index
    if (this.data) {
      throw new Error('Cannot access index after first operation!')
    }
    this.data = index.between(leftKeys, rightKeys, opts)
    return this
  },

  get (keyList = [], opts = {}) {
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

  filter (opts = {}) {
    console.log('filter', opts, this.getData().length)
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
