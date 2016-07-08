import utils from './utils'
import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import {proxiedMapperMethods, Container} from './Container'
import LinkedCollection from './LinkedCollection'

const DOMAIN = 'DataStore'
const proxiedCollectionMethods = [
  /**
   * Wrapper for {@link LinkedCollection#add}.
   *
   * @example <caption>DataStore#add</caption>
   * // Normally you would do: import {DataStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.10')
   * const {DataStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new DataStore()
   * store.defineMapper('book')
   *
   * // Add one book to the in-memory store:
   * store.add('book', { id: 1, title: 'Respect your Data' })
   * // Add multiple books to the in-memory store:
   * store.add('book', [
   *   { id: 2, title: 'Easy data recipes' },
   *   { id: 3, title: 'Active Record 101' }
   * ])
   *
   * @fires DataStore#add
   * @method DataStore#add
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {(Object|Object[]|Record|Record[])} data See {@link LinkedCollection#add}.
   * @param {Object} [opts] Configuration options. See {@link LinkedCollection#add}.
   * @returns {(Object|Object[]|Record|Record[])} See {@link LinkedCollection#add}.
   * @see LinkedCollection#add
   * @see Collection#add
   * @since 3.0.0
   */
  'add',

  /**
   * Wrapper for {@link LinkedCollection#between}.
   *
   * @example
   * // Get all users ages 18 to 30
   * const users = store.between('user', 18, 30, { index: 'age' })
   *
   * @example
   * // Same as above
   * const users = store.between('user', [18], [30], { index: 'age' })
   *
   * @method DataStore#between
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {Array} leftKeys See {@link LinkedCollection#between}.
   * @param {Array} rightKeys See {@link LinkedCollection#between}.
   * @param {Object} [opts] Configuration options. See {@link LinkedCollection#between}.
   * @returns {Object[]|Record[]} See {@link LinkedCollection#between}.
   * @see LinkedCollection#between
   * @see Collection#between
   * @since 3.0.0
   */
  'between',

  /**
   * Wrapper for {@link LinkedCollection#createIndex}.
   *
   * @example
   * // Index users by age
   * store.createIndex('user', 'age')
   *
   * @example
   * // Index users by status and role
   * store.createIndex('user', 'statusAndRole', ['status', 'role'])
   *
   * @method DataStore#createIndex
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {string} name See {@link LinkedCollection#createIndex}.
   * @param {string[]} [fieldList] See {@link LinkedCollection#createIndex}.
   * @see LinkedCollection#createIndex
   * @see Collection#createIndex
   * @since 3.0.0
   */
  'createIndex',

  /**
   * Wrapper for {@link LinkedCollection#filter}.
   *
   * @example <caption>DataStore#filter</caption>
   * // import {DataStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.10')
   * const {DataStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new DataStore()
   * store.defineMapper('post')
   * store.add('post', [
   *   { id: 1, status: 'draft', created_at_timestamp: new Date().getTime() }
   * ])
   *
   * // Get the draft posts created less than three months ago
   * let posts = store.filter('post', {
   *   where: {
   *     status: {
   *       '==': 'draft'
   *     },
   *     created_at_timestamp: {
   *       '>=': (new Date().getTime() - (1000 \* 60 \* 60 \* 24 \* 30 \* 3)) // 3 months ago
   *     }
   *   }
   * })
   * console.log(posts)
   *
   * // Use a custom filter function
   * posts = store.filter('post', function (post) { return post.id % 2 === 0 })
   *
   * @method DataStore#filter
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {(Object|Function)} [queryOrFn={}] See {@link LinkedCollection#filter}.
   * @param {Object} [thisArg] See {@link LinkedCollection#filter}.
   * @returns {Array} See {@link LinkedCollection#filter}.
   * @see LinkedCollection#filter
   * @see Collection#filter
   * @since 3.0.0
   */
  'filter',

  /**
   * Wrapper for {@link LinkedCollection#get}.
   *
   * @example <caption>DataStore#get</caption>
   * // import {DataStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.10')
   * const {DataStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new DataStore()
   * store.defineMapper('post')
   * store.add('post', [
   *   { id: 1, status: 'draft', created_at_timestamp: new Date().getTime() }
   * ])
   *
   * console.log(store.get('post', 1)) // {...}
   * console.log(store.get('post', 2)) // undefined
   *
   * @method DataStore#get
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link LinkedCollection#get}.
   * @returns {(Object|Record)} See {@link LinkedCollection#get}.
   * @see LinkedCollection#get
   * @see Collection#get
   * @since 3.0.0
   */
  'get',

  /**
   * Wrapper for {@link LinkedCollection#getAll}.
   *
   * @example
   * // Get the posts where "status" is "draft" or "inReview"
   * const posts = store.getAll('post', 'draft', 'inReview', { index: 'status' })
   *
   * @example
   * // Same as above
   * const posts = store.getAll('post', ['draft'], ['inReview'], { index: 'status' })
   *
   * @method DataStore#getAll
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {...Array} [keyList] See {@link LinkedCollection#getAll}.
   * @param {Object} [opts] See {@link LinkedCollection#getAll}.
   * @returns {Array} See {@link LinkedCollection#getAll}.
   * @see LinkedCollection#getAll
   * @see Collection#getAll
   * @since 3.0.0
   */
  'getAll',

  /**
   * Wrapper for {@link LinkedCollection#prune}.
   *
   * @method DataStore#prune
   * @param {Object} [opts] See {@link LinkedCollection#prune}.
   * @returns {Array} See {@link LinkedCollection#prune}.
   * @see LinkedCollection#prune
   * @see Collection#prune
   * @since 3.0.0
   */
  'prune',

  /**
   * Wrapper for {@link LinkedCollection#query}.
   *
   * @example
   * // Grab page 2 of users between ages 18 and 30
   * store.query('user')
   *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
   *   .skip(10) // second page
   *   .limit(10) // page size
   *   .run()
   *
   * @method DataStore#query
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @returns {Query} See {@link LinkedCollection#query}.
   * @see LinkedCollection#query
   * @see Collection#query
   * @since 3.0.0
   */
  'query',

  /**
   * Wrapper for {@link LinkedCollection#toJSON}.
   *
   * @example
   * store.defineMapper('post', {
   *   schema: {
   *     properties: {
   *       id: { type: 'number' },
   *       title: { type: 'string' }
   *     }
   *   }
   * })
   * store.add('post', [
   *   { id: 1, status: 'published', title: 'Respect your Data' },
   *   { id: 2, status: 'draft', title: 'Connecting to a data source' }
   * ])
   * console.log(store.toJSON('post'))
   * const draftsJSON = store.query('post')
   *   .filter({ status: 'draft' })
   *   .mapCall('toJSON')
   *   .run()
   *
   * @method DataStore#toJSON
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {Object} [opts] See {@link LinkedCollection#toJSON}.
   * @returns {Array} See {@link LinkedCollection#toJSON}.
   * @see LinkedCollection#toJSON
   * @see Collection#toJSON
   * @since 3.0.0
   */
  'toJSON',

  /**
   * Wrapper for {@link LinkedCollection#unsaved}.
   *
   * @method DataStore#unsaved
   * @returns {Array} See {@link LinkedCollection#unsaved}.
   * @see LinkedCollection#unsaved
   * @see Collection#unsaved
   * @since 3.0.0
   */
  'unsaved'
]
const ownMethodsForScoping = [
  'addToCache',
  'cachedFind',
  'cachedFindAll',
  'cacheFind',
  'cacheFindAll',
  'hashQuery'
]

const safeSetProp = function (record, field, value) {
  if (record && record._set) {
    record._set(`props.${field}`, value)
  } else {
    utils.set(record, field, value)
  }
}

const safeSetLink = function (record, field, value) {
  if (record && record._set) {
    record._set(`links.${field}`, value)
  } else {
    utils.set(record, field, value)
  }
}

const cachedFn = function (name, hashOrId, opts) {
  const cached = this._completedQueries[name][hashOrId]
  if (utils.isFunction(cached)) {
    return cached(name, hashOrId, opts)
  }
  return cached
}

