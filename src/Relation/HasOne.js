import utils from '../utils'
import { Relation } from '../Relation'

export const HasOneRelation = Relation.extend({
  findExistingLinksFor (relatedMapper, record) {
    const recordId = utils.get(record, relatedMapper.idAttribute)
    const records = this.findExistingLinksByForeignKey(recordId)

    if (records && records.length) {
      return records[0]
    }
  },

  isRequiresChildId () {
    return true
  }
}, {
  TYPE_NAME: 'hasOne'
})
