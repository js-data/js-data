import utils from './utils'
import Component from './Component'
import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import Mapper from './Mapper'

const DOMAIN = 'Container'

const toProxy = [
  /**
   * Wrapper for {@link Mapper#count}.
   *
   * @example <caption>Get the number of published blog posts</caption>
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.count('post', { status: 'published' }).then((numPublished) => {
   *   console.log(numPublished) // e.g. 45
   * })
   *
   * @method Container#count
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] See {@link Mapper#count}.
   * @param {Object} [opts] See {@link Mapper#count}.
   * @returns {Promise} See {@link Mapper#count}.
   * @see Mapper#count
   * @since 3.0.0
   */
  'count',

  /**
   * Wrapper for {@link Mapper#create}.
   *
   * @example <caption>Create and save a new blog post</caption>
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.create('post', {
   *   title: 'Modeling your data',
   *   status: 'draft'
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'draft', ... }
   * })
   *
   * @method Container#create
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} props See {@link Mapper#create}.
   * @param {Object} [opts] See {@link Mapper#create}.
   * @returns {Promise} See {@link Mapper#create}.
   * @see Mapper#create
   * @since 3.0.0
   */
  'create',

  /**
   * Wrapper for {@link Mapper#createMany}.
   *
   * @example <caption>Create and save several new blog posts</caption>
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.createMany('post', [{
   *   title: 'Modeling your data',
   *   status: 'draft'
   * }, {
   *   title: 'Reading data',
   *   status: 'draft'
   * }]).then((posts) => {
   *   console.log(posts[0]) // { id: 1234, status: 'draft', ... }
   *   console.log(posts[1]) // { id: 1235, status: 'draft', ... }
   * })
   *
   * @method Container#createMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Record[]} records See {@link Mapper#createMany}.
   * @param {Object} [opts] See {@link Mapper#createMany}.
   * @returns {Promise} See {@link Mapper#createMany}.
   * @see Mapper#createMany
   * @since 3.0.0
   */
  'createMany',

  /**
   * Wrapper for {@link Mapper#createRecord}.
   *
   * __Note:__ This method does __not__ interact with any adapter, and does
   * __not__ save any data. It only creates new objects in memory.
   *
   * @example <caption>Create empty unsaved record instance</caption>
   * import {Container} from 'js-data'
   * const store = new Container()
   * store.defineMapper('post')
   * const post = PostService.createRecord()
   *
   * @method Container#createRecord
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object|Object[]} props See {@link Mapper#createRecord}.
   * @param {Object} [opts] See {@link Mapper#createRecord}.
   * @returns {Promise} See {@link Mapper#createRecord}.
   * @see Mapper#createRecord
   * @since 3.0.0
   */
  'createRecord',

  /**
   * Wrapper for {@link Mapper#dbg}.
   *
   * @method Container#dbg
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {...*} args See {@link Mapper#dbg}.
   * @see Mapper#dbg
   * @since 3.0.0
   */
  'dbg',

  /**
   * Wrapper for {@link Mapper#destroy}.
   *
   * @example <caption>Destroy a specific blog post</caption>
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.destroy('post', 1234).then(() => {
   *   // Blog post #1234 has been destroyed
   * })
   *
   * @method Container#destroy
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link Mapper#destroy}.
   * @param {Object} [opts] See {@link Mapper#destroy}.
   * @returns {Promise} See {@link Mapper#destroy}.
   * @see Mapper#destroy
   * @since 3.0.0
   */
  'destroy',

  /**
   * Wrapper for {@link Mapper#destroyAll}.
   *
   * @example <caption>Destroy all "draft" blog posts</caption>
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.destroyAll('post', { status: 'draft' }).then(() => {
   *   // All "draft" blog posts have been destroyed
   * })
   *
   * @method Container#destroyAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] See {@link Mapper#destroyAll}.
   * @param {Object} [opts] See {@link Mapper#destroyAll}.
   * @returns {Promise} See {@link Mapper#destroyAll}.
   * @see Mapper#destroyAll
   * @since 3.0.0
   */
  'destroyAll',

  /**
   * Wrapper for {@link Mapper#find}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.find('post', 1).then((post) => {
   *   console.log(post) // { id: 1, ...}
   * })
   *
   * @method Container#find
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link Mapper#find}.
   * @param {Object} [opts] See {@link Mapper#find}.
   * @returns {Promise} See {@link Mapper#find}.
   * @see Mapper#find
   * @since 3.0.0
   */
  'find',

  /**
   * Wrapper for {@link Mapper#createRecord}.
   *
   * @example <caption>Find all "published" blog posts</caption>
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.findAll('post', { status: 'published' }).then((posts) => {
   *   console.log(posts) // [{ id: 1, ...}, ...]
   * })
   *
   * @method Container#findAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] See {@link Mapper#findAll}.
   * @param {Object} [opts] See {@link Mapper#findAll}.
   * @returns {Promise} See {@link Mapper#findAll}.
   * @see Mapper#findAll
   * @since 3.0.0
   */
  'findAll',

  /**
   * Wrapper for {@link Mapper#getSchema}.
   *
   * @method Container#getSchema
   * @param {string} name Name of the {@link Mapper} to target.
   * @returns {Schema} See {@link Mapper#getSchema}.
   * @see Mapper#getSchema
   * @since 3.0.0
   */
  'getSchema',

  /**
   * Wrapper for {@link Mapper#is}.
   *
   * @example
   * import {Container} from 'js-data'
   * const store = new Container()
   * store.defineMapper('post')
   * const post = store.createRecord()
   *
   * console.log(store.is('post', post)) // true
   * // Equivalent to what's above
   * console.log(post instanceof store.getMapper('post').recordClass) // true
   *
   * @method Container#is
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object|Record} record See {@link Mapper#is}.
   * @returns {boolean} See {@link Mapper#is}.
   * @see Mapper#is
   * @since 3.0.0
   */
  'is',

  /**
   * Wrapper for {@link Mapper#log}.
   *
   * @method Container#log
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {...*} args See {@link Mapper#log}.
   * @see Mapper#log
   * @since 3.0.0
   */
  'log',

  /**
   * Wrapper for {@link Mapper#sum}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('purchase_order')
   *
   * store.sum('purchase_order', 'amount', { status: 'paid' }).then((amountPaid) => {
   *   console.log(amountPaid) // e.g. 451125.34
   * })
   *
   * @method Container#sum
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {string} field See {@link Mapper#sum}.
   * @param {Object} [query] See {@link Mapper#sum}.
   * @param {Object} [opts] See {@link Mapper#sum}.
   * @returns {Promise} See {@link Mapper#sum}.
   * @see Mapper#sum
   * @since 3.0.0
   */
  'sum',

  /**
   * Wrapper for {@link Mapper#toJSON}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('person', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' },
   *       id: { type: 'string' }
   *     }
   *   }
   * })
   * const person = store.createRecord('person', { id: 1, name: 'John', foo: 'bar' })
   * console.log(store.toJSON('person', person)) // {"id":1,"name":"John","foo":"bar"}
   * console.log(store.toJSON('person', person), { strict: true }) // {"id":1,"name":"John"}
   *
   * @method Container#toJSON
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Record|Record[]} records See {@link Mapper#toJSON}.
   * @param {Object} [opts] See {@link Mapper#toJSON}.
   * @returns {Object|Object[]} See {@link Mapper#toJSON}.
   * @see Mapper#toJSON
   * @since 3.0.0
   */
  'toJSON',

  /**
   * Wrapper for {@link Mapper#update}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.update('post', 1234, {
   *   status: 'published',
   *   published_at: new Date()
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'published', ... }
   * })
   *
   * @method Container#update
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link Mapper#update}.
   * @param {Object} record See {@link Mapper#update}.
   * @param {Object} [opts] See {@link Mapper#update}.
   * @returns {Promise} See {@link Mapper#update}.
   * @see Mapper#update
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  'update',

  /**
   * Wrapper for {@link Mapper#updateAll}.
   *
   * @example <caption>Turn all of John's blog posts into drafts.</caption>
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * const update = { status: draft: published_at: null }
   * const query = { userId: 1234 }
   * store.updateAll('post', update, query).then((posts) => {
   *   console.log(posts) // [...]
   * })
   *
   * @method Container#updateAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} update See {@link Mapper#updateAll}.
   * @param {Object} [query] See {@link Mapper#updateAll}.
   * @param {Object} [opts] See {@link Mapper#updateAll}.
   * @returns {Promise} See {@link Mapper#updateAll}.
   * @see Mapper#updateAll
   * @since 3.0.0
   */
  'updateAll',

  /**
   * Wrapper for {@link Mapper#updateMany}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.updateMany('post', [
   *   { id: 1234, status: 'draft' },
   *   { id: 2468, status: 'published', published_at: new Date() }
   * ]).then((posts) => {
   *   console.log(posts) // [...]
   * })
   *
   * @method Container#updateMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records See {@link Mapper#updateMany}.
   * @param {Object} [opts] See {@link Mapper#updateMany}.
   * @returns {Promise} See {@link Mapper#updateMany}.
   * @see Mapper#updateMany
   * @since 3.0.0
   */
  'updateMany',

  /**
   * Wrapper for {@link Mapper#validate}.
   *
   * @example
   * import {Container} from 'js-data'
   * const store = new Container()
   * store.defineMapper('post', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' },
   *       id: { type: 'string' }
   *     }
   *   }
   * })
   * let errors = store.validate('post', { name: 'John' })
   * console.log(errors) // undefined
   * errors = store.validate('post', { name: 123 })
   * console.log(errors) // [{ expected: 'one of (string)', actual: 'number', path: 'name' }]
   *
   * @method Container#validate
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records See {@link Mapper#validate}.
   * @param {Object} [opts] See {@link Mapper#validate}.
   * @returns {Promise} See {@link Mapper#validate}.
   * @see Mapper#validate
   * @since 3.0.0
   */
  'validate'
]

