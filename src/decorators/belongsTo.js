import {
  isString
} from '../utils'

const op = 'belongsTo'

/**
 * @ignore
 */
function applyBelongsTo (Mapper, Relation, opts) {
  opts || (opts = {})

  const getRelation = opts.getRelation || function () {
    return Relation
  }

  const localField = opts.localField
  if (!localField) {
    throw new Error('localField is required')
  }

  const foreignKey = opts.foreignKey || opts.localKey
  if (!foreignKey) {
    throw new Error('foreignKey is required')
  }

  // if (isFunction(Mapper.RecordClass)) {
  //   // Setup configuration of the property
  //   const descriptor = {
  //     // Whether the field specified by "localField" will show up in "for...in"
  //     enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
  //     // Set default method for retrieving the linked relation
  //     get () {
  //       return this._get(`links.${localField}`)
  //     },
  //     // Set default method for setting the linked relation
  //     set (parent) {
  //       const self = this
  //       self._set(`links.${localField}`, parent)
  //       set(self, foreignKey, parent ? get(parent, getRelation().idAttribute) : undefined)
  //       return get(self, localField)
  //     }
  //   }

  //   const originalGet = descriptor.get
  //   const originalSet = descriptor.set

  //   // Check for user-defined getter
  //   if (opts.get) {
  //     // Set user-defined getter
  //     descriptor.get = function () {
  //       // Call user-defined getter, passing in:
  //       //  - target Mapper
  //       //  - related Mapper
  //       //  - instance of target Mapper
  //       //  - the original getter function, in case the user wants to use it
  //       return opts.get(Mapper, getRelation(), this, () => originalGet.call(this))
  //     }
  //     delete descriptor.writable
  //   }

  //   // Check for user-defined setter
  //   if (opts.set) {
  //     // Set user-defined setter
  //     descriptor.set = function (parent) {
  //       // Call user-defined getter, passing in:
  //       //  - target Mapper
  //       //  - related Mapper
  //       //  - instance of target Mapper
  //       //  - instance of related Mapper
  //       //  - the original setter function, in case the user wants to use it
  //       return opts.set(Mapper, getRelation(), this, parent, value => originalSet.call(this, value === undefined ? parent : value))
  //     }
  //     delete descriptor.writable
  //   }

  //   // Finally, added property to prototype of target Mapper
  //   Object.defineProperty(Mapper.RecordClass.prototype, localField, descriptor)
  // }

  if (!Mapper.relationList) {
    Mapper.relationList = []
  }
  if (!Mapper.relationFields) {
    Mapper.relationFields = []
  }
  opts.type = 'belongsTo'
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
 * @param {Mapper} Relation The Relation the target belongs to.
 * @param {Object} opts Configuration options.
 * @param {string} opts.foreignKey The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function belongsTo (Relation, opts) {
  return function (target) {
    target.dbg(op, Relation, opts)
    return applyBelongsTo(target, Relation, opts)
  }
}
