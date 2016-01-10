import {Query} from './query'
import {
  _,
  addHiddenPropsToTarget,
  classCallCheck,
  deepMixIn,
  eventify,
  fillIn,
  forOwn,
  get,
  isArray,
  isFunction,
  isObject,
  isSorN,
  isString,
  set,
  uuid
} from '../utils'
import {Index} from '../../lib/mindex/index'

/**
 * Holds a set of Model instances. Use a Collection to store and manage
 * instances of Model.
 *
 * ```javascript
 * import {Collection, Model} from 'js-data'
 * class User extends Model {}
 * const UserCollection = new Collection({ model: User })
 * const OtherUserCollection = new Collection([{ id: 1 }, { id: 2 }], { model: User })
 * ```
 *
 * @class Collection
 * @param {Model[]} [models=[]] - Initial set of models to insert into the
 * collection.
 * @param {Object} [opts] - Configuration options.
 * @param {boolean} [opts.autoPk=false]
 * @param {string} [opts.idAttribute]
 * @param {Model} [opts.model] - Reference to the Model type that will be stored
 * by this Collection.
 * @param {Object} [opts.modelOpts={}]
 * @param {string} [opts.onConflict=merge]
 */
export function Collection (models, opts) {
  const self = this

  classCallCheck(self, Collection)

  if (isObject(models) && !isArray(models)) {
    opts = models
    models = []
  }

  // Default values for arguments
  models || (models = [])
  opts || (opts = {})

  /**
   * Reference to this Collection's Model.
   *
   * @name Collection#model
   * @type {Model}
   */
  self.model = opts.model

  // Re-emit any events emitted by this Collection's model.
  if (self.model) {
    self.model.on('all', self._onModelEvent, self)
  }

  /**
   * AutoPk.
   *
   * @name Collection#autoPk
   * @type {boolean}
   * @default false
   */
  self.autoPk = opts.autoPk === undefined ? false : opts.autoPk

  /**
   * Field to be used as the unique identifier for models in this collection.
   * Defaults to `"id"` unless {@link Collection#model} is set, in which case
   * this will default to {@link Model.idAttribute}.
   *
   * @name Collection#idAttribute
   * @type {string}
   */
  self.idAttribute = opts.idAttribute

  /**
   * Any options set here will override any options of {@link Collection#model}.
   * Useful for making multiple collection that use the same Model in different
   * ways.
   *
   * @name Collection#modelOpts
   * @type {Object}
   * @default {}
   */
  self.modelOpts = opts.modelOpts || {}

  /**
   * Event listeners attached to this Collection.
   *
   * @name Collection#_listeners
   * @instance
   * @type {Model}
   * @private
   */
  self._listeners = {}

  /**
   * What to do when inserting a model into this Collection that shares a
   * primary key with a model already in this Collection.
   *
   * Possible values:
   * - merge
   * - replace
   *
   * Merge:
   *
   * Recursively shallow copy properties from the new model onto the existing
   * model.
   *
   * Replace:
   *
   * Shallow copy top-level properties from the new model onto the existing model.
   * Any top-level own properties of the existing model that are _not_ on the new
   * model will be removed.
   *
   * @name Collection#onConflict
   * @type {string}
   * @default merge
   */
  self.onConflict = opts.onConflict || 'merge'

  const idAttribute = self.modelId()

  /**
   * The main index, which uses @{link Collection#modelId} as the key.
   * @name Collection#index
   * @type {Index}
   */
  self.index = new Index([idAttribute], {
    hashCode (obj) {
      return get(obj, idAttribute)
    }
  })

  /**
   * Object that holds the secondary indexes of this collection.
   * @name Collection#indexes
   * @type {Object.<string, Index>}
   */
  self.indexes = {}

  /**
   * Object that holds the timestamps of when models were added to this
   * collection.
   * @name Collection#added
   * @type {Object.<number, Model>}
   */
  self.added = {}

  /**
   * Object that holds the autoPks of models which needed ids to be generated.
   * @name Collection#autoPks
   * @type {Object.<number, Model>}
   */
  self.autoPks = {}

  self.createIndex('addedTimestamps', ['$'], {
    fieldGetter (obj) {
      return self.added[get(obj, idAttribute)]
    }
  })
  models.forEach(function (model) {
    self.index.insertRecord(model)
    if (model && isFunction(model.on)) {
      model.on('all', self._onModelEvent, self)
    }
  })
}

