import _ from './utils'
import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import Mapper from './Mapper'

const toProxy = [
  /**
   * Proxy for {@link Mapper#count}.
   *
   * @name Container#count
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object} [query] - Passed to {@link Model.count}.
   * @param {Object} [opts] - Passed to {@link Model.count}.
   * @return {Promise}
   */
  'count',

  /**
   * Proxy for {@link Mapper#create}.
   *
   * @name Container#create
   * @method
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} record Passed to {@link Mapper#create}.
   * @param {Object} [opts] Passed to {@link Mapper#create}. See
   * {@link Mapper#create} for more configuration options.
   * @return {Promise}
   */
  'create',

  /**
   * Proxy for {@link Mapper#createMany}.
   *
   * @name Container#createMany
   * @method
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Array} records Passed to {@link Mapper#createMany}.
   * @param {Object} [opts] Passed to {@link Mapper#createMany}. See
   * {@link Mapper#createMany} for more configuration options.
   * @return {Promise}
   */
  'createMany',

  /**
   * Proxy for {@link Mapper#createRecord}.
   *
   * @name Container#createRecord
   * @method
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} props Passed to {@link Mapper#createRecord}.
   * @param {Object} [opts] Passed to {@link Mapper#createRecord}. See
   * {@link Mapper#createRecord} for configuration options.
   * @return {Promise}
   */
  'createRecord',

  /**
   * Proxy for {@link Mapper#dbg}.
   *
   * @name Container#dbg
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {...*} args - Passed to {@link Mapper#dbg}.
   */
  'dbg',

  /**
   * Proxy for {@link Mapper#destroy}.
   *
   * @name Container#destroy
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {(string|number)} id - Passed to {@link Mapper#destroy}.
   * @param {Object} [opts] - Passed to {@link Mapper#destroy}. See
   * {@link Mapper#destroy} for more configuration options.
   * @return {Promise}
   */
  'destroy',

  /**
   * Proxy for {@link Mapper#destroyAll}.
   *
   * @name Container#destroyAll
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object} [query] - Passed to {@link Mapper#destroyAll}.
   * @param {Object} [opts] - Passed to {@link Mapper#destroyAll}. See
   * {@link Mapper#destroyAll} for more configuration options.
   * @return {Promise}
   */
  'destroyAll',

  /**
   * Proxy for {@link Mapper#find}.
   *
   * @name Container#emit
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {...*} args - Passed to {@link Mapper#emit}.
   */
  'emit',

  /**
   * Proxy for {@link Mapper#find}.
   *
   * @name Container#find
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {(string|number)} id - Passed to {@link Mapper#find}.
   * @param {Object} [opts] - Passed to {@link Mapper#find}.
   * @return {Promise}
   */
  'find',

  /**
   * Proxy for {@link Mapper#createRecord}.
   *
   * @name Container#findAll
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object} [query] - Passed to {@link Model.findAll}.
   * @param {Object} [opts] - Passed to {@link Model.findAll}.
   * @return {Promise}
   */
  'findAll',

  /**
   * Proxy for {@link Mapper#is}.
   *
   * @name Container#getSchema
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   */
  'getSchema',

  /**
   * Proxy for {@link Mapper#is}.
   *
   * @name Container#is
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {...*} args - Passed to {@link Mapper#is}.
   */
  'is',

  /**
   * Proxy for {@link Mapper#log}.
   *
   * @name Container#log
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {...*} args - Passed to {@link Mapper#log}.
   */
  'log',

  /**
   * Proxy for {@link Mapper#off}.
   *
   * @name Container#off
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {...*} args - Passed to {@link Mapper#off}.
   */
  'off',

  /**
   * Proxy for {@link Mapper#on}.
   *
   * @name Container#on
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {...*} args - Passed to {@link Mapper#on}.
   */
  'on',

  /**
   * Proxy for {@link Mapper#sum}.
   *
   * @name Container#sum
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {string} field - Passed to {@link Model.sum}.
   * @param {Object} [query] - Passed to {@link Model.sum}.
   * @param {Object} [opts] - Passed to {@link Model.sum}.
   * @return {Promise}
   */
  'sum',

  /**
   * Proxy for {@link Mapper#toJSON}.
   *
   * @name Container#toJSON
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {...*} args - Passed to {@link Mapper#toJSON}.
   */
  'toJSON',

  /**
   * Proxy for {@link Mapper#update}.
   *
   * @name Container#update
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {(string|number)} id - Passed to {@link Mapper#update}.
   * @param {Object} record - Passed to {@link Mapper#update}.
   * @param {Object} [opts] - Passed to {@link Mapper#update}. See
   * {@link Mapper#update} for more configuration options.
   * @return {Promise}
   */
  'update',

  /**
   * Proxy for {@link Mapper#updateAll}.
   *
   * @name Container#updateAll
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object?} query - Passed to {@link Model.updateAll}.
   * @param {Object} props - Passed to {@link Model.updateAll}.
   * @param {Object} [opts] - Passed to {@link Model.updateAll}. See
   * {@link Model.updateAll} for more configuration options.
   * @return {Promise}
   */
  'updateAll',

  /**
   * Proxy for {@link Mapper#updateMany}.
   *
   * @name Container#updateMany
   * @method
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records Passed to {@link Mapper#updateMany}.
   * @param {Object} [opts] Passed to {@link Mapper#updateMany}. See
   * {@link Mapper#updateMany} for more configuration options.
   * @return {Promise}
   */
  'updateMany'
]

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
 * @param {Object} [opts] Configuration options.
 * @param {Function} [opts.MapperClass] Constructor function to use in
 * {@link Container#defineMapper} to create a new mapper.
 * @param {Object} [opts.mapperDefaults] Defaults options to pass to
 * {@link Container#MapperClass} when creating a new mapper.
 * @return {Container}
 */
export default function Container (opts) {
  const self = this
  _.classCallCheck(self, Container)

  opts || (opts = {})
  // Apply options provided by the user
  _.fillIn(self, opts)
  /**
   * Defaults options to pass to {@link Container#MapperClass} when creating a
   * new mapper.
   *
   * @name Container#mapperDefaults
   * @type {Object}
   */
  self.mapperDefaults = self.mapperDefaults || {}
  /**
   * Constructor function to use in {@link Container#defineMapper} to create a
   * new mapper.
   *
   * @name Container#MapperClass
   * @type {Function}
   */
  self.MapperClass = self.MapperClass || Mapper

  // Initilize private data

  // Holds the adapters, shared by all mappers in this container
  self._adapters = {}
  // The the mappers in this container
  self._mappers = {}
}

/**
 * Create a Container subclass.
 *
 * @example
 * var MyContainer = Container.extend({
 *   foo: function () { return 'bar' }
 * })
 * var container = new MyContainer()
 * container.foo() // "bar"
 *
 * @name Container.extend
 * @method
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @return {Function} Subclass of Container.
 */
Container.extend = _.extend

_.addHiddenPropsToTarget(Container.prototype, {
  /**
   * Create a new mapper and register it in this container.
   *
   * @example
   * import {Container} from 'js-data'
   * const container = new Container({
   *   mapperDefaults: { foo: 'bar' }
   * })
   * const userMapper = container.defineMapper('user')
   * userMapper.foo // "bar"
   *
   * @name Container#defineMapper
   * @method
   * @param {string} name Name under which to register the new {@link Mapper}.
   * {@link Mapper#name} will be set to this value.
   * @param {Object} [opts] Configuration options. Passed to
   * {@link Container#MapperClass} when creating the new {@link Mapper}.
   * @return {Mapper}
   */
  defineMapper (name, opts) {
    const self = this

    // For backwards compatibility with defineResource
    if (_.isObject(name)) {
      opts = name
      if (!opts.name) {
        throw new Error('name is required!')
      }
      name = opts.name
    } else if (!_.isString(name)) {
      throw new Error('name is required!')
    }

    // Default values for arguments
    opts || (opts = {})
    // Set Mapper#name
    opts.name = name
    opts.relations || (opts.relations = {})

    // Check if the user is overriding the datastore's default MapperClass
    const MapperClass = opts.MapperClass || self.MapperClass
    delete opts.MapperClass

    // Apply the datastore's defaults to the options going into the mapper
    _.fillIn(opts, self.mapperDefaults)

    // Instantiate a mapper
    const mapper = self._mappers[name] = new MapperClass(opts)
    // Make sure the mapper's name is set
    mapper.name = name
    // All mappers in this datastore will share adapters
    mapper._adapters = self.getAdapters()

    // Setup the mapper's relations, including generating Mapper#relationList
    // and Mapper#relationFields
    _.forOwn(mapper.relations, function (group, type) {
      _.forOwn(group, function (relations, _name) {
        if (_.isObject(relations)) {
          relations = [relations]
        }
        relations.forEach(function (def) {
          def.getRelation = function () {
            return self.getMapper(_name)
          }
          const Relation = self._mappers[_name] || _name
          if (type === belongsToType) {
            mapper.belongsTo(Relation, def)
          } else if (type === hasOneType) {
            mapper.hasOne(Relation, def)
          } else if (type === hasManyType) {
            mapper.hasMany(Relation, def)
          }
        })
      })
    })

    return mapper
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @name Container#getAdapter
   * @method
   * @param {string} [name] The name of the adapter to retrieve.
   * @return {Adapter} The adapter.
   */
  getAdapter (name) {
    const self = this
    const adapter = self.getAdapterName(name)
    if (!adapter) {
      throw new ReferenceError(`${adapter} not found!`)
    }
    return self.getAdapters()[adapter]
  },

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided.
   *
   * @name Container#getAdapterName
   * @method
   * @param {(Object|string)} [opts] The name of an adapter or options, if any.
   * @return {string} The name of the adapter.
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (_.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || this.mapperDefaults.defaultAdapter
  },

  /**
   * Return the registered adapters of this container.
   *
   * @name Container#getAdapters
   * @method
   * @return {Adapter}
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
   * @name Container#getMapper
   * @method
   * @param {string} name {@link Mapper#name}.
   * @return {Mapper}
   */
  getMapper (name) {
    const mapper = this._mappers[name]
    if (!mapper) {
      throw new ReferenceError(`${name} is not a registered mapper!`)
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
   * @name Container#registerAdapter
   * @method
   * @param {string} name The name of the adapter to register.
   * @param {Adapter} adapter The adapter to register.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.default=false] Whether to make the adapter the
   * default adapter for all Mappers in this container.
   */
  registerAdapter (name, adapter, opts) {
    const self = this
    opts || (opts = {})
    self.getAdapters()[name] = adapter
    // Optionally make it the default adapter for the target.
    if (opts === true || opts.default) {
      self.mapperDefaults.defaultAdapter = name
      _.forOwn(self._mappers, function (mapper) {
        mapper.defaultAdapter = name
      })
    }
  }
})

const toAdd = {}
toProxy.forEach(function (method) {
  toAdd[method] = function (name, ...args) {
    return this.getMapper(name)[method](...args)
  }
})
_.addHiddenPropsToTarget(Container.prototype, toAdd)
