import { Relation } from './Relation'
import { BelongsToRelation } from './Relation/BelongsTo'
import { HasManyRelation } from './Relation/HasMany'
import { HasOneRelation } from './Relation/HasOne'

[BelongsToRelation, HasManyRelation, HasOneRelation].forEach(RelationType => {
  Relation[RelationType.TYPE_NAME] = (related, options) => new RelationType(related, options)
})

export { belongsToType, hasManyType, hasOneType, Relation } from './Relation'
