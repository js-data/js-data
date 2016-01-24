import {
  classCallCheck,
  extend,
  get,
  getSuper,
  isArray,
  isObject,
  set
} from './utils'
import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import Collection from './Collection'

/**
 * TODO
 *
 * @class LinkedCollection
 * @extends Collection
 * @param {Array} [records] Initial set of records to insert into the
 * collection. See {@link Collection}.
 * @param {Object} [opts] Configuration options. See {@link Collection}.
 * @return {Mapper}
 */
const LinkedCollection = Collection.extend({
  constructor (records, opts) {
    const self = this
    classCallCheck(self, LinkedCollection)

    getSuper(self).call(self, records, opts)

    // Make sure this collection has somewhere to store "added" timestamps
    self._added = {}

    // Make sure this collection a reference to a datastore
    if (!self.datastore) {
      throw new Error('This collection must have a datastore!')
    }
    return self
  },

  add (records, opts) {
    // console.log('add', this.mapper.name, records)
    const self = this
    const datastore = self.datastore
    const mapper = self.mapper
    const relationList = mapper.relationList || []
    const timestamp = new Date().getTime()
    let singular

    records = getSuper(self).prototype.add.call(self, records, opts)

    if (isObject(records) && !isArray(records)) {
      singular = true
      records = [records]
    }

    records.forEach(function (record) {
      // Track when this record was added
      self._added[self.recordId(record)] = timestamp
    })

    if (relationList.length && records.length) {
      // Check the currently visited record for relations that need to be
      // inserted into their respective collections.
      mapper.relationList.forEach(function (def) {
        if (def.add === false) {
          return
        }
        const relationName = def.relation
        // A reference to the Mapper that this Mapper is related to
        const Relation = datastore.getMapper(relationName)
        // The field used by the related Mapper as the primary key
        const relationIdAttribute = Relation.idAttribute
        // Grab the foreign key in this relationship, if there is one
        const foreignKey = def.foreignKey
        const localField = def.localField
        // A lot of this is an optimization for being able to insert a lot of
        // data as quickly as possible
        const relatedCollection = datastore.getCollection(relationName)
        const type = def.type
        const isBelongsTo = type === belongsToType
        const isHasMany = type === hasManyType
        const isHasOne = type === hasOneType
        let relatedData

        records.forEach(function (record) {
          // Grab a reference to the related data attached or linked to the
          // currently visited record
          relatedData = get(record, localField)

          if (relatedData) {
            const id = get(record, mapper.idAttribute)
            // Otherwise, if there is something to be added, add it
            if (isHasMany) {
              // Handle inserting hasMany relations
              relatedData = relatedData.map(function (toInsertItem) {
                // Check that this item isn't the same item that is already in the
                // store
                if (toInsertItem !== relatedCollection.get(get(toInsertItem, relationIdAttribute))) {
                  // Make sure this item has its foreignKey
                  if (foreignKey) {
                    set(toInsertItem, foreignKey, id)
                  }
                  // Finally add this related item
                  toInsertItem = relatedCollection.add(toInsertItem)
                }
                return toInsertItem
              })
              // If it's the parent that has the localKeys
              if (def.localKeys) {
                set(record, def.localKeys, relatedData.map(function (inserted) {
                  return get(inserted, relationIdAttribute)
                }))
              }
            } else {
              const relatedDataId = get(relatedData, relationIdAttribute)
              // Handle inserting belongsTo and hasOne relations
              if (relatedData !== relatedCollection.get(relatedDataId)) {
                // Make sure foreignKey field is set
                if (isBelongsTo) {
                  set(record, def.foreignKey, relatedDataId)
                } else if (isHasOne) {
                  set(relatedData, def.foreignKey, id)
                }
                // Finally insert this related item
                relatedData = relatedCollection.add(relatedData)
              }
            }
            set(record, localField, relatedData)
          }
        })
      })
    }

    return singular ? records[0] : records
  },

  remove (id, opts) {
    const self = this
    delete self._added[id]
    return getSuper(self).prototype.remove.call(self, id, opts)
  },

  removeAll (query, opts) {
    const self = this
    const records = getSuper(self).prototype.removeAll.call(self, query, opts)
    records.forEach(function (record) {
      delete self._added[self.recordId(record)]
    })
    return records
  }
})

LinkedCollection.extend = extend

export {
  LinkedCollection as default
}
