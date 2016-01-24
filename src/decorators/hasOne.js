import {
  isString
} from '../utils'

/**
 * @ignore
 */
function applyHasOne (Mapper, Relation, opts) {
  opts || (opts = {})

  const getRelation = opts.getRelation || function () {
    return Relation
  }

  const localField = opts.localField
  if (!localField) {
    throw new Error('localField is required')
  }

  const foreignKey = opts.foreignKey
  if (!foreignKey) {
    throw new Error('foreignKey is required')
  }

  // // Setup configuration of the property
  // const descriptor = {
  //   // Whether the field specified by "localField" will show up in "for...in"
  //   enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
  //   // Set default method for retrieving the linked relation
  //   get () {
  //     return this._get(`links.${getLocalField()}`)
  //   },
  //   // Set default method for setting the linked relation
  //   set (child) {
  //     if (!child) {
  //       return
  //     }
  //     this._set(`links.${getLocalField()}`, child)
  //     set(child, getForeignKey(), get(this, Model.idAttribute))
  //     return get(this, getLocalField())
  //   }
  // }

  // // Check for user-defined getter
  // if (opts.get) {
  //   const originalGet = descriptor.get
  //   // Set user-defined getter
  //   descriptor.get = function () {
  //     // Call user-defined getter, passing in:
  //     //  - target Model
  //     //  - related Model
  //     //  - instance of target Model
  //     //  - the original getter function, in case the user wants to use it
  //     return opts.get(Model, Relation, this, originalGet ? (...args) => originalGet.apply(this, args) : undefined)
  //   }
  // }

  // // Check for user-defined setter
  // if (opts.set) {
  //   const originalSet = descriptor.set
  //   // Set user-defined setter
  //   descriptor.set = function (child) {
  //     // Call user-defined getter, passing in:
  //     //  - target Model
  //     //  - related Model
  //     //  - instance of target Model
  //     //  - instance of related Model
  //     //  - the original setter function, in case the user wants to use it
  //     return opts.set(Model, Relation, this, child, originalSet ? (...args) => originalSet.apply(this, args) : undefined)
  //   }
  // }

  // // Finally, added property to prototype of target Model
  // Object.defineProperty(Model.prototype, getLocalField(), descriptor)

  if (!Mapper.relationList) {
    Mapper.relationList = []
  }
  if (!Mapper.relationFields) {
    Mapper.relationFields = []
  }
  opts.type = 'hasOne'
  opts.name = Mapper.name
  opts.relation = isString(Relation) ? Relation : Relation.name
  opts.getRelation = getRelation
  Mapper.relationList.push(opts)
  Mapper.relationFields.push(localField)

  // Return target Mapper for chaining
  return Mapper
}

/**
 * @memberof! module:js-data
 *
 * @ignore
 * @param {Mapper} Relation The Relation of which the target has one.
 * @param {Object} opts Configuration options.
 * @param {string} opts.foreignKey The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field on the target where the relation
 * will be attached.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function hasOne (Relation, opts) {
  return function (target) {
    return applyHasOne(target, Relation, opts)
  }
}
