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
const keysToSkip = {
  length: 1,
  name: 1,
  arguments: 1,
  prototype: 1,
  caller: 1,
  __super__: 1
}

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

const noop = function (...args) {
  const opts = args.pop()
  if (opts.notify || (opts.notify === undefined && this.notify)) {
    setTimeout(() => {
      this.emit(opts.op, ...args)
    })
  }
}

const handleResponse = function handleResponse (model, data, opts, adapterName) {
  if (opts.raw) {
    data.adapter = adapterName
    if (opts.autoInject) {
      data.data = model.inject(data.data)
    }
    return data
  } else if (opts.autoInject) {
    data = model.inject(data)
  }
  if (opts.notify || (opts.notify === undefined && model.notify)) {
    setTimeout(function () {
      model.emit(opts.op, data, opts)
    })
  }
  return data
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
          .then(() => handleResponse(Ctor, data, opts, adapterName))
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
   * Whether this Model should emit lifecycle events during operation.
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
    this.collection.createIndex(name, fieldList, opts)
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
      return this.collection.mapCall('changes')
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
      this.collection.forEach(function (item) {
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
    this.beforeInject(entities, opts)

    // Track whether just one or an array of entities is being injected
    let singular = false
    const collection = _this.collection
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
      this.collection.remove(instance)
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
    const collection = this.collection

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
    const instances = this.collection.get(id)
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
    return this.collection.between(...args)
  },

  /**
   * Equivalent of `Model.collection.getAll([...ids][, opts])`. See
   * {@link Collection#getAll}.
   *
   * @memberof Model
   * @method
   * @return {Model[]} The selected entities
   */
  getAll (...args) {
    return this.collection.getAll(...args)
  },

  /**
   * Equivalent of `Model.collection.filter([query][, opts])`. See
   * {@link Collection#filter}.
   *
   * @memberof Model
   * @method
   * @return {Model[]} The selected entities.
   */
  filter (query, opts) {
    opts || (opts = {})
    return this.collection.filter(query, opts)
  },

  /**
   * Equivalent of `Model.collection.forEach(cb[, thisArg])`. See
   * {@link Collection#forEach}.
   *
   * @memberof Model
   * @method
   */
  forEach (cb, thisArg) {
    return this.collection.forEach(cb, thisArg)
  },

  /**
   * Equivalent of `Model.collection.map(cb[, thisArg])`. See
   * {@link Collection#map}.
   *
   * @memberof Model
   * @method
   * @return {Array} The result
   */
  map (cb, thisArg) {
    return this.collection.map(cb, thisArg)
  },

  /**
   * Equivalent of `Model.collection.reduce(cb, initialValue)`. See
   * {@link Collection#reducs}.
   *
   * @memberof Model
   * @method
   * @return {*} The result.
   */
  reduce (cb, initialValue) {
    return this.collection.reduce(cb, initialValue)
  },

  /**
   * Equivalent of `Model.collection.mapCall(funcName[, ...args])`. See
   * {@link Collection#mapCall}.
   *
   * @memberof Model
   * @method
   * @return {Array} The result
   */
  mapCall (...args) {
    return this.collection.mapCall(...args)
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
   * Equivalent of `Model.collection.query()`. See {@link Collection#query}.
   *
   * @memberof Model
   * @method
   * @return {Query}
   */
  query () {
    return this.collection.query()
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
    return this.adapters[adapter]
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
  beforeCreate: noop,

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
    // For debuggability
    const op = 'create'
    this.dbg(op, 'props:', props, 'opts:', opts)

    // Default values for arguments
    props || (props = {})
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(this, opts)
    opts.op = op

    // Check whether we should do an upsert instead
    if (opts.upsert && utils.get(props, this.idAttribute) && (!this.is(props) || !props._get('autoPk'))) {
      return this.update(utils.get(props, this.idAttribute), props, opts)
    }

    let adapterName

    // beforeCreate lifecycle hook
    return resolve(this.beforeCreate(props, opts))
      .then(() => {
        // Select adapter to use
        adapterName = this.getAdapterName(opts)
        // Now delegate to the adapter
        return this.getAdapter(adapterName)
          .create(this, this.prototype.toJSON.call(props, opts), opts)
      })
      .then(data => {
        // afterCreate lifecycle hook
        return resolve(this.afterCreate(data, opts))
          .then(() => {
            // If the created entity was already in this Model's collection via
            // an autoPk id, remove it from the collection
            if (this.is(props) && props._get('$')) {
              this.eject(utils.get(props, this.idAttribute))
            }
            // Possibly inject result and/or formulate result object
            return handleResponse(this, data, opts, adapterName)
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
  afterCreate: noop,

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
  beforeCreateMany: noop,

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
    // For debuggability
    const op = 'createMany'
    this.dbg(op, 'entities:', entities, 'opts:', opts)

    // Default values for arguments
    entities || (entities = [])
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(this, opts)
    opts.op = op

    // Check whether we should do an upsert instead
    if (opts.upsert) {
      let hasId = true
      entities.forEach(item => {
        hasId = hasId && utils.get(item, this.idAttribute) && (!utils.isFunction(item._get) || !item._get('autoPk'))
      })
      if (hasId) {
        return this.updateMany(entities, opts)
      }
    }

    let adapterName

    // beforeCreateMany lifecycle hook
    return resolve(this.beforeCreateMany(entities, opts))
      .then(() => {
        // Select adapter to use
        adapterName = this.getAdapterName(opts)
        // Now delegate to the adapter
        return this.getAdapter(adapterName)
          .createMany(this, entities.map(item => this.prototype.toJSON.call(item, opts)), opts)
      })
      .then(data => {
        // afterCreateMany lifecycle hook
        return resolve(this.afterCreateMany(data, opts))
          .then(() => {
            // If the created entities were already in this Model's collection
            // via an autoPk id, remove them from the collection
            entities.forEach(item => {
              if (this.is(item) && item._get('$')) {
                this.eject(utils.get(item, this.idAttribute))
              }
            })
            // Possibly inject result and/or formulate result object
            return handleResponse(this, data, opts, adapterName)
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
  afterCreateMany: noop,

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
  beforeFind: noop,

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
    const op = 'find'
    this.dbg(op, 'id:', id, 'opts:', opts)
    let adapterName

    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeFind(id, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .find(this, id, opts)
      })
      .then(data => {
        return resolve(this.afterFind(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
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
  afterFind: noop,

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
  beforeFindAll: noop,

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
    const op = 'findAll'
    this.dbg(op, 'query:', query, 'opts:', opts)
    let adapterName

    query || (query = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeFindAll(query, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .findAll(this, query, opts)
      })
      .then(data => {
        return resolve(this.afterFindAll(query, data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
      })
  },

  /**
   * Model lifecycle hook called by {@link Model.findAll}. If this method
   * returns a promise then {@link Model.findAll} will wait for the promise
   * to resolve before continuing.
   *
   * @memberof Model
   * @method
   * @param {Object} query - The `query` argument passed to {@link Model.findAll}.
   * @param {Object} data - The `data` returned by the adapter.
   * @param {Object} opts - The `opts` argument passed to {@link Model.findAll}.
   */
  afterFindAll: noop,

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
  beforeSave: noop,

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
    const op = 'save'
    const instance = this.get(id)

    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeSave(instance, opts))
      .then(() => {
        if (!instance) {
          throw new Error(`instance with "${this.idAttribute}" of ${id} not in Model's collection!`)
        }
        return instance.save(opts)
      })
      .then(data => {
        return resolve(this.afterSave(instance, opts))
          .then(() => data)
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
  afterSave: noop,

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
  beforeUpdate: noop,

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
    const op = 'update'
    this.dbg(op, 'id:', id, 'props:', props, 'opts:', opts)
    let adapterName

    props || (props = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeUpdate(id, props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .update(this, id, this.prototype.toJSON.call(props, opts), opts)
      })
      .then(data => {
        return resolve(this.afterUpdate(id, data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
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
  afterUpdate: noop,

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
  beforeUpdateMany: noop,

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
    const op = 'updateMany'
    this.dbg(op, 'entities:', entities, 'opts:', opts)
    let adapterName

    entities || (entities = [])
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeUpdateMany(entities, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .updateMany(this, entities.map(item => this.prototype.toJSON.call(item, opts)), opts)
      })
      .then(data => {
        return resolve(this.afterUpdateMany(data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
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
  afterUpdateMany: noop,

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
  beforeUpdateAll: noop,

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
    const op = 'updateAll'
    this.dbg(op, 'query:', query, 'props:', props, 'opts:', opts)
    let adapterName

    query || (query = {})
    props || (props = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeUpdateAll(query, props, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .updateAll(this, query, props, opts)
      })
      .then(data => {
        return resolve(this.afterUpdateAll(query, data, opts))
          .then(() => handleResponse(this, data, opts, adapterName))
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
  afterUpdateAll: noop,

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
  beforeDestroy: noop,

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
    const op = 'destroy'
    this.dbg(op, 'id:', id, 'opts:', opts)
    let adapterName

    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeDestroy(id, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .destroy(this, id, opts)
      })
      .then(data => {
        return resolve(this.afterDestroy(id, opts))
          .then(() => {
            if (opts.raw) {
              data.adapter = adapterName
              if (opts.autoEject) {
                data.data = this.eject(id, opts)
              }
              return data
            } else if (opts.autoEject) {
              data = this.eject(id, opts)
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
  afterDestroy: noop,

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
  beforeDestroyAll: noop,

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
    const op = 'destroyAll'
    this.dbg(op, 'query:', query, 'opts:', opts)
    let adapterName

    query || (query = {})
    opts || (opts = {})
    utils._(this, opts)
    opts.op = op

    return resolve(this.beforeDestroyAll(query, opts))
      .then(() => {
        adapterName = this.getAdapterName(opts)
        return this.getAdapter(adapterName)
          .destroyAll(this, query, opts)
      })
      .then(data => {
        return resolve(this.afterDestroyAll(query, opts))
          .then(() => {
            if (opts.raw) {
              data.adapter = adapterName
              if (opts.autoEject) {
                data.data = this.ejectAll(query, opts)
              }
              return data
            } else if (opts.autoEject) {
              data = this.ejectAll(query, opts)
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
   * @param {query} query - The `query` argument passed to {@link Model.destroyAll}.
   * @param {Object} opts - The `opts` argument passed to {@link Model.destroyAll}.
   */
  afterDestroyAll: noop,

  beforeLoadRelations: noop,
  loadRelations (id, relations, opts) {
    const _this = this
    let instance = _this.is(id) ? id : undefined
    id = instance ? utils.get(instance, _this.idAttribute) : id
    const op = 'loadRelations'
    _this.dbg(op, 'id:', id, 'relations:', relations, 'opts:', opts)
    relations || (relations = [])
    opts || (opts = {})
    const relationList = _this.relationList || []
    utils._(_this, opts)
    opts.op = op
    return resolve(_this.beforeLoadRelations(id, relations, opts))
      .then(() => {
        if (utils.isSorN(id) && !instance) {
          instance = _this.get(instance)
        }
        if (!instance) {
          throw new Error('You passed an id of an instance not found in the collection of the Model!')
        }
        if (utils.isString(relations)) {
          relations = [relations]
        }
        return Promise.all(relationList.map(function (def) {
          if (utils.isFunction(def.load)) {
            return def.load(_this, def, instance, opts)
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
                'contains': utils.get(instance, _this.idAttribute)
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
      })
      .then(() => {
        return resolve(this.afterLoadRelations(instance, relations, opts))
          .then(() => instance)
      })
  },
  afterLoadRelations: noop,

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
      const keys = Object.getOwnPropertyNames(Parent)
      keys.forEach(function (key) {
        if (keysToSkip[key]) {
          return
        }
        Object.defineProperty(Child, key, Object.getOwnPropertyDescriptor(Parent, key))
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

Object.defineProperties(Model, {
  /**
   * @ignore
   */
  __events: {
    configurable: true,
    value: {}
  },

  /**
   * Create a property where a Model's registered listeners can be stored.
   * @ignore
   */
  _events: {
    get () {
      // Make sure that a Model always has _its own_ set of registered listeners.
      // This check has to be made because ES6 class inheritance shallow copies
      // static properties, which means a child model would only have a reference
      // to the parent model's listeners.
      if (this.__events === (this.__super__ ? this.__super__ : Object.getPrototypeOf(this)).__events) {
        Object.defineProperty(this, '__events', {
          value: {}
        })
      }
      return this.__events
    }
  },

  /**
   * @ignore
   */
  _adapters: {
    configurable: true,
    value: {}
  },

  /**
   * Hash of adapters registered with this Model.
   *
   * @name adapters
   * @memberof Model
   * @type {Object}
   */
  adapters: {
    get () {
      const parentAdapters = (this.__super__ ? this.__super__ : Object.getPrototypeOf(this))._adapters
      // Make sure that a Model always has _its own_ set of registered adapters.
      // This check has to be made because ES6 class inheritance shallow copies
      // static properties, which means a child model would only have a reference
      // to the parent model's adapters.
      if (this._adapters === parentAdapters) {
        Object.defineProperty(this, '_adapters', {
          value: {}
        })
        utils.fillIn(this._adapters, parentAdapters)
      }
      return this._adapters
    }
  },

  /**
   * @ignore
   */
  _collection: {
    configurable: true,
    value: new Collection([], 'id')
  },

  /**
   * This Model's {@link Collection} instance. This is where instances of the
   * Model are stored if {@link Model.autoInject} is `true`.
   *
   * __You should use {@link Model.inject}, {@link Model.eject}, and
   * {@link Model.ejectAll} if you need to manually get data in and out of this
   * collection.__
   *
   * @name collection
   * @memberof Model
   * @type {Collection}
   */
  collection: {
    get () {
      // Make sure that a Model always has _its own_ collection. This check has to
      // be made because ES6 class inheritance shallow copies static properties,
      // which means a child Model would only have a reference to the parent
      // Model's collection.
      if (this._collection === (this.__super__ ? this.__super__ : Object.getPrototypeOf(this))._collection) {
        Object.defineProperty(this, '_collection', {
          value: new Collection([], this.idAttribute)
        })
        this._collection.on('all', this.emit, this)
        this._collection.createIndex('lastInjected', ['$'], {
          fieldGetter (obj) {
            return obj._get('$')
          }
        })
      }
      return this._collection
    }
  }
})

/**
 * Allow Models themselves emit events. Any events emitted on a Model's
 * collection will also be emitted on the Model itself.
 *
 * A Model's registered listeners are stored on the Model's `__events` property.
 */
utils.eventify(
  Model,
  function () {
    return this._events
  },
  function (value) {
    this._events = value
  }
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
