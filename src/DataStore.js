import {
  classCallCheck,
  extend,
  fillIn,
  getSuper,
  isBrowser
} from './utils'
import Container from './Container'
import LinkedCollection from './LinkedCollection'

const DATASTORE_DEFAULTS = {
  linkRelations: isBrowser
}

/**
 * The `DataStore` class is an extension of {@link Container}. Not only does
 * `DataStore` manage mappers, but also collections. `DataStore` implements the
 * asynchronous {@link Mapper} methods, such as {@link Mapper#find} and
 * {@link Mapper#create}. If you use the asynchronous `DataStore` methods
 * instead of calling them directly on the mappers, then the results of the
 * method calls will be inserted into the store's collections. You can think of
 * a `DataStore` as an [Identity Map](https://en.wikipedia.org/wiki/Identity_map_pattern)
 * for the [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)
 * (the Mappers).
 *
 * ```javascript
 * import {DataStore} from 'js-data'
 * ```
 *
 * @example
 * import {DataStore} from 'js-data'
 * import HttpAdapter from 'js-data-http'
 * const store = new DataStore()
 * const UserMapper = store.defineMapper('user')
 *
 * // Call "find" on "UserMapper" (Stateless ORM)
 * UserMapper.find(1).then(function (user) {
 *   // retrieved a "user" record via the http adapter, but that's it
 *
 *   // Call "find" on "store" for the "user" mapper (Stateful DataStore)
 *   return store.find('user', 1)
 * }).then(function (user) {
 *   // not only was a "user" record retrieved, but it was added to the
 *   // store's "user" collection
 *   const cachedUser = store.getCollection('user').get(1)
 *   user === cachedUser // true
 * })
 *
 * @class DataStore
 * @extends Container
 * @param {Object} [opts] Configuration options. See {@link Container}.
 * @return {DataStore}
 */
