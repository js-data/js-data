import utils from './utils'
import './decorators'
import Collection from './Collection'

const DOMAIN = 'LinkedCollection'

/**
 * Extends {@link Collection}. Used by a {@link DataStore} to implement an
 * Identity Map.
 *
 * @example
 * import {LinkedCollection} from 'js-data';
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomLinkedCollectionClass extends LinkedCollection {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customLinkedCollection = new CustomLinkedCollectionClass();
 * console.log(customLinkedCollection.foo());
 * console.log(CustomLinkedCollectionClass.beep());
 *
 * @class LinkedCollection
 * @extends Collection
 * @param {array} [records] Initial set of records to insert into the
 * collection. See {@link Collection}.
 * @param {object} [opts] Configuration options. See {@link Collection}.
 * @returns {Mapper}
 */
export default class LinkedCollection extends Collection {
  datastore: any;

  constructor (records, opts) {
    super(records, opts)

    // Make sure this collection has a reference to a datastore
    if (!this.datastore) {
      throw utils.err(`new ${DOMAIN}`, 'opts.datastore')(400, 'DataStore', this.datastore)
    }
  }

  _addMeta (record, timestamp) {
    // Track when this record was added
    this._added[this.recordId(record)] = timestamp

    if (utils.isFunction(record._set)) {
      record._set('$', timestamp)
    }
  }

  _clearMeta (record) {
    delete this._added[this.recordId(record)]
    if (utils.isFunction(record._set)) {
      record._set('$') // unset
    }
  }

  _onRecordEvent (...args) {
    Collection.prototype._onRecordEvent.apply(this, args)
    const event = args[0]
    // This is a very brute force method
    // Lots of room for optimization
    if (utils.isString(event) && event.indexOf('change') === 0) {
      this.updateIndexes(args[1])
    }
  }

  add (records, opts) {
    const mapper = this.mapper
    const timestamp = new Date().getTime()
    const singular = utils.isObject(records) && !utils.isArray(records)

    if (singular) {
      records = [records]
    }
    records = super.add(records, opts)

    if (mapper.relationList.length && records.length) {
      // Check the currently visited record for relations that need to be
      // inserted into their respective collections.
      mapper.relationList.forEach(def => {
        def.addLinkedRecords(records)
      })
    }

    records.forEach(record => this._addMeta(record, timestamp))

    return singular ? records[0] : records
  }

  remove (idOrRecord, opts) {
    const mapper = this.mapper
    const record = super.remove(idOrRecord, opts)
    if (record) {
      this._clearMeta(record)
    }

    if (mapper.relationList.length && record) {
      mapper.relationList.forEach(def => {
        def.removeLinkedRecords(mapper, [record])
      })
    }

    return record
  }

  removeAll (query, opts) {
    const mapper = this.mapper
    const records = super.removeAll(query, opts)
    records.forEach(this._clearMeta, this)

    if (mapper.relationList.length && records.length) {
      mapper.relationList.forEach(def => {
        def.removeLinkedRecords(mapper, records)
      })
    }

    return records
  }
}

/**
 * Create a subclass of this LinkedCollection:
 *
 * // Extend the class using alternate method.
 * const OtherLinkedCollectionClass = LinkedCollection.extend({
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const otherLinkedCollection = new OtherLinkedCollectionClass();
 * console.log(otherLinkedCollection.foo());
 * console.log(OtherLinkedCollectionClass.beep());
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherLinkedCollectionClass () {
 *   LinkedCollection.call(this);
 *   this.created_at = new Date().getTime();
 * }
 * LinkedCollection.extend({
 *   constructor: AnotherLinkedCollectionClass,
 *   foo () { return 'bar'; }
 * }, {
 *   beep () { return 'boop'; }
 * });
 * const anotherLinkedCollection = new AnotherLinkedCollectionClass();
 * console.log(anotherLinkedCollection.created_at);
 * console.log(anotherLinkedCollection.foo());
 * console.log(AnotherLinkedCollectionClass.beep());
 *
 * @method LinkedCollection.extend
 * @param {object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this LinkedCollection class.
 * @since 3.0.0
 */
