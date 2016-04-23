import utils from './utils'
import {
  belongsToType,
  hasManyType,
  hasOneType
} from './decorators'
import Collection from './Collection'

const DOMAIN = 'LinkedCollection'

/**
 * TODO
 *
 * ```javascript
 * import {LinkedCollection} from 'js-data'
 * ```
 *
 * @class LinkedCollection
 * @extends Collection
 * @param {Array} [records] Initial set of records to insert into the
 * collection. See {@link Collection}.
 * @param {Object} [opts] Configuration options. See {@link Collection}.
 * @returns {Mapper}
 */
export default Collection.extend({
  constructor: function LinkedCollection (records, opts) {
    const self = this
    utils.classCallCheck(self, LinkedCollection)
    LinkedCollection.__super__.call(self, records, opts)

    // Make sure this collection has somewhere to store "added" timestamps
    Object.defineProperty(self, '_added', {
      value: {}
    })

    // Make sure this collection has a reference to a datastore
    if (!self.datastore) {
      throw utils.err(`new ${DOMAIN}`, 'opts.datastore')(400, 'DataStore', self.datastore)
    }
    return self
  },

  _onRecordEvent (...args) {
    const self = this
    utils.getSuper(self).prototype._onRecordEvent.apply(self, args)
    const event = args[0]
    // This is a very brute force method
    // Lots of room for optimization
    if (utils.isString(event) && event.indexOf('change') === 0) {
      self.updateIndexes(args[1])
    }
  },

  add (records, opts) {
    const self = this
    const datastore = self.datastore
    const mapper = self.mapper
    const relationList = mapper.relationList
    const timestamp = new Date().getTime()
    const usesRecordClass = !!mapper.recordClass
    const idAttribute = mapper.idAttribute
    let singular

    if (utils.isObject(records) && !utils.isArray(records)) {
      singular = true
      records = [records]
    }

    records = utils.getSuper(self).prototype.add.call(self, records, opts)

    if (relationList.length && records.length) {
      // Check the currently visited record for relations that need to be
      // inserted into their respective collections.
      mapper.relationList.forEach(function (def) {
        const relationName = def.relation
        // A reference to the Mapper that this Mapper is related to
        const relatedMapper = datastore.getMapper(relationName)
        // The field used by the related Mapper as the primary key
        const relationIdAttribute = relatedMapper.idAttribute
        // Grab the foreign key in this relationship, if there is one
        const foreignKey = def.foreignKey
        // A lot of this is an optimization for being able to insert a lot of
        // data as quickly as possible
        const relatedCollection = datastore.getCollection(relationName)
        const type = def.type
        const isHasMany = type === hasManyType
        const shouldAdd = utils.isUndefined(def.add) ? true : !!def.add
        let relatedData

        records.forEach(function (record) {
          // Grab a reference to the related data attached or linked to the
          // currently visited record
          relatedData = def.getLocalField(record)
          const id = utils.get(record, idAttribute)

          if (utils.isFunction(def.add)) {
            relatedData = def.add(datastore, def, record)
          } else if (relatedData) {
            // Otherwise, if there is something to be added, add it
            if (isHasMany) {
              // Handle inserting hasMany relations
              relatedData = relatedData.map(function (toInsertItem) {
                // Check that this item isn't the same item that is already in the
                // store
                if (toInsertItem !== relatedCollection.get(relatedCollection.recordId(toInsertItem))) {
                  // Make sure this item has its foreignKey
                  if (foreignKey) {
                    // TODO: slow, could be optimized? But user loses hook
                    def.setForeignKey(record, toInsertItem)
                  }
                  // Finally add this related item
                  if (shouldAdd) {
                    toInsertItem = relatedCollection.add(toInsertItem)
                  }
                }
                return toInsertItem
              })
            } else {
              const relatedDataId = utils.get(relatedData, relationIdAttribute)
              // Handle inserting belongsTo and hasOne relations
              if (relatedData !== relatedCollection.get(relatedDataId)) {
                // Make sure foreignKey field is set
                def.setForeignKey(record, relatedData)
                // Finally insert this related item
                if (shouldAdd) {
                  relatedData = relatedCollection.add(relatedData)
                }
              }
            }
          }

          if (!relatedData || (utils.isArray(relatedData) && !relatedData.length)) {
            if (type === belongsToType) {
              const relatedId = utils.get(record, foreignKey)
              if (!utils.isUndefined(relatedId)) {
                relatedData = relatedCollection.get(relatedId)
              }
            } else if (type === hasOneType) {
              const _records = relatedCollection.filter({
                [foreignKey]: id
              })
              relatedData = _records.length ? _records[0] : undefined
            } else if (type === hasManyType) {
              if (foreignKey) {
                const _records = relatedCollection.filter({
                  [foreignKey]: id
                })
                relatedData = _records.length ? _records : undefined
              } else if (def.localKeys && utils.get(record, def.localKeys)) {
                const _records = relatedCollection.filter({
                  where: {
                    [relationIdAttribute]: {
                      'in': utils.get(record, def.localKeys)
                    }
                  }
                })
                relatedData = _records.length ? _records : undefined
              } else if (def.foreignKeys) {
                const _records = relatedCollection.filter({
                  where: {
                    [def.foreignKeys]: {
                      'contains': id
                    }
                  }
                })
                relatedData = _records.length ? _records : undefined
              }
            }
          }
          if (relatedData) {
            def.setLocalField(record, relatedData)
          } else {
          }
        })
      })
    }

    records.forEach(function (record) {
      // Track when this record was added
      self._added[self.recordId(record)] = timestamp

      if (usesRecordClass) {
        record._set('$', timestamp)
      }
    })

    return singular ? records[0] : records
  },

  remove (id, opts) {
    const self = this
    const mapper = self.mapper
    const record = utils.getSuper(self).prototype.remove.call(self, id, opts)
    if (record) {
      delete self._added[id]
      if (mapper.recordClass) {
        record._set('$') // unset
      }
    }
    return record
  },

  removeAll (query, opts) {
    const self = this
    const mapper = self.mapper
    const records = utils.getSuper(self).prototype.removeAll.call(self, query, opts)
    records.forEach(function (record) {
      delete self._added[self.recordId(record)]
      if (mapper.recordClass) {
        record._set('$') // unset
      }
    })
    return records
  }
})
