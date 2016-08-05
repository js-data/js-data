import utils, { safeSetLink, safeSetProp } from '../utils'
import { Relation } from '../Relation'

export const HasOneRelation = Relation.extend({
  findExistingLinksFor (relatedMapper, record) {
    const recordId = utils.get(record, relatedMapper.idAttribute)
    const records = this.findExistingLinksByForeignKey(recordId)

    if (records && records.length) {
      return records[0]
    }
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
    const getter = function () { return this._get(path) }

    if (store._collections[relation] && foreignKey && !store.getCollection(relation).indexes[foreignKey]) {
      store.getCollection(relation).createIndex(foreignKey)
    }

    descriptor.get = getter
    // e.g. user.profile = someProfile
    descriptor.set = function (record) {
      const current = this._get(path)
      if (record === current) {
        return current
      }
      const inverseLocalField = def.getInverse(mapper).localField
      // Update (unset) inverse relation
      if (current) {
        safeSetProp(current, foreignKey, undefined)
        store.getCollection(relation).updateIndex(current, updateOpts)
        safeSetLink(current, inverseLocalField, undefined)
      }
      if (record) {
        const relatedId = utils.get(record, def.getRelation().idAttribute)
        // Prefer store record
        if (relatedId !== undefined) {
          record = store.get(relation, relatedId) || record
        }

        // Set locals
        safeSetLink(this, localField, record)

        // Update (set) inverse relation
        safeSetProp(record, foreignKey, utils.get(this, idAttribute))
        store.getCollection(relation).updateIndex(record, updateOpts)
        safeSetLink(record, inverseLocalField, this)
      } else {
        // Unset locals
        safeSetLink(this, localField, undefined)
      }
      return record
    }
    return def.setupDescriptor(descriptor, store, mapper, collection)
  }
}, {
  TYPE_NAME: 'hasOne'
})
