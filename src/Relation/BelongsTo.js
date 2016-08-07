import utils, { safeSetLink, safeSetProp } from '../utils'
import { Relation } from '../Relation'

// TODO: remove this when the rest of the project is cleaned
const hasManyType = 'hasMany'
const hasOneType = 'hasOne'

export const BelongsToRelation = Relation.extend({
  getForeignKey (record) {
    return utils.get(record, this.foreignKey)
  },

  _setForeignKey (record, relatedRecord) {
    utils.set(record, this.foreignKey, utils.get(relatedRecord, this.getRelation().idAttribute))
  },

  findExistingLinksFor (record) {
    // console.log('\tBelongsTo#findExistingLinksFor', record)
    if (!record) {
      return
    }
    const relatedId = utils.get(record, this.foreignKey)
    if (relatedId !== undefined && relatedId !== null) {
      return this.relatedCollection.get(relatedId)
    }
  },

  setupForeignKeyDescriptor (store, mapper, collection) {
    const def = this
    const relation = def.relation
    const foreignKey = def.foreignKey
    const idAttribute = mapper.idAttribute
    const localField = def.localField
    const updateOpts = { index: foreignKey }

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
        const storeRecord = store.get(relation, value)
        if (storeRecord) {
          utils.set(this, localField, storeRecord)
        }
      }
    }
    Object.defineProperty(mapper.recordClass.prototype, foreignKey, foreignKeyDescriptor)
  },

  addDescriptor (store, mapper, collection) {
    const def = this
    const descriptor = {}
    const idAttribute = mapper.idAttribute
    const relation = def.relation
    const localField = def.localField
    const path = `links.${localField}`
    const foreignKey = def.foreignKey
    const updateOpts = { index: foreignKey }

    if (!collection.indexes[foreignKey]) {
      collection.createIndex(foreignKey)
    }

    const getter = function () { return this._get(path) }
    descriptor.get = getter
    // e.g. profile.user = someUser
    // or comment.post = somePost
    descriptor.set = function (record) {
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
          record = store.get(relation, relatedId) || record
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

    def.setupForeignKeyDescriptor(store, mapper, collection)
    return def.setupDescriptor(descriptor, store, mapper, collection)
  }
}, {
  TYPE_NAME: 'belongsTo'
})
