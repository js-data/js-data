import {camelCase, get, set} from '../utils'

/**
 * Steps to apply a "hasOne" relationship
 * 1. Choose the foreignKey and localKey
 * 2. Configure property descriptor, possibly including custom getter/setter
 * 3. Add property to prototype of target Model
 *
 * The added property is where an instance of the related Model will be
 * attached to an instance of the target Model, e.g. if User hasOne
 * Profile and "localField" is set to "profile", "user.profile" will be a
 * reference to the profile.
 */
function applyHasOne (Model, Relation, opts) {
  opts || (opts = {})
  // Choose field where the relation will be attached
  const localField = opts.localField = opts.localField || camelCase(Relation.name)
  // Choose field that holds the primary key of the relation
  const foreignKey = opts.foreignKey = opts.foreignKey || `${camelCase(Model.name)}Id`

  // Setup configuration of the property
  const descriptor = {
    // Whether the field specified by "localField" will show up in "for...in"
    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    // Set default method for retrieving the linked relation
    get () {
      const items = Relation.getAll(get(this, Model.idAttribute), { index: foreignKey })
      return items && items.length ? items[0] : undefined
    },
    // Set default method for setting the linked relation
    set (child) {
      set(child, foreignKey, get(this, Model.idAttribute))
      return get(this, localField)
    }
  }

  // Check whether the relation shouldn't actually be linked via a getter
  if (opts.link === false || (opts.link === undefined && !Model.linkRelations)) {
    delete descriptor.get
    delete descriptor.set
  }

  // Check for user-defined getter
  if (opts.get) {
    const originalGet = descriptor.get
    // Set user-defined getter
    descriptor.get = function () {
      // Call user-defined getter, passing in:
      //  - target Model
      //  - related Model
      //  - instance of target Model
      //  - the original getter function, in case the user wants to use it
      return opts.get(Model, Relation, this, originalGet ? (...args) => originalGet.apply(this, args) : undefined)
    }
  }

  // Check for user-defined setter
  if (opts.set) {
    const originalSet = descriptor.set
    // Set user-defined setter
    descriptor.set = function (child) {
      // Call user-defined getter, passing in:
      //  - target Model
      //  - related Model
      //  - instance of target Model
      //  - instance of related Model
      //  - the original setter function, in case the user wants to use it
      return opts.set(Model, Relation, this, child, originalSet ? (...args) => originalSet.apply(this, args) : undefined)
    }
  }

  // Finally, added property to prototype of target Model
  Object.defineProperty(Model.prototype, localField, descriptor)

  if (!Model.relationList) {
    Model.relationList = []
  }
  if (!Model.relationFields) {
    Model.relationFields = []
  }
  opts.type = 'hasOne'
  opts.name = Model.name
  opts.relation = Relation.name
  opts.Relation = Relation
  Model.relationList.push(opts)
  Model.relationFields.push(localField)
  Model.data().createIndex(foreignKey)

  // Return target Model for chaining
  return Model
}

/**
 * Usage:
 *
 * ES7 Usage:
 * import {hasOne, Model} from 'js-data'
 * class User extends Model {}
 * @hasOne(User, {...})
 * class Post extends Model {}
 *
 * ES6 Usage:
 * import {hasOne, Model} from 'js-data'
 * class User extends Model {}
 * class Comment extends Model {}
 * hasOne(User, {...})(Comment)
 *
 * ES5 Usage:
 * var JSData = require('js-data')
 * var User = JSData.Model.extend()
 * var Comment = JSDataModel.extend()
 * JSData.hasOne(User, {...})(Comment)
 */
export function hasOne (Model, opts) {
  return function (target) {
    return applyHasOne(target, Model, opts)
  }
}
