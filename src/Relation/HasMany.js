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

    return Boolean(hasForeignKeys || this.localKeys && utils.get(record, this.localKeys))
  },

  linkRecord (record, relatedRecords) {
    const relatedCollection = this.relatedCollection

    return relatedRecords.map((toInsertItem) => {
      const relatedId = relatedCollection.recordId(toInsertItem)

      if (toInsertItem !== relatedCollection.get(relatedId)) {
        if (this.foreignKey) {
          // TODO: slow, could be optimized? But user loses hook
          this.setForeignKey(record, toInsertItem)
        }

        if (this.canAutoAddLinks) {
          toInsertItem = relatedCollection.add(toInsertItem)
        }
      }

      return toInsertItem
    })
  },

  findExistingLinksFor (relatedMapper, record) {
    const recordId = utils.get(record, relatedMapper.idAttribute)
    const localKeysValue = this.localKeys ? utils.get(record, this.localKeys) : null
    let records

    if (this.foreignKey) {
      records = this.findExistingLinksByForeignKey(recordId)
    } else if (this.localKeys && localKeysValue) {
      records = this.findExistingLinksByLocalKeys(localKeysValue)
    } else if (this.foreignKeys) {
      records = this.findExistingLinksByForeignKeys(recordId)
    }

    if (records && records.length) {
      return records
    }
  },

  findExistingLinksByLocalKeys (localKeysValue) {
    return this.relatedCollection.filter({
      where: {
        [this.mapper.idAttribute]: {
          'in': localKeysValue
        }
      }
    })
  },

  findExistingLinksByForeignKeys (foreignId) {
    return this.relatedCollection.filter({
      where: {
        [this.foreignKeys]: {
          'contains': foreignId
        }
      }
    })
  }
}, {
  TYPE_NAME: 'hasMany'
})
