import * as utils from '../utils'
import {
  belongsTo,
  configure,
  hasMany,
  hasOne,
  setSchema,
  registerAdapter
} from '../decorators/index'
import {Collection} from '../collection/index'
import * as validate from '../validate/index'

const {
  resolve
} = utils

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

const notify = function (...args) {
  const self = this
  const opts = args.pop()
  self.dbg(opts.op, ...args)
  if (opts.notify || (opts.notify === undefined && self.notify)) {
    setTimeout(() => {
      self.emit(opts.op, ...args)
    })
  }
}

/**
 * js-data's Model class.
 * @class Model
 * @example {@lang javascript}class User extends Model {}
 *
 * @abstract
 * @param {Object} [props] The initial properties of the new instance.
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
 * initial properties.
 */
export function Model (props, opts) {
  utils.classCallCheck(this, Model)
  props || (props = {})
  opts || (opts = {})
  const _props = {}
  Object.defineProperties(this, {
    _get: {
      value (key) {
        return utils.get(_props, key)
      }
    },
    _set: {
      value (key, value) {
        return utils.set(_props, key, value)
      }
    },
    _unset: {
      value (key) {
        return utils.unset(_props, key)
      }
    }
  })
  this._set('creating', true)
  if (opts.noValidate) {
    this._set('noValidate', true)
  }
  utils.fillIn(this, props)
  this._unset('creating')
  this._set('changes', {})
  this._unset('noValidate')
  this._set('previous', utils.copy(props))
}

/**
 * Instance members
 */
utils.addHiddenPropsToTarget(Model.prototype, {
  schema (key) {
    let _schema = this.constructor.schema
    return key ? _schema[key] : _schema
  },

  validate (obj, value) {
    let errors = []
    let _schema = this.schema()
    if (!obj) {
      obj = this
    } else if (utils.isString(obj)) {
      const prop = _schema[obj]
      if (prop) {
        errors = validate.validate(prop, value) || []
      }
    } else {
      utils.forOwn(_schema, function (prop, key) {
        errors = errors.concat(validate.validate(prop, utils.get(obj, key)) || [])
      })
    }
    return errors.length ? errors : undefined
  },

  /**
   * @param {Object} [opts] Configuration options. @see {@link Model.create}.
   */
  create (opts) {
    return this.constructor.create(this, opts)
  },

  beforeSave () {},
  save (opts) {
    const Ctor = this.constructor
    const op = 'save'
    Ctor.dbg(op, 'instance:', this, 'opts:', opts)
    let adapterName

    opts || (opts = {})
    utils._(Ctor, opts)
    opts.op = op

    return resolve(this.beforeSave(opts))
      .then(() => {
        adapterName = Ctor.getAdapterName(opts)
        return Ctor.getAdapter(adapterName)
          .update(Ctor, utils.get(this, Ctor.idAttribute), this.toJSON(opts), opts)
      })
      .then(data => {
        return resolve(this.afterSave(opts))
          .then(() => Ctor.end(data, opts, adapterName))
      })
  },
  afterSave () {},

  /**
   * @param {Object} [opts] Configuration options. @see {@link Model.destroy}.
   */
  destroy (opts) {
    // TODO: move actual destroy logic here
    const Ctor = this.constructor
    return Ctor.destroy(utils.get(this, Ctor.idAttribute), opts)
  },

  // TODO: move logic for single-item async operations onto the instance.

  /**
   * Return the value at the given path for this instance.
   *
   * @param {string} key - Path of value to retrieve.
   * @return {*} Value at path.
   */
  get: function (key) {
    return utils.get(this, key)
  },

  /**
   * Set the value for a given key, or the values for the given keys if "key" is
   * an object.
   *
   * @param {(string|Object)} key - Key to set or hash of key-value pairs to set.
   * @param {*} [value] - Value to set for the given key.
   * @param {Object} [opts] - Optional configuration.
   * @param {boolean} [opts.silent=false] - Whether to trigger change events.
   */
  set: function (key, value, opts) {
    if (utils.isObject(key)) {
      opts = value
    }
    opts || (opts = {})
    if (opts.silent) {
      this._set('silent', true)
    }
    utils.set(this, key, value)
    if (!this._get('eventId')) {
      this._unset('silent')
    }
  },

  /**
   * Unset the value for a given key.
   *
   * @param {string} key - Key to unset.
   * @param {Object} [opts] - Optional configuration.
   * @param {boolean} [opts.silent=false] - Whether to trigger change events.
   */
  unset (key, opts) {
    opts || (opts = {})
    if (opts.silent) {
      this._set('silent', true)
    }
    utils.unset(this, key)
    if (!this._get('eventId')) {
      this._unset('silent')
    }
  },

  hashCode () {
    return utils.get(this, this.constructor.idAttribute)
  },

  changes (key) {
    if (key) {
      return this._get(`changes.${key}`)
    }
    return this._get('changes')
  },

  hasChanges () {
    return !!(this._get('changed') || []).length
  },

  commit () {
    this._unset('changed')
    this._set('changes', {})
    this._set('previous', utils.copy(this))
    return this
  },

  previous (key) {
    if (key) {
      return this._get(`previous.${key}`)
    }
    return this._get('previous')
  },

  revert (opts) {
    const previous = this._get('previous') || {}
    opts || (opts = {})
    opts.preserve || (opts.preserve = [])
    utils.forOwn(this, (value, key) => {
      if (key !== this.constructor.idAttribute && !previous.hasOwnProperty(key) && this.hasOwnProperty(key) && opts.preserve.indexOf(key) === -1) {
        delete this[key]
      }
    })
    utils.forOwn(previous, (value, key) => {
      if (opts.preserve.indexOf(key) === -1) {
        this[key] = value
      }
    })
    this.commit()
    return this
  },

  /**
   * Return a plain object representation of this instance.
   *
   * @param {Object} [opts] - Configuration options.
   * @param {string[]} [opts.with] - Array of relation names or relation fields
   * to include in the representation.
   * @return {Object} Plain object representation of instance.
   */
  toJSON (opts) {
    opts || (opts = {})
    const Ctor = this.constructor
    let json = this
    if (this instanceof Model) {
      json = {}
      for (var key in this) {
        json[key] = this[key]
      }
      // The user wants to include relations in the resulting plain object
      // representation
      if (Ctor && Ctor.relationList && opts.with) {
        if (utils.isString(opts.with)) {
          opts.with = [opts.with]
        }
        Ctor.relationList.forEach(def => {
          let containedName
          if (opts.with.indexOf(def.relation) !== -1) {
            containedName = def.relation
          } else if (opts.with.indexOf(def.localField) !== -1) {
            containedName = def.localField
          }
          if (containedName) {
            const optsCopy = { with: opts.with.slice() }

            // Prepare to recurse into deeply nested relations
            optsCopy.with.splice(optsCopy.with.indexOf(containedName), 1)
            optsCopy.with.forEach((relation, i) => {
              if (relation && relation.indexOf(containedName) === 0 && relation.length >= containedName.length && relation[containedName.length] === '.') {
                optsCopy.with[i] = relation.substr(containedName.length + 1)
              } else {
                optsCopy.with[i] = ''
              }
            })
            const relationData = utils.get(this, def.localField)

            if (relationData) {
              // The actual recursion
              if (utils.isArray(relationData)) {
                utils.set(json, def.localField, relationData.map(item => def.Relation.prototype.toJSON.call(item, optsCopy)))
              } else {
                utils.set(json, def.localField, def.Relation.prototype.toJSON.call(relationData, optsCopy))
              }
            }
          }
        })
      }
    }
    return json
  }
})

