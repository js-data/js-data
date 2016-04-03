import utils from './utils'
import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import Container from './Container'
import LinkedCollection from './LinkedCollection'

const DATASTORE_DEFAULTS = {
  /**
   * Whether relations should be linked for records that are in the datastore.
   *
   * Defaults to `true` in the browser and `false` in Node.js
   *
   * @name DataStore#linkRelations
   * @type {boolean}
   */
  linkRelations: utils.isBrowser
}

const props = {
  constructor: function DataStore (opts) {
    const self = this
    utils.classCallCheck(self, DataStore)
    DataStore.__super__.call(self, opts)

    self.collectionClass = self.collectionClass || LinkedCollection
    self._collections = {}
    utils.fillIn(self, DATASTORE_DEFAULTS)
    self._pendingQueries = {}
    self._completedQueries = {}
    return self
  },

  _callSuper (method, ...args) {
    return this.constructor.__super__.prototype[method].apply(this, args)
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
  _end (name, result, opts) {
    let _data = opts.raw ? result.data : result
    if (_data && utils.isFunction(this.addToCache)) {
      _data = this.addToCache(name, _data, opts)
      if (opts.raw) {
        result.data = _data
      } else {
        result = _data
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
   * @name DataStore#on
   * @method
   * @param {string} event Name of event to subsribe to.
   * @param {Function} listener Listener function to handle the event.
   * @param {*} [ctx] Optional content in which to invoke the listener.
   */

  /**
   * Used to bind to events emitted by collections in this store.
   *
   * @name DataStore#_onCollectionEvent
   * @method
   * @private
   * @param {string} name Name of the collection that emitted the event.
   * @param {...*} [args] Args passed to {@link Collection#emit}.
   */
  _onCollectionEvent (name, ...args) {
    const type = args.shift()
    this.emit(type, name, ...args)
  },

  /**
   * TODO
   *
   * @name DataStore#addToCache
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {*} data - Data from which data should be selected for add.
   * @param {Object} [opts] - Configuration options.
   */
  addToCache (name, data, opts) {
    return this.getCollection(name).add(data, opts)
  },

  cachedFind (name, id, opts) {
    return this.get(name, id, opts)
  },

  cachedFindAll (name, query, opts) {
    const self = this
    if (self._completedQueries[name][self.hashQuery(name, query, opts)]) {
      return self.filter(name, query, opts)
    }
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
    return self._callSuper('create', name, record, opts).then(function (data) {
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
    return self._callSuper('createMany', name, records, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  defineMapper (name, opts) {
    const self = this
    const mapper = utils.getSuper(self).prototype.defineMapper.call(self, name, opts)
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

    const linkRelations = self.linkRelations

    if (linkRelations) {
      mapper.relationList.forEach(function (def) {
        const relation = def.relation
        const localField = def.localField
        const path = `links.${localField}`
        const foreignKey = def.foreignKey
        const type = def.type
        const link = utils.isUndefined(def.link) ? linkRelations : def.link
        const updateOpts = { index: foreignKey }
        let descriptor, load

        if (type === belongsToType) {
          if (!collection.indexes[foreignKey]) {
            collection.createIndex(foreignKey)
          }

          descriptor = {
            get () {
              const _self = this
              let item = _self._get(path)
              if (!_self._get('$') || !link) {
                return item
              }
              const key = def.getForeignKey(_self)
              item = (utils.isUndefined(key) ? undefined : self.get(relation, key)) || item
              _self._set(path, item)
              return item
            },
            set (record) {
              const _self = this
              if (record) {
                _self._set(path, record)
                def.setForeignKey(_self, record)
              } else {
                _self._set(path, undefined)
                utils.set(_self, def.foreignKey, undefined)
              }
              return record
            }
          }
        } else if (type === hasManyType) {
          const localKeys = def.localKeys
          const foreignKeys = def.foreignKeys

          // TODO: Handle case when belongsTo relation isn't ever defined
          if (self._collections[relation] && foreignKey && !self.getCollection(relation).indexes[foreignKey]) {
            self.getCollection(relation).createIndex(foreignKey)
          }

          descriptor = {
            get () {
              const _self = this
              let items = _self._get(path)
              if (!_self._get('$') || !link) {
                return items
              }
              const key = def.getForeignKey(_self)
              const relationCollection = self.getCollection(relation)
              let storeItems

              if (foreignKey) {
                // Really fast retrieval
                storeItems = relationCollection.getAll(key, {
                  index: foreignKey
                })
              } else if (localKeys) {
                const keys = utils.get(_self, localKeys) || []
                const args = utils.isArray(keys) ? keys : Object.keys(keys)
                // Really fast retrieval
                storeItems = relationCollection.getAll.apply(relationCollection, args)
              } else if (foreignKeys) {
                const query = {}
                utils.set(query, `where.${foreignKeys}.contains`, key)
                // Make a much slower retrieval
                storeItems = relationCollection.filter(query)
              }

              if (!items || storeItems.length) {
                items = storeItems
              }
              _self._set(path, items)
              return items
            },
            set (records) {
              const _self = this
              const key = utils.get(_self, mapper.idAttribute)
              _self._set(path, records)

              if (foreignKey) {
                def.setForeignKey(_self, records)
              } if (localKeys) {
                const relatedIdAttribute = def.getRelation().idAttribute
                utils.set(_self, localKeys, records.map(function (record) {
                  return utils.get(record, relatedIdAttribute)
                }))
              } else if (foreignKeys) {
                records.forEach(function (record) {
                  const keys = utils.get(record, foreignKeys)
                  if (keys) {
                    if (keys.indexOf(key) === -1) {
                      keys.push(key)
                    }
                  } else {
                    utils.set(record, foreignKeys, [key])
                  }
                })
              }
              return records
            }
          }
        } else if (type === hasOneType) {
          descriptor = {
            get () {
              const _self = this
              let item = _self._get(path)
              if (!_self._get('$') || !link) {
                return item
              }
              const key = def.getForeignKey(_self)
              const items = self.getAll(relation, key, {
                index: foreignKey
              })
              item = (items.length ? items[0] : undefined) || item
              _self._set(path, item)
              return item
            },
            set (record) {
              const _self = this
              if (record) {
                def.setForeignKey(_self, record)
                _self._set(path, record)
              } else {
                utils.set(_self, def.foreignKey, undefined)
                _self._set(path, undefined)
              }
              return record
            }
          }
        }

        if (load && !def.load) {
          def.load = load
        }

        if (descriptor) {
          descriptor.enumerable = utils.isUndefined(def.enumerable) ? true : def.enumerable
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
    }

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
    return self._callSuper('destroy', name, id, opts).then(function (data) {
      if (opts.raw) {
        data.data = self.getCollection(name).remove(id, opts)
      } else {
        data = self.getCollection(name).remove(id, opts)
      }
      delete self._pendingQueries[name][id]
      delete self._completedQueries[name][id]
      return data
    })
  },

  /**
   * TODO
   *
   * @name DataStore#destroyAll
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
    return self._callSuper('destroyAll', name, query, opts).then(function (data) {
      if (opts.raw) {
        data.data = self.getCollection(name).removeAll(query, opts)
      } else {
        data = self.getCollection(name).removeAll(query, opts)
      }
      const hash = self.hashQuery(name, query, opts)
      delete self._pendingQueries[name][hash]
      delete self._completedQueries[name][hash]
      return data
    })
  },

  eject (id, opts) {
    return this.remove(id, opts)
  },

  ejectAll (query, opts) {
    return this.removeAll(query, opts)
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
    const pendingQuery = self._pendingQueries[name][id]

    utils.fillIn(opts, self.getMapper(name))

    if (pendingQuery) {
      return pendingQuery
    }
    const item = self.cachedFind(name, id, opts)
    let promise

    if (opts.force || !item) {
      promise = self._pendingQueries[name][id] = self._callSuper('find', name, id, opts).then(function (data) {
        delete self._pendingQueries[name][id]
        return self._end(name, data, opts)
      }, function (err) {
        delete self._pendingQueries[name][id]
        return utils.reject(err)
      }).then(function (data) {
        self._completedQueries[name][id] = new Date().getTime()
        return data
      })
    } else {
      promise = utils.resolve(item)
    }
    return promise
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
    const hash = self.hashQuery(name, query, opts)
    const pendingQuery = self._pendingQueries[name][hash]

    utils.fillIn(opts, self.getMapper(name))

    if (pendingQuery) {
      return pendingQuery
    }

    const items = self.cachedFindAll(name, query, opts)
    let promise

    if (opts.force || !items) {
      promise = self._pendingQueries[name][hash] = self._callSuper('findAll', name, query, opts).then(function (data) {
        delete self._pendingQueries[name][hash]
        return self._end(name, data, opts)
      }, function (err) {
        delete self._pendingQueries[name][hash]
        return utils.reject(err)
      }).then(function (data) {
        self._completedQueries[name][hash] = new Date().getTime()
        return data
      })
    } else {
      promise = utils.resolve(items)
    }
    return promise
  },

  /**
   * TODO
   *
   * @name DataStore#getCollection
   * @method
   * @param {string} name Name of the {@link LinkedCollection} to retrieve.
   * @return {LinkedCollection}
   */
  getCollection (name) {
    const collection = this._collections[name]
    if (!collection) {
      throw new ReferenceError(`${name} is not a registered collection!`)
    }
    return collection
  },

  hashQuery (name, query, opts) {
    return utils.toJson(query)
  },

  inject (records, opts) {
    return this.add(records, opts)
  },

  remove (name, id, opts) {
    const self = this
    const record = self.getCollection(name).remove(id, opts)
    if (record) {
      self.removeRelated(name, [record], opts)
    }
    return record
  },

  removeAll (name, query, opts) {
    const self = this
    const records = self.getCollection(name).removeAll(query, opts)
    if (records.length) {
      self.removeRelated(name, records, opts)
    }
    return records
  },

  removeRelated (name, records, opts) {
    const self = this
    utils.forEachRelation(self.getMapper(name), opts, function (def, optsCopy) {
      records.forEach(function (record) {
        let relatedData
        let query
        if (def.foreignKey && (def.type === 'hasOne' || def.type === 'hasMany')) {
          query = { [def.foreignKey]: def.getForeignKey(record) }
        } else if (def.type === 'hasMany' && def.localKeys) {
          query = {
            where: {
              [def.getRelation().idAttribute]: {
                'in': utils.get(record, def.localKeys)
              }
            }
          }
        } else if (def.type === 'hasMany' && def.foreignKeys) {
          query = {
            where: {
              [def.foreignKeys]: {
                'contains': def.getForeignKey(record)
              }
            }
          }
        } else if (def.type === 'belongsTo') {
          relatedData = self.remove(def.relation, def.getForeignKey(record), optsCopy)
        }
        if (query) {
          relatedData = self.removeAll(def.relation, query, optsCopy)
        }
        if (relatedData) {
          if (utils.isArray(relatedData) && !relatedData.length) {
            return
          }
          if (def.type === 'hasOne') {
            relatedData = relatedData[0]
          }
          def.setLocalField(record, relatedData)
        }
      })
    })
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
    return self._callSuper('update', name, id, record, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  },

  /**
   * TODO
   *
   * @name DataStore#updateAll
   * @method
   * @param {string} name - Name of the {@link Mapper} to target.
   * @param {Object} props - Passed to {@link Mapper#updateAll}.
   * @param {Object} [query] - Passed to {@link Mapper#updateAll}.
   * @param {Object} [opts] - Passed to {@link Mapper#updateAll}. See
   * {@link Mapper#updateAll} for more configuration options.
   * @return {Promise}
   */
  updateAll (name, props, query, opts) {
    const self = this
    opts || (opts = {})
    return self._callSuper('updateAll', name, query, props, opts).then(function (data) {
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
    return self._callSuper('updateMany', name, records, opts).then(function (data) {
      return self._end(name, data, opts)
    })
  }
}

const toProxy = [
  'add',
  'between',
  'createIndex',
  'filter',
  'get',
  'getAll',
  'query',
  'toJson'
]

toProxy.forEach(function (method) {
  props[method] = function (name, ...args) {
    return this.getCollection(name)[method](...args)
  }
})

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
export default Container.extend(props)
