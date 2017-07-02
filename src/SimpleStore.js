import utils from './utils'

import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import {proxiedMapperMethods, Container} from './Container'
import Collection from './Collection'

const DOMAIN = 'SimpleStore'
const proxiedCollectionMethods = [
  /**
   * Wrapper for {@link Collection#add}.
   *
   * @example <caption>SimpleStore#add</caption>
   * // Normally you would do: import {SimpleStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {SimpleStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#add
   * @method SimpleStore#add
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {(Object|Object[]|Record|Record[])} data See {@link Collection#add}.
   * @param {Object} [opts] Configuration options. See {@link Collection#add}.
   * @returns {(Object|Object[]|Record|Record[])} See {@link Collection#add}.
   * @see Collection#add
   * @see Collection#add
   * @since 3.0.0
   */
  'add',

  /**
   * Wrapper for {@link Collection#between}.
   *
   * @example
   * // Get all users ages 18 to 30
   * const users = store.between('user', 18, 30, { index: 'age' })
   *
   * @example
   * // Same as above
   * const users = store.between('user', [18], [30], { index: 'age' })
   *
   * @method SimpleStore#between
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {Array} leftKeys See {@link Collection#between}.
   * @param {Array} rightKeys See {@link Collection#between}.
   * @param {Object} [opts] Configuration options. See {@link Collection#between}.
   * @returns {Object[]|Record[]} See {@link Collection#between}.
   * @see Collection#between
   * @see Collection#between
   * @since 3.0.0
   */
  'between',

  /**
   * Wrapper for {@link Collection#createIndex}.
   *
   * @example
   * // Index users by age
   * store.createIndex('user', 'age')
   *
   * @example
   * // Index users by status and role
   * store.createIndex('user', 'statusAndRole', ['status', 'role'])
   *
   * @method SimpleStore#createIndex
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {string} name See {@link Collection#createIndex}.
   * @param {string[]} [fieldList] See {@link Collection#createIndex}.
   * @see Collection#createIndex
   * @see Collection#createIndex
   * @since 3.0.0
   */
  'createIndex',

  /**
   * Wrapper for {@link Collection#filter}.
   *
   * @example <caption>SimpleStore#filter</caption>
   * // import {SimpleStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {SimpleStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new SimpleStore()
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
   * @method SimpleStore#filter
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {(Object|Function)} [queryOrFn={}] See {@link Collection#filter}.
   * @param {Object} [thisArg] See {@link Collection#filter}.
   * @returns {Array} See {@link Collection#filter}.
   * @see Collection#filter
   * @see Collection#filter
   * @since 3.0.0
   */
  'filter',

  /**
   * Wrapper for {@link Collection#get}.
   *
   * @example <caption>SimpleStore#get</caption>
   * // import {SimpleStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {SimpleStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new SimpleStore()
   * store.defineMapper('post')
   * store.add('post', [
   *   { id: 1, status: 'draft', created_at_timestamp: new Date().getTime() }
   * ])
   *
   * console.log(store.get('post', 1)) // {...}
   * console.log(store.get('post', 2)) // undefined
   *
   * @method SimpleStore#get
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link Collection#get}.
   * @returns {(Object|Record)} See {@link Collection#get}.
   * @see Collection#get
   * @see Collection#get
   * @since 3.0.0
   */
  'get',

  /**
   * Wrapper for {@link Collection#getAll}.
   *
   * @example
   * // Get the posts where "status" is "draft" or "inReview"
   * const posts = store.getAll('post', 'draft', 'inReview', { index: 'status' })
   *
   * @example
   * // Same as above
   * const posts = store.getAll('post', ['draft'], ['inReview'], { index: 'status' })
   *
   * @method SimpleStore#getAll
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {...Array} [keyList] See {@link Collection#getAll}.
   * @param {Object} [opts] See {@link Collection#getAll}.
   * @returns {Array} See {@link Collection#getAll}.
   * @see Collection#getAll
   * @see Collection#getAll
   * @since 3.0.0
   */
  'getAll',

  /**
   * Wrapper for {@link Collection#prune}.
   *
   * @method SimpleStore#prune
   * @param {Object} [opts] See {@link Collection#prune}.
   * @returns {Array} See {@link Collection#prune}.
   * @see Collection#prune
   * @see Collection#prune
   * @since 3.0.0
   */
  'prune',

  /**
   * Wrapper for {@link Collection#query}.
   *
   * @example
   * // Grab page 2 of users between ages 18 and 30
   * store.query('user')
   *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
   *   .skip(10) // second page
   *   .limit(10) // page size
   *   .run()
   *
   * @method SimpleStore#query
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @returns {Query} See {@link Collection#query}.
   * @see Collection#query
   * @see Collection#query
   * @since 3.0.0
   */
  'query',

  /**
   * Wrapper for {@link Collection#toJSON}.
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
   * @method SimpleStore#toJSON
   * @param {(string|number)} name Name of the {@link Mapper} to target.
   * @param {Object} [opts] See {@link Collection#toJSON}.
   * @returns {Array} See {@link Collection#toJSON}.
   * @see Collection#toJSON
   * @see Collection#toJSON
   * @since 3.0.0
   */
  'toJSON',

  /**
   * Wrapper for {@link Collection#unsaved}.
   *
   * @method SimpleStore#unsaved
   * @returns {Array} See {@link Collection#unsaved}.
   * @see Collection#unsaved
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

const cachedFn = function (name, hashOrId, opts) {
  const cached = this._completedQueries[name][hashOrId]
  if (utils.isFunction(cached)) {
    return cached(name, hashOrId, opts)
  }
  return cached
}

const SIMPLESTORE_DEFAULTS = {
  /**
   * Whether to use the pending query if a `find` request for the specified
   * record is currently underway. Can be set to `true`, `false`, or to a
   * function that returns `true` or `false`.
   *
   * @default true
   * @name SimpleStore#usePendingFind
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
   * @name SimpleStore#usePendingFindAll
   * @since 3.0.0
   * @type {boolean|Function}
   */
  usePendingFindAll: true
}

