import utils from './utils'
import './decorators'
import Collection from './Collection'

const DOMAIN = 'LinkedCollection'

/**
 * Extends {@link Collection}. Used by a {@link DataStore} to implement an
 * Identity Map.
 *
 * ```javascript
 * import {LinkedCollection} from 'js-data'
 * ```
 *
 * @class LinkedCollection
 * @extends Collection
 * @param {Array} [records] Initial set of records to insert into the
 * collection. See {@link Collection}.
 * @param {Object} [opts] Configuration options. See {@link Collection}.
 * @returns {Mapper}
 */
function LinkedCollection (records, opts) {
  utils.classCallCheck(this, LinkedCollection)
  // Make sure this collection has somewhere to store "added" timestamps
  Object.defineProperties(this, {
    _added: {
      value: {}
    },
    datastore: {
      writable: true,
      value: undefined
    }
  })

  Collection.call(this, records, opts)

  // Make sure this collection has a reference to a datastore
  if (!this.datastore) {
    throw utils.err(`new ${DOMAIN}`, 'opts.datastore')(400, 'DataStore', this.datastore)
  }
}

export default Collection.extend({
  constructor: LinkedCollection,

  _addMeta (record, timestamp) {
    // Track when this record was added
    this._added[this.recordId(record)] = timestamp

    if (utils.isFunction(record._set)) {
      record._set('$', timestamp)
    }
  },

  _clearMeta (record) {
    delete this._added[this.recordId(record)]
    if (utils.isFunction(record._set)) {
      record._set('$') // unset
    }
  },

  _onRecordEvent (...args) {
    Collection.prototype._onRecordEvent.apply(this, args)
    const event = args[0]
    // This is a very brute force method
    // Lots of room for optimization
    if (utils.isString(event) && event.indexOf('change') === 0) {
      this.updateIndexes(args[1])
    }
  },

  add (records, opts) {
    const mapper = this.mapper
    const timestamp = new Date().getTime()
    const singular = utils.isObject(records) && !utils.isArray(records)

    if (singular) {
      records = [records]
    }
    records = Collection.prototype.add.call(this, records, opts)

    if (mapper.relationList.length && records.length) {
      // Check the currently visited record for relations that need to be
      // inserted into their respective collections.
      mapper.relationList.forEach(function (def) {
        def.addLinkedRecords(records)
      })
    }

    records.forEach((record) => this._addMeta(record, timestamp))

    return singular ? records[0] : records
  },

  remove (idOrRecord, opts) {
    const mapper = this.mapper
    const record = Collection.prototype.remove.call(this, idOrRecord, opts)
    if (record) {
      this._clearMeta(record)
    }

    if (mapper.relationList.length && record) {
      mapper.relationList.forEach(function (def) {
        def.removeLinkedRecords(mapper, [record])
      })
    }

    return record
  },

  removeAll (query, opts) {
    const mapper = this.mapper
    const records = Collection.prototype.removeAll.call(this, query, opts)
    records.forEach(this._clearMeta, this)

    if (mapper.relationList.length && records.length) {
      mapper.relationList.forEach(function (def) {
        def.removeLinkedRecords(mapper, records)
      })
    }

    return records
  }
})

/**
 * Create a subclass of this LinkedCollection:
 *
 * @example <caption>LinkedCollection.extend</caption>
 * // Normally you would do: import {LinkedCollection} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {LinkedCollection} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomLinkedCollectionClass extends LinkedCollection {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customLinkedCollection = new CustomLinkedCollectionClass()
 * console.log(customLinkedCollection.foo())
 * console.log(CustomLinkedCollectionClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherLinkedCollectionClass = LinkedCollection.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherLinkedCollection = new OtherLinkedCollectionClass()
 * console.log(otherLinkedCollection.foo())
 * console.log(OtherLinkedCollectionClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherLinkedCollectionClass () {
 *   LinkedCollection.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * LinkedCollection.extend({
 *   constructor: AnotherLinkedCollectionClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherLinkedCollection = new AnotherLinkedCollectionClass()
 * console.log(anotherLinkedCollection.created_at)
 * console.log(anotherLinkedCollection.foo())
 * console.log(AnotherLinkedCollectionClass.beep())
 *
 * @method LinkedCollection.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this LinkedCollection class.
 * @since 3.0.0
 */