/**
 * TODO
 *
 * @name Collection#on
 * @instance
 * @method
 * @param {string} event - TODO.
 * @param {Function} handler - TODO
 */

 /**
 * TODO
 *
 * @name Collection#off
 * @instance
 * @method
 * @param {string} [event] - TODO.
 * @param {Function} [handler] - TODO
 */

 /**
 * TODO
 *
 * @name Collection#emit
 * @instance
 * @method
 * @param {string} event - TODO.
 * @param {...*} [arg] - TODO
 */

addHiddenPropsToTarget(Collection.prototype, {
  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @private
   * @param {Object} data - TODO.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.autoAdd] - TODO
   */
  _end (data, opts) {
    const self = this
    if (opts.raw) {
      if (opts.autoAdd) {
        data.data = self.add(data.data, opts)
      }
      return data
    } else if (opts.autoAdd) {
      data = self.add(data, opts)
    }
    return data
  },

  /**
   * Used to bind to events emitted by this Collection's Model or models in this
   * Collection.
   *
   * @memberof Collection
   * @instance
   * @private
   * @param {...*} [arg] - Args passed to {@link Collection#emit}.
   */
  _onModelEvent (...args) {
    this.emit(...args)
  },

  /**
   * Insert the provided model or models.
   *
   * If a model is already in the collection then the provided model will
   * either merge with or replace the existing model based on the value of the
   * `onConflict` option.
   *
   * The collection's secondary indexes will be updated as each entity is
   * visited.
   *
   * @memberof Collection
   * @instance
   * @param {(Object|Object[]|Model|Model[])} data - The model or models to insert.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.autoPk={@link Collection.autoPk}] - Whether to
   * generate primary keys for the models to be inserted. Useful for inserting
   * temporary, unsaved data into the collection.
   * @param {string} [opts.onConflict] - What to do when a model is already in
   * the collection. Possible values are `merge` or `replace`.
   * @return {(Model|Model[])} The added model or models.
   */
  add (models, opts) {
    const self = this

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Collection's configuration
    _(self, opts)
    models = self.beforeAdd(models, opts) || models

    // Track whether just one or an array of models is being inserted
    let singular = false
    const idAttribute = self.modelId()
    const relationList = self.model ? self.model.relationList || [] : []
    const timestamp = new Date().getTime()
    if (!isArray(models)) {
      models = [models]
      singular = true
    }

    // Map the provided models to existing models.
    // New models will be inserted. If any props map to existing models,
    // they will be merged into the existing models according to the onConflict
    // option.
    models = models.map(function (props) {
      let id = self.modelId(props)
      // Track whether we had to generate an id for this model
      // Validate that the primary key attached to the model is a string or
      // number
      let autoPk = false
      if (!isSorN(id)) {
        // No id found, generate one
        if (opts.autoPk) {
          id = uuid()
          set(props, idAttribute, id)
          autoPk = true
        } else {
          // Not going to generate one, throw an error
          throw new TypeError(`${idAttribute}: Expected string or number, found ${typeof id}!`)
        }
      }
      // Grab existing model if there is one
      const existing = self.get(id)
      // If the currently visited props are just reference to the existing
      // model, then there is nothing to be done. Exit early.
      if (props === existing) {
        return existing
      }

      // Check the currently visited props for relations that need to be
      // inserted as well
      relationList.forEach(function (def) {
        // A reference to the Model that this Model is related to
        const Relation = def.getRelation()
        if (!Relation.idAttribute) {
          return
        }
        // The field used by the related Model as the primary key
        const relationIdAttribute = Relation.idAttribute
        // Grab the foreign key in this relationship, if there is one
        const foreignKey = def.foreignKey

        // Grab a reference to the related data attached or linked to the
        // currently visited props
        let toInsert = get(props, def.getLocalField())

        // If the user provided a custom insertion function for this relation,
        // call it
        if (isFunction(def.add)) {
          def.add(self, def, props)
        } else if (toInsert && def.add !== false) {
          // Otherwise, if there is something to be added, add it
          if (isArray(toInsert)) {
            // Handle inserting hasMany relations
            toInsert = toInsert.map(function (toInsertItem) {
              // Check that this item isn't the same item that is already in the
              // store
              if (!Relation.is(toInsertItem)) {
                try {
                  // Make sure this item has its foreignKey
                  if (foreignKey) {
                    set(toInsertItem, foreignKey, id)
                  }
                  // Finally add this related item
                  toInsertItem = Relation.createInstance(toInsertItem)
                } catch (err) {
                  throw new Error(`Failed to insert ${def.type} relation: "${def.relation}"! ${err.message}`)
                }
              }
              return toInsertItem
            })
            // If it's the parent that has the localKeys
            if (def.localKeys) {
              set(props, def.localKeys, toInsert.map(function (inserted) {
                return get(inserted, relationIdAttribute)
              }))
            }
          } else {
            // Handle inserting belongsTo and hasOne relations
            if (!Relation.is(toInsert)) {
              try {
                // Make sure this item has its foreignKey
                if (foreignKey) {
                  set(toInsert, def.foreignKey, id)
                }
                // Finally insert this related item
                toInsert = Relation.createInstance(toInsert)
              } catch (err) {
                throw new Error(`Failed to insert ${def.type} relation: "${def.relation}"!`)
              }
            }
          }
        }
        set(props, def.localField, toInsert)
      })

      if (existing) {
        // Here, the currently visited props corresponds to an entity already
        // in the collection, so we need to merge them
        const onConflict = opts.onConflict || self.onConflict
        if (onConflict === 'merge') {
          deepMixIn(existing, props)
        } else if (onConflict === 'replace') {
          forOwn(existing, (value, key) => {
            if (key !== idAttribute && !props.hasOwnProperty(key)) {
              delete existing[key]
            }
          })
          existing.set(props)
        }
        props = existing
        // Update all indexes in the collection
        self.updateIndexes(props)
      } else {
        // Here, the currently visted props does not correspond to any model
        // in the collection, so make this props is an instance of this Model
        // and insert it into the collection
        props = self.model ? self.model.createInstance(props) : props
        self.index.insertRecord(props)
        forOwn(self.indexes, function (index, name) {
          index.insertRecord(props)
        })
        if (props && isFunction(props.on)) {
          props.on('all', self._onModelEvent, self)
          self.emit('add', props)
        }
      }
      // Track when this model was added
      self.added[id] = timestamp
      if (autoPk) {
        self.autoPks[id] = props
      }
      return props
    })
    // Finally, return the inserted data
    const result = singular ? (models.length ? models[0] : undefined) : models
    return self.afterAdd(models, opts, result) || result
  },

  /**
   * Lifecycle hook called by {@link Collection#add}. If this method returns a
   * value then {@link Collection#add} will return that same value.
   *
   * @memberof Collection
   * @instance
   * @param {(Model|Model[])} result - The model or models that were added to
   * this Collection by {@link Collection#add}.
   * @param {Object} opts - The `opts` argument passed to {@link Collection#add}.
   */
  afterAdd () {},

  /**
   * Lifecycle hook called by {@link Collection#remove}. If this method returns
   * a value then {@link Collection#remove} will return that same value.
   *
   * @memberof Collection
   * @instance
   * @param {(string|number)} id - The `id` argument passed to {@link Collection#remove}.
   * @param {Object} opts - The `opts` argument passed to {@link Collection#remove}.
   * @param {Object} model - The result that will be returned by {@link Collection#remove}.
   */
  afterRemove () {},

  /**
   * Lifecycle hook called by {@link Collection#removeAll}. If this method
   * returns a value then {@link Collection#removeAll} will return that same
   * value.
   *
   * @memberof Collection
   * @instance
   * @param {Object} query - The `query` argument passed to {@link Collection#removeAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Collection#removeAll}.
   * @param {Object} models - The result that will be returned by {@link Collection#removeAll}.
   */
  afterRemoveAll () {},

  /**
   * Lifecycle hook called by {@link Collection#add}. If this method returns a
   * value then the `models` argument in {@link Collection#add} will be
   * re-assigned to the returned value.
   *
   * @memberof Collection
   * @instance
   * @param {(Model|Model[])} models - The `models` argument passed to {@link Collection#add}.
   * @param {Object} opts - The `opts` argument passed to {@link Collection#add}.
   */
  beforeAdd () {},

  /**
   * Lifecycle hook called by {@link Collection#remove}.
   *
   * @memberof Collection
   * @instance
   * @param {(string|number)} id - The `id` argument passed to {@link Collection#remove}.
   * @param {Object} opts - The `opts` argument passed to {@link Collection#remove}.
   */
  beforeRemove () {},

  /**
   * Lifecycle hook called by {@link Collection#removeAll}.
   *
   * @memberof Collection
   * @instance
   * @param {Object} query - The `query` argument passed to {@link Collection#removeAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Collection#removeAll}.
   */
  beforeRemoveAll () {},

  /**
   * Find all entities between two boundaries.
   *
   * Shortcut for `collection.query().between(18, 30, { index: 'age' }).run()`
   *
   * Get all users ages 18 to 30:
   * ```javascript
   * const users = collection.between(18, 30, { index: 'age' })
   * ```
   * Same as above:
   * ```javascript
   * const users = collection.between([18], [30], { index: 'age' })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Array} leftKeys - Keys defining the left boundary.
   * @param {Array} rightKeys - Keys defining the right boundary.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @param {boolean} [opts.leftInclusive=true] - Whether to include entities
   * on the left boundary.
   * @param {boolean} [opts.rightInclusive=false] - Whether to include entities
   * on the left boundary.
   * @param {boolean} [opts.limit] - Limit the result to a certain number.
   * @param {boolean} [opts.offset] - The number of resulting entities to skip.
   * @return {Array} The result.
   */
  between (leftKeys, rightKeys, opts) {
    return this.query().between(leftKeys, rightKeys, opts).run()
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {Object} props - Passed to {@link Model.create}.
   * @param {Object} [opts] - Passed to {@link Model.create}. See
   * {@link Model.create} for more configuration options.
   * @param {boolean} [opts.autoAdd] - TODO
   * @return {Promise}
   */
  create (props, opts) {
    const self = this
    const id = self.modelId(props)
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.create(props, opts).then(function (data) {
      // If the created model was already in this Collection via an autoPk id,
      // remove it from the collection
      // TODO: Fix this?
      if (self.autoPks[id]) {
        self.remove(id)
      }
      return self._end(data, opts)
    })
  },

  /**
   * Create a new secondary index on the contents of the collection.
   *
   * Index users by age:
   * ```javascript
   * collection.createIndex('age')
   * ```
   * Index users by status and role:
   * ```javascript
   * collection.createIndex('statusAndRole', ['status', 'role'])
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {string} name - The name of the new secondary index.
   * @param {string[]} [fieldList] - Array of field names to use as the key or
   * compound key of the new secondary index. If no fieldList is provided, then
   * the name will also be the field that is used to index the collection.
   * @return {Collection} A reference to itself for chaining.
   */
  createIndex (name, fieldList, opts) {
    const self = this
    if (isString(name) && fieldList === undefined) {
      fieldList = [name]
    }
    opts || (opts = {})
    opts.hashCode = opts.hashCode || function (obj) {
      return self.modelId(obj)
    }
    const index = self.indexes[name] = new Index(fieldList, opts)
    self.index.visitAll(index.insertRecord, index)
    return self
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {Array} models - Passed to {@link Model.createMany}.
   * @param {Object} [opts] - Passed to {@link Model.createMany}. See
   * {@link Model.createMany} for more configuration options.
   * @param {boolean} [opts.autoAdd] - TODO
   * @return {Promise}
   */
  createMany (models, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.createMany(models, opts).then(function (data) {
      // If the created models were already in this Collection via an autoPk
      // id, remove them from the Collection
      // TODO: Fix this?
      models.forEach(function (model) {
        const id = self.modelId(model)
        if (self.autoPks[id]) {
          self.remove(id)
        }
      })
      return self._end(data, opts)
    })
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {(string|number)} id - Passed to {@link Model.destroy}.
   * @param {Object} [opts] - Passed to {@link Model.destroy}. See
   * {@link Model.destroy} for more configuration options.
   * @return {Promise}
   */
  destroy (id, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.destroy(id, opts).then(function (data) {
      if (opts.raw) {
        data.data = self.remove(id, opts)
      } else {
        data = self.remove(id, opts)
      }
      return data
    })
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {Object} [query] - Passed to {@link Model.destroyAll}.
   * @param {Object} [opts] - Passed to {@link Model.destroyAll}. See
   * {@link Model.destroyAll} for more configuration options.
   * @return {Promise}
   */
  destroyAll (query, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.destroyAll(query, opts).then(function (data) {
      if (opts.raw) {
        data.data = self.removeAll(query, opts)
      } else {
        data = self.removeAll(query, opts)
      }
      return data
    })
  },

  /**
   * Find the entity or entities that match the provided query or pass the
   * provided filter function.
   *
   * Shortcut for `collection.query().filter(queryOrFn[, thisArg]).run()`
   *
   * Get the draft posts created less than three months:
   * ```javascript
   * const posts = collection.filter({
   *   where: {
   *     status: {
   *       '==': 'draft'
   *     },
   *     created_at_timestamp: {
   *       '>=': (new Date().getTime() - (1000 * 60 * 60 * 24 * 30 * 3)) // 3 months ago
   *     }
   *   }
   * })
   * ```
   * Use a custom filter function:
   * ```javascript
   * const posts = collection.filter(function (post) {
   *   return post.isReady()
   * })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {(Object|Function)} [queryOrFn={}] - Selection query or filter
   * function.
   * @param {Object} [thisArg] - Context to which to bind `queryOrFn` if
   * `queryOrFn` is a function.
   * @return {Array} The result.
   */
  filter (query, thisArg) {
    return this.query().filter(query, thisArg).run()
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {(string|number)} id - Passed to {@link Model.find}.
   * @param {Object} [opts] - Passed to {@link Model.find}.
   * @param {boolean} [opts.autoAdd] - TODO
   * @return {Promise}
   */
  find (id, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.find(id, opts).then(function (data) {
      return self._end(data, opts)
    })
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {Object} [query] - Passed to {@link Model.findAll}.
   * @param {Object} [opts] - Passed to {@link Model.findAll}.
   * @param {boolean} [opts.autoAdd] - TODO
   * @return {Promise}
   */
  findAll (query, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.findAll(query, opts).then(function (data) {
      return self._end(data, opts)
    })
  },

  /**
   * Iterate over all entities.
   *
   * ```javascript
   * collection.forEach(function (entity) {
   *   // do something
   * })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Function} forEachFn - Iteration function.
   * @param {*} [thisArg] - Context to which to bind `forEachFn`.
   * @return {Array} The result.
   */
  forEach (cb, thisArg) {
    this.index.visitAll(cb, thisArg)
  },

  /**
   * Get the model with the given id.
   *
   * @memberof Collection
   * @instance
   * @param {(string|number)} id - The primary key of the model to get.
   * @return {Model} The model with the given id.
   */
  get (id) {
    const instances = this.query().get(id).run()
    return instances.length ? instances[0] : undefined
  },

  /**
   * Find the entity or entities that match the provided keyLists.
   *
   * Shortcut for `collection.query().getAll(keyList1, keyList2, ...).run()`
   *
   * Get the posts where "status" is "draft" or "inReview":
   * ```javascript
   * const posts = collection.getAll('draft', 'inReview', { index: 'status' })
   * ```
   * Same as above:
   * ```javascript
   * const posts = collection.getAll(['draft'], ['inReview'], { index: 'status' })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {...Array} [keyList] - Provide one or more keyLists, and all
   * entities matching each keyList will be retrieved. If no keyLists are
   * provided, all entities will be returned.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] - Name of the secondary index to use in the
   * query. If no index is specified, the main index is used.
   * @return {Array} The result.
   */
  getAll (...args) {
    return this.query().getAll(...args).run()
  },

  /**
   * Return the entities in this Collection that have a primary key that
   * was automatically generated when they were inserted.
   *
   * @memberof Collection
   * @instance
   * @return {Model[]} The models that have autoPks.
   */
  getAutoPkItems () {
    const self = this
    return self.getAll().filter(function (model) {
      return self.autoPks[self.modelId(model)]
    })
  },

  /**
   * Limit the result.
   *
   * Shortcut for `collection.query().limit(maximumNumber).run()`
   *
   * ```javascript
   * const posts = collection.limit(10)
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {number} num - The maximum number of entities to keep in the result.
   * @return {Array} The result.
   */
  limit (num) {
    return this.query().limit(num).run()
  },

  /**
   * Apply a mapping function to all entities.
   *
   * ```javascript
   * const names = collection.map(function (user) {
   *   return user.name
   * })
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Function} mapFn - Mapping function.
   * @param {*} [thisArg] - Context to which to bind `mapFn`.
   * @return {Array} The result of the mapping.
   */
  map (cb, thisArg) {
    const data = []
    this.index.visitAll(function (value) {
      data.push(cb.call(thisArg, value))
    })
    return data
  },

  /**
   * Return the result of calling the specified function on each item in this
   * collection's main index.
   *
   * @memberof Collection
   * @instance
   * @param {string} funcName - Name of function to call
   * @parama {...*} [args] - Remaining arguments to be passed to the function.
   * @return {Array} The result.
   */
  mapCall (funcName, ...args) {
    const data = []
    this.index.visitAll(function (item) {
      data.push(item[funcName](...args))
    })
    return data
  },

  /**
   * Return the primary key of the given, or if no model is provided, return the
   * name of the field that holds the primary key of models in this Collection.
   *
   * @memberof Collection
   * @instance
   * @param {Model} [model] - The model whose primary key is to be returned.
   * @return {(string|number)} - Primary key or name of field that holds primary
   * key.
   */
  modelId (model) {
    const self = this
    if (!model) {
      return self.model ? self.model.idAttribute : self.idAttribute || 'id'
    }
    return get(model, self.modelId())
  },

  /**
   * Create a new query to be executed against the contents of the collection.
   * The result will be all or a subset of the contents of the collection.
   *
   * Grab page 2 of users between ages 18 and 30:
   * ```javascript
   * collection.query()
   *   .between(18, 30, { index: 'age' }) // between ages 18 and 30
   *   .skip(10) // second page
   *   .limit(10) // page size
   *   .run()
   * ```
   *
   * @memberof Collection
   * @instance
   * @return {Query} New query object.
   */
  query () {
    return new Query(this)
  },

  /**
   * Reduce the data in the collection to a single value and return the result.
   *
   * ```javascript
   * const totalVotes = collection.reduce(function (prev, entity) {
   *   return prev + entity.upVotes + entity.downVotes
   * }, 0)
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {Function} cb - Reduction callback.
   * @param {*} initialValue - Initial value of the reduction.
   * @return {*} The result.
   */
  reduce (cb, initialValue) {
    const data = this.getAll()
    return data.reduce(cb, initialValue)
  },

  /**
   * Remove the model with the given id from this Collection.
   *
   * @memberof Collection
   * @instance
   * @param {(string|number)} id - The primary key of the entity to be removed.
   * @param {Object} [opts] - Configuration options.
   * @return {Model} The removed entity, if any.
   */
  remove (id, opts) {
    const self = this

    // Default values for arguments
    opts || (opts = {})
    self.beforeRemove(id, opts)
    const model = self.get(id)

    // The model is in the collection, remove it
    if (model) {
      delete self.added[id]
      delete self.autoPks[id]
      self.index.removeRecord(model)
      forOwn(self.indexes, function (index, name) {
        index.removeRecord(model)
      })
      if (model && isFunction(model.off)) {
        model.off('all', self._onModelEvent, self)
        self.emit('remove', model)
      }
    }
    return self.afterRemove(id, opts, model) || model
  },

  /**
   * Remove the instances selected by "query" from the Collection instance of
   * this Model.
   *
   * @memberof Collection
   * @instance
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} [opts] - Configuration options.
   * @return {Model[]} The removed entites, if any.
   */
  removeAll (query, opts) {
    const self = this
    // Default values for arguments
    opts || (opts = {})
    self.beforeRemoveAll(query, opts)
    const models = self.filter(query)

    // Remove each selected entity from the collection
    models.forEach(function (item) {
      self.remove(self.modelId(item))
    })
    return self.afterRemoveAll(query, opts, models) || models
  },

  /**
   * Skip a number of results.
   *
   * Shortcut for `collection.query().skip(numberToSkip).run()`
   *
   * ```javascript
   * const posts = collection.skip(10)
   * ```
   *
   * @memberof Collection
   * @instance
   * @param {number} num - The number of entities to skip.
   * @return {Array} The result.
   */
  skip (num) {
    return this.query().skip(num).run()
  },

  /**
   * Return the plain JSON representation of all items in this collection.
   * Assumes entities in this collection have a toJSON method.
   *
   * @memberof Collection
   * @instance
   * @param {Object} [opts] - Configuration options.
   * @param {string[]} [opts.with] - Array of relation names or relation fields
   * to include in the representation.
   * @return {Array} The entities.
   */
  toJSON (opts) {
    return this.mapCall('toJSON', opts)
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {(string|number)} id - Passed to {@link Model.update}.
   * @param {Object} props - Passed to {@link Model.update}.
   * @param {Object} [opts] - Passed to {@link Model.update}. See
   * {@link Model.update} for more configuration options.
   * @param {boolean} [opts.autoAdd] - TODO
   * @return {Promise}
   */
  update (id, props, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.update(id, props, opts).then(function (data) {
      return self._end(data, opts)
    })
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {Object?} query - Passed to {@link Model.updateAll}.
   * @param {Object} props - Passed to {@link Model.updateAll}.
   * @param {Object} [opts] - Passed to {@link Model.updateAll}. See
   * {@link Model.updateAll} for more configuration options.
   * @param {boolean} [opts.autoAdd] - TODO
   * @return {Promise}
   */
  updateAll (query, props, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.updateAll(query, props, opts).then(function (data) {
      return self._end(data, opts)
    })
  },

  /**
   * Update a record's position in a single index of this collection. See
   * {@link Collection#updateIndexes} to update a record's position in all
   * indexes at once.
   *
   * @memberof Collection
   * @instance
   * @param {Object} record - The record to update.
   * @param {Object} [opts] - Configuration options.
   * @param {string} [opts.index] The index in which to update the record's
   * position. If you don't specify an index then the record will be updated
   * in the main index.
   */
  updateIndex (record, opts) {
    opts || (opts = {})
    const index = opts.index ? this.indexes[opts.index] : this.index
    index.updateRecord(record)
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {Object} record - TODO
   * @param {Object} [opts] - Configuration options.
   */
  updateIndexes (record) {
    const self = this
    self.index.updateRecord(record)
    forOwn(self.indexes, function (index, name) {
      index.updateRecord(record)
    })
  },

  /**
   * TODO
   *
   * @memberof Collection
   * @instance
   * @param {Model[]} models - Passed to {@link Model.updateMany}.
   * @param {Object} [opts] - Passed to {@link Model.updateMany}. See
   * {@link Model.updateMany} for more configuration options.
   * @param {boolean} [opts.autoAdd] - TODO
   * @return {Promise}
   */
  updateMany (models, opts) {
    const self = this
    opts || (opts = {})
    fillIn(opts, self.modelOpts)
    return self.model.updateMany(models, opts).then(function (data) {
      return self._end(data, opts)
    })
  }
})

eventify(
  Collection.prototype,
  function () {
    return this._listeners
  },
  function (value) {
    this._listeners = value
  }
)