const props = {
  constructor: function Container (opts) {
    utils.classCallCheck(this, Container)
    Container.__super__.call(this)
    opts || (opts = {})

    Object.defineProperties(this, {
      // Holds the adapters, shared by all mappers in this container
      _adapters: {
        value: {}
      },
      // The the mappers in this container
      _mappers: {
        value: {}
      }
    })

    // Apply options provided by the user
    utils.fillIn(this, opts)

    /**
     * Defaults options to pass to {@link Container#mapperClass} when creating a
     * new {@link Mapper}.
     *
     * @default {}
     * @name Container#mapperDefaults
     * @since 3.0.0
     * @type {Object}
     */
    this.mapperDefaults = this.mapperDefaults || {}

    /**
     * Constructor function to use in {@link Container#defineMapper} to create a
     * new mapper.
     *
     * {@link Mapper}
     * @name Container#mapperClass
     * @since 3.0.0
     * @type {Constructor}
     */
    this.mapperClass = this.mapperClass || Mapper
  },

  /**
   * Register a new event listener on this Container.
   *
   * Proxy for {@link Component#on}. If an event was emitted by a Mapper in the
   * Container, then the name of the Mapper will be prepended to the arugments
   * passed to the listener.
   *
   * @method Container#on
   * @param {string} event Name of event to subsribe to.
   * @param {Function} listener Listener function to handle the event.
   * @param {*} [ctx] Optional content in which to invoke the listener.
   * @since 3.0.0
   */

  /**
   * Used to bind to events emitted by mappers in this container.
   *
   * @method Container#_onMapperEvent
   * @param {string} name Name of the mapper that emitted the event.
   * @param {...*} [args] Args See {@link Mapper#emit}.
   * @private
   * @since 3.0.0
   */
  _onMapperEvent (name, ...args) {
    const type = args.shift()
    this.emit(type, name, ...args)
  },

  /**
   * Create a new mapper and register it in this container.
   *
   * @example
   * import {Container} from 'js-data'
   * const store = new Container({
   *   mapperDefaults: { foo: 'bar' }
   * })
   * const userMapper = store.defineMapper('user')
   * userMapper.foo // "bar"
   *
   * @method Container#defineMapper
   * @param {string} name Name under which to register the new {@link Mapper}.
   * {@link Mapper#name} will be set to this value.
   * @param {Object} [opts] Configuration options. Passed to
   * {@link Container#mapperClass} when creating the new {@link Mapper}.
   * @returns {Mapper}
   * @since 3.0.0
   */
  defineMapper (name, opts) {
    // For backwards compatibility with defineResource
    if (utils.isObject(name)) {
      opts = name
      name = opts.name
    }
    if (!utils.isString(name)) {
      throw utils.err(`${DOMAIN}#defineMapper`, 'name')(400, 'string', name)
    }

    // Default values for arguments
    opts || (opts = {})
    // Set Mapper#name
    opts.name = name
    opts.relations || (opts.relations = {})

    // Check if the user is overriding the datastore's default mapperClass
    const mapperClass = opts.mapperClass || this.mapperClass
    delete opts.mapperClass

    // Apply the datastore's defaults to the options going into the mapper
    utils.fillIn(opts, this.mapperDefaults)

    // Instantiate a mapper
    const mapper = this._mappers[name] = new mapperClass(opts) // eslint-disable-line
    mapper.relations || (mapper.relations = {})
    // Make sure the mapper's name is set
    mapper.name = name
    // All mappers in this datastore will share adapters
    mapper._adapters = this.getAdapters()

    mapper.datastore = this

    mapper.on('all', (...args) => this._onMapperEvent(name, ...args))

    // Setup the mapper's relations, including generating Mapper#relationList
    // and Mapper#relationFields
    utils.forOwn(mapper.relations, (group, type) => {
      utils.forOwn(group, (relations, _name) => {
        if (utils.isObject(relations)) {
          relations = [relations]
        }
        relations.forEach((def) => {
          def.getRelation = () => this.getMapper(_name)
          const relatedMapper = this._mappers[_name] || _name
          if (type === belongsToType) {
            mapper.belongsTo(relatedMapper, def)
          } else if (type === hasOneType) {
            mapper.hasOne(relatedMapper, def)
          } else if (type === hasManyType) {
            mapper.hasMany(relatedMapper, def)
          }
        })
      })
    })

    return mapper
  },

  defineResource (name, opts) {
    return this.defineMapper(name, opts)
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @method Container#getAdapter
   * @param {string} [name] The name of the adapter to retrieve.
   * @returns {Adapter} The adapter.
   * @since 3.0.0
   */
  getAdapter (name) {
    const adapter = this.getAdapterName(name)
    if (!adapter) {
      throw utils.err(`${DOMAIN}#getAdapter`, 'name')(400, 'string', name)
    }
    return this.getAdapters()[adapter]
  },

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided.
   *
   * @method Container#getAdapterName
   * @param {(Object|string)} [opts] The name of an adapter or options, if any.
   * @returns {string} The name of the adapter.
   * @since 3.0.0
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || this.mapperDefaults.defaultAdapter
  },

  /**
   * Return the registered adapters of this container.
   *
   * @method Container#getAdapters
   * @returns {Adapter}
   * @since 3.0.0
   */
  getAdapters () {
    return this._adapters
  },

  /**
   * Return the mapper registered under the specified name.
   *
   * @example
   * import {Container} from 'js-data'
   * const container = new Container()
   * const userMapper = container.defineMapper('user')
   * userMapper === container.getMapper('user') // true
   *
   * @method Container#getMapper
   * @param {string} name {@link Mapper#name}.
   * @returns {Mapper}
   * @since 3.0.0
   */
  getMapper (name) {
    const mapper = this._mappers[name]
    if (!mapper) {
      throw utils.err(`${DOMAIN}#getMapper`, name)(404, 'mapper')
    }
    return mapper
  },

  /**
   * Register an adapter on this container under the given name. Adapters
   * registered on a container are shared by all mappers in the container.
   *
   * @example
   * import {Container} from 'js-data'
   * import HttpAdapter from 'js-data-http'
   * const container = new Container()
   * container.registerAdapter('http', new HttpAdapter, { default: true })
   *
   * @method Container#registerAdapter
   * @param {string} name The name of the adapter to register.
   * @param {Adapter} adapter The adapter to register.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.default=false] Whether to make the adapter the
   * default adapter for all Mappers in this container.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   */
  registerAdapter (name, adapter, opts) {
    opts || (opts = {})
    this.getAdapters()[name] = adapter
    // Optionally make it the default adapter for the target.
    if (opts === true || opts.default) {
      this.mapperDefaults.defaultAdapter = name
      utils.forOwn(this._mappers, function (mapper) {
        mapper.defaultAdapter = name
      })
    }
  }
}

