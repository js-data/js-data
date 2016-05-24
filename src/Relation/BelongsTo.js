import utils from '../utils'
import { Relation } from '../Relation'

export const BelongsToRelation = Relation.extend({
  getForeignKey (record) {
    return utils.get(record, this.foreignKey)
  },

  _setForeignKey (record, relatedRecord) {
    utils.set(record, this.foreignKey, utils.get(relatedRecord, this.getRelation().idAttribute))
  },

  findExistingLinksFor (relatedMapper, record) {
    const relatedId = utils.get(record, this.foreignKey)

    if (!utils.isUndefined(relatedId)) {
      return this.relatedCollection.get(relatedId)
    }
  }
}, {
  TYPE_NAME: 'belongsTo'
})
