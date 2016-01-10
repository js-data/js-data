import {
  camelCase,
  get,
  isFunction,
  isString,
  set
} from '../utils'

const op = 'hasMany'

/**
 * Steps to apply a "hasMany" relationship
 * 1. Choose the localField and foreignKey or localKeys
 * 2. Configure property descriptor, possibly including custom getter/setter
 * 3. Add property to prototype of target Model
 *
 * The added property is where instances of the related Model will be
 * attached to an instance of the target Model, e.g. if User hasMany Comment
 * and "localField" is set to "comments", "user.comments" will be a reference to
 * the array of comments.
 *
 * @ignore
 */
function applyHasMany (Model, Relation, opts) {
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
    return opts.localField || `${camelCase(getRelation().name)}Collection`
  }

  // Choose field on related instances that holds the primary key of instances
  // of the target Model
  let foreignKey = opts.foreignKey
  const localKeys = opts.localKeys
  const foreignKeys = opts.foreignKeys

  if (!foreignKey && !localKeys && !foreignKeys) {
    foreignKey = opts.foreignKey = `${camelCase(Model.name)}Id`
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
    set (children) {
      if (!children) {
        return
      }
      this._set(`links.${getLocalField()}`, children)
      if (children && children.length) {
        const id = get(this, Model.idAttribute)
        if (foreignKey) {
          children.forEach(function (child) {
            set(child, foreignKey, id)
          })
        } else if (localKeys) {
          const keys = []
          children.forEach(function (child) {
            keys.push(get(child, getRelation().idAttribute))
          })
          set(this, localKeys, keys)
        } else if (foreignKeys) {
          children.forEach(function (child) {
            const keys = get(child, foreignKeys)
            if (keys) {
              if (keys.indexOf(id) === -1) {
                keys.push(id)
              }
            } else {
              set(child, foreignKeys, [id])
            }
          })
        }
      }
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
  }

  // Check for user-defined setter
  if (opts.set) {
    // Set user-defined setter
    descriptor.set = function (children) {
      // Call user-defined getter, passing in:
      //  - target Model
      //  - related Model
      //  - instance of target Model
      //  - instances of related Model
      //  - the original setter function, in case the user wants to use it
      return opts.set(Model, getRelation(), this, children, value => originalSet.call(this, value === undefined ? children : value))
    }
  }

  // Finally, added property to prototype of target Model
  Object.defineProperty(Model.prototype, getLocalField(), descriptor)

  if (!Model.relationList) {
    Model.relationList = []
  }
  if (!Model.relationFields) {
    Model.relationFields = []
  }
  opts.type = 'hasMany'
  opts.name = Model.name
  opts.relation = getRelation().name
  opts.Relation = getRelation()
  opts.getRelation = getRelation
  opts.getLocalField = getLocalField
  Model.relationList.push(opts)
  Model.relationFields.push(getLocalField())

  // Return target Model for chaining
  return Model
}

/**
 * @memberof! module:js-data
 * @example
 * // ES6
 * import {hasMany, Model} from 'js-data'
 * class Comment extends Model {}
 *
 * // @hasMany(Comment)
 * class User extends Model {}
 * hasMany(Comment)(User)
 *
 * // ES5
 * var JSData = require('js-data')
 * var User = JSData.Model.extend({}, { name: 'User' })
 * var Comment = JSDataModel.extend({}, { name: 'Comment' })
 * JSData.hasMany(User)(Comment)
 *
 * @param {Model} Model - The Model of which the target has many.
 * @param {Object} [opts] - Configuration options.
 * @param {string} [opts.localField] - The field on the target where the relation
 * will be attached.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function hasMany (Relation, opts) {
  return function (target) {
    target.dbg(op, Relation, opts)
    return applyHasMany(target, Relation, opts)
  }
}
