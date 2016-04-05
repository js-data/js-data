import utils from './utils'
import Component from './Component'
import Record from './Record'
import Schema from './Schema'
import {
  belongsTo,
  belongsToType,
  hasMany,
  hasManyType,
  hasOne,
  hasOneType
} from './decorators'

const makeNotify = function (num) {
  return function (...args) {
    const self = this
    const opts = args[args.length - num]
    self.dbg(opts.op, ...args)
    if (opts.notify || (opts.notify === undefined && self.notify)) {
      setTimeout(() => {
        self.emit(opts.op, ...args)
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
   * Hash of registered adapters. Don't modify directly. Use {@link Mapper#registerAdapter}.
   *
   * @name Mapper#_adapters
   */
  _adapters: {},

  /**
   * Whether to augment {@link Mapper#recordClass} with getter/setter property
   * accessors according to the properties defined in {@link Mapper#schema}.
   * This makes possible validation and change tracking on individual properties
   * when using the dot (e.g. `user.name = "Bob"`) operator to modify a
   * property.
   *
   * @name Mapper#applySchema
   * @type {boolean}
   * @default true
   */
  applySchema: true,

  /**
   * Whether to enable debug-level logs.
   *
   * @name Mapper#debug
   * @type {boolean}
   * @default false
   */
  debug: false,

  /**
   * The name of the registered adapter that this Mapper should used by default.
   *
   * @name Mapper#defaultAdapter
   * @type {string}
   * @default "http"
   */
  defaultAdapter: 'http',

  /**
   * The field used as the unique identifier on records handled by this Mapper.
   *
   * @name Mapper#idAttribute
   * @type {string}
   * @default id
   */
  idAttribute: 'id',

  /**
   * Whether this Mapper should emit operational events.
   *
   * Defaults to `true` in the browser and `false` in Node.js
   *
   * @name Mapper#notify
   * @type {boolean}
   */
  notify: utils.isBrowser,

  /**
   * Whether {@link Mapper#create}, {@link Mapper#createMany}, {@link Mapper#save},
   * {@link Mapper#update}, {@link Mapper#updateAll}, {@link Mapper#updateMany},
   * {@link Mapper#find}, {@link Mapper#findAll}, {@link Mapper#destroy}, and
   * {@link Mapper#destroyAll} should return a raw result object that contains
   * both the instance data returned by the adapter _and_ metadata about the
   * operation.
   *
   * The default is to NOT return the result object, and instead return just the
   * instance data.
   *
   * @name Mapper#raw
   * @type {boolean}
   * @default false
   */
  raw: false
}

/**
 * ```javascript
 * import {Mapper} from 'js-data'
 * ```
 *
 * The core of JSData's [ORM/ODM][orm] implementation. Given a minimum amout of
 * meta information about a resource, a Mapper can perform generic CRUD
 * operations against that resource. Apart from its configuration, a Mapper is
 * stateless. The particulars of various persistence layers has been abstracted
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
 * @class Mapper
 * @extends Component
 * @param {Object} opts Configuration options.
 * @param {boolean} [opts.applySchema=true] Whether to apply this Mapper's
 * {@link Schema} to the prototype of this Mapper's Record class. The enables
 * features like active change detection, validation during use of the
 * assignment operator, etc.
 * @param {boolean} [opts.debug=false] Wether to log debugging information
 * during operation.
 * @param {string} [opts.defaultAdapter=http] The name of the adapter to use by
 * default.
 * @param {string} [opts.idAttribute=id] The field that uniquely identifies
 * Records that this Mapper will be dealing with. Typically called a primary
 * key.
 * @param {string} opts.name The name for this Mapper. This is the minimum
 * amount of meta information required for a Mapper to be able to execute CRUD
 * operations for a "Resource".
 * @param {boolean} [opts.notify] Whether to emit lifecycle events.
 * @param {boolean} [opts.raw=false] Whether lifecycle methods should return a
 * more detailed reponse object instead of just a Record instance or Record
 * instances.
 */
export default Component.extend({
  constructor: function Mapper (opts) {
    const self = this
    utils.classCallCheck(self, Mapper)
    Mapper.__super__.call(self)
    opts || (opts = {})

    // Prepare certain properties to be non-enumerable
    Object.defineProperties(self, {
      _adapters: {
        value: undefined,
        writable: true
      },

      /**
       * Set the `false` to force the Mapper to work with POJO objects only.
       *
       * ```javascript
       * import {Mapper, Record} from 'js-data'
       * const UserMapper = new Mapper({ recordClass: false })
       * UserMapper.recordClass // false
       * const user = UserMapper#createRecord()
       * user instanceof Record // false
       * ```
       *
       * Set to a custom class to have records wrapped in your custom class.
       *
       * ```javascript
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
       * ```
       *
       * Extend the {@link Record} class.
       *
       * ```javascript
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
       * ```
       *
       * @name Mapper#recordClass
       * @default {@link Record}
       */
      recordClass: {
        value: undefined,
        writable: true
      },

      lifecycleMethods: {
        value: LIFECYCLE_METHODS
      },

      schema: {
        value: undefined,
        writable: true
      }
    })

    // Apply user-provided configuration
    utils.fillIn(self, opts)
    // Fill in any missing options with the defaults
    utils.fillIn(self, utils.copy(MAPPER_DEFAULTS))

    /**
     * Minimum amount of meta information required for a Mapper to be able to
     * execute CRUD operations for a "Resource".
     *
     * @name Mapper#name
     * @type {string}
     */
    if (!self.name) {
      throw new Error('name is required!')
    }

    // Setup schema, with an empty default schema if necessary
    if (!(self.schema instanceof Schema)) {
      self.schema = new Schema(self.schema || {})
    }

    // Create a subclass of Record that's tied to this Mapper
    if (utils.isUndefined(self.recordClass)) {
      const superClass = Record
      self.recordClass = superClass.extend({
        constructor: (function () {
          var subClass = function Record (props, opts) {
            utils.classCallCheck(this, subClass)
            superClass.call(this, props, opts)
          }
          return subClass
        })()
      })
    }

    if (self.recordClass) {
      self.recordClass.mapper = self

      // We can only apply the schema to the prototype of self.recordClass if the
      // class extends Record
      if (utils.getSuper(self.recordClass, true) === Record && self.schema && self.schema.apply && self.applySchema) {
        self.schema.apply(self.recordClass.prototype)
      }
    }
  },

  /**
   * Mapper lifecycle hook called by {@link Mapper#count}. If this method
   * returns a promise then {@link Mapper#count} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterCount
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#count}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#count}.
   * @param {*} result The result, if any.
   */
  afterCount: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#create}. If this method
   * returns a promise then {@link Mapper#create} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterCreate
   * @method
   * @param {Object} props The `props` argument passed to {@link Mapper#create}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
   * @param {*} result The result, if any.
   */
  afterCreate: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
   * returns a promise then {@link Mapper#createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterCreateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
   * @param {*} result The result, if any.
   */
  afterCreateMany: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
   * returns a promise then {@link Mapper#destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterDestroy
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
   * @param {*} result The result, if any.
   */
  afterDestroy: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
   * returns a promise then {@link Mapper#destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterDestroyAll
   * @method
   * @param {*} data The `data` returned by the adapter.
   * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
   * @param {*} result The result, if any.
   */
  afterDestroyAll: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#find}. If this method
   * returns a promise then {@link Mapper#find} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterFind
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
   * @param {*} result The result, if any.
   */
  afterFind: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
   * returns a promise then {@link Mapper#findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterFindAll
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
   * @param {*} result The result, if any.
   */
  afterFindAll: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#sum}. If this method
   * returns a promise then {@link Mapper#sum} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterSum
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#sum}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#sum}.
   * @param {*} result The result, if any.
   */
  afterSum: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#update}. If this method
   * returns a promise then {@link Mapper#update} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterUpdate
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
   * @param {props} props The `props` argument passed to {@link Mapper#update}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
   * @param {*} result The result, if any.
   */
  afterUpdate: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
   * returns a promise then {@link Mapper#updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterUpdateAll
   * @method
   * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
   * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
   * @param {*} result The result, if any.
   */
  afterUpdateAll: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
   * returns a promise then {@link Mapper#updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#afterUpdateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
   * @param {*} result The result, if any.
   */
  afterUpdateMany: notify2,

  /**
   * Mapper lifecycle hook called by {@link Mapper#create}. If this method
   * returns a promise then {@link Mapper#create} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeCreate
   * @method
   * @param {Object} props The `props` argument passed to {@link Mapper#create}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#create}.
   */
  beforeCreate: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#createMany}. If this method
   * returns a promise then {@link Mapper#createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeCreateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#createMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#createMany}.
   */
  beforeCreateMany: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#count}. If this method
   * returns a promise then {@link Mapper#count} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeCount
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#count}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#count}.
   */
  beforeCount: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroy}. If this method
   * returns a promise then {@link Mapper#destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeDestroy
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#destroy}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroy}.
   */
  beforeDestroy: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#destroyAll}. If this method
   * returns a promise then {@link Mapper#destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeDestroyAll
   * @method
   * @param {query} query The `query` argument passed to {@link Mapper#destroyAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#destroyAll}.
   */
  beforeDestroyAll: notify,

  /**
   * Mappers lifecycle hook called by {@link Mapper#find}. If this method
   * returns a promise then {@link Mapper#find} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeFind
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#find}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#find}.
   */
  beforeFind: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#findAll}. If this method
   * returns a promise then {@link Mapper#findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeFindAll
   * @method
   * @param {Object} query The `query` argument passed to {@link Mapper#findAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#findAll}.
   */
  beforeFindAll: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#sum}. If this method
   * returns a promise then {@link Mapper#sum} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeSum
   * @method
   * @param {string} field The `field` argument passed to {@link Mapper#sum}.
   * @param {Object} query The `query` argument passed to {@link Mapper#sum}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#sum}.
   */
  beforeSum: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#update}. If this method
   * returns a promise then {@link Mapper#update} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeUpdate
   * @method
   * @param {(string|number)} id The `id` argument passed to {@link Mapper#update}.
   * @param {props} props The `props` argument passed to {@link Mapper#update}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#update}.
   */
  beforeUpdate: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateAll}. If this method
   * returns a promise then {@link Mapper#updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeUpdateAll
   * @method
   * @param {Object} props The `props` argument passed to {@link Mapper#updateAll}.
   * @param {Object} query The `query` argument passed to {@link Mapper#updateAll}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateAll}.
   */
  beforeUpdateAll: notify,

  /**
   * Mapper lifecycle hook called by {@link Mapper#updateMany}. If this method
   * returns a promise then {@link Mapper#updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @name Mapper#beforeUpdateMany
   * @method
   * @param {Array} records The `records` argument passed to {@link Mapper#updateMany}.
   * @param {Object} opts The `opts` argument passed to {@link Mapper#updateMany}.
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
   * @name Mapper#_end
   * @method
   * @private
   */
  _end (result, opts, skip) {
    const self = this
    if (opts.raw) {
      utils._(result, opts)
    }
    if (skip) {
      return result
    }
    let _data = opts.raw ? result.data : result
    if (_data && utils.isFunction(self.wrap)) {
      _data = self.wrap(_data, opts)
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
   * ```
   * Post.belongsTo(User, {
   *   localKey: 'myUserId'
   * })
   *
   * Comment.belongsTo(User)
   * Comment.belongsTo(Post, {
   *   localField: '_post'
   * })
   * ```
   *
   * @name Mapper#belongsTo
   * @method
   */
  belongsTo (relatedMapper, opts) {
    return belongsTo(relatedMapper, opts)(this)
  },

  /**
   * Using the `query` argument, select records to pull from an adapter.
   * Expects back from the adapter the array of selected records.
   *
   * {@link Mapper#beforeCount} will be called before calling the adapter.
   * {@link Mapper#afterCount} will be called after calling the adapter.
   *
   * @name Mapper#count
   * @method
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * resulting data. If `true` return a response object that includes the
   * resulting data and metadata about the operation.
   * @return {Promise}
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
   * @name Mapper#create
   * @method
   * @param {Object} props The properties for the new record.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * created data. If `true` return a response object that includes the created
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading
   * create if `props` contains nested relations. NOT performed in a
   * transaction. Each nested create will result in another {@link Mapper#create}
   * or {@link Mapper#createMany} call.
   * @param {string[]} [opts.pass=[]] Relations to send to the adapter as part
   * of the payload. Normally relations are not sent.
   * @return {Promise}
   */
  create (props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    utils._(opts, self)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeCreate lifecycle hook
    op = opts.op = 'beforeCreate'
    return utils.resolve(self[op](props, opts)).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = utils.isUndefined(_props) ? props : _props

      // Deep pre-create belongsTo relations
      const belongsToRelationData = {}
      opts.with || (opts.with = [])
      let tasks = []
      utils.forEachRelation(self, opts, function (def, optsCopy) {
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
          tasks.push(relatedMapper.create(relationData, optsCopy).then(function (data) {
            def.setLocalField(belongsToRelationData, data)
            def.setForeignKey(props, data)
          }))
        } else if (def.type === hasManyType && def.localKeys) {
          // Create his hasMany relation first because it uses localKeys
          tasks.push(relatedMapper.createMany(relationData, optsCopy)).then(function (data) {
            def.setLocalField(belongsToRelationData, data)
            utils.set(props, def.localKeys, data.map(function (record) {
              return utils.get(record, relatedIdAttribute)
            }))
          })
        }
      })
      return utils.Promise.all(tasks).then(function () {
        // Now delegate to the adapter for the main create
        op = opts.op = 'create'
        self.dbg(op, props, opts)
        return utils.resolve(self.getAdapter(adapter)[op](self, self.toJSON(props, { with: opts.pass || [] }), opts))
      }).then(function (data) {
        const createdRecord = opts.raw ? data.data : data
        // Deep post-create hasMany and hasOne relations
        tasks = []
        utils.forEachRelation(self, opts, function (def, optsCopy) {
          const relationData = def.getLocalField(props)
          if (!relationData) {
            return
          }
          let task
          // Create hasMany and hasOne after the main create because we needed
          // a generated id to attach to these items
          if (def.type === hasManyType && def.foreignKey) {
            def.setForeignKey(createdRecord, relationData)
            task = def.getRelation().createMany(relationData, optsCopy).then(function (data) {
              def.setLocalField(createdRecord, opts.raw ? data.data : data)
            })
          } else if (def.type === hasOneType) {
            def.setForeignKey(createdRecord, relationData)
            task = def.getRelation().create(relationData, optsCopy).then(function (data) {
              def.setLocalField(createdRecord, opts.raw ? data.data : data)
            })
          } else if (def.type === belongsToType && def.getLocalField(belongsToRelationData)) {
            def.setLocalField(createdRecord, def.getLocalField(belongsToRelationData))
          }
          if (task) {
            tasks.push(task)
          }
        })
        return utils.Promise.all(tasks).then(function () {
          return data
        })
      })
    }).then(function (result) {
      result = self._end(result, opts)
      // afterCreate lifecycle hook
      op = opts.op = 'afterCreate'
      return utils.resolve(self[op](props, opts, result)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return utils.isUndefined(_result) ? result : _result
      })
    })
  },

  createInstance (props, opts) {
    return this.createRecord(props, opts)
  },

  /**
   * Given an array of records, batch create them via an adapter.
   *
   * {@link Mapper#beforeCreateMany} will be called before calling the adapter.
   * {@link Mapper#afterCreateMany} will be called after calling the adapter.
   *
   * @name Mapper#createMany
   * @method
   * @param {Array} records Array of records to be created in one batch.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading
   * create if `records` contains nested relations. NOT performed in a
   * transaction. Each nested create will result in another {@link Mapper#createMany}
   * call.
   * @param {string[]} [opts.pass=[]] Relations to send to the adapter as part
   * of the payload. Normally relations are not sent.
   * @return {Promise}
   */
  createMany (records, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    records || (records = [])
    opts || (opts = {})

    // Fill in "opts" with the Mapper's configuration
    utils._(opts, self)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeCreateMany lifecycle hook
    op = opts.op = 'beforeCreateMany'
    return utils.resolve(self[op](records, opts)).then(function (_records) {
      // Allow for re-assignment from lifecycle hook
      records = utils.isUndefined(_records) ? records : _records

      // Deep pre-create belongsTo relations
      const belongsToRelationData = {}
      opts.with || (opts.with = [])
      let tasks = []
      utils.forEachRelation(self, opts, function (def, optsCopy) {
        const relationData = records.map(function (record) {
          return def.getLocalField(record)
        }).filter(function (relatedRecord) {
          return relatedRecord
        })
        if (def.type === belongsToType && relationData.length === records.length) {
          // Create belongsTo relation first because we need a generated id to
          // attach to the child
          tasks.push(def.getRelation().createMany(relationData, optsCopy).then(function (data) {
            const relatedRecords = optsCopy.raw ? data.data : data
            def.setLocalField(belongsToRelationData, relatedRecords)
            records.forEach(function (record, i) {
              def.setForeignKey(record, relatedRecords[i])
            })
          }))
        }
      })
      return utils.Promise.all(tasks).then(function () {
        // Now delegate to the adapter
        op = opts.op = 'createMany'
        const json = records.map(function (record) {
          return self.toJSON(record, { with: opts.pass || [] })
        })
        self.dbg(op, records, opts)
        return utils.resolve(self.getAdapter(adapter)[op](self, json, opts))
      }).then(function (data) {
        const createdRecords = opts.raw ? data.data : data

        // Deep post-create hasOne relations
        tasks = []
        utils.forEachRelation(self, opts, function (def, optsCopy) {
          const relationData = records.map(function (record) {
            return def.getLocalField(record)
          }).filter(function (relatedRecord) {
            return relatedRecord
          })
          if (relationData.length !== records.length) {
            return
          }
          const belongsToData = def.getLocalField(belongsToRelationData)
          let task
          // Create hasMany and hasOne after the main create because we needed
          // a generated id to attach to these items
          if (def.type === hasManyType) {
            // Not supported
            self.log('warn', 'deep createMany of hasMany type not supported!')
          } else if (def.type === hasOneType) {
            createdRecords.forEach(function (createdRecord, i) {
              def.setForeignKey(createdRecord, relationData[i])
            })
            task = def.getRelation().createMany(relationData, optsCopy).then(function (data) {
              const relatedData = opts.raw ? data.data : data
              createdRecords.forEach(function (createdRecord, i) {
                def.setLocalField(createdRecord, relatedData[i])
              })
            })
          } else if (def.type === belongsToType && belongsToData && belongsToData.length === createdRecords.length) {
            createdRecords.forEach(function (createdRecord, i) {
              def.setLocalField(createdRecord, belongsToData[i])
            })
          }
          if (task) {
            tasks.push(task)
          }
        })
        return utils.Promise.all(tasks).then(function () {
          return data
        })
      })
    }).then(function (result) {
      result = self._end(result, opts)
      // afterCreateMany lifecycle hook
      op = opts.op = 'afterCreateMany'
      return utils.resolve(self[op](records, opts, result)).then(function (_result) {
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
   * @name Mapper#createRecord
   * @method
   * @param {Object|Array} props The properties for the Record instance or an
   * array of property objects for the Record instances.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.noValidate=false] Whether to skip validation when
   * the Record instances are created.
   * @return {Object|Array} The Record instance or Record instances.
   */
  createRecord (props, opts) {
    props || (props = {})
    const self = this
    if (utils.isArray(props)) {
      return props.map(function (_props) {
        return self.createRecord(_props, opts)
      })
    }
    if (!utils.isObject(props)) {
      throw new Error('Cannot create a record from ' + props + '!')
    }
    const recordClass = self.recordClass
    const relationList = self.relationList || []
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
   * @name Mapper#crud
   * @method
   * @param {string} method Name of the lifecycle method to invoke.
   * @param {...*} args Arguments to pass to the lifecycle method.
   * @return {Promise}
   */
  crud (method, ...args) {
    const self = this
    const config = self.lifecycleMethods[method]
    if (!config) {
      throw new Error(`${method}: No such CRUD method!`)
    }

    const upper = `${method.charAt(0).toUpperCase()}${method.substr(1)}`
    const before = `before${upper}`
    const after = `after${upper}`

    let op, adapter

    // Default values for arguments
    config.defaults.forEach(function (value, i) {
      if (utils.isUndefined(args[i])) {
        args[i] = utils.copy(value)
      }
    })

    const opts = args[args.length - 1]

    // Fill in "opts" with the Mapper's configuration
    utils._(opts, self)
    adapter = opts.adapter = self.getAdapterName(opts)

    // before lifecycle hook
    op = opts.op = before
    return utils.resolve(self[op](...args)).then(function (_value) {
      if (!utils.isUndefined(config.beforeAssign)) {
        // Allow for re-assignment from lifecycle hook
        args[config.beforeAssign] = utils.isUndefined(_value) ? args[config.beforeAssign] : _value
      }
      // Now delegate to the adapter
      op = opts.op = method
      args = config.adapterArgs ? config.adapterArgs(self, ...args) : args
      self.dbg(op, ...args)
      return utils.resolve(self.getAdapter(adapter)[op](self, ...args))
    }).then(function (result) {
      result = self._end(result, opts, !!config.skip)
      args.push(result)
      // after lifecycle hook
      op = opts.op = after
      return utils.resolve(self[op](...args)).then(function (_result) {
        // Allow for re-assignment from lifecycle hook
        return utils.isUndefined(_result) ? result : _result
      })
    })
  },

  /**
   * Using an adapter, destroy the record with the primary key specified by the
   * `id` argument.
   *
   * {@link Mapper#beforeDestroy} will be called before destroying the record.
   * {@link Mapper#afterDestroy} will be called after destroying the record.
   *
   * @name Mapper#destroy
   * @method
   * @param {(string|number)} id The primary key of the record to destroy.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   * @return {Promise}
   */
  destroy (id, opts) {
    return this.crud('destroy', id, opts)
  },

  /**
   * Using the `query` argument, destroy the selected records via an adapter.
   * If no `query` is provided then all records will be destroyed.
   *
   * {@link Mapper#beforeDestroyAll} will be called before destroying the records.
   * {@link Mapper#afterDestroyAll} will be called after destroying the records.
   *
   * @name Mapper#destroyAll
   * @method
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   * @return {Promise}
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
   * @name Mapper#find
   * @method
   * @param {(string|number)} id The primary key of the record to retrieve.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   * @return {Promise}
   */
  find (id, opts) {
    return this.crud('find', id, opts)
  },

  /**
   * Using the `query` argument, select records to pull from an adapter.
   * Expects back from the adapter the array of selected records.
   *
   * {@link Mapper#beforeFindAll} will be called before calling the adapter.
   * {@link Mapper#afterFindAll} will be called after calling the adapter.
   *
   * @name Mapper#findAll
   * @method
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * resulting data. If `true` return a response object that includes the
   * resulting data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   * @return {Promise}
   */
  findAll (query, opts) {
    return this.crud('findAll', query, opts)
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @name Mapper#getAdapter
   * @method
   * @param {string} [name] The name of the adapter to retrieve.
   * @return {Adapter} The adapter.
   */
  getAdapter (name) {
    const self = this
    self.dbg('getAdapter', 'name:', name)
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
   * @name Mapper#getAdapterName
   * @method
   * @param {(Object|string)} [opts] The name of an adapter or options, if any.
   * @return {string} The name of the adapter.
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  },

  /**
   * @name Mapper#getAdapters
   * @method
   * @return {Object} This Mapper's adapters
   */
  getAdapters () {
    return this._adapters
  },

  /**
   * Returns this Mapper's schema.
   *
   * @return {Schema} This Mapper's schema.
   */
  getSchema () {
    return this.schema
  },

  /**
   * Defines a hasMany relationship. Only useful if you're managing your
   * Mappers manually and not using a Container or DataStore component.
   *
   * ```
   * User.hasMany(Post, {
   *   localField: 'my_posts'
   * })
   * ```
   *
   * @name Mapper#hasMany
   * @method
   */
  hasMany (relatedMapper, opts) {
    return hasMany(relatedMapper, opts)(this)
  },

  /**
   * Defines a hasOne relationship. Only useful if you're managing your
   * Mappers manually and not using a Container or DataStore component.
   *
   * ```
   * User.hasOne(Profile, {
   *   localField: '_profile'
   * })
   * ```
   *
   * @name Mapper#hasOne
   * @method
   */
  hasOne (relatedMapper, opts) {
    return hasOne(relatedMapper, opts)(this)
  },

  /**
   * Return whether `record` is an instance of this Mapper's recordClass.
   *
   * @name Mapper#is
   * @method
   * @param {Object} record The record to check.
   * @return {boolean} Whether `record` is an instance of this Mapper's
   * {@link Mapper#recordClass}.
   */
  is (record) {
    const recordClass = this.recordClass
    return recordClass ? record instanceof recordClass : false
  },

  /**
   * Register an adapter on this mapper under the given name.
   *
   * @name Mapper#registerAdapter
   * @method
   * @param {string} name The name of the adapter to register.
   * @param {Adapter} adapter The adapter to register.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.default=false] Whether to make the adapter the
   * default adapter for this Mapper.
   */
  registerAdapter (name, adapter, opts) {
    const self = this
    opts || (opts = {})
    self.getAdapters()[name] = adapter
    // Optionally make it the default adapter for the target.
    if (opts === true || opts.default) {
      self.defaultAdapter = name
    }
  },

  /**
   * Using the `query` argument, select records to pull from an adapter.
   * Expects back from the adapter the array of selected records.
   *
   * {@link Mapper#beforeSum} will be called before calling the adapter.
   * {@link Mapper#afterSum} will be called after calling the adapter.
   *
   * @name Mapper#sum
   * @method
   * @param {string} field The field to sum.
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * resulting data. If `true` return a response object that includes the
   * resulting data and metadata about the operation.
   * @return {Promise}
   */
  sum (field, query, opts) {
    return this.crud('sum', field, query, opts)
  },

  /**
   * Return a plain object representation of the given record.
   *
   * @name Mapper#toJSON
   * @method
   * @param {Object} record Record from which to create a plain object
   * representation.
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Array of relation names or relation fields
   * to include in the representation.
   * @return {Object} Plain object representation of the record.
   */
  toJSON (record, opts) {
    const self = this
    opts || (opts = {})
    const relationFields = (self ? self.relationFields : []) || []
    let json = {}
    let properties
    if (self && self.schema) {
      properties = self.schema.properties || {}
      // TODO: Make this work recursively
      utils.forOwn(properties, function (opts, prop) {
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
    if (self && opts.withAll) {
      opts.with = relationFields.slice()
    }
    if (self && opts.with) {
      if (utils.isString(opts.with)) {
        opts.with = [opts.with]
      }
      utils.forEachRelation(self, opts, function (def, optsCopy) {
        const relationData = def.getLocalField(record)
        if (relationData) {
          // The actual recursion
          if (utils.isArray(relationData)) {
            def.setLocalField(json, relationData.map(function (item) {
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
   * @name Mapper#update
   * @method
   * @param {(string|number)} id The primary key of the record to update.
   * @param {Object} props The update to apply to the record.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   * @return {Promise}
   */
  update (id, props, opts) {
    return this.crud('update', id, props, opts)
  },

  /**
   * Using the `query` argument, perform the a single updated to the selected
   * records. Expects back from the adapter an array of the updated records.
   *
   * {@link Mapper#beforeUpdateAll} will be called before making the update.
   * {@link Mapper#afterUpdateAll} will be called after making the update.
   *
   * @name Mapper#updateAll
   * @method
   * @param {Object} props Update to apply to selected records.
   * @param {Object} [query={}] Selection query.
   * @param {Object} [query.where] Filtering criteria.
   * @param {number} [query.skip] Number to skip.
   * @param {number} [query.limit] Number to limit to.
   * @param {Array} [query.orderBy] Sorting criteria.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   * @return {Promise}
   */
  updateAll (props, query, opts) {
    return this.crud('updateAll', props, query, opts)
  },

  /**
   * Given an array of updates, perform each of the updates via an adapter. Each
   * "update" is a hash of properties with which to update an record. Each
   * update must contain the primary key to be updated.
   *
   * {@link Mapper#beforeUpdateMany} will be called before making the update.
   * {@link Mapper#afterUpdateMany} will be called after making the update.
   *
   * @name Mapper#updateMany
   * @method
   * @param {Array} records Array up record updates.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.adapter={@link Mapper#defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.notify={@link Mapper#notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Mapper#raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if each record update contains nested updates for relations. NOT
   * performed in a transaction.
   * @return {Promise}
   */
  updateMany (records, opts) {
    return this.crud('updateMany', records, opts)
  },

  /**
   * Validate the given record or records according to this Mapper's
   * {@link Schema}. No return value means no errors.
   *
   * @name Mapper#validate
   * @method
   * @param {Object|Array} record The record or records to validate.
   * @param {Object} [opts] Configuration options. Passed to
   * {@link Schema#validate}.
   * @return {Array} Array of errors or undefined if no errors.
   */
  validate (record, opts) {
    const self = this
    const schema = self.getSchema()
    if (!schema) {
      throw new Error(`${self.name} mapper has no schema!`)
    }
    if (utils.isArray(record)) {
      return record.map(function (_record) {
        return schema.validate(_record, opts)
      })
    } else if (utils.isObject(record)) {
      return schema.validate(record, opts)
    } else {
      throw new Error('not a record!')
    }
  },

  /**
   * Method used to wrap data returned by an adapter with this Mapper's Record
   * class.
   *
   * @name Mapper#wrap
   * @method
   * @param {Object|Array} data The data to be wrapped.
   * @param {Object} [opts] Configuration options. Passed to {@link Mapper#createRecord}.
   * @return {Object|Array}
   */
  wrap (data, opts) {
    return this.createRecord(data, opts)
  }
})