const DataStore = Container.extend({
  constructor (opts) {
    const self = this
    classCallCheck(self, DataStore)

    getSuper(self).call(self, opts)
    self.CollectionClass = self.CollectionClass || LinkedCollection
    self._collections = {}
    fillIn(self, DATASTORE_DEFAULTS)
    return self
  },

  /**
   * TODO
   *
   * @name DataStore#_end
   * @method
   * @private
   * @param {string} name Name of the {@link LinkedCollection} to which to
   * add the data.
   * @param {Object} data TODO.
   * @param {Object} [opts] Configuration options.
   * @return {(Object|Array)} Result.
   */
  _end (name, data, opts) {
    if (opts.raw) {
      data.data = this.getCollection(name).add(data.data, opts)
      return data
    } else {
      data = this.getCollection(name).add(data, opts)
    }
    return data
  },

  /**
   * TODO
   *
   * @name DataStore#create
   * @method
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} record Passed to {@link Mapper#create}.
   * @param {Object} [opts] Passed to {@link Mapper#create}. See
   * {@link Mapper#create} for more configuration options.
   * @return {Promise}
   */
  create (name, record, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).create(record, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  /**
   * TODO
   *
   * @name DataStore#createMany
   * @method
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Array} records Passed to {@link Mapper#createMany}.
   * @param {Object} [opts] Passed to {@link Mapper#createMany}. See
   * {@link Mapper#createMany} for more configuration options.
   * @return {Promise}
   */
  createMany (name, records, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).createMany(records, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  defineMapper (name, opts) {
    const self = this
    const mapper = getSuper(self).prototype.defineMapper.call(self, name, opts)
    mapper.relationList = mapper.relationList || []

    mapper.relationList.forEach(function (def) {
      // TODO: Conditionally add getters and setters to RecordClass prototype
    })

    // The datastore uses a subclass of Collection that is "datastore-aware"
    const collection = self._collections[name] = new self.CollectionClass(null, {
      // Make sure the collection has somewhere to store "added" timestamps
      _added: {},
      // Give the collection a reference to this datastore
      datastore: self,
      // The mapper tied to the collection
      mapper
    })

    // Create a secondary index on the "added" timestamps of records in the
    // collection
    collection.createIndex('addedTimestamps', ['$'], {
      fieldGetter (obj) {
        return collection._added[collection.recordId(obj)]
      }
    })
    return mapper
  },

  /**
   * TODO
   *
   * @name DataStore#destroy
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {(string|number)} id - Passed to {@link Mapper#destroy}.
   * @param {Object} [opts] - Passed to {@link Mapper#destroy}. See
   * {@link Mapper#destroy} for more configuration options.
   * @return {Promise}
   */
  destroy (name, id, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).destroy(id, opts).then(function (data) {
      if (opts.raw) {
        data.data = self.getCollection(name).remove(id, opts)
      } else {
        data = self.getCollection(name).remove(id, opts)
      }
      return data
    })
  },

  /**
   * TODO
   *
   * @name Mapper#destroyAll
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object} [query] - Passed to {@link Mapper#destroyAll}.
   * @param {Object} [opts] - Passed to {@link Mapper#destroyAll}. See
   * {@link Mapper#destroyAll} for more configuration options.
   * @return {Promise}
   */
  destroyAll (name, query, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).destroyAll(query, opts).then(function (data) {
      if (opts.raw) {
        data.data = self.getCollection(name).removeAll(query, opts)
      } else {
        data = self.getCollection(name).removeAll(query, opts)
      }
      return data
    })
  },

  /**
   * TODO
   *
   * @name DataStore#find
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {(string|number)} id - Passed to {@link Mapper#find}.
   * @param {Object} [opts] - Passed to {@link Mapper#find}.
   * @return {Promise}
   */
  find (name, id, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).find(id, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  /**
   * TODO
   *
   * @name DataStore#findAll
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object} [query] - Passed to {@link Model.findAll}.
   * @param {Object} [opts] - Passed to {@link Model.findAll}.
   * @return {Promise}
   */
  findAll (name, query, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).findAll(query, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  /**
   * TODO
   *
   * @name DataStore#getCollection
   * @method
   * @param {string} name Name of the {@link DataStoreCollection} to retrieve.
   * @return {DataStoreCollection}
   */
  getCollection (name) {
    const collection = this._collections[name]
    if (!collection) {
      throw new ReferenceError(`${name} is not a registered collection!`)
    }
    return collection
  },

  /**
   * TODO
   *
   * @name DataStore#update
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {(string|number)} id - Passed to {@link Mapper#update}.
   * @param {Object} record - Passed to {@link Mapper#update}.
   * @param {Object} [opts] - Passed to {@link Mapper#update}. See
   * {@link Mapper#update} for more configuration options.
   * @return {Promise}
   */
  update (name, id, record, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).update(id, record, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  /**
   * TODO
   *
   * @name DataStore#updateAll
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object?} query - Passed to {@link Model.updateAll}.
   * @param {Object} props - Passed to {@link Model.updateAll}.
   * @param {Object} [opts] - Passed to {@link Model.updateAll}. See
   * {@link Model.updateAll} for more configuration options.
   * @return {Promise}
   */
  updateAll (name, query, props, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).updateAll(query, props, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  /**
   * TODO
   *
   * @name DataStore#updateMany
   * @method
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records Passed to {@link Mapper#updateMany}.
   * @param {Object} [opts] Passed to {@link Mapper#updateMany}. See
   * {@link Mapper#updateMany} for more configuration options.
   * @return {Promise}
   */
  updateMany (name, records, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.getMapper(name).updateMany(records, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  }
})

DataStore.prototype.defineResource = DataStore.prototype.defineMapper

/**
 * Create a DataStore subclass.
 *
 * ```javascript
 * var MyDataStore = DataStore.extend({
 *   foo: function () { return 'bar' }
 * })
 * var store = new MyDataStore()
 * store.foo() // "bar"
 * ```
 *
 * @name DataStore.extend
 * @method
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @return {Function} Subclass of DataStore.
 */
DataStore.extend = extend

export {
  DataStore as default
}