/**
 * The `SimpleStore` class is an extension of {@link Container}. Not only does
 * `SimpleStore` manage mappers, but also collections. `SimpleStore` implements the
 * asynchronous {@link Mapper} methods, such as {@link Mapper#find} and
 * {@link Mapper#create}. If you use the asynchronous `SimpleStore` methods
 * instead of calling them directly on the mappers, then the results of the
 * method calls will be inserted into the store's collections. You can think of
 * a `SimpleStore` as an [Identity Map](https://en.wikipedia.org/wiki/Identity_map_pattern)
 * for the [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)
 * (the Mappers).
 *
 * ```javascript
 * import {SimpleStore} from 'js-data'
 * ```
 *
 * @example
 * import {SimpleStore} from 'js-data'
 * import HttpAdapter from 'js-data-http'
 * const store = new SimpleStore()
 *
 * // SimpleStore#defineMapper returns a direct reference to the newly created
 * // Mapper.
 * const UserMapper = store.defineMapper('user')
 *
 * // SimpleStore#as returns the store scoped to a particular Mapper.
 * const UserStore = store.as('user')
 *
 * // Call "find" on "UserMapper" (Stateless ORM)
 * UserMapper.find(1).then((user) => {
 *   // retrieved a "user" record via the http adapter, but that's it
 *
 *   // Call "find" on "store" targeting "user" (Stateful SimpleStore)
 *   return store.find('user', 1) // same as "UserStore.find(1)"
 * }).then((user) => {
 *   // not only was a "user" record retrieved, but it was added to the
 *   // store's "user" collection
 *   const cachedUser = store.getCollection('user').get(1)
 *   console.log(user === cachedUser) // true
 * })
 *
 * @class SimpleStore
 * @extends Container
 * @param {Object} [opts] Configuration options. See {@link Container}.
 * @param {boolean} [opts.collectionClass={@link Collection}] See {@link SimpleStore#collectionClass}.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {boolean|Function} [opts.usePendingFind=true] See {@link SimpleStore#usePendingFind}.
 * @param {boolean|Function} [opts.usePendingFindAll=true] See {@link SimpleStore#usePendingFindAll}.
 * @returns {SimpleStore}
 * @see Container
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#SimpleStore","Components of JSData: SimpleStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/working-with-the-SimpleStore","Working with the SimpleStore"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/jsdata-and-the-browser","Notes on using JSData in the Browser"]
 */
function SimpleStore (opts) {
  utils.classCallCheck(this, SimpleStore)

  opts || (opts = {})
  // Fill in any missing options with the defaults
  utils.fillIn(opts, SIMPLESTORE_DEFAULTS)
  Container.call(this, opts)

  this.collectionClass = this.collectionClass || Collection
  this._collections = {}
  this._pendingQueries = {}
  this._completedQueries = {}
}