toProxy.forEach(function (method) {
  props[method] = function (name, ...args) {
    return this.getMapper(name)[method](...args)
  }
})

/**
 * ```javascript
 * import {Container} from 'js-data'
 * ```
 *
 * The `Container` class is a place to store {@link Mapper} instances.
 *
 * Without a container, you need to manage mappers yourself, including resolving
 * circular dependencies among relations. All mappers in a container share the
 * same adapters, so you don't have to add each adapter to all of your mappers.
 *
 * @example <caption>Without Container</caption>
 * import {Mapper} from 'js-data'
 * import HttpAdapter from 'js-data-http'
 * const adapter = new HttpAdapter()
 * const userMapper = new Mapper({ name: 'user' })
 * userMapper.registerAdapter('http', adapter, { default: true })
 * const commentMapper = new Mapper({ name: 'comment' })
 * commentMapper.registerAdapter('http', adapter, { default: true })
 *
 * // This might be more difficult if the mappers were defined in different
 * // modules.
 * userMapper.hasMany(commentMapper, {
 *   localField: 'comments',
 *   foreignKey: 'userId'
 * })
 * commentMapper.belongsTo(userMapper, {
 *   localField: 'user',
 *   foreignKey: 'userId'
 * })
 *
 * @example <caption>With Container</caption>
 * import {Container} from 'js-data'
 * import HttpAdapter from 'js-data-http'
 * const container = new Container()
 * // All mappers in container share adapters
 * container.registerAdapter('http', new HttpAdapter(), { default: true })
 *
 * // These could be defined in separate modules without a problem.
 * container.defineMapper('user', {
 *   relations: {
 *     hasMany: {
 *       comment: {
 *         localField: 'comments',
 *         foreignKey: 'userId'
 *       }
 *     }
 *   }
 * })
 * container.defineMapper('comment', {
 *   relations: {
 *     belongsTo: {
 *       user: {
 *         localField: 'user',
 *         foreignKey: 'userId'
 *       }
 *     }
 *   }
 * })
 *
 * @class Container
 * @extends Component
 * @param {Object} [opts] Configuration options.
 * @param {Function} [opts.mapperClass] Constructor function to use in
 * {@link Container#defineMapper} to create a new mapper.
 * @param {Object} [opts.mapperDefaults] Defaults options to pass to
 * {@link Container#mapperClass} when creating a new mapper.
 * @returns {Container}
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#container","Components of JSData: Container"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/jsdata-and-the-browser","Notes on using JSData in the Browser"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/jsdata-and-nodejs","Notes on using JSData in Node.js"]
 */
export default Component.extend(props)

/**
 * Create a subclass of this Container.
 *
 * @example <caption>Extend the class in a cross-browser manner.</caption>
 * import {Container} from 'js-data'
 * const CustomContainerClass = Container.extend({
 *   foo () { return 'bar' }
 * })
 * const customContainer = new CustomContainerClass()
 * console.log(customContainer.foo()) // "bar"
 *
 * @example <caption>Extend the class using ES2015 class syntax.</caption>
 * class CustomContainerClass extends Container {
 *   foo () { return 'bar' }
 * }
 * const customContainer = new CustomContainerClass()
 * console.log(customContainer.foo()) // "bar"
 *
 * @method Container.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Container.
 * @since 3.0.0
 */
