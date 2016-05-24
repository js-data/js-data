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
function LinkedCollection (records, opts) {
  utils.classCallCheck(this, LinkedCollection)
  // Make sure this collection has somewhere to store "added" timestamps
  Object.defineProperties(this, {
    _added: {
      value: {}
    },
    datastore: {
      writable: true,
      value: undefined
    }
  })

  LinkedCollection.__super__.call(this, records, opts)

  // Make sure this collection has a reference to a datastore
  if (!this.datastore) {
    throw utils.err(`new ${DOMAIN}`, 'opts.datastore')(400, 'DataStore', this.datastore)
  }
  return this
}

export default Collection.extend({
  constructor: LinkedCollection,

  _onRecordEvent (...args) {
    utils.getSuper(this).prototype._onRecordEvent.apply(this, args)
    const event = args[0]
    // This is a very brute force method
    // Lots of room for optimization
    if (utils.isString(event) && event.indexOf('change') === 0) {
      this.updateIndexes(args[1])
    }
  },

  add (records, opts) {
    const datastore = this.datastore
    const mapper = this.mapper
    const relationList = mapper.relationList
    const timestamp = new Date().getTime()
    const usesRecordClass = !!mapper.recordClass
    const idAttribute = mapper.idAttribute
    let singular

    if (utils.isObject(records) && !utils.isArray(records)) {
      singular = true
      records = [records]
    }

    records = utils.getSuper(this).prototype.add.call(this, records, opts)

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

    records.forEach((record) => {
      // Track when this record was added
      this._added[this.recordId(record)] = timestamp

      if (usesRecordClass) {
        record._set('$', timestamp)
      }
    })

    return singular ? records[0] : records
  },

  remove (id, opts) {
    const mapper = this.mapper
    const record = utils.getSuper(this).prototype.remove.call(this, id, opts)
    if (record) {
      delete this._added[id]
      if (mapper.recordClass) {
        record._set('$') // unset
      }
    }
    return record
  },

  removeAll (query, opts) {
    const mapper = this.mapper
    const records = utils.getSuper(this).prototype.removeAll.call(this, query, opts)
    records.forEach((record) => {
      delete this._added[this.recordId(record)]
      if (mapper.recordClass) {
        record._set('$') // unset
      }
    })
    return records
  }
})

/**
 * Create a subclass of this LinkedCollection.
 *
 * @example <caption>Extend the class in a cross-browser manner.</caption>
 * import {LinkedCollection} from 'js-data'
 * const CustomLinkedCollectionClass = LinkedCollection.extend({
 *   foo () { return 'bar' }
 * })
 * const customLinkedCollection = new CustomLinkedCollectionClass()
 * console.log(customLinkedCollection.foo()) // "bar"
 *
 * @example <caption>Extend the class using ES2015 class syntax.</caption>
 * class CustomLinkedCollectionClass extends LinkedCollection {
 *   foo () { return 'bar' }
 * }
 * const customLinkedCollection = new CustomLinkedCollectionClass()
 * console.log(customLinkedCollection.foo()) // "bar"
 *
 * @method LinkedCollection.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this LinkedCollection class.
 * @since 3.0.0
 */
