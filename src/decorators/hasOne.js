import {camelCase, get, set} from '../utils'

const op = 'hasOne'

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
 *
 * @ignore
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
      if (!this._get('$')) {
        return this._get(`links.${localField}`)
      }
      const items = Relation.getAll(get(this, Model.idAttribute), { index: foreignKey })
      const item = items && items.length ? items[0] : undefined
      this._set(`links.${localField}`, item)
      return item
    },
    // Set default method for setting the linked relation
    set (child) {
      this._set(`links.${localField}`, child)
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
  Model.getCollection().createIndex(foreignKey)

  // Return target Model for chaining
  return Model
}

/**
 * @memberof! module:js-data
 * @example
 * // ES6
 * import {hasOne, Model} from 'js-data'
 * class User extends Model {}
 *
 * // @hasOne(User) (ES7)
 * class Comment extends Model {}
 * hasOne(User, {...})(Comment)
 *
 * // ES5
 * var JSData = require('js-data')
 * var User = JSData.Model.extend({}, { name: 'User' })
 * var Comment = JSDataModel.extend({}, { name: 'Comment' })
 * JSData.hasOne(User, {...})(Comment)
 *
 * @param {Model} Model - The Model of which the target has one.
 * @param {Object} [opts] - Configuration options.
 * @param {string} [opts.localField] - The field on the target where the relation
 * will be attached.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function hasOne (Model, opts) {
  return function (target) {
    target.dbg(op, 'Model:', Model, 'opts:', opts)
    return applyHasOne(target, Model, opts)
  }
}
