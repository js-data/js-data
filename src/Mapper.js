import utils from './utils'
import Component from './Component'
import Record from './Record'
import Schema from './Schema'
import { Relation } from './relations'
import {
  belongsTo,
  belongsToType,
  hasMany,
  hasManyType,
  hasOne,
  hasOneType
} from './decorators'

const DOMAIN = 'Mapper'
const validatingHooks = [
  'beforeCreate',
  'beforeCreateMany',
  'beforeUpdate',
  'beforeUpdateAll',
  'beforeUpdateMany'
]
const makeNotify = function (num) {
  return function (...args) {
    const opts = args[args.length - num]
    const op = opts.op
    this.dbg(op, ...args)

    // Automatic validation
    if (validatingHooks.indexOf(op) !== -1 && opts.validate !== false) {
      // Save current value of option
      const originalExistingOnly = opts.existingOnly

      // For updates, ignore required fields if they aren't present
      if (op.indexOf('beforeUpdate') === 0 && utils.isUndefined(opts.existingOnly)) {
        opts.existingOnly = true
      }
      const errors = this.validate(args[op === 'beforeUpdate' ? 1 : 0], utils.pick(opts, ['existingOnly']))

      // Restore option
      opts.existingOnly = originalExistingOnly

      // Abort lifecycle due to validation errors
      if (errors) {
        return utils.reject(errors)
      }
    }

    // Emit lifecycle event
    if (opts.notify || (opts.notify === undefined && this.notify)) {
      setTimeout(() => {
        this.emit(op, ...args)
      })
    }
  }
}

// These are the default implementations of all of the lifecycle hooks
const notify = makeNotify(1)
const notify2 = makeNotify(2)

// This object provides meta information used by Mapper#crud to actually
// execute each lifecycle method
const LIFECYCLE_METHODS = {
  count: {
    defaults: [{}, {}],
    skip: true,
    types: []
  },
  destroy: {
    defaults: [{}, {}],
    skip: true,
    types: []
  },
  destroyAll: {
    defaults: [{}, {}],
    skip: true,
    types: []
  },
  find: {
    defaults: [undefined, {}],
    types: []
  },
  findAll: {
    defaults: [{}, {}],
    types: []
  },
  sum: {
    defaults: [undefined, {}, {}],
    skip: true,
    types: []
  },
  update: {
    adapterArgs (mapper, id, props, opts) {
      return [id, mapper.toJSON(props, opts), opts]
    },
    beforeAssign: 1,
    defaults: [undefined, {}, {}],
    types: []
  },
  updateAll: {
    adapterArgs (mapper, props, query, opts) {
      return [mapper.toJSON(props, opts), query, opts]
    },
    beforeAssign: 0,
    defaults: [{}, {}, {}],
    types: []
  },
  updateMany: {
    adapterArgs (mapper, records, opts) {
      return [records.map(function (record) {
        return mapper.toJSON(record, opts)
      }), opts]
    },
    beforeAssign: 0,
    defaults: [[], {}],
    types: []
  }
}

const MAPPER_DEFAULTS = {
  /**
   * Hash of registered adapters. Don't modify directly. Use
   * {@link Mapper#registerAdapter} instead.
   *
   * @default {}
   * @name Mapper#_adapters
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   */
  _adapters: {},

  /**
   * Whether to augment {@link Mapper#recordClass} with ES5 getters and setters
   * according to the properties defined in {@link Mapper#schema}. This makes
   * possible validation and change tracking on individual properties
   * when using the dot (e.g. `user.name = "Bob"`) operator to modify a
   * property, and is `true` by default.
   *
   * @default true
   * @name Mapper#applySchema
   * @since 3.0.0
   * @type {boolean}
   */
  applySchema: true,

  /**
   * The name of the registered adapter that this Mapper should used by default.
   *
   * @default "http"
   * @name Mapper#defaultAdapter
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   * @type {string}
   */
  defaultAdapter: 'http',

  /**
   * The field used as the unique identifier on records handled by this Mapper.
   *
   * @default id
   * @name Mapper#idAttribute
   * @since 3.0.0
   * @type {string}
   */
  idAttribute: 'id',

  /**
   * Whether this Mapper should emit operational events.
   *
   * @default true
   * @name Mapper#notify
   * @since 3.0.0
   * @type {boolean}
   */
  notify: true,

  /**
   * Whether {@link Mapper#create}, {@link Mapper#createMany},
   * {@link Mapper#update}, {@link Mapper#updateAll}, {@link Mapper#updateMany},
   * {@link Mapper#find}, {@link Mapper#findAll}, {@link Mapper#destroy},
   * {@link Mapper#destroyAll}, {@link Mapper#count}, and {@link Mapper#sum}
   * should return a raw result object that contains both the instance data
   * returned by the adapter _and_ metadata about the operation.
   *
   * The default is to NOT return the result object, and instead return just the
   * instance data.
   *
   * @default false
   * @name Mapper#raw
   * @since 3.0.0
   * @type {boolean}
   */
  raw: false
}

/**
 * The core of JSData's [ORM/ODM][orm] implementation. Given a minimum amout of
 * meta information about a resource, a Mapper can perform generic CRUD
 * operations against that resource. Apart from its configuration, a Mapper is
 * stateless. The particulars of various persistence layers have been abstracted
 * into adapters, which a Mapper uses to perform its operations.
 *
 * The term "Mapper" comes from the [Data Mapper Pattern][pattern] described in
 * Martin Fowler's [Patterns of Enterprise Application Architecture][book]. A
 * Data Mapper moves data between [in-memory object instances][record] and a
 * relational or document-based database. JSData's Mapper can work with any
 * persistence layer you can write an adapter for.
 *
 * _("Model" is a heavily overloaded term and is avoided in this documentation
 * to prevent confusion.)_
 *
 * [orm]: https://en.wikipedia.org/wiki/Object-relational_mapping
 * [pattern]: https://en.wikipedia.org/wiki/Data_mapper_pattern
 * [book]: http://martinfowler.com/books/eaa.html
 * [record]: Record.html
 *
 * @example <caption>Import and instantiate</caption>
 * import {Mapper} from 'js-data'
 *
 * const UserService = new Mapper({ name: 'user' })
 *
 * @example <caption>Define a Mapper using the Container component</caption>
 * import {Container} from 'js-data'
 *
 * const store = new Container()
 * store.defineMapper('user')
 *
 * @class Mapper
 * @extends Component
 * @param {Object} opts Configuration options.
 * @param {boolean} [opts.applySchema=true] See {@link Mapper#applySchema}.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {string} [opts.defaultAdapter=http] See {@link Mapper#defaultAdapter}.
 * @param {string} [opts.idAttribute=id] See {@link Mapper#idAttribute}.
 * @param {string} opts.name See {@link Mapper#name}.
 * @param {boolean} [opts.notify] See {@link Mapper#notify}.
 * @param {boolean} [opts.raw=false] See {@link Mapper#raw}.
 * @param {Function|boolean} [opts.recordClass] See {@link Mapper#recordClass}.
 * @returns {Mapper} A new {@link Mapper} instance.
 * @see http://www.js-data.io/v3.0/docs/components-of-jsdata#mapper
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#mapper","Components of JSData: Mapper"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/modeling-your-data","Modeling your data"]
 */