/**
 * Static members
 */
utils.fillIn(Model, {
  /**
   * Hash of registered adapters. Don't modify. Use {@link Model.registerAdapter}.
   *
   * @memberOf Model
   * @private
   */
  _adapters: null,

  /**
   * @ignore
   */
  _adaptersOwner: null,

  /**
   * This Model's {@link Collection} instance. This is where instances of the
   * Model are stored if {@link Model.autoInject} is `true`.
   *
   * __You should use {@link Model.inject}, {@link Model.eject}, and
   * {@link Model.ejectAll} if you need to manually get data in and out of this
   * collection.__
   *
   * @memberof Model
   * @private
   * @type {Collection}
   */
  _collection: null,

  /**
   * @ignore
   */
  _collectionOwner: null,

  /**
   * Hash of registered listeners. Don't modify. Use {@link Model.on} and
   * {@link Model.off}.
   *
   * @memberOf Model
   * @private
   */
  _listeners: null,

  /**
   * @ignore
   */
  _listenersOwner: null,

  /**
   * Whether {@link Model.destroy} and {@link Model.destroyAll} should
   * automatically eject the specified item(s) from the Model's collection on
   * success.
   *
   * @memberof Model
   * @type {boolean}
   * @default true
   */
  autoEject: true,

  /**
   * Whether {@link Model.create}, {@link Model.createMany},
   * {@link Model.update}, {@link Model.updateAll}, {@link Model.updateMany},
   * {@link Model.save}, should automatically inject the specified item(s)
   * returned by the adapter into the the Model's collection on success.
   *
   * __Defaults to `true` in the Browser.__
   *
   * __Defaults to `false` in Node.js__
   *
   * @memberof Model
   * @type {boolean}
   */
  autoInject: isBrowser,
  bypassCache: false,

  /**
   * Whether to disallow the use of `new Function` in {@link Model.extend}.
   *
   * You may set this to `true` if you so desire, but the class (constructor
   * function) produced by {@link Model.extend} will not be a named function,
   * which makes for slightly less debuggability.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  csp: false,

  /**
   * The name of the registered adapter that should be used by default by any
   * of the Model's static methods that use an adapter.
   *
   * @memberof Model
   * @type {string}
   * @default http
   */
  defaultAdapter: 'http',

  /**
   * Whether to enable debug-level logs.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  debug: false,
  eagerEject: false,

  /**
   * The field on instances of {@link Model} that should be used as the unique
   * identifier for instances of the Model.
   *
   * @memberof Model
   * @type {string}
   * @default id
   */
  idAttribute: 'id',

  /**
   * Whether to add property accessors to the prototype of {@link Model} for
   * each of the Model's relations. For each relation, the property accessor
   * will be added as the field specified by the `localField` option of the
   * relation definition. A relation property accessor returns related data by
   * accessing the related Model. If the related Model's collection is empty,
   * then the property accessors won't return anything.
   *
   * __Defaults to `true` in the Browser.__
   *
   * __Defaults to `false` in Node.js__
   *
   * @memberof Model
   * @type {boolean}
   */
  linkRelations: isBrowser,

  /**
   * Whether this Model should emit operational events.
   *
   * __Defaults to `true` in the Browser.__
   *
   * __Defaults to `false` in Node.js__
   *
   * @memberof Model
   * @type {boolean}
   */
  notify: isBrowser,

  /**
   * What to do when injecting an item into the Model's collection that shares a
   * primary key with an item already in the Model's collection.
   *
   * Possible values:
   * - merge
   * - replace
   *
   * Merge:
   *
   * Recursively shallow copy properties from the new item onto the existing
   * item.
   *
   * Replace:
   *
   * Shallow copy top-level properties from the new item onto the existing item.
   * Any top-level own properties of the existing item that are _not_ on the new
   * item will be removed.
   *
   * @memberof Model
   * @type {string}
   * @default merge
   */
  onConflict: 'merge',

  /**
   * Whether the relation property accessors should be enumerable. It's
   * recommended that this stay false.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  relationsEnumerable: false,

  /**
   * Whether {@link Model.create}, {@link Model.createMany}, {@link Model.save},
   * {@link Model.update}, {@link Model.updateAll}, {@link Model.updateMany},
   * {@link Model.find}, {@link Model.findAll}, {@link Model.destroy}, and
   * {@link Model.destroyAll} should return a raw result object that contains
   * both the instance data returned by the adapter _and_ metadata about the
   * operation.
   *
   * The default is to NOT return the result object, and instead return just the
   * instance data.
   *
   * @memberof Model
   * @type {boolean}
   * @default false
   */
  raw: false,

  /**
   * Whether {@link Model.create} and {@link Model.createMany} should instead
   * call {@link Model.update} and {@link Model.updateMany} if the provided
   * props/entities already contain a primary key.
   *
   * @memberof Model
   * @type {boolean}
   * @default true
   */
  upsert: true,

  /**
   * @memberOf Model
   * @method
   * @private
   */
  _events (value) {
    if (value) {
      this._listeners = value
    } else if (this._listenersOwner !== this) {
      this._listeners = {}
      this._listenersOwner = this
    }
    return this._listeners
  },

  end (data, opts) {
    const self = this
    if (opts.raw) {
      if (opts.autoInject) {
        data.data = self.inject(data.data)
      }
      utils._(opts, data)
      return data
    } else if (opts.autoInject) {
      data = self.inject(data)
    }
    if (opts.notify) {
      setTimeout(function () {
        self.emit(opts.op, data, opts)
      })
    }
    return data
  },

  /**
   * Create a new secondary index in the Collection instance of this Model.
   *
   * @memberof Model
   * @method
   * @param {string} name - The name of the new secondary index
   * @param {string[]} fieldList - The list of keys to be used to create the index.
   * @param {Object} [opts] - Configuration options.
   * @param {Function} [opts.fieldGetter] - Getter function to be used to grab
   * values off of instances for each field in the index's field list. Will be
   * passed the instance and the field to be retrieved.
   * @param {Function} [opts.hashCode] - Function used to return a unique
   * identifier for each instance in the collection. Will be passed the instance.
   */
  createIndex (name, fieldList, opts) {
    this.dbg('createIndex', 'name:', name, 'fieldList:', fieldList, 'opts:', opts)
    this.getCollection().createIndex(name, fieldList, opts)
  },

  /**
   * Return new instance of this Model from the given properties. Equivalent to
   * `new Model([props][, opts])`. Returns `props` if `props` is already an
   * instance of this Model.
   *
   * @memberof Model
   * @method
   * @param {Object} props - The initial properties of the new instance.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
   * initial properties.
   * @return {Model} The instance.
   */
  createInstance (props, opts) {
    let Ctor = this
    // Check to make sure "props" is not already an instance of this Model.
    return props instanceof Ctor ? props : new Ctor(props, opts)
  },

  /**
   * Return whether `instance` is an instance of this Model.
   *
   * @memberof Model
   * @method
   * @param {Object} instance - The instance to check.
   * @return {boolean} Whether `instance` is an instance of this Model.
   */
  is (instance) {
    return instance instanceof this
  },

  /**
   * Return the entities in this Model's collection that have a primary key that
   * was automatically generated when they were injected into the collection.
   *
   * @memberof Model
   * @method
   * @return {Model[]} The entities where with autoPks.
   */
  getAutoPkItems () {
    return this.getAll().filter(function (item) {
      return item._get('autoPk')
    })
  },

  /**
   * If the entity with the given primary key is currently in this Model's
   * collection, return the result of calling {@link Model#changes} on that
   * entity, otherwise return undefined.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} [id] - If provided, only return changes for the
   * entity with the given primary key.
   * @return {(Object|Array)} Changes to the entity since the entity was instantiated.
   */
  changes (id) {
    this.dbg('changes', 'id:', id)
    if (utils.isSorN(id)) {
      const instance = this.get(id)
      return instance ? instance.changes() : undefined
    } else {
      return this.getCollection().mapCall('changes')
    }
  },

  /**
   * If the entity with the given primary key is currently in this Model's
   * collection, return the result of calling {@link Model#hasChanges} on that
   * entity, otherwise return undefined.
   *
   * If no primary key is provided, return whether any entity in this Model's
   * collection has any changes.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} [id] - The primary key of the entity.
   * @return {boolean} Whether the entity has any changes, or whether any entity
   * in this Model's collection has any changes.
   */
  hasChanges (id) {
    this.dbg('hasChanges', 'id:', id)
    if (utils.isSorN(id)) {
      const instance = this.get(id)
      if (instance) {
        return instance.hasChanges()
      }
    } else {
      let hasChanges = false
      this.getCollection().forEach(function (item) {
        hasChanges = hasChanges || item.hasChanges()
      })
      return hasChanges
    }
  },

  beforeInject () {},

  /**
   * Insert the provided entity or entities into this Model's collection.
   *
   * If an entity is already in the collection then the provided entity will
   * either merge with or replace the existing item based on the value of the
   * `onConflict` option.
   *
   * The collection's secondary indexes will be updated as each entity is
   * visited.
   *
   * @memberof Model
   * @method
   * @param {(Object|Object[]|Model|Model[])} items - The item or items to insert.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.autoPk={@link Model.autoPk}] - Whether to generate
   * primary keys for the entities to be injected. Useful for injecting
   * temporary, unsaved data into a Model's collection.
   * @param {string} [opts.onConflict] - What to do when an item is already in
   * the Model's collection. Possible values are `merge` or `replace`.
   * @return {(Model|Model[])} The injected entity or entities.
   */
  inject (entities, opts) {
    const _this = this

    // For debuggability
    const op = 'inject'
    _this.dbg(op, 'entities:', entities, 'opts:', opts)

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(_this, opts)
    opts.op = op
    entities = this.beforeInject(entities, opts) || entities

    // Track whether just one or an array of entities is being injected
    let singular = false
    const collection = _this.getCollection()
    const idAttribute = _this.idAttribute
    const relationList = _this.relationList || []
    const timestamp = new Date().getTime()
    if (!utils.isArray(entities)) {
      entities = [entities]
      singular = true
    }

    // Map the provided entities to injected entities.
    // New entities will be injected. If any props map to existing entities,
    // they will be merged into the existing entities according to the onConflict
    // option.
    entities = entities.map(function (props) {
      let id = utils.get(props, idAttribute)
      // Track whether we had to generate an id for this entity
      let autoPk = false
      // Validate that the primary key attached to the entity is a string or
      // numer
      if (!utils.isSorN(id)) {
        // No id found, generate one
        if (opts.autoPk) {
          id = utils.uuid()
          utils.set(props, idAttribute, id)
          autoPk = true
        } else {
          // Not going to generate one, throw an error
          throw new TypeError(`User#${idAttribute}: Expected string or number, found ${typeof id}!`)
        }
      }
      // Grab existing entity if there is one
      const existing = _this.get(id)
      // If the currently visited props are just reference to the existing
      // entity, then there is nothing to be done. Exit early.
      if (props === existing) {
        return existing
      }

      // Check the currently visited props for relations that need to be
      // injected as well
      relationList.forEach(function (def) {
        // A reference to the Model that this Model is related to
        const Relation = def.Relation
        // The field used by the related Model as the primary key
        const relationIdAttribute = Relation.idAttribute
        // Grab the foreign key in this relationship, if there is one
        const foreignKey = def.foreignKey

        // Grab a reference to the related data attached or linked to the
        // currently visited props
        let toInject = utils.get(props, def.localField)

        // If the user provided a custom injection function for this relation,
        // call it
        if (utils.isFunction(def.inject)) {
          def.inject(_this, def, props)
        } else if (toInject && def.inject !== false) {
          // Otherwise, if there is something to be injected, inject it
          if (utils.isArray(toInject)) {
            // Handle injecting hasMany relations
            toInject = toInject.map(function (toInjectItem) {
              // Check that this item isn't the same item that is already in the
              // store
              if (toInjectItem !== Relation.get(utils.get(toInjectItem, relationIdAttribute))) {
                try {
                  // Make sure this item has its foreignKey
                  if (foreignKey) {
                    utils.set(toInjectItem, foreignKey, id)
                  }
                  // Finally inject this related item
                  toInjectItem = Relation.inject(toInjectItem)
                } catch (err) {
                  throw new Error(`Failed to inject ${def.type} relation: "${def.relation}"! ${err.message}`)
                }
              }
              return toInjectItem
            })
            // If it's the parent that has the localKeys
            if (def.localKeys) {
              utils.set(props, def.localKeys, toInject.map(function (injected) {
                return utils.get(injected, relationIdAttribute)
              }))
            }
          } else {
            // Handle injecting belongsTo and hasOne relations
            if (toInject !== Relation.get(utils.get(toInject, relationIdAttribute))) {
              try {
                // Make sure the parent has its localKey
                if (def.localKey) {
                  utils.set(props, def.localKey, utils.get(toInject, Relation.idAttribute))
                }
                // Make sure this item has its localKey
                if (foreignKey) {
                  utils.set(toInject, def.foreignKey, utils.get(props, idAttribute))
                }
                // Finally inject this related item
                toInject = Relation.inject(toInject)
              } catch (err) {
                throw new Error(`Failed to inject ${def.type} relation: "${def.relation}"!`)
              }
            }
          }
        }
        if (def.link || (def.link === undefined && _this.linkRelations)) {
          // Remove relation properties from the item, since those relations
          // have been injected by now
          utils.unset(props, def.localField)
        } else {
          // Here, linking is turned off, so we setup a manual link
          utils.set(props, def.localField, toInject)
        }
      })

      if (existing) {
        // Here, the currently visited props corresponds to an entity already
        // in the collection, so we need to merge them
        const onConflict = opts.onConflict || _this.onConflict
        if (onConflict === 'merge') {
          utils.deepMixIn(existing, props)
        } else if (onConflict === 'replace') {
          utils.forOwn(existing, (value, key) => {
            if (key !== idAttribute && !props.hasOwnProperty(key)) {
              delete existing[key]
            }
          })
          existing.set(props)
        }
        props = existing
        // Update all indexes in the collection
        collection.update(props)
      } else {
        // Here, the currently visted props does not correspond to any entity
        // in the collection, so make this props is an instance of this Model
        // and insert it into the collection
        props = _this.createInstance(props)
        if (autoPk) {
          // Flag this instance as one that had its primary key generated
          props._set('autoPk', autoPk)
        }
        collection.insert(props)
      }
      // Track when this entity was injected
      props._set('$', timestamp)
      return props
    })
    // Finally, return the injected data
    const result = singular ? (entities.length ? entities[0] : undefined) : entities
    this.afterInject(result, opts)
    return result
  },

  afterInject () {},

  beforeEject () {},

  /**
   * Remove the entity with the given primary key from this Model's collection.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to be removed.
   * @param {Object} [opts] - Configuration options.
   * @return {Model} The removed entity, if any.
   */
  eject (id, opts) {
    // For debuggability
    const op = 'eject'
    this.dbg(op, 'id:', id, 'opts:', opts)

    // Default values for arguments
    opts || (opts = {})
    opts.op = op
    this.beforeEject(id, opts)
    const instance = this.get(id)

    // The instance is in the collection, remove it
    if (instance) {
      instance._unset('$')
      this.getCollection().remove(instance)
    }
    this.afterEject(instance, opts)
    return instance
  },

  afterEject () {},

  beforeEjectAll () {},

  /**
   * Remove the instances selected by "query" from the Collection instance of
   * this Model.
   *
   * @memberof Model
   * @method
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} [opts] - Configuration options.
   * @return {Model[]} The removed entites, if any.
   */
  ejectAll (query, opts) {
    // For debuggability
    const op = 'ejectAll'
    this.dbg(op, 'query:', query, 'opts:', opts)

    // Default values for arguments
    opts || (opts = {})
    opts.op = op
    this.beforeEjectAll(query, opts)
    const entities = this.filter(query)
    const collection = this.getCollection()

    // Remove each selected entity from the collection
    entities.forEach(function (item) {
      collection.remove(item)
    })
    this.afterEjectAll(entities, query, opts)
    return entities
  },

  afterEjectAll () {},

  /**
   * Return the entity in this Model's collection that has the given primary
   * key, if such an entity can be found.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - Primary key of the entity to retrieve.
   * @return {Model} The entity or undefined.
   */
  get: function (id) {
    this.dbg('get', 'id:', id)
    const instances = this.getCollection().get(id)
    return instances.length ? instances[0] : undefined
  },

  /**
   * Proxy for Collection#between
   *
   * @memberof Model
   * @method
   * @return {Model[]}
   */
  between (...args) {
    return this.getCollection().between(...args)
  },

  /**
   * Equivalent of `Model.getCollection().getAll([...ids][, opts])`. See
   * {@link Collection#getAll}.
   *
   * @memberof Model
   * @method
   * @return {Model[]} The selected entities
   */
  getAll (...args) {
    return this.getCollection().getAll(...args)
  },

  /**
   * Equivalent of `Model.getCollection().filter([query][, opts])`. See
   * {@link Collection#filter}.
   *
   * @memberof Model
   * @method
   * @return {Model[]} The selected entities.
   */
  filter (query, opts) {
    opts || (opts = {})
    return this.getCollection().filter(query, opts)
  },

  /**
   * Equivalent of `Model.getCollection().forEach(cb[, thisArg])`. See
   * {@link Collection#forEach}.
   *
   * @memberof Model
   * @method
   */
  forEach (cb, thisArg) {
    return this.getCollection().forEach(cb, thisArg)
  },

  /**
   * Equivalent of `Model.getCollection().map(cb[, thisArg])`. See
   * {@link Collection#map}.
   *
   * @memberof Model
   * @method
   * @return {Array} The result
   */
  map (cb, thisArg) {
    return this.getCollection().map(cb, thisArg)
  },

  /**
   * Equivalent of `Model.getCollection().reduce(cb, initialValue)`. See
   * {@link Collection#reducs}.
   *
   * @memberof Model
   * @method
   * @return {*} The result.
   */
  reduce (cb, initialValue) {
    return this.getCollection().reduce(cb, initialValue)
  },

  /**
   * Equivalent of `Model.getCollection().mapCall(funcName[, ...args])`. See
   * {@link Collection#mapCall}.
   *
   * @memberof Model
   * @method
   * @return {Array} The result
   */
  mapCall (...args) {
    return this.getCollection().mapCall(...args)
  },

  /**
   * Return the plain JSON representation of all items in this Model's
   * collection.
   *
   * @memberof Model
   * @method
   * @param {Object} [opts] - Configuration options.
   * @param {string[]} [opts.with] - Array of relation names or relation fields
   * to include in the representation.
   * @return {Model[]} The entities.
   */
  toJSON (opts) {
    return this.mapCall('toJSON', opts)
  },

  /**
   * Equivalent of `Model.getCollection().query()`. See {@link Collection#query}.
   *
   * @memberof Model
   * @method
   * @return {Query}
   */
  query () {
    return this.getCollection().query()
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @memberof Model
   * @method
   * @param {string} [name]- The name of the adapter to retrieve.
   * @return {Adapter} The adapter, if any.
   */
  getAdapter (name) {
    this.dbg('getAdapter', 'name:', name)
    const adapter = this.getAdapterName(name)
    if (!adapter) {
      throw new ReferenceError(`${adapter} not found!`)
    }
    return this.getAdapters()[adapter]
  },

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided.
   *
   * @memberof Model
   * @method
   * @param {(Object|string)} [opts] - The name of an adapter or options, if any.
   * @return {string} The name of the adapter.
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || opts.defaultAdapter
  },

  getAdapters () {
    if (this._adaptersOwner !== this) {
      const prevAdapters = this._adapters
      this._adapters = {}
      if (prevAdapters) {
        utils.fillIn(this._adapters, prevAdapters)
      }
      this._adaptersOwner = this
    }
    return this._adapters
  },

  getCollection () {
    if (this._collectionOwner !== this) {
      this._collection = new Collection([], this.idAttribute)
      this._collection.on('all', this.emit, this)
      this._collection.createIndex('lastInjected', ['$'], {
        fieldGetter (obj) {
          return obj._get('$')
        }
      })
      this._collectionOwner = this
    }
    return this._collection
  },

  /**
   * Model lifecycle hook called by {@link Model.create}. If this method
   * returns a promise then {@link Model.create} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} props - The `props` argument passed to {@link Model.create}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.create}.
   */
  beforeCreate: notify,

  checkUpsertCreate (props, opts) {
    const self = this
    return (opts.upsert || (opts.upsert === undefined && self.upsert)) &&
          utils.get(props, self.idAttribute) &&
          (!self.is(props) || !props._get('autoPk'))
  },

  /**
   * Using an adapter, create a new the entity from the provided `props`.
   *
   * {@link Model.beforeCreate} will be called before calling the adapter.
   * {@link Model.afterCreate} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {Object} props - The properties from which to create the entity.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting created data into this Model's collection upon success.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * created data. If `true` return a response object that includes the created
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading
   * create if `props` contains nested relations. NOT performed in a transaction.
   */
  create (props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Check whether we should do an upsert instead
    if (self.checkUpsertCreate(props, opts)) {
      return self.update(utils.get(props, self.idAttribute), props, opts)
    }

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeCreate lifecycle hook
    op = opts.op = 'beforeCreate'
    return resolve(self[op](props, opts))
      .then(function (_props) {
        // Allow for re-assignment from lifecycle hook
        props = _props || props
        // Now delegate to the adapter
        op = opts.op = 'create'
        const json = self.prototype.toJSON.call(props, opts)
        self.dbg(op, json, opts)
        return self.getAdapter(adapter)[op](self, json, opts)
      })
      .then(function (data) {
        // afterCreate lifecycle hook
        op = opts.op = 'afterCreate'
        return resolve(self[op](data, opts))
          .then(function (_data) {
            // Allow for re-assignment from lifecycle hook
            data = _data || data
            // If the created entity was already in self Model's collection via
            // an autoPk id, remove it from the collection
            // TODO: Fix this?
            if (self.is(props) && props._get('$')) {
              self.eject(utils.get(props, self.idAttribute))
            }
            // Possibly inject result and/or formulate result object
            return self.end(data, opts)
          })
      })
  },

  /**
   * Model lifecycle hook called by {@link Model.create}. If this method
   * returns a promise then {@link Model.create} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} data - The `data` return by the adapter.
   * @param {Object} opts - The `opts` argument passed to {@link Model.create}.
   */
  afterCreate: notify,

  /**
   * Model lifecycle hook called by {@link Model.createMany}. If this method
   * returns a promise then {@link Model.createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.createMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.createMany}.
   */
  beforeCreateMany: notify,

  checkUpsertCreateMany (entities, opts) {
    const self = this
    if (opts.upsert || (opts.upsert === undefined && self.upsert)) {
      return entities.reduce(function (hasId, item) {
        return hasId && utils.get(item, self.idAttribute) && (!utils.isFunction(item._get) || !item._get('autoPk'))
      }, true)
    }
  },

  /**
   * Given an array of entities, batch create them via an adapter.
   *
   * {@link Model.beforeCreateMany} will be called before calling the adapter.
   * {@link Model.afterCreateMany} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - Array up entities to be created.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting created entities into this Model's collection.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to create in a cascading create
   * if the entities to be created have linked/nested relations. NOT performed
   * in a transaction.
   */
  createMany (entities, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    entities || (entities = [])
    opts || (opts = {})

    // Check whether we should do an upsert instead
    if (self.checkUpsertCreateMany(entities, opts)) {
      return self.updateMany(entities, opts)
    }

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeCreateMany lifecycle hook
    op = opts.op = 'beforeCreateMany'
    return resolve(self[op](entities, opts))
      .then(function (_entities) {
        // Allow for re-assignment from lifecycle hook
        entities = _entities || entities
        // Now delegate to the adapter
        op = opts.op = 'createMany'
        const json = entities.map(function (item) {
          return self.prototype.toJSON.call(item, opts)
        })
        self.dbg(op, json, opts)
        return self.getAdapter(adapter)[op](self, json, opts)
      }).then(function (data) {
        // afterCreateMany lifecycle hook
        op = opts.op = 'afterCreateMany'
        return resolve(self[op](data, opts)).then(function (_data) {
          // Allow for re-assignment from lifecycle hook
          data = _data || data
          // If the created entities were already in this Model's collection
          // via an autoPk id, remove them from the collection
          // TODO: Fix this?
          entities.forEach(item => {
            if (self.is(item) && item._get('$')) {
              self.eject(utils.get(item, self.idAttribute))
            }
          })
          // Possibly inject result and/or formulate result object
          return self.end(data, opts)
        })
      })
  },

  /**
   * Model lifecycle hook called by {@link Model.createMany}. If this method
   * returns a promise then {@link Model.createMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.createMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.createMany}.
   */
  afterCreateMany: notify,

  /**
   * Model lifecycle hook called by {@link Model.find}. If this method
   * returns a promise then {@link Model.find} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.find}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.find}.
   */
  beforeFind: notify,

  /**
   * Retrieve via an adapter the entity with the given primary key. The returned
   * entity will be injected into the Model's collection if `autoInject` is true.
   *
   * {@link Model.beforeFind} will be called before calling the adapter.
   * {@link Model.afterFind} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to retrieve.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting data into this Model's collection.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   */
  find (id, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeFind lifecycle hook
    op = opts.op = 'beforeFind'
    return resolve(self[op](id, opts)).then(function (_id) {
      // Allow for re-assignment from lifecycle hook
      id = _id === undefined ? id : _id
      // Now delegate to the adapter
      op = opts.op = 'find'
      self.dbg(op, id, opts)
      return self.getAdapter(adapter)[op](self, id, opts)
    }).then(function (data) {
      // afterFind lifecycle hook
      op = opts.op = 'afterFind'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.find}. If this method
   * returns a promise then {@link Model.find} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.find}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.find}.
   */
  afterFind: notify,

  /**
   * Model lifecycle hook called by {@link Model.findAll}. If this method
   * returns a promise then {@link Model.findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} query - The `query` argument passed to {@link Model.findAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.findAll}.
   */
  beforeFindAll: notify,

  /**
   * Using the `query` argument, select entities to pull from an adapter.
   * Expects back from the adapter the array of selected entities. The returned
   * entities will be injected into the Model's collection if `autoInject` is
   * true.
   *
   * {@link Model.beforeFindAll} will be called before calling the adapter.
   * {@link Model.afterFindAll} will be called after calling the adapter.
   *
   * @memberof Model
   * @method
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting data into this Model's collection.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * resulting data. If `true` return a response object that includes the
   * resulting data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to eager load in the request.
   */
  findAll (query, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeFindAll lifecycle hook
    op = opts.op = 'beforeFindAll'
    return resolve(self[op](query, opts)).then(function (_query) {
      // Allow for re-assignment from lifecycle hook
      query = _query || query
      // Now delegate to the adapter
      op = opts.op = 'findAll'
      self.dbg(op, query, opts)
      return self.getAdapter(adapter)[op](self, query, opts)
    }).then(function (data) {
      // afterFindAll lifecycle hook
      op = opts.op = 'afterFindAll'
      return resolve(self[op](data, query, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.findAll}. If this method
   * returns a promise then {@link Model.findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} data - The `data` returned by the adapter.
   * @param {Object} query - The `query` argument passed to {@link Model.findAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.findAll}.
   */
  afterFindAll: notify,

  /**
   * Model lifecycle hook called by {@link Model.save}. If this method
   * returns a promise then {@link Model.save} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.save}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.save}.
   */
  beforeSave: notify,

  /**
   * If the entity with the given primary key is currently in this Model's
   * collection, call the instance's {@link Model#save} method. If the entity
   * is not in this Model's collection, the returned promise will be rejected.
   *
   * {@link Model.beforeSave} will be called before calling {@link Model#save}.
   * {@link Model#beforeSave} will be called before saving the entity.
   * {@link Model#afterSave} will be called after saving the entity.
   * {@link Model.afterSave} will be called after calling {@link Model#save}.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to save.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting updated data into this Model's collection.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to save in a cascading
   * save if any of the entity's relations are linked to the entity.
   * NOT performed in a transaction.
   */
  save (id, opts) {
    let op
    const self = this
    let instance = self.get(id)

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    opts.adapter = self.getAdapterName(opts)

    // beforeSave lifecycle hook
    op = opts.op = 'beforeSave'
    return resolve(self[op](instance, opts))
      .then(function (_instance) {
        instance = _instance || instance
        if (!instance) {
          throw new Error(`instance with "${self.idAttribute}" of ${id} not in Model's collection!`)
        }
        // Now delegate to the adapter
        op = opts.op = 'save'
        self.dbg(op, id, opts)
        return instance[op](opts)
      })
      .then(function (data) {
        // afterSave lifecycle hook
        op = opts.op = 'afterSave'
        return resolve(self[op](instance, opts)).then(() => data)
      })
  },

  /**
   * Model lifecycle hook called by {@link Model.save}. If this method
   * returns a promise then {@link Model.save} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.save}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.save}.
   */
  afterSave: notify,

  /**
   * Model lifecycle hook called by {@link Model.update}. If this method
   * returns a promise then {@link Model.update} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.update}.
   * @param {props} props - The `props` argument passed to {@link Model.update}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.update}.
   */
  beforeUpdate: notify,

  /**
   * Using an adapter, update the entity with the primary key specified by the
   * `id` argument.
   *
   * {@link Model.beforeUpdate} will be called before updating the entity.
   * {@link Model.afterUpdate} will be called after updating the entity.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to update.
   * @param {Object} props - The update to apply to the entity.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting updated data into this Model's collection.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   */
  update (id, props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeUpdate lifecycle hook
    op = opts.op = 'beforeUpdate'
    return resolve(self[op](id, props, opts)).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = _props || props
      // Now delegate to the adapter
      op = opts.op = 'update'
      const json = self.prototype.toJSON.call(props, opts)
      self.dbg(op, id, json, opts)
      return self.getAdapter(adapter)[op](self, id, json, opts)
    }).then(function (data) {
      // afterUpdate lifecycle hook
      op = opts.op = 'afterUpdate'
      return resolve(self[op](id, data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.update}. If this method
   * returns a promise then {@link Model.update} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.update}.
   * @param {props} props - The `props` argument passed to {@link Model.update}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.update}.
   */
  afterUpdate: notify,

  /**
   * Model lifecycle hook called by {@link Model.updateMany}. If this method
   * returns a promise then {@link Model.updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.updateMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateMany}.
   */
  beforeUpdateMany: notify,

  /**
   * Given an array of updates, perform each of the updates via an adapter. Each
   * "update" is a hash of properties with which to update an entity. Each
   * update must contain the primary key to be updated.
   *
   * {@link Model.beforeUpdateMany} will be called before making the update.
   * {@link Model.afterUpdateMany} will be called after making the update.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - Array up entity updates.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting updated data into this Model's collection.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if each entity update contains nested updates for relations. NOT
   * performed in a transaction.
   */
  updateMany (entities, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    entities || (entities = [])
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeUpdateMany lifecycle hook
    op = opts.op = 'beforeUpdateMany'
    return resolve(self[op](entities, opts)).then(function (_entities) {
      // Allow for re-assignment from lifecycle hook
      entities = _entities || entities
      // Now delegate to the adapter
      op = opts.op = 'updateMany'
      const json = entities.map(function (item) {
        return self.prototype.toJSON.call(item, opts)
      })
      self.dbg(op, json, opts)
      return self.getAdapter(adapter)[op](self, json, opts)
    }).then(function (data) {
      // afterUpdateMany lifecycle hook
      op = opts.op = 'afterUpdateMany'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.updateMany}. If this method
   * returns a promise then {@link Model.updateMany} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Array} entities - The `entities` argument passed to {@link Model.updateMany}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateMany}.
   */
  afterUpdateMany: notify,

  /**
   * Model lifecycle hook called by {@link Model.updateAll}. If this method
   * returns a promise then {@link Model.updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} query - The `query` argument passed to {@link Model.updateAll}.
   * @param {Object} props - The `props` argument passed to {@link Model.updateAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateAll}.
   */
  beforeUpdateAll: notify,

  /**
   * Using the `query` argument, perform the a single updated to the selected
   * entities. Expects back from the adapter an array of the updated entities.
   * The updated entities will be injected into the Model's collection if
   * `autoInject` is true.
   *
   * {@link Model.beforeUpdateAll} will be called before making the update.
   * {@link Model.afterUpdateAll} will be called after making the update.
   *
   * @memberof Model
   * @method
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} props - Update to apply to selected entities.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoInject={@link Model.autoInject}] Whether to
   * inject the resulting updated data into this Model's collection.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * updated data. If `true` return a response object that includes the updated
   * data and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to update in a cascading
   * update if `props` contains nested updates to relations. NOT performed in a
   * transaction.
   */
  updateAll (query, props, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeUpdateAll lifecycle hook
    op = opts.op = 'beforeUpdateAll'
    return resolve(self[op](query, props, opts)).then(function (_props) {
      // Allow for re-assignment from lifecycle hook
      props = _props || props
      // Now delegate to the adapter
      op = opts.op = 'updateAll'
      const json = self.prototype.toJSON.call(props, opts)
      self.dbg(op, query, json, opts)
      return self.getAdapter(adapter)[op](self, query, json, opts)
    }).then(function (data) {
      // afterUpdateAll lifecycle hook
      op = opts.op = 'afterUpdateAll'
      return resolve(self[op](query, data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        // Possibly inject result and/or formulate result object
        return self.end(data, opts)
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.updateAll}. If this method
   * returns a promise then {@link Model.updateAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} query - The `query` argument passed to {@link Model.updateAll}.
   * @param {Object} props - The `props` argument passed to {@link Model.updateAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.updateAll}.
   */
  afterUpdateAll: notify,

  /**
   * Model lifecycle hook called by {@link Model.destroy}. If this method
   * returns a promise then {@link Model.destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.destroy}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroy}.
   */
  beforeDestroy: notify,

  /**
   * Using an adapter, destroy the entity with the primary key specified by the
   * `id` argument.
   *
   * {@link Model.beforeDestroy} will be called before destroying the entity.
   * {@link Model.afterDestroy} will be called after destroying the entity.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The primary key of the entity to destroy.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoEject={@link Model.autoEject}] Whether to remove
   * the entity from this Model's collection upon success.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   */
  destroy (id, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeDestroy lifecycle hook
    op = opts.op = 'beforeDestroy'
    return resolve(self[op](id, opts)).then(function (_id) {
      // Allow for re-assignment from lifecycle hook
      id = _id === undefined ? id : _id
      // Now delegate to the adapter
      op = opts.op = 'destroy'
      self.dbg(op, id, opts)
      return self.getAdapter(adapter)[op](self, id, opts)
    }).then(function (data) {
      // afterDestroy lifecycle hook
      op = opts.op = 'afterDestroy'
      return resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          if (opts.autoEject) {
            data.data = self.eject(id, opts)
          }
          utils._(opts, data)
          return data
        } else if (opts.autoEject) {
          data = self.eject(id, opts)
        }
        return data
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.destroy}. If this method
   * returns a promise then {@link Model.destroy} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {(string|number)} id - The `id` argument passed to {@link Model.destroy}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroy}.
   */
  afterDestroy: notify,

  /**
   * Model lifecycle hook called by {@link Model.destroyAll}. If this method
   * returns a promise then {@link Model.destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {query} query - The `query` argument passed to {@link Model.destroyAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroyAll}.
   */
  beforeDestroyAll: notify,

  /**
   * Using the `query` argument, destroy the selected entities via an adapter.
   * If no `query` is provided then all entities will be destroyed.
   *
   * {@link Model.beforeDestroyAll} will be called before destroying the entities.
   * {@link Model.afterDestroyAll} will be called after destroying the entities.
   *
   * @memberof Model
   * @method
   * @param {Object} [query={}] - Selection query.
   * @param {Object} [query.where] - Filtering criteria.
   * @param {number} [query.skip] - Number to skip.
   * @param {number} [query.limit] - Number to limit to.
   * @param {Array} [query.orderBy] - Sorting criteria.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.adapter={@link Model.defaultAdapter}] Name of the
   * adapter to use.
   * @param {boolean} [opts.autoEject={@link Model.autoEject}] Whether to remove
   * the entities from this Model's collection upon success.
   * @param {boolean} [opts.notify={@link Model.notify}] Whether to emit
   * lifecycle events.
   * @param {boolean} [opts.raw={@link Model.raw}] If `false`, return the
   * ejected data (if any). If `true` return a response object that includes the
   * ejected data (if any) and metadata about the operation.
   * @param {string[]} [opts.with=[]] Relations to destroy in a cascading
   * delete. NOT performed in a transaction.
   */
  destroyAll (query, opts) {
    let op, adapter
    const self = this

    // Default values for arguments
    query || (query = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeDestroyAll lifecycle hook
    op = opts.op = 'beforeDestroyAll'
    return resolve(self[op](query, opts)).then(function (_query) {
      // Allow for re-assignment from lifecycle hook
      query = _query || query
      // Now delegate to the adapter
      op = opts.op = 'destroyAll'
      self.dbg(op, query, opts)
      return self.getAdapter(adapter)[op](self, query, opts)
    }).then(function (data) {
      // afterDestroyAll lifecycle hook
      op = opts.op = 'afterDestroyAll'
      return resolve(self[op](data, query, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          if (opts.autoEject) {
            data.data = self.ejectAll(query, opts)
          }
          utils._(opts, data)
          return data
        } else if (opts.autoEject) {
          data = self.ejectAll(query, opts)
        }
        return data
      })
    })
  },

  /**
   * Model lifecycle hook called by {@link Model.destroyAll}. If this method
   * returns a promise then {@link Model.destroyAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {*} data - The `data` returned by the adapter.
   * @param {query} query - The `query` argument passed to {@link Model.destroyAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroyAll}.
   */
  afterDestroyAll: notify,

  beforeLoadRelations: notify,
  loadRelations (id, relations, opts) {
    let op
    const self = this
    const relationList = self.relationList || []
    let instance = self.is(id) ? id : undefined
    id = instance ? utils.get(instance, self.idAttribute) : id

    // Default values for arguments
    relations || (relations = [])
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    opts.adapter = self.getAdapterName(opts)

    // beforeLoadRelations lifecycle hook
    op = opts.op = 'beforeLoadRelations'
    return resolve(self[op](id, relations, opts)).then(function () {
      if (utils.isSorN(id) && !instance) {
        instance = self.get(instance)
      }
      if (!instance) {
        throw new Error('You passed an id of an instance not found in the collection of the Model!')
      }
      if (utils.isString(relations)) {
        relations = [relations]
      }
      // Now delegate to the adapter
      op = opts.op = 'loadRelations'
      self.dbg(op, instance, relations, opts)
      return Promise.all(relationList.map(function (def) {
        if (utils.isFunction(def.load)) {
          return def.load(self, def, instance, opts)
        }
        let task
        if (def.foreignKey) {
          task = def.Relation.findAll({
            [def.foreignKey]: id
          }, opts)
        } else if (def.localKey) {
          const key = utils.get(instance, def.localKey)
          if (utils.isSorN(key)) {
            task = def.Relation.find(key, opts)
          }
        } else if (def.localKeys) {
          task = def.Relation.findAll({
            [def.Relation.idAttribute]: {
              'in': utils.get(instance, def.localKeys)
            }
          }, opts)
        } else if (def.foreignKeys) {
          task = def.Relation.findAll({
            [def.Relation.idAttribute]: {
              'contains': utils.get(instance, self.idAttribute)
            }
          }, opts)
        }
        if (task) {
          task = task.then(function (data) {
            if (opts.raw) {
              data = data.data
            }
            utils.set(instance, def.localField, def.type === 'hasOne' ? (data.length ? data[0] : undefined) : data)
          })
        }
        return task
      }))
    }).then(function () {
      // afterLoadRelations lifecycle hook
      op = opts.op = 'afterLoadRelations'
      return resolve(self[op](instance, relations, opts)).then(function () {
        return instance
      })
    })
  },
  afterLoadRelations: notify,

  log (level, ...args) {
    if (level && !args.length) {
      args.push(level)
      level = 'debug'
    }
    if (level === 'debug' && !this.debug) {
      return
    }
    const prefix = `${level.toUpperCase()}: (${this.name})`
    if (console[level]) {
      console[level](prefix, ...args)
    } else {
      console.log(prefix, ...args)
    }
  },

  dbg (...args) {
    this.log('debug', ...args)
  },

  /**
   * Usage:
   *
   * Post.belongsTo(User, {
   *   localKey: 'myUserId'
   * })
   *
   * Comment.belongsTo(User)
   * Comment.belongsTo(Post, {
   *   localField: '_post'
   * })
   */
  belongsTo (model, opts) {
    return belongsTo(model, opts)(this)
  },

  /**
   * Usage:
   *
   * User.hasMany(Post, {
   *   localField: 'my_posts'
   * })
   */
  hasMany (model, opts) {
    return hasMany(model, opts)(this)
  },

  /**
   * Usage:
   *
   * User.hasOne(Profile, {
   *   localField: '_profile'
   * })
   */
  hasOne (model, opts) {
    return hasOne(model, opts)(this)
  },

  /**
   * Invoke the {@link module:js-data.exports.setSchema setSchema} decorator on
   * this Model.
   * @param {Object} opts - Property configurations.
   * @return {Model} A reference to the Model for chaining.
   */
  setSchema (opts) {
    return setSchema(opts)(this)
  },

  /**
   * Invoke the {@link module:js-data.exports.configure configure} decorator on
   * this Model.
   * @param {Object} opts - Configuration
   * @return {Model} A reference to the Model for chaining.
   */
  configure (opts) {
    return configure(opts)(this)
  },

  /**
   * Invoke the {@link module:js-data.exports.registerAdapter registerAdapter}
   * decorator on this Model.
   * @param {string} name - The name of the adapter to register.
   * @param {Adapter} adapter - The adapter to register.
   * @param {Object} [opts] - Configuration options.
   * @param {boolean} [opts.default=false] - Whether to make the adapter the
   * default for this Model.
   * @return {Model} A reference to the Model for chaining.
   */
  registerAdapter (name, adapter, opts) {
    return registerAdapter(name, adapter, opts)(this)
  },

  /**
   * Extend this Model and return a new child Model. Static properties on this
   * Model will be shallow copied to the child Model. The child Model's
   * prototype will point to the parent Model.
   *
   * @example
   * var User = JSData.Model.extend({}, { name: 'User' })
   * @param {Object} props={} - Properties to add to the prototype of the class.
   * @param {Function} [props.initialize] - Optional function to invoke during
   * construction of instances of the class. Will receive any arguments passed
   * to the constructor. "this" will refer to the instance being constructed.
   * @param {Object} classProps - Static properties to add to the class.
   * @param {string} classProps.name - Name of the class. Required.
   * @param {string} [classProps.idAttribute='id'] - Field to use as the unique
   * identifier for instances of the class.
   * @param {Object} [classProps.schema] - Value to pass to the {@link Model.setSchema setSchema}
   * method of the class after the class is created.
   */
  extend (props, classProps) {
    const Parent = this
    let Child

    Parent.dbg('extend', 'props:', props, 'classProps:', classProps)

    props || (props = {})
    classProps || (classProps = {})

    const initialize = props.initialize
    delete props.initialize

    if (props.hasOwnProperty('constructor')) {
      Child = props.constructor
      delete props.constructor
    } else {
      if (!classProps.name) {
        throw new TypeError(`name: Expected string, found ${typeof classProps.name}!`)
      }
      if (classProps.csp) {
        Child = function (...args) {
          utils.classCallCheck(this, Child)
          const _this = utils.possibleConstructorReturn(this, (Child.__super__ || Object.getPrototypeOf(Child)).apply(this, args))
          if (initialize) {
            initialize.apply(_this, args)
          }
          return _this
        }
      } else {
        const name = utils.pascalCase(classProps.name)
        const func = `return function ${name}() {
                        classCallCheck(this, ${name})
                        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                          args[_key] = arguments[_key];
                        }
                        var _this = possibleConstructorReturn(this, (${name}.__super__ || Object.getPrototypeOf(${name})).apply(this, args));
                        if (initialize) {
                          initialize.apply(_this, arguments)
                        }
                        return _this
                      }`
        Child = new Function('classCallCheck', 'possibleConstructorReturn', 'Parent', 'initialize', func)(utils.classCallCheck, utils.possibleConstructorReturn, Parent, initialize) // eslint-disable-line
      }
    }

    classProps.shortname = classProps.shortname || utils.camelCase(Child.name || classProps.name)
    delete classProps.name

    const _schema = classProps.schema
    delete classProps.schema

    Child.prototype = Object.create(Parent && Parent.prototype, {
      constructor: {
        value: Child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    })

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(Child, Parent)
    } else if (classProps.strictEs6Class) {
      Child.__proto__ = Parent // eslint-disable-line
    } else {
      utils.forOwn(Parent, function (value, key) {
        Child[key] = value
      })
    }
    Object.defineProperty(Child, '__super__', {
      configurable: true,
      value: Parent
    })

    configure(props)(Child.prototype)
    configure(classProps)(Child)
    if (_schema) {
      setSchema(_schema)(Child)
    }

    return Child
  }
})

/**
 * Register a new event listener on this Model.
 *
 * @name on
 * @memberOf! Model
 * @method
 */

/**
 * Remove an event listener from this Model.
 *
 * @name off
 * @memberOf! Model
 * @method
 */

/**
 * Trigger an event on this Model.
 *
 * @name emit
 * @memberOf! Model
 * @method
 */

/**
 * Allow Models themselves emit events. Any events emitted on a Model's
 * collection will also be emitted on the Model itself.
 *
 * A Model's registered listeners are stored on the Model's `__events` property.
 */
utils.eventify(
  Model,
  function () {
    return this._events()
  },
  function (value) {
    this._events(value)
  },
  true
)

/**
 * Allow instancess to emit events. Any events emitted instances in a Model's
 * collection will also be emitted on the collection itself, and hence, on the
 * Model as well.
 *
 * An instance's registered listeners are stored in the instance's private data
 * hash.
 */
utils.eventify(
  Model.prototype,
  function () {
    return this._get('events')
  },
  function (value) {
    this._set('events', value)
  }
)
