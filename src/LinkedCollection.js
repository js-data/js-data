import utils from './utils'
import './decorators'
import Collection from './Collection'

const DOMAIN = 'LinkedCollection'

/**
 * TODO
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

  LinkedCollection.__super__.call(this, records, opts)

  // Make sure this collection has a reference to a datastore
  if (!this.datastore) {
    throw utils.err(`new ${DOMAIN}`, 'opts.datastore')(400, 'DataStore', this.datastore)
  }
  return this
}

export default Collection.extend({
  constructor: LinkedCollection,

  _onRecordEvent (...args) {
    utils.getSuper(this).prototype._onRecordEvent.apply(this, args)
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

    records = utils.getSuper(this).prototype.add.call(this, records, opts)

    if (mapper.relationList.length && records.length) {
      // Check the currently visited record for relations that need to be
      // inserted into their respective collections.
      mapper.relationList.forEach(function (def) {
        def.linkRecords(mapper, records)
      })
    }

    records.forEach((record) => this._addMeta(record, timestamp))

    return singular ? records[0] : records
  },

  remove (id, opts) {
    const mapper = this.mapper
    const record = utils.getSuper(this).prototype.remove.call(this, id, opts)
    if (record) {
      this._clearMeta(record)
    }
    return record
  },

  removeAll (query, opts) {
    const mapper = this.mapper
    const records = utils.getSuper(this).prototype.removeAll.call(this, query, opts)
    records.forEach(this._clearMeta, this)
    return records
  },

  _clearMeta (record) {
    delete this._added[this.recordId(record)]
    if (this.mapper.recordClass) {
      record._set('$') // unset
    }
  },

  _addMeta (record, timestamp) {
    // Track when this record was added
    this._added[this.recordId(record)] = timestamp

    if (this.mapper.recordClass) {
      record._set('$', timestamp)
    }
  }
})

/**
 * Create a subclass of this LinkedCollection.
 *
 * @example <caption>Extend the class in a cross-browser manner.</caption>
 * import {LinkedCollection} from 'js-data'
 * const CustomLinkedCollectionClass = LinkedCollection.extend({
 *   foo () { return 'bar' }
 * })
 * const customLinkedCollection = new CustomLinkedCollectionClass()
 * console.log(customLinkedCollection.foo()) // "bar"
 *
 * @example <caption>Extend the class using ES2015 class syntax.</caption>
 * class CustomLinkedCollectionClass extends LinkedCollection {
 *   foo () { return 'bar' }
 * }
 * const customLinkedCollection = new CustomLinkedCollectionClass()
 * console.log(customLinkedCollection.foo()) // "bar"
 *
 * @method LinkedCollection.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this LinkedCollection class.
 * @since 3.0.0
 */
