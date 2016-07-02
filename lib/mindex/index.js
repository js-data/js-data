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
// Copyright 2015-2016 Jason Dobry
//
// Summary of modifications:
// Reworked dependencies so as to re-use code already in js-data
// Removed unused code
import utils from '../../src/utils'
import {binarySearch, insertAt, removeAt} from './_utils'

export default function Index (fieldList, opts) {
  utils.classCallCheck(this, Index)
  fieldList || (fieldList = [])

  if (!utils.isArray(fieldList)) {
    throw new Error('fieldList must be an array.')
  }

  opts || (opts = {})
  this.fieldList = fieldList
  this.fieldGetter = opts.fieldGetter
  this.hashCode = opts.hashCode
  this.isIndex = true
  this.keys = []
  this.values = []
}

utils.addHiddenPropsToTarget(Index.prototype, {
  'set' (keyList, value) {
    if (!utils.isArray(keyList)) {
      keyList = [keyList]
    }

    let key = keyList.shift() || undefined
    let pos = binarySearch(this.keys, key)

    if (keyList.length === 0) {
      if (pos.found) {
        let dataLocation = binarySearch(this.values[pos.index], value, this.hashCode)
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
        let newIndex = new Index([], { hashCode: this.hashCode })
        newIndex.set(keyList, value)
        insertAt(this.values, pos.index, newIndex)
      }
    }
  },

  'get' (keyList) {
    if (!utils.isArray(keyList)) {
      keyList = [keyList]
    }

    let key = keyList.shift() || undefined
    let pos = binarySearch(this.keys, key)

    if (keyList.length === 0) {
      if (pos.found) {
        if (this.values[pos.index].isIndex) {
          return this.values[pos.index].getAll()
        } else {
          return this.values[pos.index].slice()
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
  },

  getAll (opts) {
    opts || (opts = {})
    let results = []
    const values = this.values
    if (opts.order === 'desc') {
      for (let i = values.length - 1; i >= 0; i--) {
        const value = values[i]
        if (value.isIndex) {
          results = results.concat(value.getAll(opts))
        } else {
          results = results.concat(value)
        }
      }
    } else {
      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        if (value.isIndex) {
          results = results.concat(value.getAll(opts))
        } else {
          results = results.concat(value)
        }
      }
    }
    return results
  },

  visitAll (cb, thisArg) {
    this.values.forEach(function (value) {
      if (value.isIndex) {
        value.visitAll(cb, thisArg)
      } else {
        value.forEach(cb, thisArg)
      }
    })
  },

  between (leftKeys, rightKeys, opts) {
    opts || (opts = {})
    if (!utils.isArray(leftKeys)) {
      leftKeys = [leftKeys]
    }
    if (!utils.isArray(rightKeys)) {
      rightKeys = [rightKeys]
    }
    utils.fillIn(opts, {
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
  },

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
            results = results.concat(this.values[i]._between(utils.copy(leftKeys), rightKeys.map(function () { return undefined }), opts))
          } else if (currKey === rightKey) {
            results = results.concat(this.values[i]._between(leftKeys.map(function () { return undefined }), utils.copy(rightKeys), opts))
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
  },

  peek () {
    if (this.values.length) {
      if (this.values[0].isIndex) {
        return this.values[0].peek()
      } else {
        return this.values[0]
      }
    }
    return []
  },

  clear () {
    this.keys = []
    this.values = []
  },

  insertRecord (data) {
    let keyList = this.fieldList.map(function (field) {
      if (utils.isFunction(field)) {
        return field(data) || undefined
      } else {
        return data[field] || undefined
      }
    })
    this.set(keyList, data)
  },

  removeRecord (data) {
    let removed
    const isUnique = this.hashCode(data) !== undefined
    this.values.forEach((value, i) => {
      if (value.isIndex) {
        if (value.removeRecord(data)) {
          if (value.keys.length === 0) {
            removeAt(this.keys, i)
            removeAt(this.values, i)
          }
          removed = true
          return false
        }
      } else {
        let dataLocation = {}
        if (this.keys[i] === undefined || !isUnique) {
          for (let j = value.length - 1; j >= 0; j--) {
            if (value[j] === data) {
              dataLocation = {
                found: true,
                index: j
              }
              break
            }
          }
        } else if (isUnique) {
          dataLocation = binarySearch(value, data, this.hashCode)
        }
        if (dataLocation.found) {
          removeAt(value, dataLocation.index)
          if (value.length === 0) {
            removeAt(this.keys, i)
            removeAt(this.values, i)
          }
          removed = true
          return false
        }
      }
    })
    return removed ? data : undefined
  },

  updateRecord (data) {
    const removed = this.removeRecord(data)
    if (removed !== undefined) {
      this.insertRecord(data)
    }
  }
})
