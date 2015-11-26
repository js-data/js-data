import {isArray, get, set} from '../utils'

/**
 * Steps to apply a "hasMany" relationship
 * 1. Choose the localField and foreignKey or localKeys
 * 2. Configure property descriptor, possibly including custom getter/setter
 * 3. Add property to prototype of target Resource
 *
 * The added property is where instances of the related Resource will be
 * attached to an instance of the target Resource, e.g. if User hasMany Comment
 * and "localField" is set to "comments", "user.comments" will be a reference to
 * the array of comments.
 */
function applyHasMany (Resource, Relation, opts = {}) {
  // Choose field where the relation will be attached
  const localField = opts.localField || Relation.name.toLowerCase()
  // Choose field on related instances that holds the primary key of instances
  // of the target Resource
  const foreignKey = opts.foreignKey || Relation.name.toLowerCase() + '_id'
  const localKeys = opts.localKeys || Relation.name.toLowerCase() + '_ids'
  const foreignKeys = opts.foreignKeys || Relation.name.toLowerCase() + '_ids'

  // Setup configuration of the property
  const descriptor = {
    // Whether the field specified by "localField" will show up in "for...in"
    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    // Set default method for retrieving the linked relation
    get () {
      const query = {}
      if (foreignKey) {
        // Make a FAST retrieval of the relation using a secondary index
        return Relation.getAll(get(this, Resource.idAttribute), { index: foreignKey })
      } else if (localKeys) {
        const keys = get(this, localKeys) || []
        const args = isArray(keys) ? keys : Object.keys(keys)
        // Make a slower retrieval using the ids in the "localKeys" array
        return Relation.getAll.apply(Resource, args)
      } else if (foreignKeys) {
        set(query, `where.${foreignKeys}.contains`, get(this, Resource.idAttribute))
        // Make a much slower retrieval
        return Relation.filter(query)
      }
      return undefined
    },
    // Set default method for setting the linked relation
    set (children) {
      if (children && children.length) {
        const id = get(this, Resource.idAttribute)
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

  // Check whether the relation shouldn't actually be linked via a getter
  if (opts.link === false || (opts.link === undefined && !Resource.linkRelations)) {
    delete descriptor.get
    delete descriptor.set
  }

  // Check for user-defined getter
  if (opts.get) {
    const originalGet = descriptor.get
    // Set user-defined getter
    descriptor.get = function () {
      // Call user-defined getter, passing in:
      //  - target Resource
      //  - related Resource
      //  - instance of target Resource
      //  - the original getter function, in case the user wants to use it
      return opts.get(Resource, Relation, this, originalGet ? (...args) => originalGet.apply(this, args) : undefined)
    }
  }

  // Check for user-defined setter
  if (opts.set) {
    const originalSet = descriptor.set
    // Set user-defined setter
    descriptor.set = function (children) {
      // Call user-defined getter, passing in:
      //  - target Resource
      //  - related Resource
      //  - instance of target Resource
      //  - instances of related Resource
      //  - the original setter function, in case the user wants to use it
      return opts.set(Resource, Relation, this, children, originalSet ? (...args) => originalSet.apply(this, args) : undefined)
    }
  }

  // Finally, added property to prototype of target Resource
  Object.defineProperty(Resource.prototype, localField, descriptor)

  // Return target Resource for chaining
  return Resource
}

/**
 * Usage:
 *
 * ES7 Usage:
 * import {hasMany, Resource} from 'js-data'
 * class Post extends Resource {}
 * @hasMany(Post, {...})
 * class User extends Resource {}
 *
 * ES6 Usage:
 * import {hasMany, Resource} from 'js-data'
 * class User extends Resource {}
 * class Comment extends Resource {}
 * hasMany(Comment, {...})(User)
 *
 * ES5 Usage:
 * var JSData = require('js-data')
 * var User = JSData.Resource.extend()
 * var Comment = JSDataResource.extend()
 * JSData.hasMany(User, {...})(Comment)
 */
export function hasMany (Resource, opts) {
  return function (target) {
    return applyHasMany(target, Resource, opts)
  }
}
