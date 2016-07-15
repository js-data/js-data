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
  }
}, {
  TYPE_NAME: 'belongsTo'
})