const DATASTORE_DEFAULTS = {
  /**
   * Whether in-memory relations should be unlinked from records after they are
   * destroyed.
   *
   * @default true
   * @name DataStore#unlinkOnDestroy
   * @since 3.0.0
   * @type {boolean}
   */
  unlinkOnDestroy: true,

  /**
   * Whether to use the pending query if a `find` request for the specified
   * record is currently underway. Can be set to `true`, `false`, or to a
   * function that returns `true` or `false`.
   *
   * @default true
   * @name DataStore#usePendingFind
   * @since 3.0.0
   * @type {boolean|Function}
   */
  usePendingFind: true,

  /**
   * Whether to use the pending query if a `findAll` request for the given query
   * is currently underway. Can be set to `true`, `false`, or to a function that
   * returns `true` or `false`.
   *
   * @default true
   * @name DataStore#usePendingFindAll
   * @since 3.0.0
   * @type {boolean|Function}
   */
  usePendingFindAll: true
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
 *
 * // DataStore#defineMapper returns a direct reference to the newly created
 * // Mapper.
 * const UserMapper = store.defineMapper('user')
 *
 * // DataStore#as returns the store scoped to a particular Mapper.
 * const UserStore = store.as('user')
 *
 * // Call "find" on "UserMapper" (Stateless ORM)
 * UserMapper.find(1).then((user) => {
 *   // retrieved a "user" record via the http adapter, but that's it
 *
 *   // Call "find" on "store" targeting "user" (Stateful DataStore)
 *   return store.find('user', 1) // same as "UserStore.find(1)"
 * }).then((user) => {
 *   // not only was a "user" record retrieved, but it was added to the
 *   // store's "user" collection
 *   const cachedUser = store.getCollection('user').get(1)
 *   console.log(user === cachedUser) // true
 * })
 *
 * @class DataStore
 * @extends Container
 * @param {Object} [opts] Configuration options. See {@link Container}.
 * @param {boolean} [opts.collectionClass={@link LinkedCollection}] See {@link DataStore#collectionClass}.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {boolean} [opts.unlinkOnDestroy=true] See {@link DataStore#unlinkOnDestroy}.
 * @param {boolean|Function} [opts.usePendingFind=true] See {@link DataStore#usePendingFind}.
 * @param {boolean|Function} [opts.usePendingFindAll=true] See {@link DataStore#usePendingFindAll}.
 * @returns {DataStore}
 * @see Container
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#datastore","Components of JSData: DataStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/working-with-the-datastore","Working with the DataStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/jsdata-and-the-browser","Notes on using JSData in the Browser"]
 */
function DataStore (opts) {
  utils.classCallCheck(this, DataStore)

  opts || (opts = {})
  // Fill in any missing options with the defaults
  utils.fillIn(opts, DATASTORE_DEFAULTS)
  Container.call(this, opts)

  this.collectionClass = this.collectionClass || LinkedCollection
  this._collections = {}
  this._pendingQueries = {}
  this._completedQueries = {}
}

const props = {
  constructor: DataStore,

  _callSuper (method, ...args) {
    return this.constructor.__super__.prototype[method].apply(this, args)
  },

  /**
   * Internal method used to handle Mapper responses.
   *
   * @method DataStore#_end
   * @private
   * @param {string} name Name of the {@link LinkedCollection} to which to
   * add the data.
   * @param {Object} result The result from a Mapper.
   * @param {Object} [opts] Configuration options.
   * @returns {(Object|Array)} Result.
   */
  _end (name, result, opts) {
    let data = opts.raw ? result.data : result
    if (data && utils.isFunction(this.addToCache)) {
      data = this.addToCache(name, data, opts)
      if (opts.raw) {
        result.data = data
      } else {
        result = data
      }
    }
    return result
  },

  /**
   * Register a new event listener on this DataStore.
   *
   * Proxy for {@link Container#on}. If an event was emitted by a Mapper or
   * Collection in the DataStore, then the name of the Mapper or Collection will
   * be prepended to the arugments passed to the provided event handler.
   *
   * @example
   * // Listen for all "afterCreate" events in a DataStore
   * store.on('afterCreate', (mapperName, props, opts, result) => {
   *   console.log(mapperName) // "post"
   *   console.log(props.id) // undefined
   *   console.log(result.id) // 1234
   * })
   * store.create('post', { title: 'Modeling your data' }).then((post) => {
   *   console.log(post.id) // 1234
   * })
   *
   * @example
   * // Listen for the "add" event on a collection
   * store.on('add', (mapperName, records) => {
   *   console.log(records) // [...]
   * })
   *
   * @example
   * // Listen for "change" events on a record
   * store.on('change', (mapperName, record, changes) => {
   *   console.log(changes) // { changed: { title: 'Modeling your data' } }
   * })
   * post.title = 'Modeling your data'
   *
   * @method DataStore#on
   * @param {string} event Name of event to subsribe to.
   * @param {Function} listener Listener function to handle the event.
   * @param {*} [ctx] Optional content in which to invoke the listener.
   */

  /**
   * Used to bind to events emitted by collections in this store.
   *
   * @method DataStore#_onCollectionEvent
   * @private
   * @param {string} name Name of the collection that emitted the event.
   * @param {...*} [args] Args passed to {@link Collection#emit}.
   */
  _onCollectionEvent (name, ...args) {
    const type = args.shift()
    this.emit(type, name, ...args)
  },

  /**
   * This method takes the data received from {@link DataStore#find},
   * {@link DataStore#findAll}, {@link DataStore#update}, etc., and adds the
   * data to the store. _You don't need to call this method directly._
   *
   * If you're using the http adapter and your response data is in an unexpected
   * format, you may need to override this method so the right data gets added
   * to the store.
   *
   * @example
   * const store = new DataStore({
   *   addToCache (mapperName, data, opts) {
   *     // Let's say for a particular Resource, response data is in a weird format
   *     if (name === 'comment') {
   *       // Re-assign the variable to add the correct records into the stores
   *       data = data.items
   *     }
   *     // Now perform default behavior
   *     return DataStore.prototype.addToCache.call(this, mapperName, data, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends DataStore {
   *   addToCache (mapperName, data, opts) {
   *     // Let's say for a particular Resource, response data is in a weird format
   *     if (name === 'comment') {
   *       // Re-assign the variable to add the correct records into the stores
   *       data = data.items
   *     }
   *     // Now perform default behavior
   *     return super.addToCache(mapperName, data, opts)
   *   }
   * }
   * const store = new MyStore()
   *
   * @method DataStore#addToCache
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {*} data Data from which data should be selected for add.
   * @param {Object} [opts] Configuration options.
   */
  addToCache (name, data, opts) {
    return this.getCollection(name).add(data, opts)
  },

  /**
   * Return the store scoped to a particular mapper/collection pair.
   *
   * @example <caption>DataStore.as</caption>
   * // Normally you would do: import {DataStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.10')
   * const {DataStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new DataStore()
   * const UserMapper = store.defineMapper('user')
   * const UserStore = store.as('user')
   *
   * const user1 = store.createRecord('user', { name: 'John' })
   * const user2 = UserStore.createRecord({ name: 'John' })
   * const user3 = UserMapper.createRecord({ name: 'John' })
   * console.log(user1 === user2)
   * console.log(user2 === user3)
   * console.log(user1 === user3)
   *
   * @method DataStore#as
   * @param {string} name Name of the {@link Mapper}.
   * @returns {Object} The store, scoped to a particular Mapper/Collection pair.
   * @since 3.0.0
   */
  as (name) {
    const props = {}
    const original = this
    const methods = ownMethodsForScoping
      .concat(proxiedMapperMethods)
      .concat(proxiedCollectionMethods)

    methods.forEach(function (method) {
      props[method] = {
        writable: true,
        value (...args) {
          return original[method](name, ...args)
        }
      }
    })
    props.getMapper = {
      writable: true,
      value () {
        return original.getMapper(name)
      }
    }
    props.getCollection = {
      writable: true,
      value () {
        return original.getCollection(name)
      }
    }
    return Object.create(this, props)
  },

  /**
   * Retrieve a cached `find` result, if any. This method is called during
   * {@link DataStore#find} to determine if {@link Mapper#find} needs to be
   * called. If this method returns `undefined` then {@link Mapper#find} will
   * be called. Otherwise {@link DataStore#find} will immediately resolve with
   * the return value of this method.
   *
   * When using {@link DataStore} in the browser, you can override this method
   * to implement your own cache-busting strategy.
   *
   * @example
   * const store = new DataStore({
   *   cachedFind (mapperName, id, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return undefined to trigger a Mapper#find call
   *       return
   *     }
   *     // Otherwise perform default behavior
   *     return DataStore.prototype.cachedFind.call(this, mapperName, id, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends DataStore {
   *   cachedFind (mapperName, id, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return undefined to trigger a Mapper#find call
   *       return
   *     }
   *     // Otherwise perform default behavior
   *     return super.cachedFind(mapperName, id, opts)
   *   }
   * }
   * const store = new MyStore()
   *
   * @method DataStore#cachedFind
   * @param {string} name The `name` argument passed to {@link DataStore#find}.
   * @param {(string|number)} id The `id` argument passed to {@link DataStore#find}.
   * @param {Object} opts The `opts` argument passed to {@link DataStore#find}.
   * @since 3.0.0
   */
  cachedFind: cachedFn,

  /**
   * Retrieve a cached `findAll` result, if any. This method is called during
   * {@link DataStore#findAll} to determine if {@link Mapper#findAll} needs to be
   * called. If this method returns `undefined` then {@link Mapper#findAll} will
   * be called. Otherwise {@link DataStore#findAll} will immediately resolve with
   * the return value of this method.
   *
   * When using {@link DataStore} in the browser, you can override this method
   * to implement your own cache-busting strategy.
   *
   * @example
   * const store = new DataStore({
   *   cachedFindAll (mapperName, hash, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return undefined to trigger a Mapper#findAll call
   *       return undefined
   *     }
   *     // Otherwise perform default behavior
   *     return DataStore.prototype.cachedFindAll.call(this, mapperName, hash, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends DataStore {
   *   cachedFindAll (mapperName, hash, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return undefined to trigger a Mapper#findAll call
   *       return undefined
   *     }
   *     // Otherwise perform default behavior
   *     return super.cachedFindAll(mapperName, hash, opts)
   *   }
   * }
   * const store = new MyStore()
   *
   * @method DataStore#cachedFindAll
   * @param {string} name The `name` argument passed to {@link DataStore#findAll}.
   * @param {string} hash The result of calling {@link DataStore#hashQuery} on
   * the `query` argument passed to {@link DataStore#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link DataStore#findAll}.
   * @since 3.0.0
   */
  cachedFindAll: cachedFn,

  /**
   * Mark a {@link Mapper#find} result as cached by adding an entry to
   * {@link DataStore#_completedQueries}. By default, once a `find` entry is
   * added it means subsequent calls to the same Resource with the same `id`
   * argument will immediately resolve with the result of calling
   * {@link DataStore#get} instead of delegating to {@link Mapper#find}.
   *
   * As part of implementing your own caching strategy, you may choose to
   * override this method.
   *
   * @example
   * const store = new DataStore({
   *   cacheFind (mapperName, data, id, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to DataStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior
   *     return DataStore.prototype.cacheFind.call(this, mapperName, data, id, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends DataStore {
   *   cacheFind (mapperName, data, id, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to DataStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior
   *     return super.cacheFind(mapperName, data, id, opts)
   *   }
   * }
   * const store = new MyStore()
   *
   * @method DataStore#cacheFind
   * @param {string} name The `name` argument passed to {@link DataStore#find}.
   * @param {*} data The result to cache.
   * @param {(string|number)} id The `id` argument passed to {@link DataStore#find}.
   * @param {Object} opts The `opts` argument passed to {@link DataStore#find}.
   * @since 3.0.0
   */
  cacheFind (name, data, id, opts) {
    this._completedQueries[name][id] = (name, id, opts) => this.get(name, id)
  },

  /**
   * Mark a {@link Mapper#findAll} result as cached by adding an entry to
   * {@link DataStore#_completedQueries}. By default, once a `findAll` entry is
   * added it means subsequent calls to the same Resource with the same `query`
   * argument will immediately resolve with the result of calling
   * {@link DataStore#filter} instead of delegating to {@link Mapper#findAll}.
   *
   * As part of implementing your own caching strategy, you may choose to
   * override this method.
   *
   * @example
   * const store = new DataStore({
   *   cachedFindAll (mapperName, data, hash, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to DataStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior.
   *     return DataStore.prototype.cachedFindAll.call(this, mapperName, data, hash, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends DataStore {
   *   cachedFindAll (mapperName, data, hash, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to DataStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior.
   *     return super.cachedFindAll(mapperName, data, hash, opts)
   *   }
   * }
   * const store = new MyStore()
   *
   * @method DataStore#cacheFindAll
   * @param {string} name The `name` argument passed to {@link DataStore#findAll}.
   * @param {*} data The result to cache.
   * @param {string} hash The result of calling {@link DataStore#hashQuery} on
   * the `query` argument passed to {@link DataStore#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link DataStore#findAll}.
   * @since 3.0.0
   */
  cacheFindAll (name, data, hash, opts) {
    this._completedQueries[name][hash] = (name, hash, opts) => this.filter(name, utils.fromJson(hash))
  },

  /**
   * Remove __all__ records from the in-memory store and reset
   * {@link DataStore#_completedQueries}.
   *
   * @method DataStore#clear
   * @returns {Object} Object containing all records that were in the store.
   * @see DataStore#remove
   * @see DataStore#removeAll
   * @since 3.0.0
   */
  clear () {
    const removed = {}
    utils.forOwn(this._collections, (collection, name) => {
      removed[name] = collection.removeAll()
      this._completedQueries[name] = {}
    })
    return removed
  },

  /**
   * Fired during {@link DataStore#create}. See
   * {@link DataStore~beforeCreateListener} for how to listen for this event.
   *
   * @event DataStore#beforeCreate
   * @see DataStore~beforeCreateListener
   * @see DataStore#create
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeCreate} event.
   *
   * @example
   * function onBeforeCreate (mapperName, props, opts) {
   *   // do something
   * }
   * store.on('beforeCreate', onBeforeCreate)
   *
   * @callback DataStore~beforeCreateListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeCreate}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeCreate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeCreate}.
   * @see DataStore#event:beforeCreate
   * @see DataStore#create
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#create}. See
   * {@link DataStore~afterCreateListener} for how to listen for this event.
   *
   * @event DataStore#afterCreate
   * @see DataStore~afterCreateListener
   * @see DataStore#create
   */
  /**
   * Callback signature for the {@link DataStore#event:afterCreate} event.
   *
   * @example
   * function onAfterCreate (mapperName, props, opts, result) {
   *   // do something
   * }
   * store.on('afterCreate', onAfterCreate)
   *
   * @callback DataStore~afterCreateListener
   * @param {string} name The `name` argument received by {@link Mapper#afterCreate}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterCreate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterCreate}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterCreate}.
   * @see DataStore#event:afterCreate
   * @see DataStore#create
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#create}. Adds the created record to the store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('book')
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   POST /book {"author_id":1234,...}
   * store.create('book', {
   *   author_id: 1234,
   *   edition: 'First Edition',
   *   title: 'Respect your Data'
   * }).then((book) => {
   *   console.log(book.id) // 120392
   *   console.log(book.title) // "Respect your Data"
   * })
   *
   * @fires DataStore#beforeCreate
   * @fires DataStore#afterCreate
   * @fires DataStore#add
   * @method DataStore#create
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} record Passed to {@link Mapper#create}.
   * @param {Object} [opts] Passed to {@link Mapper#create}. See
   * {@link Mapper#create} for more configuration options.
   * @returns {Promise} Resolves with the result of the create.
   * @since 3.0.0
   */
  create (name, record, opts) {
    opts || (opts = {})
    return this._callSuper('create', name, record, opts)
      .then((result) => this._end(name, result, opts))
  },

  /**
   * Fired during {@link DataStore#createMany}. See
   * {@link DataStore~beforeCreateManyListener} for how to listen for this event.
   *
   * @event DataStore#beforeCreateMany
   * @see DataStore~beforeCreateManyListener
   * @see DataStore#createMany
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeCreateMany} event.
   *
   * @example
   * function onBeforeCreateMany (mapperName, records, opts) {
   *   // do something
   * }
   * store.on('beforeCreateMany', onBeforeCreateMany)
   *
   * @callback DataStore~beforeCreateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeCreateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#beforeCreateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeCreateMany}.
   * @see DataStore#event:beforeCreateMany
   * @see DataStore#createMany
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#createMany}. See
   * {@link DataStore~afterCreateManyListener} for how to listen for this event.
   *
   * @event DataStore#afterCreateMany
   * @see DataStore~afterCreateManyListener
   * @see DataStore#createMany
   */
  /**
   * Callback signature for the {@link DataStore#event:afterCreateMany} event.
   *
   * @example
   * function onAfterCreateMany (mapperName, records, opts, result) {
   *   // do something
   * }
   * store.on('afterCreateMany', onAfterCreateMany)
   *
   * @callback DataStore~afterCreateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterCreateMany}.
   * @see DataStore#event:afterCreateMany
   * @see DataStore#createMany
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#createMany}. Adds the created records to the
   * store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('book')
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   POST /book [{"author_id":1234,...},{...}]
   * store.createMany('book', [{
   *   author_id: 1234,
   *   edition: 'First Edition',
   *   title: 'Respect your Data'
   * }, {
   *   author_id: 1234,
   *   edition: 'Second Edition',
   *   title: 'Respect your Data'
   * }]).then((books) => {
   *   console.log(books[0].id) // 142394
   *   console.log(books[0].title) // "Respect your Data"
   * })
   *
   * @fires DataStore#beforeCreateMany
   * @fires DataStore#afterCreateMany
   * @fires DataStore#add
   * @method DataStore#createMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Array} records Passed to {@link Mapper#createMany}.
   * @param {Object} [opts] Passed to {@link Mapper#createMany}. See
   * {@link Mapper#createMany} for more configuration options.
   * @returns {Promise} Resolves with the result of the create.
   * @since 3.0.0
   */
  createMany (name, records, opts) {
    opts || (opts = {})
    return this._callSuper('createMany', name, records, opts)
      .then((result) => this._end(name, result, opts))
  },

  defineMapper (name, opts) {
    // Complexity of this method is beyond simply using => functions to bind context
    const self = this
    const mapper = Container.prototype.defineMapper.call(self, name, opts)
    self._pendingQueries[name] = {}
    self._completedQueries[name] = {}
    mapper.relationList || Object.defineProperty(mapper, 'relationList', { value: [] })

    // The datastore uses a subclass of Collection that is "datastore-aware"
    const collection = self._collections[name] = new self.collectionClass(null, { // eslint-disable-line
      // Make sure the collection has somewhere to store "added" timestamps
      _added: {},
      // Give the collection a reference to this datastore
      datastore: self,
      // The mapper tied to the collection
      mapper
    })

    const schema = mapper.schema || {}
    const properties = schema.properties || {}
    // TODO: Make it possible index nested properties?
    utils.forOwn(properties, function (opts, prop) {
      if (opts.indexed) {
        collection.createIndex(prop)
      }
    })

    // Create a secondary index on the "added" timestamps of records in the
    // collection
    collection.createIndex('addedTimestamps', ['$'], {
      fieldGetter (obj) {
        return collection._added[collection.recordId(obj)]
      }
    })

    collection.on('all', function (...args) {
      self._onCollectionEvent(name, ...args)
    })

    const idAttribute = mapper.idAttribute

    mapper.relationList.forEach(function (def) {
      const relation = def.relation
      const localField = def.localField
      const path = `links.${localField}`
      const foreignKey = def.foreignKey
      const type = def.type
      const updateOpts = { index: foreignKey }
      let descriptor

      const getter = function () { return this._get(path) }

      if (type === belongsToType) {
        if (!collection.indexes[foreignKey]) {
          collection.createIndex(foreignKey)
        }

        descriptor = {
          get: getter,
          // e.g. profile.user = someUser
          // or comment.post = somePost
          set (record) {
            // e.g. const otherUser = profile.user
            const currentParent = this._get(path)
            // e.g. profile.user === someUser
            if (record === currentParent) {
              return currentParent
            }
            const id = utils.get(this, idAttribute)
            const inverseDef = def.getInverse(mapper)

            // e.g. profile.user !== someUser
            // or comment.post !== somePost
            if (currentParent) {
              // e.g. otherUser.profile = undefined
              if (inverseDef.type === hasOneType) {
                safeSetLink(currentParent, inverseDef.localField, undefined)
              } else if (inverseDef.type === hasManyType) {
                // e.g. remove comment from otherPost.comments
                const children = utils.get(currentParent, inverseDef.localField)
                if (id === undefined) {
                  utils.remove(children, (child) => child === this)
                } else {
                  utils.remove(children, (child) => child === this || id === utils.get(child, idAttribute))
                }
              }
            }
            if (record) {
              // e.g. profile.user = someUser
              const relatedIdAttribute = def.getRelation().idAttribute
              const relatedId = utils.get(record, relatedIdAttribute)

              // Prefer store record
              if (relatedId !== undefined && this._get('$')) {
                record = self.get(relation, relatedId) || record
              }

              // Set locals
              // e.g. profile.user = someUser
              // or comment.post = somePost
              safeSetLink(this, localField, record)
              safeSetProp(this, foreignKey, relatedId)
              collection.updateIndex(this, updateOpts)

              // Update (set) inverse relation
              if (inverseDef.type === hasOneType) {
                // e.g. someUser.profile = profile
                safeSetLink(record, inverseDef.localField, this)
              } else if (inverseDef.type === hasManyType) {
                // e.g. add comment to somePost.comments
                const children = utils.get(record, inverseDef.localField)
                if (id === undefined) {
                  utils.noDupeAdd(children, this, (child) => child === this)
                } else {
                  utils.noDupeAdd(children, this, (child) => child === this || id === utils.get(child, idAttribute))
                }
              }
            } else {
              // Unset in-memory link only
              // e.g. profile.user = undefined
              // or comment.post = undefined
              safeSetLink(this, localField, undefined)
            }
            return record
          }
        }

        let foreignKeyDescriptor = Object.getOwnPropertyDescriptor(mapper.recordClass.prototype, foreignKey)
        if (!foreignKeyDescriptor) {
          foreignKeyDescriptor = {
            enumerable: true
          }
        }
        const originalGet = foreignKeyDescriptor.get
        foreignKeyDescriptor.get = function () {
          if (originalGet) {
            return originalGet.call(this)
          }
          return this._get(`props.${foreignKey}`)
        }
        const originalSet = foreignKeyDescriptor.set
        foreignKeyDescriptor.set = function (value) {
          if (originalSet) {
            originalSet.call(this, value)
          }
          const currentParent = utils.get(this, localField)
          const id = utils.get(this, idAttribute)
          const inverseDef = def.getInverse(mapper)
          const currentParentId = currentParent ? utils.get(currentParent, def.getRelation().idAttribute) : undefined

          if (currentParent && currentParentId !== undefined && currentParentId !== value) {
            if (inverseDef.type === hasOneType) {
              safeSetLink(currentParent, inverseDef.localField, undefined)
            } else if (inverseDef.type === hasManyType) {
              const children = utils.get(currentParent, inverseDef.localField)
              if (id === undefined) {
                utils.remove(children, (child) => child === this)
              } else {
                utils.remove(children, (child) => child === this || id === utils.get(child, idAttribute))
              }
            }
          }

          safeSetProp(this, foreignKey, value)
          collection.updateIndex(this, updateOpts)

          if ((value === undefined || value === null)) {
            if (currentParentId !== undefined) {
              // Unset locals
              utils.set(this, localField, undefined)
            }
          } else if (this._get('$')) {
            const storeRecord = self.get(relation, value)
            if (storeRecord) {
              utils.set(this, localField, storeRecord)
            }
          }
        }
        Object.defineProperty(mapper.recordClass.prototype, foreignKey, foreignKeyDescriptor)
      } else if (type === hasManyType) {
        const localKeys = def.localKeys
        const foreignKeys = def.foreignKeys

        // TODO: Handle case when belongsTo relation isn't ever defined
        if (self._collections[relation] && foreignKey && !self.getCollection(relation).indexes[foreignKey]) {
          self.getCollection(relation).createIndex(foreignKey)
        }

        descriptor = {
          get () {
            let current = getter.call(this)
            if (!current) {
              this._set(path, [])
            }
            return getter.call(this)
          },
          // e.g. post.comments = someComments
          // or user.groups = someGroups
          // or group.users = someUsers
          set (records) {
            if (records && !utils.isArray(records)) {
              records = [records]
            }
            const id = utils.get(this, idAttribute)
            const relatedIdAttribute = def.getRelation().idAttribute
            const inverseDef = def.getInverse(mapper)
            const inverseLocalField = inverseDef.localField
            const current = this._get(path) || []
            const toLink = []
            const toLinkIds = {}

            if (records) {
              records.forEach((record) => {
                // e.g. comment.id
                const relatedId = utils.get(record, relatedIdAttribute)
                const currentParent = utils.get(record, inverseLocalField)
                if (currentParent && currentParent !== this) {
                  const currentChildrenOfParent = utils.get(currentParent, localField)
                  // e.g. somePost.comments.remove(comment)
                  if (relatedId === undefined) {
                    utils.remove(currentChildrenOfParent, (child) => child === record)
                  } else {
                    utils.remove(currentChildrenOfParent, (child) => child === record || relatedId === utils.get(child, relatedIdAttribute))
                  }
                }
                if (relatedId !== undefined) {
                  if (this._get('$')) {
                    // Prefer store record
                    record = self.get(relation, relatedId) || record
                  }
                  // e.g. toLinkIds[comment.id] = comment
                  toLinkIds[relatedId] = record
                }
                toLink.push(record)
              })
            }

            // e.g. post.comments = someComments
            if (foreignKey) {
              current.forEach((record) => {
                // e.g. comment.id
                const relatedId = utils.get(record, relatedIdAttribute)
                if ((relatedId === undefined && toLink.indexOf(record) === -1) || (relatedId !== undefined && !(relatedId in toLinkIds))) {
                  // Update (unset) inverse relation
                  if (records) {
                    // e.g. comment.post_id = undefined
                    safeSetProp(record, foreignKey, undefined)
                    // e.g. CommentCollection.updateIndex(comment, { index: 'post_id' })
                    self.getCollection(relation).updateIndex(record, updateOpts)
                  }
                  // e.g. comment.post = undefined
                  safeSetLink(record, inverseLocalField, undefined)
                }
              })
              toLink.forEach((record) => {
                // Update (set) inverse relation
                // e.g. comment.post_id = post.id
                safeSetProp(record, foreignKey, id)
                // e.g. CommentCollection.updateIndex(comment, { index: 'post_id' })
                self.getCollection(relation).updateIndex(record, updateOpts)
                // e.g. comment.post = post
                safeSetLink(record, inverseLocalField, this)
              })
            } else if (localKeys) {
              // Update locals
              // e.g. group.users = someUsers
              // Update (set) inverse relation
              const ids = toLink.map((child) => utils.get(child, relatedIdAttribute)).filter((id) => id !== undefined)
              // e.g. group.user_ids = [1,2,3,...]
              utils.set(this, localKeys, ids)
              // Update (unset) inverse relation
              if (inverseDef.foreignKeys) {
                current.forEach((child) => {
                  const relatedId = utils.get(child, relatedIdAttribute)
                  if ((relatedId === undefined && toLink.indexOf(child) === -1) || (relatedId !== undefined && !(relatedId in toLinkIds))) {
                    // Update inverse relation
                    // safeSetLink(child, inverseLocalField, undefined)
                    const parents = utils.get(child, inverseLocalField) || []
                    // e.g. someUser.groups.remove(group)
                    if (id === undefined) {
                      utils.remove(parents, (parent) => parent === this)
                    } else {
                      utils.remove(parents, (parent) => parent === this || id === utils.get(parent, idAttribute))
                    }
                  }
                })
                toLink.forEach((child) => {
                  // Update (set) inverse relation
                  const parents = utils.get(child, inverseLocalField)
                  // e.g. someUser.groups.push(group)
                  if (id === undefined) {
                    utils.noDupeAdd(parents, this, (parent) => parent === this)
                  } else {
                    utils.noDupeAdd(parents, this, (parent) => parent === this || id === utils.get(parent, idAttribute))
                  }
                })
              }
            } else if (foreignKeys) {
              // e.g. user.groups = someGroups
              // Update (unset) inverse relation
              current.forEach((parent) => {
                const ids = utils.get(parent, foreignKeys) || []
                // e.g. someGroup.user_ids.remove(user.id)
                utils.remove(ids, (_key) => id === _key)
                const children = utils.get(parent, inverseLocalField)
                // e.g. someGroup.users.remove(user)
                if (id === undefined) {
                  utils.remove(children, (child) => child === this)
                } else {
                  utils.remove(children, (child) => child === this || id === utils.get(child, idAttribute))
                }
              })
              // Update (set) inverse relation
              toLink.forEach((parent) => {
                const ids = utils.get(parent, foreignKeys) || []
                utils.noDupeAdd(ids, id, (_key) => id === _key)
                const children = utils.get(parent, inverseLocalField)
                if (id === undefined) {
                  utils.noDupeAdd(children, this, (child) => child === this)
                } else {
                  utils.noDupeAdd(children, this, (child) => child === this || id === utils.get(child, idAttribute))
                }
              })
            }

            this._set(path, toLink)
            return toLink
          }
        }
      } else if (type === hasOneType) {
        // TODO: Handle case when belongsTo relation isn't ever defined
        if (self._collections[relation] && foreignKey && !self.getCollection(relation).indexes[foreignKey]) {
          self.getCollection(relation).createIndex(foreignKey)
        }
        descriptor = {
          get: getter,
          // e.g. user.profile = someProfile
          set (record) {
            const current = this._get(path)
            if (record === current) {
              return current
            }
            const inverseLocalField = def.getInverse(mapper).localField
            if (record) {
              // Update (unset) inverse relation
              if (current) {
                safeSetProp(current, foreignKey, undefined)
                self.getCollection(relation).updateIndex(current, updateOpts)
                safeSetLink(current, inverseLocalField, undefined)
              }
              const relatedId = utils.get(record, def.getRelation().idAttribute)
              // Prefer store record
              if (relatedId !== undefined) {
                record = self.get(relation, relatedId) || record
              }

              // Set locals
              safeSetLink(this, localField, record)

              // Update (set) inverse relation
              safeSetProp(record, foreignKey, utils.get(this, idAttribute))
              self.getCollection(relation).updateIndex(record, updateOpts)
              safeSetLink(record, inverseLocalField, this)
            } else {
              // Unset locals
              safeSetLink(this, localField, undefined)
            }
            return record
          }
        }
      }

      if (descriptor) {
        descriptor.enumerable = def.enumerable === undefined ? false : def.enumerable
        if (def.get) {
          let origGet = descriptor.get
          descriptor.get = function () {
            return def.get(def, this, (...args) => origGet.apply(this, args))
          }
        }
        if (def.set) {
          let origSet = descriptor.set
          descriptor.set = function (related) {
            return def.set(def, this, related, (value) => origSet.call(this, value === undefined ? related : value))
          }
        }
        Object.defineProperty(mapper.recordClass.prototype, localField, descriptor)
      }
    })

    return mapper
  },

  /**
   * Fired during {@link DataStore#destroy}. See
   * {@link DataStore~beforeDestroyListener} for how to listen for this event.
   *
   * @event DataStore#beforeDestroy
   * @see DataStore~beforeDestroyListener
   * @see DataStore#destroy
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeDestroy} event.
   *
   * @example
   * function onBeforeDestroy (mapperName, id, opts) {
   *   // do something
   * }
   * store.on('beforeDestroy', onBeforeDestroy)
   *
   * @callback DataStore~beforeDestroyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeDestroy}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeDestroy}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeDestroy}.
   * @see DataStore#event:beforeDestroy
   * @see DataStore#destroy
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#destroy}. See
   * {@link DataStore~afterDestroyListener} for how to listen for this event.
   *
   * @event DataStore#afterDestroy
   * @see DataStore~afterDestroyListener
   * @see DataStore#destroy
   */
  /**
   * Callback signature for the {@link DataStore#event:afterDestroy} event.
   *
   * @example
   * function onAfterDestroy (mapperName, id, opts, result) {
   *   // do something
   * }
   * store.on('afterDestroy', onAfterDestroy)
   *
   * @callback DataStore~afterDestroyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterDestroy}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterDestroy}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterDestroy}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterDestroy}.
   * @see DataStore#event:afterDestroy
   * @see DataStore#destroy
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#destroy}. Removes any destroyed record from the
   * in-memory store. Clears out any {@link DataStore#_completedQueries} entries
   * associated with the provided `id`.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('book')
   *
   * store.add('book', { id: 1234, title: 'Data Management is Hard' })
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   DELETE /book/1234
   * store.destroy('book', 1234).then(() => {
   *   // The book record is no longer in the in-memory store
   *   console.log(store.get('book', 1234)) // undefined
   *
   *   return store.find('book', 1234)
   * }).then((book) {
   *   // The book was deleted from the database too
   *   console.log(book) // undefined
   * })
   *
   * @fires DataStore#beforeDestroy
   * @fires DataStore#afterDestroy
   * @fires DataStore#remove
   * @method DataStore#destroy
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id Passed to {@link Mapper#destroy}.
   * @param {Object} [opts] Passed to {@link Mapper#destroy}. See
   * {@link Mapper#destroy} for more configuration options.
   * @returns {Promise} Resolves when the destroy operation completes.
   * @since 3.0.0
   */
  destroy (name, id, opts) {
    opts || (opts = {})
    return this._callSuper('destroy', name, id, opts).then((result) => {
      const record = this.getCollection(name).remove(id, opts)

      if (record && this.unlinkOnDestroy) {
        const _opts = utils.plainCopy(opts)
        _opts.withAll = true
        utils.forEachRelation(this.getMapper(name), _opts, (def) => {
          utils.set(record, def.localField, undefined)
        })
      }

      if (opts.raw) {
        result.data = record
      } else {
        result = record
      }
      delete this._pendingQueries[name][id]
      delete this._completedQueries[name][id]
      return result
    })
  },

  /**
   * Fired during {@link DataStore#destroyAll}. See
   * {@link DataStore~beforeDestroyAllListener} for how to listen for this event.
   *
   * @event DataStore#beforeDestroyAll
   * @see DataStore~beforeDestroyAllListener
   * @see DataStore#destroyAll
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeDestroyAll} event.
   *
   * @example
   * function onBeforeDestroyAll (mapperName, query, opts) {
   *   // do something
   * }
   * store.on('beforeDestroyAll', onBeforeDestroyAll)
   *
   * @callback DataStore~beforeDestroyAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeDestroyAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeDestroyAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeDestroyAll}.
   * @see DataStore#event:beforeDestroyAll
   * @see DataStore#destroyAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#destroyAll}. See
   * {@link DataStore~afterDestroyAllListener} for how to listen for this event.
   *
   * @event DataStore#afterDestroyAll
   * @see DataStore~afterDestroyAllListener
   * @see DataStore#destroyAll
   */
  /**
   * Callback signature for the {@link DataStore#event:afterDestroyAll} event.
   *
   * @example
   * function onAfterDestroyAll (mapperName, query, opts, result) {
   *   // do something
   * }
   * store.on('afterDestroyAll', onAfterDestroyAll)
   *
   * @callback DataStore~afterDestroyAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterDestroyAll}.
   * @see DataStore#event:afterDestroyAll
   * @see DataStore#destroyAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#destroyAll}. Removes any destroyed records from
   * the in-memory store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('book')
   *
   * store.add('book', { id: 1234, title: 'Data Management is Hard' })
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   DELETE /book/1234
   * store.destroy('book', 1234).then(() => {
   *   // The book record is gone from the in-memory store
   *   console.log(store.get('book', 1234)) // undefined
   *   return store.find('book', 1234)
   * }).then((book) {
   *   // The book was deleted from the database too
   *   console.log(book) // undefined
   * })
   *
   * @fires DataStore#beforeDestroyAll
   * @fires DataStore#afterDestroyAll
   * @fires DataStore#remove
   * @method DataStore#destroyAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] Passed to {@link Mapper#destroyAll}.
   * @param {Object} [opts] Passed to {@link Mapper#destroyAll}. See
   * {@link Mapper#destroyAll} for more configuration options.
   * @returns {Promise} Resolves when the delete completes.
   * @since 3.0.0
   */
  destroyAll (name, query, opts) {
    opts || (opts = {})
    return this._callSuper('destroyAll', name, query, opts).then((result) => {
      const records = this.getCollection(name).removeAll(query, opts)

      if (records && records.length && this.unlinkOnDestroy) {
        const _opts = utils.plainCopy(opts)
        _opts.withAll = true
        utils.forEachRelation(this.getMapper(name), _opts, (def) => {
          records.forEach((record) => {
            utils.set(record, def.localField, undefined)
          })
        })
      }

      if (opts.raw) {
        result.data = records
      } else {
        result = records
      }
      const hash = this.hashQuery(name, query, opts)
      delete this._pendingQueries[name][hash]
      delete this._completedQueries[name][hash]
      return result
    })
  },

  eject (name, id, opts) {
    console.warn('DEPRECATED: "eject" is deprecated, use "remove" instead')
    return this.remove(name, id, opts)
  },

  ejectAll (name, query, opts) {
    console.warn('DEPRECATED: "ejectAll" is deprecated, use "removeAll" instead')
    return this.removeAll(name, query, opts)
  },

  /**
   * Fired during {@link DataStore#find}. See
   * {@link DataStore~beforeFindListener} for how to listen for this event.
   *
   * @event DataStore#beforeFind
   * @see DataStore~beforeFindListener
   * @see DataStore#find
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeFind} event.
   *
   * @example
   * function onBeforeFind (mapperName, id, opts) {
   *   // do something
   * }
   * store.on('beforeFind', onBeforeFind)
   *
   * @callback DataStore~beforeFindListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeFind}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeFind}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeFind}.
   * @see DataStore#event:beforeFind
   * @see DataStore#find
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#find}. See
   * {@link DataStore~afterFindListener} for how to listen for this event.
   *
   * @event DataStore#afterFind
   * @see DataStore~afterFindListener
   * @see DataStore#find
   */
  /**
   * Callback signature for the {@link DataStore#event:afterFind} event.
   *
   * @example
   * function onAfterFind (mapperName, id, opts, result) {
   *   // do something
   * }
   * store.on('afterFind', onAfterFind)
   *
   * @callback DataStore~afterFindListener
   * @param {string} name The `name` argument received by {@link Mapper#afterFind}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterFind}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterFind}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterFind}.
   * @see DataStore#event:afterFind
   * @see DataStore#find
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#find}. Adds any found record to the store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('book')
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   GET /book/1234
   * store.find('book', 1234).then((book) => {
   *   // The book record is now in the in-memory store
   *   console.log(store.get('book', 1234) === book) // true
   * })
   *
   * @fires DataStore#beforeFind
   * @fires DataStore#afterFind
   * @fires DataStore#add
   * @method DataStore#find
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id Passed to {@link Mapper#find}.
   * @param {Object} [opts] Passed to {@link Mapper#find}.
   * @param {boolean|Function} [opts.usePendingFind] See {@link DataStore#usePendingFind}
   * @returns {Promise} Resolves with the result, if any.
   * @since 3.0.0
   */
  find (name, id, opts) {
    opts || (opts = {})
    const mapper = this.getMapper(name)
    const pendingQuery = this._pendingQueries[name][id]
    const usePendingFind = opts.usePendingFind === undefined ? this.usePendingFind : opts.usePendingFind
    utils._(opts, mapper)

    if (pendingQuery && (utils.isFunction(usePendingFind) ? usePendingFind.call(this, name, id, opts) : usePendingFind)) {
      return pendingQuery
    }
    const item = this.cachedFind(name, id, opts)
    let promise

    if (opts.force || !item) {
      promise = this._pendingQueries[name][id] = this._callSuper('find', name, id, opts).then((result) => {
        delete this._pendingQueries[name][id]
        result = this._end(name, result, opts)
        this.cacheFind(name, result, id, opts)
        return result
      }, (err) => {
        delete this._pendingQueries[name][id]
        return utils.reject(err)
      })
    } else {
      promise = utils.resolve(item)
    }
    return promise
  },

  /**
   * Fired during {@link DataStore#findAll}. See
   * {@link DataStore~beforeFindAllListener} for how to listen for this event.
   *
   * @event DataStore#beforeFindAll
   * @see DataStore~beforeFindAllListener
   * @see DataStore#findAll
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeFindAll} event.
   *
   * @example
   * function onBeforeFindAll (mapperName, query, opts) {
   *   // do something
   * }
   * store.on('beforeFindAll', onBeforeFindAll)
   *
   * @callback DataStore~beforeFindAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeFindAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeFindAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeFindAll}.
   * @see DataStore#event:beforeFindAll
   * @see DataStore#findAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#findAll}. See
   * {@link DataStore~afterFindAllListener} for how to listen for this event.
   *
   * @event DataStore#afterFindAll
   * @see DataStore~afterFindAllListener
   * @see DataStore#findAll
   */
  /**
   * Callback signature for the {@link DataStore#event:afterFindAll} event.
   *
   * @example
   * function onAfterFindAll (mapperName, query, opts, result) {
   *   // do something
   * }
   * store.on('afterFindAll', onAfterFindAll)
   *
   * @callback DataStore~afterFindAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterFindAll}.
   * @see DataStore#event:afterFindAll
   * @see DataStore#findAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#findAll}. Adds any found records to the store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('movie')
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   GET /movie?rating=PG
   * store.find('movie', { rating: 'PG' }).then((movies) => {
   *   // The movie records are now in the in-memory store
   *   console.log(store.filter('movie'))
   * })
   *
   * @fires DataStore#beforeFindAll
   * @fires DataStore#afterFindAll
   * @fires DataStore#add
   * @method DataStore#findAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] Passed to {@link Mapper.findAll}.
   * @param {Object} [opts] Passed to {@link Mapper.findAll}.
   * @param {boolean|Function} [opts.usePendingFindAll] See {@link DataStore#usePendingFindAll}
   * @returns {Promise} Resolves with the result, if any.
   * @since 3.0.0
   */
  findAll (name, query, opts) {
    opts || (opts = {})
    const mapper = this.getMapper(name)
    const hash = this.hashQuery(name, query, opts)
    const pendingQuery = this._pendingQueries[name][hash]
    const usePendingFindAll = opts.usePendingFindAll === undefined ? this.usePendingFindAll : opts.usePendingFindAll
    utils._(opts, mapper)

    if (pendingQuery && (utils.isFunction(usePendingFindAll) ? usePendingFindAll.call(this, name, query, opts) : usePendingFindAll)) {
      return pendingQuery
    }

    const items = this.cachedFindAll(name, hash, opts)
    let promise

    if (opts.force || !items) {
      promise = this._pendingQueries[name][hash] = this._callSuper('findAll', name, query, opts).then((result) => {
        delete this._pendingQueries[name][hash]
        result = this._end(name, result, opts)
        this.cacheFindAll(name, result, hash, opts)
        return result
      }, (err) => {
        delete this._pendingQueries[name][hash]
        return utils.reject(err)
      })
    } else {
      promise = utils.resolve(items)
    }
    return promise
  },

  /**
   * Return the {@link LinkedCollection} with the given name, if for some
   * reason you need a direct reference to the collection.
   *
   * @method DataStore#getCollection
   * @param {string} name Name of the {@link LinkedCollection} to retrieve.
   * @returns {LinkedCollection}
   * @since 3.0.0
   * @throws {Error} Thrown if the specified {@link LinkedCollection} does not
   * exist.
   */
  getCollection (name) {
    const collection = this._collections[name]
    if (!collection) {
      throw utils.err(`${DOMAIN}#getCollection`, name)(404, 'collection')
    }
    return collection
  },

  /**
   * Hashing function used to cache {@link DataStore#find} and
   * {@link DataStore#findAll} requests. This method simply JSONifies the
   * `query` argument passed to {@link DataStore#find} or
   * {@link DataStore#findAll}.
   *
   * Override this method for custom hashing behavior.
   * @method DataStore#hashQuery
   * @param {string} name The `name` argument passed to {@link DataStore#find}
   * or {@link DataStore#findAll}.
   * @param {Object} query The `query` argument passed to {@link DataStore#find}
   * or {@link DataStore#findAll}.
   * @returns {string} The JSONified `query`.
   * @since 3.0.0
   */
  hashQuery (name, query, opts) {
    return utils.toJson(query)
  },

  inject (name, records, opts) {
    console.warn('DEPRECATED: "inject" is deprecated, use "add" instead')
    return this.add(name, records, opts)
  },

  /**
   * Wrapper for {@link LinkedCollection#remove}. Removes the specified
   * {@link Record} from the store.
   *
   * @example <caption>DataStore#remove</caption>
   * // Normally you would do: import {DataStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.10')
   * const {DataStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new DataStore()
   * store.defineMapper('book')
   * console.log(store.getAll('book').length)
   * store.add('book', { id: 1234 })
   * console.log(store.getAll('book').length)
   * store.remove('book', 1234)
   * console.log(store.getAll('book').length)
   *
   * @fires DataStore#remove
   * @method DataStore#remove
   * @param {string} name The name of the {@link LinkedCollection} to target.
   * @param {string|number} id The primary key of the {@link Record} to remove.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Relations of the {@link Record} to also
   * remove from the store.
   * @returns {Record} The removed {@link Record}, if any.
   * @see LinkedCollection#add
   * @see Collection#add
   * @since 3.0.0
   */
  remove (name, id, opts) {
    const record = this.getCollection(name).remove(id, opts)
    if (record) {
      this.removeRelated(name, [record], opts)
    }
    return record
  },

  /**
   * Wrapper for {@link LinkedCollection#removeAll}. Removes the selected
   * {@link Record}s from the store.
   *
   * @example <caption>DataStore#removeAll</caption>
   * // Normally you would do: import {DataStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-beta.10')
   * const {DataStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new DataStore()
   * store.defineMapper('movie')
   * console.log(store.getAll('movie').length)
   * store.add('movie', [{ id: 3, rating: 'R' }, { id: 4, rating: 'PG-13' })
   * console.log(store.getAll('movie').length)
   * store.removeAll('movie', { rating: 'R' })
   * console.log(store.getAll('movie').length)
   *
   * @fires DataStore#remove
   * @method DataStore#removeAll
   * @param {string} name The name of the {@link LinkedCollection} to target.
   * @param {Object} [query={}] Selection query. See {@link query}.
   * @param {Object} [query.where] See {@link query.where}.
   * @param {number} [query.offset] See {@link query.offset}.
   * @param {number} [query.limit] See {@link query.limit}.
   * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Relations of the {@link Record} to also
   * remove from the store.
   * @returns {Record} The removed {@link Record}s, if any.
   * @see LinkedCollection#add
   * @see Collection#add
   * @since 3.0.0
   */
  removeAll (name, query, opts) {
    const records = this.getCollection(name).removeAll(query, opts)
    if (records.length) {
      this.removeRelated(name, records, opts)
    }
    return records
  },

  /**
   * Remove from the store {@link Record}s that are related to the provided
   * {@link Record}(s).
   *
   * @fires DataStore#remove
   * @method DataStore#removeRelated
   * @param {string} name The name of the {@link LinkedCollection} to target.
   * @param {Record|Record[]} records {@link Record}s whose relations are to be
   * removed.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Relations of the {@link Record}(s) to remove
   * from the store.
   * @since 3.0.0
   */
  removeRelated (name, records, opts) {
    if (!utils.isArray(records)) {
      records = [records]
    }
    utils.forEachRelation(this.getMapper(name), opts, (def, optsCopy) => {
      records.forEach((record) => {
        let relatedData
        let query
        if (def.foreignKey && (def.type === hasOneType || def.type === hasManyType)) {
          query = { [def.foreignKey]: def.getForeignKey(record) }
        } else if (def.type === hasManyType && def.localKeys) {
          query = {
            where: {
              [def.getRelation().idAttribute]: {
                'in': utils.get(record, def.localKeys)
              }
            }
          }
        } else if (def.type === hasManyType && def.foreignKeys) {
          query = {
            where: {
              [def.foreignKeys]: {
                'contains': def.getForeignKey(record)
              }
            }
          }
        } else if (def.type === belongsToType) {
          relatedData = this.remove(def.relation, def.getForeignKey(record), optsCopy)
        }
        if (query) {
          relatedData = this.removeAll(def.relation, query, optsCopy)
        }
        if (relatedData) {
          if (utils.isArray(relatedData) && !relatedData.length) {
            return
          }
          if (def.type === hasOneType) {
            relatedData = relatedData[0]
          }
          def.setLocalField(record, relatedData)
        }
      })
    })
  },

  /**
   * Fired during {@link DataStore#update}. See
   * {@link DataStore~beforeUpdateListener} for how to listen for this event.
   *
   * @event DataStore#beforeUpdate
   * @see DataStore~beforeUpdateListener
   * @see DataStore#update
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeUpdate} event.
   *
   * @example
   * function onBeforeUpdate (mapperName, id, props, opts) {
   *   // do something
   * }
   * store.on('beforeUpdate', onBeforeUpdate)
   *
   * @callback DataStore~beforeUpdateListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdate}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeUpdate}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeUpdate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdate}.
   * @see DataStore#event:beforeUpdate
   * @see DataStore#update
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#update}. See
   * {@link DataStore~afterUpdateListener} for how to listen for this event.
   *
   * @event DataStore#afterUpdate
   * @see DataStore~afterUpdateListener
   * @see DataStore#update
   */
  /**
   * Callback signature for the {@link DataStore#event:afterUpdate} event.
   *
   * @example
   * function onAfterUpdate (mapperName, id, props, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdate', onAfterUpdate)
   *
   * @callback DataStore~afterUpdateListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdate}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdate}.
   * @see DataStore#event:afterUpdate
   * @see DataStore#update
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#update}. Adds the updated {@link Record} to the
   * store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('post')
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   PUT /post/1234 {"status":"published"}
   * store.update('post', 1, { status: 'published' }).then((post) => {
   *   // The post record has also been updated in the in-memory store
   *   console.log(store.get('post', 1234))
   * })
   *
   * @fires DataStore#beforeUpdate
   * @fires DataStore#afterUpdate
   * @fires DataStore#add
   * @method DataStore#update
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id Passed to {@link Mapper#update}.
   * @param {Object} record Passed to {@link Mapper#update}.
   * @param {Object} [opts] Passed to {@link Mapper#update}. See
   * {@link Mapper#update} for more configuration options.
   * @returns {Promise} Resolves with the result of the update.
   * @since 3.0.0
   */
  update (name, id, record, opts) {
    opts || (opts = {})
    return this._callSuper('update', name, id, record, opts)
      .then((result) => this._end(name, result, opts))
  },

  /**
   * Fired during {@link DataStore#updateAll}. See
   * {@link DataStore~beforeUpdateAllListener} for how to listen for this event.
   *
   * @event DataStore#beforeUpdateAll
   * @see DataStore~beforeUpdateAllListener
   * @see DataStore#updateAll
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeUpdateAll} event.
   *
   * @example
   * function onBeforeUpdateAll (mapperName, props, query, opts) {
   *   // do something
   * }
   * store.on('beforeUpdateAll', onBeforeUpdateAll)
   *
   * @callback DataStore~beforeUpdateAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdateAll}.
   * @see DataStore#event:beforeUpdateAll
   * @see DataStore#updateAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#updateAll}. See
   * {@link DataStore~afterUpdateAllListener} for how to listen for this event.
   *
   * @event DataStore#afterUpdateAll
   * @see DataStore~afterUpdateAllListener
   * @see DataStore#updateAll
   */
  /**
   * Callback signature for the {@link DataStore#event:afterUpdateAll} event.
   *
   * @example
   * function onAfterUpdateAll (mapperName, props, query, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdateAll', onAfterUpdateAll)
   *
   * @callback DataStore~afterUpdateAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdateAll}.
   * @see DataStore#event:afterUpdateAll
   * @see DataStore#updateAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#updateAll}. Adds the updated {@link Record}s to
   * the store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('post')
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   PUT /post?author_id=1234 {"status":"published"}
   * store.updateAll('post', { author_id: 1234 }, { status: 'published' }).then((posts) => {
   *   // The post records have also been updated in the in-memory store
   *   console.log(store.filter('posts', { author_id: 1234 }))
   * })
   *
   * @fires DataStore#beforeUpdateAll
   * @fires DataStore#afterUpdateAll
   * @fires DataStore#add
   * @method DataStore#updateAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} props Passed to {@link Mapper#updateAll}.
   * @param {Object} [query] Passed to {@link Mapper#updateAll}.
   * @param {Object} [opts] Passed to {@link Mapper#updateAll}. See
   * {@link Mapper#updateAll} for more configuration options.
   * @returns {Promise} Resolves with the result of the update.
   * @since 3.0.0
   */
  updateAll (name, props, query, opts) {
    opts || (opts = {})
    return this._callSuper('updateAll', name, query, props, opts)
      .then((result) => this._end(name, result, opts))
  },

  /**
   * Fired during {@link DataStore#updateMany}. See
   * {@link DataStore~beforeUpdateManyListener} for how to listen for this event.
   *
   * @event DataStore#beforeUpdateMany
   * @see DataStore~beforeUpdateManyListener
   * @see DataStore#updateMany
   */
  /**
   * Callback signature for the {@link DataStore#event:beforeUpdateMany} event.
   *
   * @example
   * function onBeforeUpdateMany (mapperName, records, opts) {
   *   // do something
   * }
   * store.on('beforeUpdateMany', onBeforeUpdateMany)
   *
   * @callback DataStore~beforeUpdateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#beforeUpdateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdateMany}.
   * @see DataStore#event:beforeUpdateMany
   * @see DataStore#updateMany
   * @since 3.0.0
   */
  /**
   * Fired during {@link DataStore#updateMany}. See
   * {@link DataStore~afterUpdateManyListener} for how to listen for this event.
   *
   * @event DataStore#afterUpdateMany
   * @see DataStore~afterUpdateManyListener
   * @see DataStore#updateMany
   */
  /**
   * Callback signature for the {@link DataStore#event:afterUpdateMany} event.
   *
   * @example
   * function onAfterUpdateMany (mapperName, records, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdateMany', onAfterUpdateMany)
   *
   * @callback DataStore~afterUpdateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdateMany}.
   * @see DataStore#event:afterUpdateMany
   * @see DataStore#updateMany
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#updateMany}. Adds the updated {@link Record}s to
   * the store.
   *
   * @example
   * import {DataStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new DataStore()
   * store.registerAdapter('http', new HttpAdapter(), { default: true })
   *
   * store.defineMapper('post')
   *
   * // Since this example uses the http adapter, we'll get something like:
   * //
   * //   PUT /post [{"id":3,status":"published"},{"id":4,status":"published"}]
   * store.updateMany('post', [
   *   { id: 3, status: 'published' },
   *   { id: 4, status: 'published' }
   * ]).then((posts) => {
   *   // The post records have also been updated in the in-memory store
   *   console.log(store.getAll('post', 3, 4))
   * })
   *
   * @fires DataStore#beforeUpdateMany
   * @fires DataStore#afterUpdateMany
   * @fires DataStore#add
   * @method DataStore#updateMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records Passed to {@link Mapper#updateMany}.
   * @param {Object} [opts] Passed to {@link Mapper#updateMany}. See
   * {@link Mapper#updateMany} for more configuration options.
   * @returns {Promise} Resolves with the result of the update.
   * @since 3.0.0
   */
  updateMany (name, records, opts) {
    opts || (opts = {})
    return this._callSuper('updateMany', name, records, opts)
      .then((result) => this._end(name, result, opts))
  }
}

proxiedCollectionMethods.forEach(function (method) {
  props[method] = function (name, ...args) {
    return this.getCollection(name)[method](...args)
  }
})

export default Container.extend(props)

/**
 * Fired when a record changes. Only works for records that have tracked fields.
 * See {@link DataStore~changeListener} on how to listen for this event.
 *
 * @event DataStore#change
 * @see DataStore~changeListener
 */

/**
 * Callback signature for the {@link DataStore#event:change} event.
 *
 * @example
 * function onChange (mapperName, record, changes) {
 *   // do something
 * }
 * store.on('change', onChange)
 *
 * @callback DataStore~changeListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record} record The Record that changed.
 * @param {Object} changes The changes.
 * @see DataStore#event:change
 * @since 3.0.0
 */

/**
 * Fired when one or more records are added to the in-memory store. See
 * {@link DataStore~addListener} on how to listen for this event.
 *
 * @event DataStore#add
 * @see DataStore~addListener
 * @see DataStore#event:add
 * @see DataStore#add
 * @see DataStore#create
 * @see DataStore#createMany
 * @see DataStore#find
 * @see DataStore#findAll
 * @see DataStore#update
 * @see DataStore#updateAll
 * @see DataStore#updateMany
 */

/**
 * Callback signature for the {@link DataStore#event:add} event.
 *
 * @example
 * function onAdd (mapperName, recordOrRecords) {
 *   // do something
 * }
 * store.on('add', onAdd)
 *
 * @callback DataStore~addListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record|Record[]} The Record or Records that were added.
 * @see DataStore#event:add
 * @see DataStore#add
 * @see DataStore#create
 * @see DataStore#createMany
 * @see DataStore#find
 * @see DataStore#findAll
 * @see DataStore#update
 * @see DataStore#updateAll
 * @see DataStore#updateMany
 * @since 3.0.0
 */

/**
 * Fired when one or more records are removed from the in-memory store. See
 * {@link DataStore~removeListener} for how to listen for this event.
 *
 * @event DataStore#remove
 * @see DataStore~removeListener
 * @see DataStore#event:remove
 * @see DataStore#clear
 * @see DataStore#destroy
 * @see DataStore#destroyAll
 * @see DataStore#remove
 * @see DataStore#removeAll
 */

/**
 * Callback signature for the {@link DataStore#event:remove} event.
 *
 * @example
 * function onRemove (mapperName, recordsOrRecords) {
 *   // do something
 * }
 * store.on('remove', onRemove)
 *
 * @callback DataStore~removeListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record|Record[]} Record or Records that were removed.
 * @see DataStore#event:remove
 * @see DataStore#clear
 * @see DataStore#destroy
 * @see DataStore#destroyAll
 * @see DataStore#remove
 * @see DataStore#removeAll
 * @since 3.0.0
 */

/**
 * Create a subclass of this DataStore:
 * @example <caption>DataStore.extend</caption>
 * // Normally you would do: import {DataStore} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.10')
 * const {DataStore} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomDataStoreClass extends DataStore {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customDataStore = new CustomDataStoreClass()
 * console.log(customDataStore.foo())
 * console.log(CustomDataStoreClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherDataStoreClass = DataStore.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherDataStore = new OtherDataStoreClass()
 * console.log(otherDataStore.foo())
 * console.log(OtherDataStoreClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherDataStoreClass () {
 *   DataStore.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * DataStore.extend({
 *   constructor: AnotherDataStoreClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherDataStore = new AnotherDataStoreClass()
 * console.log(anotherDataStore.created_at)
 * console.log(anotherDataStore.foo())
 * console.log(AnotherDataStoreClass.beep())
 *
 * @method DataStore.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this DataStore class.
 * @since 3.0.0
 */