const props = {
  constructor: SimpleStore,

  /**
   * Internal method used to handle Mapper responses.
   *
   * @method SimpleStore#_end
   * @private
   * @param {string} name Name of the {@link Collection} to which to
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
   * Register a new event listener on this SimpleStore.
   *
   * Proxy for {@link Container#on}. If an event was emitted by a Mapper or
   * Collection in the SimpleStore, then the name of the Mapper or Collection will
   * be prepended to the arugments passed to the provided event handler.
   *
   * @example
   * // Listen for all "afterCreate" events in a SimpleStore
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
   * @method SimpleStore#on
   * @param {string} event Name of event to subsribe to.
   * @param {Function} listener Listener function to handle the event.
   * @param {*} [ctx] Optional content in which to invoke the listener.
   */

  /**
   * Used to bind to events emitted by collections in this store.
   *
   * @method SimpleStore#_onCollectionEvent
   * @private
   * @param {string} name Name of the collection that emitted the event.
   * @param {...*} [args] Args passed to {@link Collection#emit}.
   */
  _onCollectionEvent (name, ...args) {
    const type = args.shift()
    this.emit(type, name, ...args)
  },

  /**
   * This method takes the data received from {@link SimpleStore#find},
   * {@link SimpleStore#findAll}, {@link SimpleStore#update}, etc., and adds the
   * data to the store. _You don't need to call this method directly._
   *
   * If you're using the http adapter and your response data is in an unexpected
   * format, you may need to override this method so the right data gets added
   * to the store.
   *
   * @example
   * const store = new SimpleStore({
   *   addToCache (mapperName, data, opts) {
   *     // Let's say for a particular Resource, response data is in a weird format
   *     if (name === 'comment') {
   *       // Re-assign the variable to add the correct records into the stores
   *       data = data.items
   *     }
   *     // Now perform default behavior
   *     return SimpleStore.prototype.addToCache.call(this, mapperName, data, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends SimpleStore {
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
   * @method SimpleStore#addToCache
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
   * @example <caption>SimpleStore.as</caption>
   * // Normally you would do: import {SimpleStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {SimpleStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new SimpleStore()
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
   * @method SimpleStore#as
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
   * {@link SimpleStore#find} to determine if {@link Mapper#find} needs to be
   * called. If this method returns `undefined` then {@link Mapper#find} will
   * be called. Otherwise {@link SimpleStore#find} will immediately resolve with
   * the return value of this method.
   *
   * When using {@link SimpleStore} in the browser, you can override this method
   * to implement your own cache-busting strategy.
   *
   * @example
   * const store = new SimpleStore({
   *   cachedFind (mapperName, id, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return undefined to trigger a Mapper#find call
   *       return
   *     }
   *     // Otherwise perform default behavior
   *     return SimpleStore.prototype.cachedFind.call(this, mapperName, id, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends SimpleStore {
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
   * @method SimpleStore#cachedFind
   * @param {string} name The `name` argument passed to {@link SimpleStore#find}.
   * @param {(string|number)} id The `id` argument passed to {@link SimpleStore#find}.
   * @param {Object} opts The `opts` argument passed to {@link SimpleStore#find}.
   * @since 3.0.0
   */
  cachedFind: cachedFn,

  /**
   * Retrieve a cached `findAll` result, if any. This method is called during
   * {@link SimpleStore#findAll} to determine if {@link Mapper#findAll} needs to be
   * called. If this method returns `undefined` then {@link Mapper#findAll} will
   * be called. Otherwise {@link SimpleStore#findAll} will immediately resolve with
   * the return value of this method.
   *
   * When using {@link SimpleStore} in the browser, you can override this method
   * to implement your own cache-busting strategy.
   *
   * @example
   * const store = new SimpleStore({
   *   cachedFindAll (mapperName, hash, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return undefined to trigger a Mapper#findAll call
   *       return undefined
   *     }
   *     // Otherwise perform default behavior
   *     return SimpleStore.prototype.cachedFindAll.call(this, mapperName, hash, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends SimpleStore {
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
   * @method SimpleStore#cachedFindAll
   * @param {string} name The `name` argument passed to {@link SimpleStore#findAll}.
   * @param {string} hash The result of calling {@link SimpleStore#hashQuery} on
   * the `query` argument passed to {@link SimpleStore#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link SimpleStore#findAll}.
   * @since 3.0.0
   */
  cachedFindAll: cachedFn,

  /**
   * Mark a {@link Mapper#find} result as cached by adding an entry to
   * {@link SimpleStore#_completedQueries}. By default, once a `find` entry is
   * added it means subsequent calls to the same Resource with the same `id`
   * argument will immediately resolve with the result of calling
   * {@link SimpleStore#get} instead of delegating to {@link Mapper#find}.
   *
   * As part of implementing your own caching strategy, you may choose to
   * override this method.
   *
   * @example
   * const store = new SimpleStore({
   *   cacheFind (mapperName, data, id, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to SimpleStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior
   *     return SimpleStore.prototype.cacheFind.call(this, mapperName, data, id, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends SimpleStore {
   *   cacheFind (mapperName, data, id, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to SimpleStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior
   *     return super.cacheFind(mapperName, data, id, opts)
   *   }
   * }
   * const store = new MyStore()
   *
   * @method SimpleStore#cacheFind
   * @param {string} name The `name` argument passed to {@link SimpleStore#find}.
   * @param {*} data The result to cache.
   * @param {(string|number)} id The `id` argument passed to {@link SimpleStore#find}.
   * @param {Object} opts The `opts` argument passed to {@link SimpleStore#find}.
   * @since 3.0.0
   */
  cacheFind (name, data, id, opts) {
    this._completedQueries[name][id] = (name, id, opts) => this.get(name, id)
  },

  /**
   * Mark a {@link Mapper#findAll} result as cached by adding an entry to
   * {@link SimpleStore#_completedQueries}. By default, once a `findAll` entry is
   * added it means subsequent calls to the same Resource with the same `query`
   * argument will immediately resolve with the result of calling
   * {@link SimpleStore#filter} instead of delegating to {@link Mapper#findAll}.
   *
   * As part of implementing your own caching strategy, you may choose to
   * override this method.
   *
   * @example
   * const store = new SimpleStore({
   *   cachedFindAll (mapperName, data, hash, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to SimpleStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior.
   *     return SimpleStore.prototype.cachedFindAll.call(this, mapperName, data, hash, opts)
   *   }
   * })
   *
   * @example
   * // Extend using ES2015 class syntax.
   * class MyStore extends SimpleStore {
   *   cachedFindAll (mapperName, data, hash, opts) {
   *     // Let's say for a particular Resource, we always want to pull fresh from the server
   *     if (mapperName === 'schedule') {
   *       // Return without saving an entry to SimpleStore#_completedQueries
   *       return
   *     }
   *     // Otherwise perform default behavior.
   *     return super.cachedFindAll(mapperName, data, hash, opts)
   *   }
   * }
   * const store = new MyStore()
   *
   * @method SimpleStore#cacheFindAll
   * @param {string} name The `name` argument passed to {@link SimpleStore#findAll}.
   * @param {*} data The result to cache.
   * @param {string} hash The result of calling {@link SimpleStore#hashQuery} on
   * the `query` argument passed to {@link SimpleStore#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link SimpleStore#findAll}.
   * @since 3.0.0
   */
  cacheFindAll (name, data, hash, opts) {
    this._completedQueries[name][hash] = (name, hash, opts) => this.filter(name, utils.fromJson(hash))
  },

  /**
   * Remove __all__ records from the in-memory store and reset
   * {@link SimpleStore#_completedQueries}.
   *
   * @method SimpleStore#clear
   * @returns {Object} Object containing all records that were in the store.
   * @see SimpleStore#remove
   * @see SimpleStore#removeAll
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
   * Fired during {@link SimpleStore#create}. See
   * {@link SimpleStore~beforeCreateListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeCreate
   * @see SimpleStore~beforeCreateListener
   * @see SimpleStore#create
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeCreate} event.
   *
   * @example
   * function onBeforeCreate (mapperName, props, opts) {
   *   // do something
   * }
   * store.on('beforeCreate', onBeforeCreate)
   *
   * @callback SimpleStore~beforeCreateListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeCreate}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeCreate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeCreate}.
   * @see SimpleStore#event:beforeCreate
   * @see SimpleStore#create
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#create}. See
   * {@link SimpleStore~afterCreateListener} for how to listen for this event.
   *
   * @event SimpleStore#afterCreate
   * @see SimpleStore~afterCreateListener
   * @see SimpleStore#create
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterCreate} event.
   *
   * @example
   * function onAfterCreate (mapperName, props, opts, result) {
   *   // do something
   * }
   * store.on('afterCreate', onAfterCreate)
   *
   * @callback SimpleStore~afterCreateListener
   * @param {string} name The `name` argument received by {@link Mapper#afterCreate}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterCreate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterCreate}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterCreate}.
   * @see SimpleStore#event:afterCreate
   * @see SimpleStore#create
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#create}. Adds the created record to the store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeCreate
   * @fires SimpleStore#afterCreate
   * @fires SimpleStore#add
   * @method SimpleStore#create
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} record Passed to {@link Mapper#create}.
   * @param {Object} [opts] Passed to {@link Mapper#create}. See
   * {@link Mapper#create} for more configuration options.
   * @returns {Promise} Resolves with the result of the create.
   * @since 3.0.0
   */
  create (name, record, opts) {
    opts || (opts = {})
    return Container.prototype.create.call(this, name, record, opts)
      .then((result) => this._end(name, result, opts))
  },

  /**
   * Fired during {@link SimpleStore#createMany}. See
   * {@link SimpleStore~beforeCreateManyListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeCreateMany
   * @see SimpleStore~beforeCreateManyListener
   * @see SimpleStore#createMany
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeCreateMany} event.
   *
   * @example
   * function onBeforeCreateMany (mapperName, records, opts) {
   *   // do something
   * }
   * store.on('beforeCreateMany', onBeforeCreateMany)
   *
   * @callback SimpleStore~beforeCreateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeCreateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#beforeCreateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeCreateMany}.
   * @see SimpleStore#event:beforeCreateMany
   * @see SimpleStore#createMany
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#createMany}. See
   * {@link SimpleStore~afterCreateManyListener} for how to listen for this event.
   *
   * @event SimpleStore#afterCreateMany
   * @see SimpleStore~afterCreateManyListener
   * @see SimpleStore#createMany
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterCreateMany} event.
   *
   * @example
   * function onAfterCreateMany (mapperName, records, opts, result) {
   *   // do something
   * }
   * store.on('afterCreateMany', onAfterCreateMany)
   *
   * @callback SimpleStore~afterCreateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterCreateMany}.
   * @see SimpleStore#event:afterCreateMany
   * @see SimpleStore#createMany
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#createMany}. Adds the created records to the
   * store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeCreateMany
   * @fires SimpleStore#afterCreateMany
   * @fires SimpleStore#add
   * @method SimpleStore#createMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Array} records Passed to {@link Mapper#createMany}.
   * @param {Object} [opts] Passed to {@link Mapper#createMany}. See
   * {@link Mapper#createMany} for more configuration options.
   * @returns {Promise} Resolves with the result of the create.
   * @since 3.0.0
   */
  createMany (name, records, opts) {
    opts || (opts = {})
    return Container.prototype.createMany.call(this, name, records, opts)
      .then((result) => this._end(name, result, opts))
  },

  defineMapper (name, opts) {
    const self = this
    const mapper = Container.prototype.defineMapper.call(self, name, opts)
    self._pendingQueries[name] = {}
    self._completedQueries[name] = {}
    mapper.relationList || Object.defineProperty(mapper, 'relationList', { value: [] })

    let collectionOpts = {
      // Make sure the collection has somewhere to store "added" timestamps
      _added: {},
      // Give the collection a reference to this SimpleStore
      datastore: self,
      // The mapper tied to the collection
      mapper
    }

    if (opts && ('onConflict' in opts)) {
      collectionOpts.onConflict = opts.onConflict
    }

    // The SimpleStore uses a subclass of Collection that is "SimpleStore-aware"
    const collection = self._collections[name] = new self.collectionClass(null, collectionOpts)  // eslint-disable-line

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

    return mapper
  },

  /**
   * Fired during {@link SimpleStore#destroy}. See
   * {@link SimpleStore~beforeDestroyListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeDestroy
   * @see SimpleStore~beforeDestroyListener
   * @see SimpleStore#destroy
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeDestroy} event.
   *
   * @example
   * function onBeforeDestroy (mapperName, id, opts) {
   *   // do something
   * }
   * store.on('beforeDestroy', onBeforeDestroy)
   *
   * @callback SimpleStore~beforeDestroyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeDestroy}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeDestroy}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeDestroy}.
   * @see SimpleStore#event:beforeDestroy
   * @see SimpleStore#destroy
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#destroy}. See
   * {@link SimpleStore~afterDestroyListener} for how to listen for this event.
   *
   * @event SimpleStore#afterDestroy
   * @see SimpleStore~afterDestroyListener
   * @see SimpleStore#destroy
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterDestroy} event.
   *
   * @example
   * function onAfterDestroy (mapperName, id, opts, result) {
   *   // do something
   * }
   * store.on('afterDestroy', onAfterDestroy)
   *
   * @callback SimpleStore~afterDestroyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterDestroy}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterDestroy}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterDestroy}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterDestroy}.
   * @see SimpleStore#event:afterDestroy
   * @see SimpleStore#destroy
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#destroy}. Removes any destroyed record from the
   * in-memory store. Clears out any {@link SimpleStore#_completedQueries} entries
   * associated with the provided `id`.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeDestroy
   * @fires SimpleStore#afterDestroy
   * @fires SimpleStore#remove
   * @method SimpleStore#destroy
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id Passed to {@link Mapper#destroy}.
   * @param {Object} [opts] Passed to {@link Mapper#destroy}. See
   * {@link Mapper#destroy} for more configuration options.
   * @returns {Promise} Resolves when the destroy operation completes.
   * @since 3.0.0
   */
  destroy (name, id, opts) {
    opts || (opts = {})
    return Container.prototype.destroy.call(this, name, id, opts).then((result) => {
      const record = this.getCollection(name).remove(id, opts)

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
   * Fired during {@link SimpleStore#destroyAll}. See
   * {@link SimpleStore~beforeDestroyAllListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeDestroyAll
   * @see SimpleStore~beforeDestroyAllListener
   * @see SimpleStore#destroyAll
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeDestroyAll} event.
   *
   * @example
   * function onBeforeDestroyAll (mapperName, query, opts) {
   *   // do something
   * }
   * store.on('beforeDestroyAll', onBeforeDestroyAll)
   *
   * @callback SimpleStore~beforeDestroyAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeDestroyAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeDestroyAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeDestroyAll}.
   * @see SimpleStore#event:beforeDestroyAll
   * @see SimpleStore#destroyAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#destroyAll}. See
   * {@link SimpleStore~afterDestroyAllListener} for how to listen for this event.
   *
   * @event SimpleStore#afterDestroyAll
   * @see SimpleStore~afterDestroyAllListener
   * @see SimpleStore#destroyAll
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterDestroyAll} event.
   *
   * @example
   * function onAfterDestroyAll (mapperName, query, opts, result) {
   *   // do something
   * }
   * store.on('afterDestroyAll', onAfterDestroyAll)
   *
   * @callback SimpleStore~afterDestroyAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterDestroyAll}.
   * @see SimpleStore#event:afterDestroyAll
   * @see SimpleStore#destroyAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#destroyAll}. Removes any destroyed records from
   * the in-memory store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeDestroyAll
   * @fires SimpleStore#afterDestroyAll
   * @fires SimpleStore#remove
   * @method SimpleStore#destroyAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] Passed to {@link Mapper#destroyAll}.
   * @param {Object} [opts] Passed to {@link Mapper#destroyAll}. See
   * {@link Mapper#destroyAll} for more configuration options.
   * @returns {Promise} Resolves when the delete completes.
   * @since 3.0.0
   */
  destroyAll (name, query, opts) {
    opts || (opts = {})
    return Container.prototype.destroyAll.call(this, name, query, opts).then((result) => {
      const records = this.getCollection(name).removeAll(query, opts)

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
   * Fired during {@link SimpleStore#find}. See
   * {@link SimpleStore~beforeFindListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeFind
   * @see SimpleStore~beforeFindListener
   * @see SimpleStore#find
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeFind} event.
   *
   * @example
   * function onBeforeFind (mapperName, id, opts) {
   *   // do something
   * }
   * store.on('beforeFind', onBeforeFind)
   *
   * @callback SimpleStore~beforeFindListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeFind}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeFind}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeFind}.
   * @see SimpleStore#event:beforeFind
   * @see SimpleStore#find
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#find}. See
   * {@link SimpleStore~afterFindListener} for how to listen for this event.
   *
   * @event SimpleStore#afterFind
   * @see SimpleStore~afterFindListener
   * @see SimpleStore#find
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterFind} event.
   *
   * @example
   * function onAfterFind (mapperName, id, opts, result) {
   *   // do something
   * }
   * store.on('afterFind', onAfterFind)
   *
   * @callback SimpleStore~afterFindListener
   * @param {string} name The `name` argument received by {@link Mapper#afterFind}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterFind}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterFind}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterFind}.
   * @see SimpleStore#event:afterFind
   * @see SimpleStore#find
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#find}. Adds any found record to the store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeFind
   * @fires SimpleStore#afterFind
   * @fires SimpleStore#add
   * @method SimpleStore#find
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id Passed to {@link Mapper#find}.
   * @param {Object} [opts] Passed to {@link Mapper#find}.
   * @param {boolean} [opts.force] Bypass cacheFind
   * @param {boolean|Function} [opts.usePendingFind] See {@link SimpleStore#usePendingFind}
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

    if (opts.force || !item) {
      const promise = this._pendingQueries[name][id] = Container.prototype.find.call(this, name, id, opts)
      return promise
        .then((result) => {
          delete this._pendingQueries[name][id]
          result = this._end(name, result, opts)
          this.cacheFind(name, result, id, opts)
          return result
        }, (err) => {
          delete this._pendingQueries[name][id]
          return utils.reject(err)
        })
    }

    return utils.resolve(item)
  },

  /**
   * Fired during {@link SimpleStore#findAll}. See
   * {@link SimpleStore~beforeFindAllListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeFindAll
   * @see SimpleStore~beforeFindAllListener
   * @see SimpleStore#findAll
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeFindAll} event.
   *
   * @example
   * function onBeforeFindAll (mapperName, query, opts) {
   *   // do something
   * }
   * store.on('beforeFindAll', onBeforeFindAll)
   *
   * @callback SimpleStore~beforeFindAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeFindAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeFindAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeFindAll}.
   * @see SimpleStore#event:beforeFindAll
   * @see SimpleStore#findAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#findAll}. See
   * {@link SimpleStore~afterFindAllListener} for how to listen for this event.
   *
   * @event SimpleStore#afterFindAll
   * @see SimpleStore~afterFindAllListener
   * @see SimpleStore#findAll
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterFindAll} event.
   *
   * @example
   * function onAfterFindAll (mapperName, query, opts, result) {
   *   // do something
   * }
   * store.on('afterFindAll', onAfterFindAll)
   *
   * @callback SimpleStore~afterFindAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterFindAll}.
   * @see SimpleStore#event:afterFindAll
   * @see SimpleStore#findAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#findAll}. Adds any found records to the store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeFindAll
   * @fires SimpleStore#afterFindAll
   * @fires SimpleStore#add
   * @method SimpleStore#findAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] Passed to {@link Mapper.findAll}.
   * @param {Object} [opts] Passed to {@link Mapper.findAll}.
   * @param {boolean} [opts.force] Bypass cacheFindAll
   * @param {boolean|Function} [opts.usePendingFindAll] See {@link SimpleStore#usePendingFindAll}
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

    if (opts.force || !items) {
      const promise = this._pendingQueries[name][hash] = Container.prototype.findAll.call(this, name, query, opts)
      return promise
        .then((result) => {
          delete this._pendingQueries[name][hash]
          result = this._end(name, result, opts)
          this.cacheFindAll(name, result, hash, opts)
          return result
        }, (err) => {
          delete this._pendingQueries[name][hash]
          return utils.reject(err)
        })
    }

    return utils.resolve(items)
  },

  /**
   * Return the {@link Collection} with the given name, if for some
   * reason you need a direct reference to the collection.
   *
   * @method SimpleStore#getCollection
   * @param {string} name Name of the {@link Collection} to retrieve.
   * @returns {Collection}
   * @since 3.0.0
   * @throws {Error} Thrown if the specified {@link Collection} does not
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
   * Hashing function used to cache {@link SimpleStore#find} and
   * {@link SimpleStore#findAll} requests. This method simply JSONifies the
   * `query` argument passed to {@link SimpleStore#find} or
   * {@link SimpleStore#findAll}.
   *
   * Override this method for custom hashing behavior.
   * @method SimpleStore#hashQuery
   * @param {string} name The `name` argument passed to {@link SimpleStore#find}
   * or {@link SimpleStore#findAll}.
   * @param {Object} query The `query` argument passed to {@link SimpleStore#find}
   * or {@link SimpleStore#findAll}.
   * @returns {string} The JSONified `query`.
   * @since 3.0.0
   */
  hashQuery (name, query, opts) {
    return utils.toJson(query || {})
  },

  inject (name, records, opts) {
    console.warn('DEPRECATED: "inject" is deprecated, use "add" instead')
    return this.add(name, records, opts)
  },

  /**
   * Wrapper for {@link Collection#remove}. Removes the specified
   * {@link Record} from the store.
   *
   * @example <caption>SimpleStore#remove</caption>
   * // Normally you would do: import {SimpleStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {SimpleStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new SimpleStore()
   * store.defineMapper('book')
   * console.log(store.getAll('book').length)
   * store.add('book', { id: 1234 })
   * console.log(store.getAll('book').length)
   * store.remove('book', 1234)
   * console.log(store.getAll('book').length)
   *
   * @fires SimpleStore#remove
   * @method SimpleStore#remove
   * @param {string} name The name of the {@link Collection} to target.
   * @param {string|number} id The primary key of the {@link Record} to remove.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Relations of the {@link Record} to also
   * remove from the store.
   * @returns {Record} The removed {@link Record}, if any.
   * @see Collection#add
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
   * Wrapper for {@link Collection#removeAll}. Removes the selected
   * {@link Record}s from the store.
   *
   * @example <caption>SimpleStore#removeAll</caption>
   * // Normally you would do: import {SimpleStore} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {SimpleStore} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new SimpleStore()
   * store.defineMapper('movie')
   * console.log(store.getAll('movie').length)
   * store.add('movie', [{ id: 3, rating: 'R' }, { id: 4, rating: 'PG-13' })
   * console.log(store.getAll('movie').length)
   * store.removeAll('movie', { rating: 'R' })
   * console.log(store.getAll('movie').length)
   *
   * @fires SimpleStore#remove
   * @method SimpleStore#removeAll
   * @param {string} name The name of the {@link Collection} to target.
   * @param {Object} [query={}] Selection query. See {@link query}.
   * @param {Object} [query.where] See {@link query.where}.
   * @param {number} [query.offset] See {@link query.offset}.
   * @param {number} [query.limit] See {@link query.limit}.
   * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Relations of the {@link Record} to also
   * remove from the store.
   * @returns {Record} The removed {@link Record}s, if any.
   * @see Collection#add
   * @see Collection#add
   * @since 3.0.0
   */
  removeAll (name, query, opts) {
    if (!query || !Object.keys(query).length) {
      this._completedQueries[name] = {}
    } else {
      this._completedQueries[name][this.hashQuery(name, query, opts)] = undefined
    }
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
   * @fires SimpleStore#remove
   * @method SimpleStore#removeRelated
   * @param {string} name The name of the {@link Collection} to target.
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
   * Fired during {@link SimpleStore#update}. See
   * {@link SimpleStore~beforeUpdateListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeUpdate
   * @see SimpleStore~beforeUpdateListener
   * @see SimpleStore#update
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeUpdate} event.
   *
   * @example
   * function onBeforeUpdate (mapperName, id, props, opts) {
   *   // do something
   * }
   * store.on('beforeUpdate', onBeforeUpdate)
   *
   * @callback SimpleStore~beforeUpdateListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdate}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeUpdate}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeUpdate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdate}.
   * @see SimpleStore#event:beforeUpdate
   * @see SimpleStore#update
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#update}. See
   * {@link SimpleStore~afterUpdateListener} for how to listen for this event.
   *
   * @event SimpleStore#afterUpdate
   * @see SimpleStore~afterUpdateListener
   * @see SimpleStore#update
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterUpdate} event.
   *
   * @example
   * function onAfterUpdate (mapperName, id, props, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdate', onAfterUpdate)
   *
   * @callback SimpleStore~afterUpdateListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdate}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdate}.
   * @see SimpleStore#event:afterUpdate
   * @see SimpleStore#update
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#update}. Adds the updated {@link Record} to the
   * store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeUpdate
   * @fires SimpleStore#afterUpdate
   * @fires SimpleStore#add
   * @method SimpleStore#update
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
    return Container.prototype.update.call(this, name, id, record, opts)
      .then((result) => this._end(name, result, opts))
  },

  /**
   * Fired during {@link SimpleStore#updateAll}. See
   * {@link SimpleStore~beforeUpdateAllListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeUpdateAll
   * @see SimpleStore~beforeUpdateAllListener
   * @see SimpleStore#updateAll
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeUpdateAll} event.
   *
   * @example
   * function onBeforeUpdateAll (mapperName, props, query, opts) {
   *   // do something
   * }
   * store.on('beforeUpdateAll', onBeforeUpdateAll)
   *
   * @callback SimpleStore~beforeUpdateAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdateAll}.
   * @see SimpleStore#event:beforeUpdateAll
   * @see SimpleStore#updateAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#updateAll}. See
   * {@link SimpleStore~afterUpdateAllListener} for how to listen for this event.
   *
   * @event SimpleStore#afterUpdateAll
   * @see SimpleStore~afterUpdateAllListener
   * @see SimpleStore#updateAll
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterUpdateAll} event.
   *
   * @example
   * function onAfterUpdateAll (mapperName, props, query, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdateAll', onAfterUpdateAll)
   *
   * @callback SimpleStore~afterUpdateAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdateAll}.
   * @see SimpleStore#event:afterUpdateAll
   * @see SimpleStore#updateAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#updateAll}. Adds the updated {@link Record}s to
   * the store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeUpdateAll
   * @fires SimpleStore#afterUpdateAll
   * @fires SimpleStore#add
   * @method SimpleStore#updateAll
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
    return Container.prototype.updateAll.call(this, name, props, query, opts)
      .then((result) => this._end(name, result, opts))
  },

  /**
   * Fired during {@link SimpleStore#updateMany}. See
   * {@link SimpleStore~beforeUpdateManyListener} for how to listen for this event.
   *
   * @event SimpleStore#beforeUpdateMany
   * @see SimpleStore~beforeUpdateManyListener
   * @see SimpleStore#updateMany
   */
  /**
   * Callback signature for the {@link SimpleStore#event:beforeUpdateMany} event.
   *
   * @example
   * function onBeforeUpdateMany (mapperName, records, opts) {
   *   // do something
   * }
   * store.on('beforeUpdateMany', onBeforeUpdateMany)
   *
   * @callback SimpleStore~beforeUpdateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#beforeUpdateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdateMany}.
   * @see SimpleStore#event:beforeUpdateMany
   * @see SimpleStore#updateMany
   * @since 3.0.0
   */
  /**
   * Fired during {@link SimpleStore#updateMany}. See
   * {@link SimpleStore~afterUpdateManyListener} for how to listen for this event.
   *
   * @event SimpleStore#afterUpdateMany
   * @see SimpleStore~afterUpdateManyListener
   * @see SimpleStore#updateMany
   */
  /**
   * Callback signature for the {@link SimpleStore#event:afterUpdateMany} event.
   *
   * @example
   * function onAfterUpdateMany (mapperName, records, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdateMany', onAfterUpdateMany)
   *
   * @callback SimpleStore~afterUpdateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdateMany}.
   * @see SimpleStore#event:afterUpdateMany
   * @see SimpleStore#updateMany
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#updateMany}. Adds the updated {@link Record}s to
   * the store.
   *
   * @example
   * import {SimpleStore} from 'js-data'
   * import {HttpAdapter} from 'js-data-http'
   *
   * const store = new SimpleStore()
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
   * @fires SimpleStore#beforeUpdateMany
   * @fires SimpleStore#afterUpdateMany
   * @fires SimpleStore#add
   * @method SimpleStore#updateMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records Passed to {@link Mapper#updateMany}.
   * @param {Object} [opts] Passed to {@link Mapper#updateMany}. See
   * {@link Mapper#updateMany} for more configuration options.
   * @returns {Promise} Resolves with the result of the update.
   * @since 3.0.0
   */
  updateMany (name, records, opts) {
    opts || (opts = {})
    return Container.prototype.updateMany.call(this, name, records, opts)
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
 * See {@link SimpleStore~changeListener} on how to listen for this event.
 *
 * @event SimpleStore#change
 * @see SimpleStore~changeListener
 */

/**
 * Callback signature for the {@link SimpleStore#event:change} event.
 *
 * @example
 * function onChange (mapperName, record, changes) {
 *   // do something
 * }
 * store.on('change', onChange)
 *
 * @callback SimpleStore~changeListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record} record The Record that changed.
 * @param {Object} changes The changes.
 * @see SimpleStore#event:change
 * @since 3.0.0
 */

/**
 * Fired when one or more records are added to the in-memory store. See
 * {@link SimpleStore~addListener} on how to listen for this event.
 *
 * @event SimpleStore#add
 * @see SimpleStore~addListener
 * @see SimpleStore#event:add
 * @see SimpleStore#add
 * @see SimpleStore#create
 * @see SimpleStore#createMany
 * @see SimpleStore#find
 * @see SimpleStore#findAll
 * @see SimpleStore#update
 * @see SimpleStore#updateAll
 * @see SimpleStore#updateMany
 */

/**
 * Callback signature for the {@link SimpleStore#event:add} event.
 *
 * @example
 * function onAdd (mapperName, recordOrRecords) {
 *   // do something
 * }
 * store.on('add', onAdd)
 *
 * @callback SimpleStore~addListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record|Record[]} The Record or Records that were added.
 * @see SimpleStore#event:add
 * @see SimpleStore#add
 * @see SimpleStore#create
 * @see SimpleStore#createMany
 * @see SimpleStore#find
 * @see SimpleStore#findAll
 * @see SimpleStore#update
 * @see SimpleStore#updateAll
 * @see SimpleStore#updateMany
 * @since 3.0.0
 */

/**
 * Fired when one or more records are removed from the in-memory store. See
 * {@link SimpleStore~removeListener} for how to listen for this event.
 *
 * @event SimpleStore#remove
 * @see SimpleStore~removeListener
 * @see SimpleStore#event:remove
 * @see SimpleStore#clear
 * @see SimpleStore#destroy
 * @see SimpleStore#destroyAll
 * @see SimpleStore#remove
 * @see SimpleStore#removeAll
 */

/**
 * Callback signature for the {@link SimpleStore#event:remove} event.
 *
 * @example
 * function onRemove (mapperName, recordsOrRecords) {
 *   // do something
 * }
 * store.on('remove', onRemove)
 *
 * @callback SimpleStore~removeListener
 * @param {string} name The name of the associated {@link Mapper}.
 * @param {Record|Record[]} Record or Records that were removed.
 * @see SimpleStore#event:remove
 * @see SimpleStore#clear
 * @see SimpleStore#destroy
 * @see SimpleStore#destroyAll
 * @see SimpleStore#remove
 * @see SimpleStore#removeAll
 * @since 3.0.0
 */

/**
 * Create a subclass of this SimpleStore:
 * @example <caption>SimpleStore.extend</caption>
 * // Normally you would do: import {SimpleStore} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {SimpleStore} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomSimpleStoreClass extends SimpleStore {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customSimpleStore = new CustomSimpleStoreClass()
 * console.log(customSimpleStore.foo())
 * console.log(CustomSimpleStoreClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherSimpleStoreClass = SimpleStore.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherSimpleStore = new OtherSimpleStoreClass()
 * console.log(otherSimpleStore.foo())
 * console.log(OtherSimpleStoreClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherSimpleStoreClass () {
 *   SimpleStore.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * SimpleStore.extend({
 *   constructor: AnotherSimpleStoreClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherSimpleStore = new AnotherSimpleStoreClass()
 * console.log(anotherSimpleStore.created_at)
 * console.log(anotherSimpleStore.foo())
 * console.log(AnotherSimpleStoreClass.beep())
 *
 * @method SimpleStore.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this SimpleStore class.
 * @since 3.0.0
 */