function Mapper (opts) {
  utils.classCallCheck(this, Mapper)
  Component.call(this)
  opts || (opts = {})

  // Prepare certain properties to be non-enumerable
  Object.defineProperties(this, {
    _adapters: {
      value: undefined,
      writable: true
    },

    /**
     * Set to `false` to force the Mapper to work with POJO objects only.
     *
     * @example <caption>Use POJOs only.</caption>
     * import {Mapper, Record} from 'js-data'
     * const UserMapper = new Mapper({ recordClass: false })
     * UserMapper.recordClass // false
     * const user = UserMapper#createRecord()
     * user instanceof Record // false
     *
     * @example <caption>Set to a custom class to have records wrapped in your custom class.</caption>
     * import {Mapper, Record} from 'js-data'
     *  // Custom class
     * class User {
     *   constructor (props = {}) {
     *     for (var key in props) {
     *       if (props.hasOwnProperty(key)) {
     *         this[key] = props[key]
     *       }
     *     }
     *   }
     * }
     * const UserMapper = new Mapper({ recordClass: User })
     * UserMapper.recordClass // function User() {}
     * const user = UserMapper#createRecord()
     * user instanceof Record // false
     * user instanceof User // true
     *
     *
     * @example <caption>Extend the {@link Record} class.</caption>
     * import {Mapper, Record} from 'js-data'
     *  // Custom class
     * class User extends Record {
     *   constructor () {
     *     super(props)
     *   }
     * }
     * const UserMapper = new Mapper({ recordClass: User })
     * UserMapper.recordClass // function User() {}
     * const user = UserMapper#createRecord()
     * user instanceof Record // true
     * user instanceof User // true
     *
     * @name Mapper#recordClass
     * @default {@link Record}
     * @see Record
     * @since 3.0.0
     */
    recordClass: {
      value: undefined,
      writable: true
    },

    /**
     * The meta information describing this Mapper's available lifecycle
     * methods. __Do not modify.__
     *
     * TODO: Improve documentation.
     *
     * @name Mapper#lifecycleMethods
     * @since 3.0.0
     * @type {Object}
     */
    lifecycleMethods: {
      value: LIFECYCLE_METHODS
    },

    /**
     * This Mapper's {@link Schema}.
     *
     * @name Mapper#schema
     * @see Schema
     * @since 3.0.0
     * @type {Schema}
     */
    schema: {
      value: undefined,
      writable: true
    }
  })

  // Apply user-provided configuration
  utils.fillIn(this, opts)
  // Fill in any missing options with the defaults
  utils.fillIn(this, utils.copy(MAPPER_DEFAULTS))

  /**
   * The name for this Mapper. This is the minimum amount of meta information
   * required for a Mapper to be able to execute CRUD operations for a
   * Resource.
   *
   * @name Mapper#name
   * @since 3.0.0
   * @type {string}
   */
  if (!this.name) {
    throw utils.err(`new ${DOMAIN}`, 'opts.name')(400, 'string', this.name)
  }

  // Setup schema, with an empty default schema if necessary
  if (!(this.schema instanceof Schema)) {
    this.schema = new Schema(this.schema || {})
  }

  if (this.schema instanceof Schema) {
    this.schema.type || (this.schema.type = 'object')
  }

  // Create a subclass of Record that's tied to this Mapper
  if (utils.isUndefined(this.recordClass)) {
    const superClass = Record
    this.recordClass = superClass.extend({
      constructor: (function Record () {
        var subClass = function Record (props, opts) {
          utils.classCallCheck(this, subClass)
          superClass.call(this, props, opts)
        }
        return subClass
      })()
    })
  }

  if (this.recordClass) {
    this.recordClass.mapper = this

    // We can only apply the schema to the prototype of this.recordClass if the
    // class extends Record
    if (utils.getSuper(this.recordClass, true) === Record && this.schema && this.schema.apply && this.applySchema) {
      this.schema.apply(this.recordClass.prototype)
    }
  }
}

