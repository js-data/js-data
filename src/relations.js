import { Relation } from './Relation'
import { BelongsToRelation } from './Relation/BelongsTo'
import { HasManyRelation } from './Relation/HasMany'
import { HasOneRelation } from './Relation/HasOne'

[BelongsToRelation, HasManyRelation, HasOneRelation].forEach(function (RelationType) {
  Relation[RelationType.TYPE_NAME] = function (related, options) {
    return new RelationType(related, options)
  }
})

export { belongsToType, hasManyType, hasOneType, Relation } from './Relation'
