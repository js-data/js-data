import utils from '../utils'
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

  isRequiresParentId () {
    return !!this.localKeys && this.localKeys.length > 0
  },

  isRequiresChildId () {
    return !!this.foreignKey
  },

  createParentRecord (props, opts) {
    const relationData = this.getLocalField(props)
    const foreignIdField = this.getRelation().idAttribute

    return this.createLinked(relationData, opts).then((records) => {
      utils.set(props, this.localKeys, records.map((record) => utils.get(record, foreignIdField)))
    })
  },

  createLinked (props, opts) {
    return this.getRelation().createMany(props, opts)
  }
}, {
  TYPE_NAME: 'hasMany'
})