export default Component.extend({
  constructor: Mapper,

  /**
   * Mapper lifecycle hook called by {@link Mapper#count}. If this method
   * returns a promise then {@link Mapper#count} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterCount
   * @param {Object} query The `query` argument passed to {@link Mapper#count}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#count}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterCount: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#create}. If this method
   * returns a promise then {@link Mapper#create} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterCreate
   * @param {Object} props The `props` argument passed to {@link Mapper#create}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterCreate: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
   * returns a promise then {@link Mapper#createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterCreateMany
   * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterCreateMany: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
   * returns a promise then {@link Mapper#destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterDestroy
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterDestroy: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
   * returns a promise then {@link Mapper#destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterDestroyAll
   * @param {*} data The `data` returned by the adapter.
   * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterDestroyAll: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#find}. If this method
   * returns a promise then {@link Mapper#find} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterFind
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterFind: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
   * returns a promise then {@link Mapper#findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterFindAll
   * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterFindAll: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#sum}. If this method
   * returns a promise then {@link Mapper#sum} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterSum
   * @param {Object} query The `query` argument passed to {@link Mapper#sum}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#sum}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterSum: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#update}. If this method
   * returns a promise then {@link Mapper#update} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterUpdate
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
   * @param {props} props The `props` argument passed to {@link Mapper#update}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterUpdate: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
   * returns a promise then {@link Mapper#updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterUpdateAll
   * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
   * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterUpdateAll: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
   * returns a promise then {@link Mapper#updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#afterUpdateMany
   * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
   * @param {*} result The result, if any.
   * @since 3.0.0
   */
  afterUpdateMany: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#create}. If this method
   * returns a promise then {@link Mapper#create} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeCreate
   * @param {Object} props The `props` argument passed to {@link Mapper#create}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
   * @since 3.0.0
   */
  beforeCreate: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
   * returns a promise then {@link Mapper#createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeCreateMany
   * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
   * @since 3.0.0
   */
  beforeCreateMany: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#count}. If this method
   * returns a promise then {@link Mapper#count} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeCount
   * @param {Object} query The `query` argument passed to {@link Mapper#count}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#count}.
   * @since 3.0.0
   */
  beforeCount: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
   * returns a promise then {@link Mapper#destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeDestroy
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
   * @since 3.0.0
   */
  beforeDestroy: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
   * returns a promise then {@link Mapper#destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeDestroyAll
   * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
   * @since 3.0.0
   */
  beforeDestroyAll: notify,

  /**
   * Mappers lifecycle hook called by {@link Mapper#find}. If this method
   * returns a promise then {@link Mapper#find} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeFind
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
   * @since 3.0.0
   */
  beforeFind: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
   * returns a promise then {@link Mapper#findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeFindAll
   * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
   * @since 3.0.0
   */
  beforeFindAll: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#sum}. If this method
   * returns a promise then {@link Mapper#sum} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeSum
   * @param {string} field The `field` argument passed to {@link Mapper#sum}.
   * @param {Object} query The `query` argument passed to {@link Mapper#sum}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#sum}.
   * @since 3.0.0
   */
  beforeSum: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#update}. If this method
   * returns a promise then {@link Mapper#update} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeUpdate
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
   * @param {props} props The `props` argument passed to {@link Mapper#update}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
   * @since 3.0.0
   */
  beforeUpdate: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
   * returns a promise then {@link Mapper#updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeUpdateAll
   * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
   * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
   * @since 3.0.0
   */
  beforeUpdateAll: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
   * returns a promise then {@link Mapper#updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @method Mapper#beforeUpdateMany
   * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
   * @since 3.0.0
   */
  beforeUpdateMany: notify,

  /**
   * This method is called at the end of most lifecycle methods. It does the
   * following:
   *
   * 1. If `opts.raw` is `true`, add this Mapper's configuration to the `opts`
   * argument as metadata for the operation.
   * 2. Wrap the result data appropriately using {@link Mapper#wrap}, which
   * calls {@link Mapper#createRecord}.
   *
   * @method Mapper#_end
   * @private
   * @since 3.0.0
   */
  _end (result, opts, skip) {
    if (opts.raw) {
      utils._(result, opts)
    }
    if (skip) {
      return result
    }
    let _data = opts.raw ? result.data : result
    if (_data && utils.isFunction(this.wrap)) {
      _data = this.wrap(_data, opts)
      if (opts.raw) {
        result.data = _data
      } else {
        result = _data
      }
    }
    return result
  },

  /**
   * Define a belongsTo relationship. Only useful if you're managing your
   * Mappers manually and not using a Container or DataStore component.
   *
   * @example
   * PostService.belongsTo(UserService, {
   *   // post.user_id points to user.id
   *   foreignKey: 'user_id'
   *   // user records will be attached to post records at "post.user"
   *   localField: 'user'
   * })
   *
   * CommentService.belongsTo(UserService, {
   *   // comment.user_id points to user.id
   *   foreignKey: 'user_id'
   *   // user records will be attached to comment records at "comment.user"
   *   localField: 'user'
   * })
   * CommentService.belongsTo(PostService, {
   *   // comment.post_id points to post.id
   *   foreignKey: 'post_id'
   *   // post records will be attached to comment records at "comment.post"
   *   localField: 'post'
   * })
   *
   * @method Mapper#belongsTo
   * @see http://www.js-data.io/v3.0/docs/relations
   * @since 3.0.0
   */
  belongsTo (relatedMapper, opts) {
    return belongsTo(relatedMapper, opts)(this)
  },

  /**
   * Select records according to the `query` argument and return the count.
   *
   * {@link Mapper#beforeCount} will be called before calling the adapter.
   * {@link Mapper#afterCount} will be called after calling the adapter.
   *
   * @example <caption>Get the number of published blog posts</caption>
   * PostService.count({ status: 'published' }).then((numPublished) => {
   *   console.log(numPublished) // e.g. 45
   * })
   *
   * @method Mapper#count
   * @param {Object} [query={}] Selection query. See {@link query}.
   * @param {Object} [query.where] See {@link query.where}.
   * @param {number} [query.offset] See {@link query.offset}.
   * @param {number} [query.limit] See {@link query.limit}.
   * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options. Refer to the `count` method
   * of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @returns {Promise} Resolves with the count of the selected records.
   * @since 3.0.0
   */
  count (query, opts) {
    return this.crud('count', query, opts)
  },

  /**
   * Create and save a new the record using the provided `props`.
   *
   * {@link Mapper#beforeCreate} will be called before calling the adapter.
   * {@link Mapper#afterCreate} will be called after calling the adapter.
   *
   * @example <caption>Create and save a new blog post</caption>
   * PostService.create({
   *   title: 'Modeling your data',
   *   status: 'draft'
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'draft', ... }
   * })
   *
   * @method Mapper#create
   * @param {Object} props The properties for the new record.
   * @param {Object} [opts] Configuration options. Refer to the `create` method
   * of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading
   * create if `props` contains nested relations. NOT performed in a
   * transaction. Each nested create will result in another {@link Mapper#create}
   * or {@link Mapper#createMany} call.
   * @param {string[]} [opts.pass=[]] Relations to send to the adapter as part
   * of the payload. Normally relations are not sent.
   * @returns {Promise} Resolves with the created record.
   * @since 3.0.0
   */
  create (props, opts) {
    let op, adapter
    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    utils._(opts, this)
    adapter = opts.adapter = this.getAdapterName(opts)

    // beforeCreate lifecycle hook
    op = opts.op = 'beforeCreate'
    return utils.resolve(this[op](props, opts)).then((_props) => {
      // Allow for re-assignment from lifecycle hook
      props = utils.isUndefined(_props) ? props : _props

      // Deep pre-create belongsTo relations
      const belongsToRelationData = {}
      opts.with || (opts.with = [])
      let tasks = []
      utils.forEachRelation(this, opts, (def, optsCopy) => {
        const relationData = def.getLocalField(props)
        const relatedMapper = def.getRelation()
        const relatedIdAttribute = relatedMapper.idAttribute
        optsCopy.raw = false
        if (!relationData) {
          return
        }
        if (def.type === belongsToType) {
          // Create belongsTo relation first because we need a generated id to
          // attach to the child
          tasks.push(relatedMapper.create(relationData, optsCopy).then((data) => {
            def.setLocalField(belongsToRelationData, data)
            def.setForeignKey(props, data)
          }))
        } else if (def.type === hasManyType && def.localKeys) {
          // Create his hasMany relation first because it uses localKeys
          tasks.push(relatedMapper.createMany(relationData, optsCopy).then((data) => {
            def.setLocalField(belongsToRelationData, data)
            utils.set(props, def.localKeys, data.map((record) => utils.get(record, relatedIdAttribute)))
          }))
        }
      })
      return utils.Promise.all(tasks).then(() => {
        // Now delegate to the adapter for the main create
        op = opts.op = 'create'
        this.dbg(op, props, opts)
        return utils.resolve(this.getAdapter(adapter)[op](this, this.toJSON(props, { with: opts.pass || [] }), opts))
      }).then((data) => {
        const createdRecord = opts.raw ? data.data : data
        // Deep post-create hasMany and hasOne relations
        tasks = []
        utils.forEachRelation(this, opts, (def, optsCopy) => {
          const relationData = def.getLocalField(props)
          if (!relationData) {
            return
          }
          optsCopy.raw = false
          let task
          // Create hasMany and hasOne after the main create because we needed
          // a generated id to attach to these items
          if (def.type === hasManyType && def.foreignKey) {
            def.setForeignKey(createdRecord, relationData)
            task = def.getRelation().createMany(relationData, optsCopy).then((data) => {
              def.setLocalField(createdRecord, data)
            })
          } else if (def.type === hasOneType) {
            def.setForeignKey(createdRecord, relationData)
            task = def.getRelation().create(relationData, optsCopy).then((data) => {
              def.setLocalField(createdRecord, data)
            })
          } else if (def.type === belongsToType && def.getLocalField(belongsToRelationData)) {
            def.setLocalField(createdRecord, def.getLocalField(belongsToRelationData))
          } else if (def.type === hasManyType && def.localKeys && def.getLocalField(belongsToRelationData)) {
            def.setLocalField(createdRecord, def.getLocalField(belongsToRelationData))
          }
          if (task) {
            tasks.push(task)
          }
        })
        return utils.Promise.all(tasks).then(() => {
          return data
        })
      })
    }).then((result) => {
      result = this._end(result, opts)
      // afterCreate lifecycle hook
      op = opts.op = 'afterCreate'
      return utils.resolve(this[op](props, opts, result)).then((_result) => {
        // Allow for re-assignment from lifecycle hook
        return utils.isUndefined(_result) ? result : _result
      })
    })
  },

  /**
   * Use {@link Mapper#createRecord} instead.
   * @deprecated
   * @method Mapper#createInstance
   * @param {Object|Array} props See {@link Mapper#createRecord}.
   * @param {Object} [opts] See {@link Mapper#createRecord}.
   * @returns {Object|Array} See {@link Mapper#createRecord}.
   * @see Mapper#createRecord
   * @since 3.0.0
   */
  createInstance (props, opts) {
    return this.createRecord(props, opts)
  },

  /**
   * Given an array of records, batch create them via an adapter.
   *
   * {@link Mapper#beforeCreateMany} will be called before calling the adapter.
   * {@link Mapper#afterCreateMany} will be called after calling the adapter.
   *
   * @example <caption>Create and save several new blog posts</caption>
   * PostService.createMany([{
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
   * @method Mapper#createMany
   * @param {Record[]} records Array of records to be created in one batch.
   * @param {Object} [opts] Configuration options. Refer to the `createMany`
   * method of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading
   * create if `records` contains nested relations. NOT performed in a
   * transaction. Each nested create will result in another {@link Mapper#createMany}
   * call.
   * @param {string[]} [opts.pass=[]] Relations to send to the adapter as part
   * of the payload. Normally relations are not sent.
   * @returns {Promise} Resolves with the created records.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  createMany (records, opts) {
    let op, adapter
    // Default values for arguments
    records || (records = [])
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    utils._(opts, this)
    adapter = opts.adapter = this.getAdapterName(opts)

    // beforeCreateMany lifecycle hook
    op = opts.op = 'beforeCreateMany'
    return utils.resolve(this[op](records, opts)).then((_records) => {
      // Allow for re-assignment from lifecycle hook
      records = utils.isUndefined(_records) ? records : _records

      // Deep pre-create belongsTo relations
      const belongsToRelationData = {}
      opts.with || (opts.with = [])
      let tasks = []
      utils.forEachRelation(this, opts, (def, optsCopy) => {
        const relationData = records
          .map((record) => def.getLocalField(record))
          .filter((relatedRecord) => relatedRecord)
        if (def.type === belongsToType && relationData.length === records.length) {
          // Create belongsTo relation first because we need a generated id to
          // attach to the child
          tasks.push(def.getRelation().createMany(relationData, optsCopy).then((data) => {
            const relatedRecords = optsCopy.raw ? data.data : data
            def.setLocalField(belongsToRelationData, relatedRecords)
            records.forEach((record, i) => {
              def.setForeignKey(record, relatedRecords[i])
            })
          }))
        }
      })
      return utils.Promise.all(tasks).then(() => {
        // Now delegate to the adapter
        op = opts.op = 'createMany'
        const json = records.map((record) => this.toJSON(record, { with: opts.pass || [] }))
        this.dbg(op, records, opts)
        return utils.resolve(this.getAdapter(adapter)[op](this, json, opts))
      }).then((data) => {
        const createdRecords = opts.raw ? data.data : data

        // Deep post-create hasOne relations
        tasks = []
        utils.forEachRelation(this, opts, (def, optsCopy) => {
          const relationData = records
            .map((record) => def.getLocalField(record))
            .filter((relatedRecord) => relatedRecord)
          if (relationData.length !== records.length) {
            return
          }
          const belongsToData = def.getLocalField(belongsToRelationData)
          let task
          // Create hasMany and hasOne after the main create because we needed
          // a generated id to attach to these items
          if (def.type === hasManyType) {
            // Not supported
            this.log('warn', 'deep createMany of hasMany type not supported!')
          } else if (def.type === hasOneType) {
            createdRecords.forEach((createdRecord, i) => {
              def.setForeignKey(createdRecord, relationData[i])
            })
            task = def.getRelation().createMany(relationData, optsCopy).then((data) => {
              const relatedData = opts.raw ? data.data : data
              createdRecords.forEach((createdRecord, i) => {
                def.setLocalField(createdRecord, relatedData[i])
              })
            })
          } else if (def.type === belongsToType && belongsToData && belongsToData.length === createdRecords.length) {
            createdRecords.forEach((createdRecord, i) => {
              def.setLocalField(createdRecord, belongsToData[i])
            })
          }
          if (task) {
            tasks.push(task)
          }
        })
        return utils.Promise.all(tasks).then(() => data)
      })
    }).then((result) => {
      result = this._end(result, opts)
      // afterCreateMany lifecycle hook
      op = opts.op = 'afterCreateMany'
      return utils.resolve(this[op](records, opts, result)).then((_result) => {
        // Allow for re-assignment from lifecycle hook
        return utils.isUndefined(_result) ? result : _result
      })
    })
  },

  /**
   * Create an unsaved, uncached instance of this Mapper's
   * {@link Mapper#recordClass}.
   *
   * Returns `props` if `props` is already an instance of
   * {@link Mapper#recordClass}.
   *
   * __Note:__ This method does __not__ interact with any adapter, and does
   * __not__ save any data. It only creates new objects in memory.
   *
   * @example <caption>Create empty unsaved record instance</caption>
   * const post = PostService.createRecord()
   *
   * @example <caption>Create an unsaved record instance with inital properties</caption>
   * const post = PostService.createRecord({
   *   title: 'Modeling your data',
   *   status: 'draft'
   * })
   *
   * @example <caption>Create a record instance that corresponds to a saved record</caption>
   * const post = PostService.createRecord({
   *   // JSData thinks this record has been saved if it has a primary key
   *   id: 1234,
   *   title: 'Modeling your data',
   *   status: 'draft'
   * })
   *
   * @example <caption>Create record instances from an array</caption>
   * const posts = PostService.createRecord([{
   *   title: 'Modeling your data',
   *   status: 'draft'
   * }, {
   *   title: 'Reading data',
   *   status: 'draft'
   * }])
   *
   * @example <caption>Records are validated by default</caption>
   * import {Mapper} from 'js-data'
   * const PostService = new Mapper({
   *   name: 'post',
   *   schema: { properties: { title: { type: 'string' } } }
   * })
   * try {
   *   const post = PostService.createRecord({
   *     title: 1234,
   *   })
   * } catch (err) {
   *   console.log(err.errors) // [{ expected: 'one of (string)', actual: 'number', path: 'title' }]
   * }
   *
   * @example <caption>Skip validation</caption>
   * import {Mapper} from 'js-data'
   * const PostService = new Mapper({
   *   name: 'post',
   *   schema: { properties: { title: { type: 'string' } } }
   * })
   * const post = PostService.createRecord({
   *   title: 1234,
   * }, { noValidate: true })
   * console.log(post.isValid()) // false
   *
   * @method Mapper#createRecord
   * @param {Object|Object[]} props The properties for the Record instance or an
   * array of property objects for the Record instances.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.noValidate=false] Whether to skip validation when
   * the Record instances are created.
   * @returns {Record|Record[]} The Record instance or Record instances.
   * @since 3.0.0
   */
  createRecord (props, opts) {
    props || (props = {})
    if (utils.isArray(props)) {
      return props.map((_props) => this.createRecord(_props, opts))
    }
    if (!utils.isObject(props)) {
      throw utils.err(`${DOMAIN}#createRecord`, 'props')(400, 'array or object', props)
    }
    const recordClass = this.recordClass
    const relationList = this.relationList || []
    relationList.forEach(function (def) {
      const relatedMapper = def.getRelation()
      const relationData = def.getLocalField(props)
      if (relationData && !relatedMapper.is(relationData)) {
        if (utils.isArray(relationData) && (!relationData.length || relatedMapper.is(relationData[0]))) {
          return
        }
        utils.set(props, def.localField, relatedMapper.createRecord(relationData, opts))
      }
    })
    // Check to make sure "props" is not already an instance of this Mapper.
    return recordClass ? (props instanceof recordClass ? props : new recordClass(props, opts)) : props // eslint-disable-line
  },

  /**
   * Lifecycle invocation method.
   *
   * TODO: Improve documentation for this method.
   *
   * @method Mapper#crud
   * @param {string} method Name of the lifecycle method to invoke.
   * @param {...*} args Arguments to pass to the lifecycle method.
   * @returns {Promise}
   * @since 3.0.0
   */
  crud (method, ...args) {
    const config = this.lifecycleMethods[method]
    if (!config) {
      throw utils.err(`${DOMAIN}#crud`, method)(404, 'method')
    }

    const upper = `${method.charAt(0).toUpperCase()}${method.substr(1)}`
    const before = `before${upper}`
    const after = `after${upper}`

    let op, adapter

    // Default values for arguments
    config.defaults.forEach((value, i) => {
      if (utils.isUndefined(args[i])) {
        args[i] = utils.copy(value)
      }
    })

    const opts = args[args.length - 1]

    // Fill in "opts" with the Mapper's configuration
    utils._(opts, this)
    adapter = opts.adapter = this.getAdapterName(opts)

    // before lifecycle hook
    op = opts.op = before
    return utils.resolve(this[op](...args)).then((_value) => {
      if (!utils.isUndefined(args[config.beforeAssign])) {
        // Allow for re-assignment from lifecycle hook
        args[config.beforeAssign] = utils.isUndefined(_value) ? args[config.beforeAssign] : _value
      }
      // Now delegate to the adapter
      op = opts.op = method
      args = config.adapterArgs ? config.adapterArgs(this, ...args) : args
      this.dbg(op, ...args)
      return utils.resolve(this.getAdapter(adapter)[op](this, ...args))
    }).then((result) => {
      result = this._end(result, opts, !!config.skip)
      args.push(result)
      // after lifecycle hook
      op = opts.op = after
      return utils.resolve(this[op](...args)).then((_result) => {
        // Allow for re-assignment from lifecycle hook
        return utils.isUndefined(_result) ? result : _result
      })
    })
  },

  /**
   * Using an adapter, destroy the record with the given primary key.
   *
   * {@link Mapper#beforeDestroy} will be called before destroying the record.
   * {@link Mapper#afterDestroy} will be called after destroying the record.
   *
   * @example <caption>Destroy a specific blog post</caption>
   * PostService.destroy(1234).then(() => {
   *   // Blog post #1234 has been destroyed
   * })
   *
   * @example <caption>Get full response</caption>
   * PostService.destroy(1234, { raw: true }).then((result) => {
   *   console.log(result.deleted) e.g. 1
   *   console.log(...) // etc., more metadata can be found on the result
   * })
   *
   * @method Mapper#destroy
   * @param {(string|number)} id The primary key of the record to destroy.
   * @param {Object} [opts] Configuration options. Refer to the `destroy` method
   * of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @returns {Promise} Resolves when the record has been destroyed. Resolves
   * even if no record was found to be destroyed.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  destroy (id, opts) {
    return this.crud('destroy', id, opts)
  },

  /**
   * Destroy the records selected by `query` via an adapter. If no `query` is
   * provided then all records will be destroyed.
   *
   * {@link Mapper#beforeDestroyAll} will be called before destroying the records.
   * {@link Mapper#afterDestroyAll} will be called after destroying the records.
   *
   * @example <caption>Destroy all blog posts</caption>
   * PostService.destroyAll().then(() => {
   *   // All blog posts have been destroyed
   * })
   *
   * @example <caption>Destroy all "draft" blog posts</caption>
   * PostService.destroyAll({ status: 'draft' }).then(() => {
   *   // All "draft" blog posts have been destroyed
   * })
   *
   * @example <caption>Get full response</caption>
   * const query = null
   * const options = { raw: true }
   * PostService.destroyAll(query, options).then((result) => {
   *   console.log(result.deleted) e.g. 14
   *   console.log(...) // etc., more metadata can be found on the result
   * })
   *
   * @method Mapper#destroyAll
   * @param {Object} [query={}] Selection query. See {@link query}.
   * @param {Object} [query.where] See {@link query.where}.
   * @param {number} [query.offset] See {@link query.offset}.
   * @param {number} [query.limit] See {@link query.limit}.
   * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options. Refer to the `destroyAll`
   * method of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @returns {Promise} Resolves when the records have been destroyed. Resolves
   * even if no records were found to be destroyed.
   * @see query
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  destroyAll (query, opts) {
    return this.crud('destroyAll', query, opts)
  },

  /**
   * Retrieve via an adapter the record with the given primary key.
   *
   * {@link Mapper#beforeFind} will be called before calling the adapter.
   * {@link Mapper#afterFind} will be called after calling the adapter.
   *
   * @example
   * PostService.find(1).then((post) => {
   *   console.log(post) // { id: 1, ...}
   * })
   *
   * @example <caption>Get full response</caption>
   * PostService.find(1, { raw: true }).then((result) => {
   *   console.log(result.data) // { id: 1, ...}
   *   console.log(result.found) // 1
   *   console.log(...) // etc., more metadata can be found on the result
   * })
   *
   * @method Mapper#find
   * @param {(string|number)} id The primary key of the record to retrieve.
   * @param {Object} [opts] Configuration options. Refer to the `find` method
   * of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   * @returns {Promise} Resolves with the found record. Resolves with
   * `undefined` if no record was found.
   * @see http://www.js-data.io/v3.0/docs/reading-data
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/reading-data","Reading data"]
   */
  find (id, opts) {
    return this.crud('find', id, opts)
  },

  /**
   * Using the `query` argument, select records to retrieve via an adapter.
   *
   * {@link Mapper#beforeFindAll} will be called before calling the adapter.
   * {@link Mapper#afterFindAll} will be called after calling the adapter.
   *
   * @example <caption>Find all "published" blog posts</caption>
   * PostService.findAll({ status: 'published' }).then((posts) => {
   *   console.log(posts) // [{ id: 1, status: 'published', ...}, ...]
   * })
   *
   * @example <caption>Get full response</caption>
   * PostService.findAll({ status: 'published' }, { raw: true }).then((result) => {
   *   console.log(result.data) // [{ id: 1, status: 'published', ...}, ...]
   *   console.log(result.found) // e.g. 13
   *   console.log(...) // etc., more metadata can be found on the result
   * })
   *
   * @method Mapper#findAll
   * @param {Object} [query={}] Selection query. See {@link query}.
   * @param {Object} [query.where] See {@link query.where}.
   * @param {number} [query.offset] See {@link query.offset}.
   * @param {number} [query.limit] See {@link query.limit}.
   * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options. Refer to the `findAll` method
   * of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   * @returns {Promise} Resolves with the found records, if any.
   * @see query
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/reading-data","Reading data"]
   */
  findAll (query, opts) {
    return this.crud('findAll', query, opts)
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @method Mapper#getAdapter
   * @param {string} [name] The name of the adapter to retrieve.
   * @returns {Adapter} The adapter.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   */
  getAdapter (name) {
    this.dbg('getAdapter', 'name:', name)
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
   * @method Mapper#getAdapterName
   * @param {(Object|string)} [opts] The name of an adapter or options, if any.
   * @returns {string} The name of the adapter.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  },

  /**
   * Get the object of registered adapters for this Mapper.
   *
   * @method Mapper#getAdapters
   * @returns {Object} {@link Mapper#_adapters}
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   */
  getAdapters () {
    return this._adapters
  },

  /**
   * Returns this Mapper's {@link Schema}.
   *
   * @method Mapper#getSchema
   * @returns {Schema} This Mapper's {@link Schema}.
   * @see Mapper#schema
   * @since 3.0.0
   */
  getSchema () {
    return this.schema
  },

  /**
   * Defines a hasMany relationship. Only useful if you're managing your
   * Mappers manually and not using a Container or DataStore component.
   *
   * @example
   * UserService.hasMany(PostService, {
   *   // post.user_id points to user.id
   *   foreignKey: 'user_id'
   *   // post records will be attached to user records at "user.posts"
   *   localField: 'posts'
   * })
   *
   * @method Mapper#hasMany
   * @see http://www.js-data.io/v3.0/docs/relations
   * @since 3.0.0
   */
  hasMany (relatedMapper, opts) {
    return hasMany(relatedMapper, opts)(this)
  },

  /**
   * Defines a hasOne relationship. Only useful if you're managing your Mappers
   * manually and not using a {@link Container} or {@link DataStore} component.
   *
   * @example
   * UserService.hasOne(ProfileService, {
   *   // profile.user_id points to user.id
   *   foreignKey: 'user_id'
   *   // profile records will be attached to user records at "user.profile"
   *   localField: 'profile'
   * })
   *
   * @method Mapper#hasOne
   * @see http://www.js-data.io/v3.0/docs/relations
   * @since 3.0.0
   */
  hasOne (relatedMapper, opts) {
    return hasOne(relatedMapper, opts)(this)
  },

  /**
   * Return whether `record` is an instance of this Mapper's recordClass.
   *
   * @example
   * const post = PostService.createRecord()
   *
   * console.log(PostService.is(post)) // true
   * // Equivalent to what's above
   * console.log(post instanceof PostService.recordClass) // true
   *
   * @method Mapper#is
   * @param {Object|Record} record The record to check.
   * @returns {boolean} Whether `record` is an instance of this Mapper's
   * {@link Mapper#recordClass}.
   * @since 3.0.0
   */
  is (record) {
    const recordClass = this.recordClass
    return recordClass ? record instanceof recordClass : false
  },

  /**
   * Register an adapter on this Mapper under the given name.
   *
   * @method Mapper#registerAdapter
   * @param {string} name The name of the adapter to register.
   * @param {Adapter} adapter The adapter to register.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.default=false] Whether to make the adapter the
   * default adapter for this Mapper.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   */
  registerAdapter (name, adapter, opts) {
    opts || (opts = {})
    this.getAdapters()[name] = adapter
    // Optionally make it the default adapter for the target.
    if (opts === true || opts.default) {
      this.defaultAdapter = name
    }
  },

  /**
   * Select records according to the `query` argument, and aggregate the sum
   * value of the property specified by `field`.
   *
   * {@link Mapper#beforeSum} will be called before calling the adapter.
   * {@link Mapper#afterSum} will be called after calling the adapter.
   *
   * @example
   * PurchaseOrderService.sum('amount', { status: 'paid' }).then((amountPaid) => {
   *   console.log(amountPaid) // e.g. 451125.34
   * })
   *
   * @method Mapper#sum
   * @param {string} field The field to sum.
   * @param {Object} [query={}] Selection query. See {@link query}.
   * @param {Object} [query.where] See {@link query.where}.
   * @param {number} [query.offset] See {@link query.offset}.
   * @param {number} [query.limit] See {@link query.limit}.
   * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options. Refer to the `sum` method
   * of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @returns {Promise} Resolves with the aggregated sum.
   * @since 3.0.0
   */
  sum (field, query, opts) {
    return this.crud('sum', field, query, opts)
  },

  /**
   * Return a plain object representation of the given record. Relations can
   * be optionally be included. Non-schema properties can be excluded.
   *
   * @example
   * import {Mapper, Schema} from 'js-data'
   * const PersonService = new Mapper({
   *   name: 'person',
   *   schema: {
   *     properties: {
   *       name: { type: 'string' },
   *       id: { type: 'string' }
   *     }
   *   }
   * })
   * const person = PersonService.createRecord({ id: 1, name: 'John', foo: 'bar' })
   * console.log(PersonService.toJSON(person)) // {"id":1,"name":"John","foo":"bar"}
   * console.log(PersonService.toJSON(person), { strict: true }) // {"id":1,"name":"John"}
   *
   * @method Mapper#toJSON
   * @param {Record|Record[]} records Record or records from which to create a
   * POJO representation.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.strict] Whether to exclude properties that are not
   * defined in {@link Mapper#schema}.
   * @param {string[]} [opts.with] Array of relation names or relation fields
   * to include in the POJO representation.
   * @param {boolean} [opts.withAll] Whether to simply include all relations in
   * the representation. Overrides `opts.with`.
   * @returns {Object|Object[]} POJO representation of the record or records.
   * @since 3.0.0
   */
  toJSON (records, opts) {
    let record
    opts || (opts = {})
    if (utils.isArray(records)) {
      return records.map((record) => this.toJSON(record, opts))
    } else {
      record = records
    }
    const relationFields = (this ? this.relationFields : []) || []
    let json = {}
    let properties
    if (this && this.schema) {
      properties = this.schema.properties || {}
      // TODO: Make this work recursively
      utils.forOwn(properties, (opts, prop) => {
        json[prop] = utils.plainCopy(record[prop])
      })
    }
    properties || (properties = {})
    if (!opts.strict) {
      for (var key in record) {
        if (!properties[key] && relationFields.indexOf(key) === -1) {
          json[key] = utils.plainCopy(record[key])
        }
      }
    }
    // The user wants to include relations in the resulting plain object
    // representation
    if (this && opts.withAll) {
      opts.with = relationFields.slice()
    }
    if (this && opts.with) {
      if (utils.isString(opts.with)) {
        opts.with = [opts.with]
      }
      utils.forEachRelation(this, opts, (def, optsCopy) => {
        const relationData = def.getLocalField(record)
        if (relationData) {
          // The actual recursion
          if (utils.isArray(relationData)) {
            def.setLocalField(json, relationData.map((item) => {
              return def.getRelation().toJSON(item, optsCopy)
            }))
          } else {
            def.setLocalField(json, def.getRelation().toJSON(relationData, optsCopy))
          }
        }
      })
    }
    return json
  },

  /**
   * Using an adapter, update the record with the primary key specified by the
   * `id` argument.
   *
   * {@link Mapper#beforeUpdate} will be called before updating the record.
   * {@link Mapper#afterUpdate} will be called after updating the record.
   *
   * @example <caption>Update a specific post</caption>
   * PostService.update(1234, {
   *   status: 'published',
   *   published_at: new Date()
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'published', ... }
   * })
   *
   * @method Mapper#update
   * @param {(string|number)} id The primary key of the record to update.
   * @param {Object} props The update to apply to the record.
   * @param {Object} [opts] Configuration options. Refer to the `update` method
   * of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * transaction.
   * @returns {Promise} Resolves with the updated record. Rejects if the record
   * could not be found.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  update (id, props, opts) {
    return this.crud('update', id, props, opts)
  },

  /**
   * Using the `query` argument, perform the a single updated to the selected
   * records.
   *
   * {@link Mapper#beforeUpdateAll} will be called before making the update.
   * {@link Mapper#afterUpdateAll} will be called after making the update.
   *
   * @example <caption>Turn all of John's blog posts into drafts.</caption>
   * const update = { status: draft: published_at: null }
   * const query = { userId: 1234 }
   * PostService.updateAll(update, query).then((posts) => {
   *   console.log(posts) // [...]
   * })
   *
   * @method Mapper#updateAll
   * @param {Object} props Update to apply to selected records.
   * @param {Object} [query={}] Selection query. See {@link query}.
   * @param {Object} [query.where] See {@link query.where}.
   * @param {number} [query.offset] See {@link query.offset}.
   * @param {number} [query.limit] See {@link query.limit}.
   * @param {string|Array[]} [query.orderBy] See {@link query.orderBy}.
   * @param {Object} [opts] Configuration options. Refer to the `updateAll`
   * method of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @returns {Promise} Resolves with the update records, if any.
   * @see query
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  updateAll (props, query, opts) {
    return this.crud('updateAll', props, query, opts)
  },

  /**
   * Given an array of updates, perform each of the updates via an adapter. Each
   * "update" is a hash of properties with which to update an record. Each
   * update must contain the primary key of the record to be updated.
   *
   * {@link Mapper#beforeUpdateMany} will be called before making the update.
   * {@link Mapper#afterUpdateMany} will be called after making the update.
   *
   * @example
   * PostService.updateMany([
   *   { id: 1234, status: 'draft' },
   *   { id: 2468, status: 'published', published_at: new Date() }
   * ]).then((posts) => {
   *   console.log(posts) // [...]
   * })
   *
   * @method Mapper#updateMany
   * @param {Record[]} records Array up record updates.
   * @param {Object} [opts] Configuration options. Refer to the `updateMany`
   * method of whatever adapter you're using for more configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] See {@link Mapper#notify}.
   * @param {boolean} [opts.raw={@link Mapper#raw}] See {@link Mapper#raw}.
   * @returns {Promise} Resolves with the updated records. Rejects if any of the
   * records could be found.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  updateMany (records, opts) {
    return this.crud('updateMany', records, opts)
  },

  /**
   * Validate the given record or records according to this Mapper's
   * {@link Schema}. If there are no validation errors then the return value
   * will be `undefined`.
   *
   * @example
   * import {Mapper, Schema} from 'js-data'
   * const PersonSchema = new Schema({
   *   properties: {
   *     name: { type: 'string' },
   *     id: { type: 'string' }
   *   }
   * })
   * const PersonService = new Mapper({
   *   name: 'person',
   *   schema: PersonSchema
   * })
   * let errors = PersonService.validate({ name: 'John' })
   * console.log(errors) // undefined
   * errors = PersonService.validate({ name: 123 })
   * console.log(errors) // [{ expected: 'one of (string)', actual: 'number', path: 'name' }]
   *
   * @method Mapper#validate
   * @param {Object|Object[]} record The record or records to validate.
   * @param {Object} [opts] Configuration options. Passed to
   * {@link Schema#validate}.
   * @returns {Object[]} Array of errors or `undefined` if no errors.
   * @since 3.0.0
   */
  validate (record, opts) {
    opts || (opts = {})
    const schema = this.getSchema()
    const _opts = utils.pick(opts, ['existingOnly'])
    if (utils.isArray(record)) {
      const errors = record.map((_record) => schema.validate(_record, utils.pick(_opts, ['existingOnly'])))
      let hasErrors = false
      errors.forEach(function (err) {
        if (err) {
          hasErrors = true
        }
      })
      if (hasErrors) {
        return errors
      }
      return undefined
    }
    return schema.validate(record, _opts)
  },

  /**
   * Method used to wrap data returned by an adapter with this Mapper's
   * {@link Mapper#recordClass}. This method is used by all of a Mapper's CRUD
   * methods. The provided implementation of this method assumes that the `data`
   * passed to it is a record or records that need to be wrapped with
   * {@link Mapper#createRecord}. Override with care.
   *
   * Provided implementation of {@link Mapper#wrap}:
   *
   * ```
   * function (data, opts) {
   *   return this.createRecord(data, opts)
   * }
   * ```
   *
   * @example <caption>Override to customize behavior</caption>
   * const PostMapper = new Mapper({
   *   name: 'post',
   *   wrap (data, opts) {
   *     const originalWrap = this.constructor.prototype.wrap
   *     // Let's say "GET /post" doesn't return JSON quite like JSData expects,
   *     // but the actual post records are nested under a "posts" field. So,
   *     // we override Mapper#wrap to handle this special case.
   *     if (opts.op === 'findAll') {
   *       return originalWrap.call(this, data.posts, opts)
   *     }
   *     // Otherwise perform original behavior
   *     return originalWrap.call(this, data, opts)
   *   }
   * })
   *
   * @method Mapper#wrap
   * @param {Object|Object[]} data The record or records to be wrapped.
   * @param {Object} [opts] Configuration options. Passed to {@link Mapper#createRecord}.
   * @returns {Record|Record[]} The wrapped record or records.
   * @since 3.0.0
   */
  wrap (data, opts) {
    return this.createRecord(data, opts)
  },

  /**
   * @ignore
   */
  defineRelations () {
    // Setup the mapper's relations, including generating Mapper#relationList
    // and Mapper#relationFields
    utils.forOwn(this.relations, (group, type) => {
      utils.forOwn(group, (relations, _name) => {
        if (utils.isObject(relations)) {
          relations = [relations]
        }
        relations.forEach((def) => {
          const relatedMapper = this.datastore.getMapperByName(_name) || _name
          def.getRelation = () => this.datastore.getMapper(_name)

          if (typeof Relation[type] !== 'function') {
            throw utils.err(DOMAIN, 'defineRelations')(400, 'relation type (hasOne, hasMany, etc)', type, true)
          }

          this[type](relatedMapper, def)
        })
      })
    })
  }
})

/**
 * Create a subclass of this Mapper:
 * <div id="Mapper.extend" class="tonic">
 * // Normally you would do: import {Mapper} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Mapper} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomMapperClass extends Mapper {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customMapper = new CustomMapperClass()
 * console.log(customMapper.foo())
 * console.log(CustomMapperClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherMapperClass = Mapper.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherMapper = new OtherMapperClass()
 * console.log(otherMapper.foo())
 * console.log(OtherMapperClass.beep())
 * </div>
 *
 * Provide a custom constructor function:
 * <div id="Mapper.extend" class="tonic">
 * // Normally you would do: import {Mapper} from 'js-data'
 * const JSData = require('js-data@3.0.0-beta.7')
 * const {Mapper} = JSData
 * console.log(\`Using JSData v${JSData.version.full}\`)
 *
 * // Extend the class, providing a custom constructor.
 * function OtherMapperClass (opts) {
 *   Mapper.call(this, opts)
 *   this.created_at = new Date().getTime()
 * }
 * Mapper.extend({
 *   constructor: OtherMapperClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherMapper = new OtherMapperClass()
 * console.log(otherMapper.created_at)
 * console.log(otherMapper.foo())
 * console.log(OtherMapperClass.beep())
 * </div>
 *
 * @method Mapper.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Mapper class.
 * @since 3.0.0
 */
