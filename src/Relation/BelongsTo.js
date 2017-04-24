import utils from '../utils'
import { Relation } from '../Relation'

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

  isRequiresParentId () {
    return true
  },

  createParentRecord (props, opts) {
    const relationData = this.getLocalField(props)

    return this.createLinked(relationData, opts).then((record) => {
      this.setForeignKey(props, record)
    })
  },

  createChildRecord () {
    throw new Error('"BelongsTo" relation does not support child creation as it cannot have children.')
  }
}, {
  TYPE_NAME: 'belongsTo'
})
