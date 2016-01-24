import {
  isString
} from '../utils'

/**
 * @ignore
 */
function applyHasMany (Mapper, Relation, opts) {
  opts || (opts = {})

  const getRelation = opts.getRelation || function () {
    return Relation
  }

  const localField = opts.localField
  if (!localField) {
    throw new Error('localField is required')
  }

  const foreignKey = opts.foreignKey
  const localKeys = opts.localKeys
  const foreignKeys = opts.foreignKeys
  if (!foreignKey && !localKeys && !foreignKeys) {
    throw new Error('one of (foreignKey, localKeys, foreignKeys) is required')
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
  //   set (children) {
  //     if (!children) {
  //       return
  //     }
  //     this._set(`links.${getLocalField()}`, children)
  //     if (children && children.length) {
  //       const id = get(this, Model.idAttribute)
  //       if (foreignKey) {
  //         children.forEach(function (child) {
  //           set(child, foreignKey, id)
  //         })
  //       } else if (localKeys) {
  //         const keys = []
  //         children.forEach(function (child) {
  //           keys.push(get(child, getRelation().idAttribute))
  //         })
  //         set(this, localKeys, keys)
  //       } else if (foreignKeys) {
  //         children.forEach(function (child) {
  //           const keys = get(child, foreignKeys)
  //           if (keys) {
  //             if (keys.indexOf(id) === -1) {
  //               keys.push(id)
  //             }
  //           } else {
  //             set(child, foreignKeys, [id])
  //           }
  //         })
  //       }
  //     }
  //     return get(this, getLocalField())
  //   }
  // }

  // const originalGet = descriptor.get
  // const originalSet = descriptor.set

  // // Check for user-defined getter
  // if (opts.get) {
  //   // Set user-defined getter
  //   descriptor.get = function () {
  //     // Call user-defined getter, passing in:
  //     //  - target Model
  //     //  - related Model
  //     //  - instance of target Model
  //     //  - the original getter function, in case the user wants to use it
  //     return opts.get(Model, getRelation(), this, () => originalGet.call(this))
  //   }
  // }

  // // Check for user-defined setter
  // if (opts.set) {
  //   // Set user-defined setter
  //   descriptor.set = function (children) {
  //     // Call user-defined getter, passing in:
  //     //  - target Model
  //     //  - related Model
  //     //  - instance of target Model
  //     //  - instances of related Model
  //     //  - the original setter function, in case the user wants to use it
  //     return opts.set(Model, getRelation(), this, children, value => originalSet.call(this, value === undefined ? children : value))
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
  opts.type = 'hasMany'
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
 * @param {Mapper} Relation - The relation of which the target has many.
 * @param {Object} opts - Configuration options.
 * @param {string} opts.localField The field on the target where the relation
 * will be attached.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function hasMany (Relation, opts) {
  return function (target) {
    return applyHasMany(target, Relation, opts)
  }
}
