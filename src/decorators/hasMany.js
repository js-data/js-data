import {camelCase, isArray, get, set} from '../utils'

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
function applyHasMany (target, Relation, opts) {
  opts || (opts = {})
  // Choose field where the relation will be attached
  const localField = opts.localField = opts.localField || `${camelCase(Relation.name)}Collection`
  // Choose field on related instances that holds the primary key of instances
  // of the target Model
  let foreignKey = opts.foreignKey
  const localKeys = opts.localKeys
  const foreignKeys = opts.foreignKeys

  if (!foreignKey && !localKeys && !foreignKeys) {
    foreignKey = opts.foreignKey = `${camelCase(target.name)}_id`
  }
  if (foreignKey) {
    Relation.getCollection().createIndex(foreignKey)
  }

  // Setup configuration of the property
  const descriptor = {
    // Whether the field specified by "localField" will show up in "for...in"
    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    // Set default method for retrieving the linked relation
    get () {
      if (!this._get('$')) {
        return this._get(`links.${localField}`)
      }
      const query = {}
      let items
      if (foreignKey) {
        // Make a FAST retrieval of the relation using a secondary index
        items = Relation.getAll(get(this, target.idAttribute), { index: foreignKey })
      } else if (localKeys) {
        const keys = get(this, localKeys) || []
        const args = isArray(keys) ? keys : Object.keys(keys)
        // Make a slower retrieval using the ids in the "localKeys" array
        items = Relation.getAll.apply(Relation, args)
      } else if (foreignKeys) {
        set(query, `where.${foreignKeys}.contains`, get(this, target.idAttribute))
        // Make a much slower retrieval
        items = Relation.filter(query)
      }
      this._set(`links.${localField}`, items)
      return items
    },
    // Set default method for setting the linked relation
    set (children) {
      this._set(`links.${localField}`, children)
      if (children && children.length) {
        const id = get(this, target.idAttribute)
        if (foreignKey) {
          children.forEach(function (child) {
            set(child, foreignKey, id)
          })
        } else if (localKeys) {
          const keys = []
          children.forEach(function (child) {
            keys.push(get(child, Relation.idAttribute))
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
      return get(this, localField)
    }
  }

  const originalGet = descriptor.get
  const originalSet = descriptor.set

  // Check whether the relation shouldn't actually be linked via a getter
  if (opts.link === false || (opts.link === undefined && !target.linkRelations)) {
    delete descriptor.get
    delete descriptor.set
    descriptor.writable = true
  }

  // Check for user-defined getter
  if (opts.get) {
    // Set user-defined getter
    descriptor.get = function () {
      // Call user-defined getter, passing in:
      //  - target Model
      //  - related Model
      //  - instance of target Model
      //  - the original getter function, in case the user wants to use it
      return opts.get(target, Relation, this, () => originalGet.call(this))
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
      return opts.set(target, Relation, this, children, value => originalSet.call(this, value === undefined ? children : value))
    }
  }

  // Finally, added property to prototype of target Model
  Object.defineProperty(target.prototype, localField, descriptor)

  if (!target.relationList) {
    target.relationList = []
  }
  if (!target.relationFields) {
    target.relationFields = []
  }
  opts.type = 'hasMany'
  opts.name = target.name
  opts.relation = Relation.name
  opts.Relation = Relation
  target.relationList.push(opts)
  target.relationFields.push(localField)

  // Return target Model for chaining
  return target
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
export function hasMany (Model, opts) {
  return function (target) {
    target.dbg(op, 'Model:', Model, 'opts:', opts)
    return applyHasMany(target, Model, opts)
  }
}
