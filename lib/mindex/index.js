// Copyright (c) 2015, InternalFX.

// Permission to use, copy, modify, and/or distribute this software for any purpose with or
// without fee is hereby granted, provided that the above copyright notice and this permission
// notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO
// THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT
// SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR
// ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE
// USE OR PERFORMANCE OF THIS SOFTWARE.

// Modifications
// Copyright 2015 Jason Dobry
//
// Summary of modifications:
// Converted to ES6 Class syntax
// Reworked dependencies so as to re-use code already in js-data
import {copy, fillIn, isArray, omit} from '../../src/core/utils'
import {binarySearch, insertAt, removeAt} from './utils'

export class Index {
  constructor (fieldList = [], idAttribute) {
    if (!isArray(fieldList)) {
      throw new Error('fieldList must be an array.')
    }

    this.fieldList = fieldList
    this.idAttribute = idAttribute
    this.isIndex = true
    this.keys = []
    this.values = []
  }

  set (keyList, value) {
    if (!isArray(keyList)) {
      keyList = [keyList]
    }

    let key = keyList.shift() || null
    let pos = binarySearch(this.keys, key)

    if (keyList.length === 0) {
      if (pos.found) {
        let dataLocation = binarySearch(this.values[pos.index], value, this.idAttribute)
        if (!dataLocation.found) {
          insertAt(this.values[pos.index], dataLocation.index, value)
        }
      } else {
        insertAt(this.keys, pos.index, key)
        insertAt(this.values, pos.index, [value])
      }
    } else {
      if (pos.found) {
        this.values[pos.index].set(keyList, value)
      } else {
        insertAt(this.keys, pos.index, key)
        let newIndex = new Index()
        newIndex.set(keyList, value)
        insertAt(this.values, pos.index, newIndex)
      }
    }
  }

  get (keyList) {
    if (!isArray(keyList)) {
      keyList = [keyList]
    }

    let key = keyList.shift() || null
    let pos = binarySearch(this.keys, key)

    if (keyList.length === 0) {
      if (pos.found) {
        if (this.values[pos.index].isIndex) {
          return this.values[pos.index].getAll()
        } else {
          return this.values[pos.index]
        }
      } else {
        return []
      }
    } else {
      if (pos.found) {
        return this.values[pos.index].get(keyList)
      } else {
        return []
      }
    }
  }

  getAll () {
    let results = []
    this.values.forEach(function (value) {
      if (value.isIndex) {
        results = results.concat(value.getAll())
      } else {
        results = results.concat(value)
      }
    })
    return results
  }

  visitAll (cb, thisArg) {
    this.values.forEach(function (value) {
      if (value.isIndex) {
        value.visitAll(cb, thisArg)
      } else {
        value.forEach(cb, thisArg)
      }
    })
  }

  query (query) {
    let leftKeys
    let rightKeys

    if (query['>']) {
      leftKeys = query['>']
      query.leftInclusive = false
    } else if (query['>=']) {
      leftKeys = query['>=']
      query.leftInclusive = true
    }

    if (query['<']) {
      rightKeys = query['<']
      query.rightInclusive = false
    } else if (query['<=']) {
      rightKeys = query['<=']
      query.rightInclusive = true
    }

    if (leftKeys.length !== rightKeys.length) {
      throw new Error('Key arrays must be same length')
    }

    return this.between(leftKeys, rightKeys, omit(query, ['>', '>=', '<', '<=']))
  }

  between (leftKeys, rightKeys, opts = {}) {
    if (!isArray(leftKeys)) {
      leftKeys = [leftKeys]
    }
    if (!isArray(rightKeys)) {
      rightKeys = [rightKeys]
    }
    fillIn(opts, {
      leftInclusive: true,
      rightInclusive: false,
      limit: undefined,
      offset: 0
    })

    let results = this._between(leftKeys, rightKeys, opts)

    if (opts.limit) {
      return results.slice(opts.offset, opts.limit + opts.offset)
    } else {
      return results.slice(opts.offset)
    }
  }

  _between (leftKeys, rightKeys, opts) {
    let results = []

    let leftKey = leftKeys.shift()
    let rightKey = rightKeys.shift()

    let pos

    if (leftKey !== undefined) {
      pos = binarySearch(this.keys, leftKey)
    } else {
      pos = {
        found: false,
        index: 0
      }
    }

    if (leftKeys.length === 0) {
      if (pos.found && opts.leftInclusive === false) {
        pos.index += 1
      }

      for (let i = pos.index; i < this.keys.length; i += 1) {
        if (rightKey !== undefined) {
          if (opts.rightInclusive) {
            if (this.keys[i] > rightKey) { break }
          } else {
            if (this.keys[i] >= rightKey) { break }
          }
        }

        if (this.values[i].isIndex) {
          results = results.concat(this.values[i].getAll())
        } else {
          results = results.concat(this.values[i])
        }

        if (opts.limit) {
          if (results.length >= (opts.limit + opts.offset)) {
            break
          }
        }
      }
    } else {
      for (let i = pos.index; i < this.keys.length; i += 1) {
        let currKey = this.keys[i]
        if (currKey > rightKey) { break }

        if (this.values[i].isIndex) {
          if (currKey === leftKey) {
            results = results.concat(this.values[i]._between(copy(leftKeys), rightKeys.map(function () { return undefined }), opts))
          } else if (currKey === rightKey) {
            results = results.concat(this.values[i]._between(leftKeys.map(function () { return undefined }), copy(rightKeys), opts))
          } else {
            results = results.concat(this.values[i].getAll())
          }
        } else {
          results = results.concat(this.values[i])
        }

        if (opts.limit) {
          if (results.length >= (opts.limit + opts.offset)) {
            break
          }
        }
      }
    }

    if (opts.limit) {
      return results.slice(0, opts.limit + opts.offset)
    } else {
      return results
    }
  }

  remove (keyList, value) {
    if (!isArray(keyList)) {
      keyList = [keyList]
    }

    let key = keyList.shift()
    let pos = binarySearch(this.keys, key)

    if (keyList.length === 0) {
      if (pos.found) {
        let dataLocation = binarySearch(this.values[pos.index], value, this.idAttribute)
        if (dataLocation.found) {
          removeAt(this.values[pos.index], dataLocation.index)
          if (this.values[pos.index].length === 0) {
            removeAt(this.keys, pos.index)
            removeAt(this.values, pos.index)
          }
        }
      }
    } else {
      if (pos.found) {
        this.values[pos.index].delete(keyList, value)
      }
    }
  }

  clear () {
    this.keys = []
    this.values = []
  }

  insertRecord (data) {
    let keyList = this.fieldList.map(function (field) {
      return data[field] || null
    })

    this.set(keyList, data)
  }

  removeRecord (data) {
    let keyList = this.fieldList.map(function (field) {
      return data[field] || null
    })

    this.remove(keyList, data)
  }

  updateRecord (data) {
    this.removeRecord(data)
    this.insertRecord(data)
  }
}
