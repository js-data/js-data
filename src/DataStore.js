import utils, { safeSetLink, safeSetProp } from './utils'

import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import SimpleStore from './SimpleStore'
import LinkedCollection from './LinkedCollection'

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
  unlinkOnDestroy: true
}

/**
 * The `DataStore` class is an extension of {@link SimpleStore}. Not only does
 * `DataStore` manage mappers and store data in collections, it uses the
 * {@link LinkedCollection} class to link related records together in memory.
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
 * @extends SimpleStore
 * @param {Object} [opts] Configuration options. See {@link SimpleStore}.
 * @param {boolean} [opts.collectionClass={@link LinkedCollection}] See {@link DataStore#collectionClass}.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {boolean} [opts.unlinkOnDestroy=true] See {@link DataStore#unlinkOnDestroy}.
 * @param {boolean|Function} [opts.usePendingFind=true] See {@link DataStore#usePendingFind}.
 * @param {boolean|Function} [opts.usePendingFindAll=true] See {@link DataStore#usePendingFindAll}.
 * @returns {DataStore}
 * @see SimpleStore
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
  opts.collectionClass || (opts.collectionClass = LinkedCollection)
  SimpleStore.call(this, opts)
}

const props = {
  constructor: DataStore,

  defineMapper (name, opts) {
    // Complexity of this method is beyond simply using => functions to bind context
    const self = this
    const mapper = SimpleStore.prototype.defineMapper.call(self, name, opts)
    const idAttribute = mapper.idAttribute
    const collection = this.getCollection(name)

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
            if (currentParent && inverseDef) {
              this.removeInverseRelation(currentParent, id, inverseDef, idAttribute)
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

              if (inverseDef) {
                this.setupInverseRelation(record, id, inverseDef, idAttribute)
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
            // Update (unset) inverse relation
            if (current) {
              safeSetProp(current, foreignKey, undefined)
              self.getCollection(relation).updateIndex(current, updateOpts)
              safeSetLink(current, inverseLocalField, undefined)
            }
            if (record) {
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

  destroy (name, id, opts) {
    opts || (opts = {})
    return SimpleStore.prototype.destroy.call(this, name, id, opts).then((result) => {
      let record
      if (opts.raw) {
        record = result.data
      } else {
        record = result
      }

      if (record && this.unlinkOnDestroy) {
        const _opts = utils.plainCopy(opts)
        _opts.withAll = true
        utils.forEachRelation(this.getMapper(name), _opts, (def) => {
          utils.set(record, def.localField, undefined)
        })
      }
      return result
    })
  },

  destroyAll (name, query, opts) {
    opts || (opts = {})
    return SimpleStore.prototype.destroyAll.call(this, name, query, opts).then((result) => {
      let records
      if (opts.raw) {
        records = result.data
      } else {
        records = result
      }

      if (records && records.length && this.unlinkOnDestroy) {
        const _opts = utils.plainCopy(opts)
        _opts.withAll = true
        utils.forEachRelation(this.getMapper(name), _opts, (def) => {
          records.forEach((record) => {
            utils.set(record, def.localField, undefined)
          })
        })
      }
      return result
    })
  }
}

export default SimpleStore.extend(props)

/**
 * Create a subclass of this DataStore:
 * @example <caption>DataStore.extend</caption>
 * // Normally you would do: import {DataStore} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
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
