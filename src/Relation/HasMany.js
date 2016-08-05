import utils, { safeSetLink, safeSetProp } from '../utils'
import { Relation } from '../Relation'

export const HasManyRelation = Relation.extend({
  validateOptions (related, opts) {
    Relation.prototype.validateOptions.call(this, related, opts)

    const { localKeys, foreignKeys, foreignKey } = opts

    if (!foreignKey && !localKeys && !foreignKeys) {
      throw utils.err('new Relation', 'opts.<foreignKey|localKeys|foreignKeys>')(400, 'string', foreignKey)
    }
  },

  canFindLinkFor (record) {
    const hasForeignKeys = this.foreignKey || this.foreignKeys
    return !!(hasForeignKeys || (this.localKeys && utils.get(record, this.localKeys)))
  },

  linkRecord (record, relatedRecords) {
    const relatedCollection = this.relatedCollection
    const canAutoAddLinks = this.canAutoAddLinks
    const foreignKey = this.foreignKey
    const unsaved = this.relatedCollection.unsaved()

    return relatedRecords.map((relatedRecord) => {
      const relatedId = relatedCollection.recordId(relatedRecord)

      if ((relatedId === undefined && unsaved.indexOf(relatedRecord) === -1) || relatedRecord !== relatedCollection.get(relatedId)) {
        if (foreignKey) {
          // TODO: slow, could be optimized? But user loses hook
          this.setForeignKey(record, relatedRecord)
        }
        if (canAutoAddLinks) {
          relatedRecord = relatedCollection.add(relatedRecord)
        }
      }

      return relatedRecord
    })
  },

  findExistingLinksFor (record) {
    const id = utils.get(record, this.mapper.idAttribute)
    const ids = this.localKeys ? utils.get(record, this.localKeys) : null
    let records

    if (id !== undefined && this.foreignKey) {
      records = this.findExistingLinksByForeignKey(id)
    } else if (this.localKeys && ids) {
      records = this.findExistingLinksByLocalKeys(ids)
    } else if (id !== undefined && this.foreignKeys) {
      records = this.findExistingLinksByForeignKeys(id)
    }

    if (records && records.length) {
      return records
    }
  },

  // e.g. user hasMany group via "foreignKeys", so find all users of a group
  findExistingLinksByLocalKeys (ids) {
    return this.relatedCollection.filter({
      where: {
        [this.mapper.idAttribute]: {
          'in': ids
        }
      }
    })
  },

  // e.g. group hasMany user via "localKeys", so find all groups that own a user
  findExistingLinksByForeignKeys (id) {
    return this.relatedCollection.filter({
      where: {
        [this.foreignKeys]: {
          'contains': id
        }
      }
    })
  },

  addDescriptor (store, mapper, collection) {
    const def = this
    const descriptor = {}
    const idAttribute = mapper.idAttribute
    const localKeys = def.localKeys
    const foreignKeys = def.foreignKeys

    const relation = def.relation
    const localField = def.localField
    const path = `links.${localField}`
    const foreignKey = def.foreignKey
    const updateOpts = { index: foreignKey }

    // TODO: Handle case when belongsTo relation isn't ever defined
    if (store._collections[relation] && foreignKey && !store.getCollection(relation).indexes[foreignKey]) {
      store.getCollection(relation).createIndex(foreignKey)
    }

    const getter = function () { return this._get(path) }

    descriptor.get = function () {
      let current = getter.call(this)
      if (!current) {
        this._set(path, [])
      }
      return getter.call(this)
    }
    // e.g. post.comments = someComments
    // or user.groups = someGroups
    // or group.users = someUsers
    descriptor.set = function (records) {
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
              record = store.get(relation, relatedId) || record
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
              store.getCollection(relation).updateIndex(record, updateOpts)
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
          store.getCollection(relation).updateIndex(record, updateOpts)
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
    return def.setupDescriptor(descriptor, store, mapper, collection)
  }
}, {
  TYPE_NAME: 'hasMany'
})
