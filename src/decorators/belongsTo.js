import {
  camelCase,
  get,
  isFunction,
  isString,
  set
} from '../utils'

const op = 'belongsTo'

/**
 * Steps to apply a "belongsTo" relationship
 * 1. Choose the localField and foreignKey
 * 2. Configure property descriptor, possibly including custom getter/setter
 * 3. Add property to prototype of target Model
 *
 * The added property is where an instance of the related Model will be
 * attached to an instance of the target Model, e.g. if Comment belongsTo
 * User and "localField" is set to "user", "comment.user" will be a reference to
 * the user.
 *
 * @ignore
 */
function applyBelongsTo (Model, Relation, opts) {
  opts || (opts = {})

  function getRelation () {
    const fake = {
      name: Relation
    }
    if (isString(Relation)) {
      if (isFunction(Model.getModel)) {
        return Model.getModel(Relation) || fake
      }
      return fake
    }
    return Relation
  }

  function getLocalField () {
    return opts.localField || camelCase(getRelation().name)
  }

  function getForeignKey () {
    return opts.foreignKey || opts.localKey || `${camelCase(getRelation().name)}Id`
  }

  // Setup configuration of the property
  const descriptor = {
    // Whether the field specified by "localField" will show up in "for...in"
    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    // Set default method for retrieving the linked relation
    get () {
      return this._get(`links.${getLocalField()}`)
    },
    // Set default method for setting the linked relation
    set (parent) {
      if (!parent) {
        return
      }
      this._set(`links.${getLocalField()}`, parent)
      set(this, getForeignKey(), parent[getRelation().idAttribute])
      return get(this, getLocalField())
    }
  }

  const originalGet = descriptor.get
  const originalSet = descriptor.set

  // Check for user-defined getter
  if (opts.get) {
    // Set user-defined getter
    descriptor.get = function () {
      // Call user-defined getter, passing in:
      //  - target Model
      //  - related Model
      //  - instance of target Model
      //  - the original getter function, in case the user wants to use it
      return opts.get(Model, getRelation(), this, () => originalGet.call(this))
    }
    delete descriptor.writable
  }

  // Check for user-defined setter
  if (opts.set) {
    // Set user-defined setter
    descriptor.set = function (parent) {
      // Call user-defined getter, passing in:
      //  - target Model
      //  - related Model
      //  - instance of target Model
      //  - instance of related Model
      //  - the original setter function, in case the user wants to use it
      return opts.set(Model, getRelation(), this, parent, value => originalSet.call(this, value === undefined ? parent : value))
    }
    delete descriptor.writable
  }

  if (descriptor.get) {
    descriptor.set || (descriptor.set = function () {})
  }

  // Finally, added property to prototype of target Model
  Object.defineProperty(Model.prototype, getLocalField(), descriptor)

  if (!Model.relationList) {
    Model.relationList = []
  }
  if (!Model.relationFields) {
    Model.relationFields = []
  }
  opts.type = 'belongsTo'
  opts.name = Model.name
  opts.relation = Relation.name
  opts.Relation = Relation
  opts.getRelation = getRelation
  opts.getLocalField = getLocalField
  opts.getForeignKey = getForeignKey
  Model.relationList.push(opts)
  Model.relationFields.push(getLocalField())

  // Return target Model for chaining
  return Model
}

/**
 * @memberof! module:js-data
 * @example
 * // ES6
 * import {belongsTo, Model} from 'js-data'
 * class User extends Model {}
 *
 * // @belongsTo(User) (ES7)
 * class Comment extends Model {}
 * belongsTo(User)(Comment)
 *
 * // ES5
 * var JSData = require('js-data')
 * var User = JSData.Model.extend({}, { name: 'User' })
 * var Comment = JSDataModel.extend({}, { name: 'Comment' })
 * JSData.belongsTo(User)(Comment)
 *
 * @param {Model} Relation - The Relation the target belongs to.
 * @param {Object} [opts] - Configuration options.
 * @param {string} [opts.localField] - The field on the target where the relation
 * will be attached.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function belongsTo (Relation, opts) {
  return function (Model) {
    Model.dbg(op, Relation, opts)
    return applyBelongsTo(Model, Relation, opts)
  }
}
