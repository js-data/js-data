import {get, set} from '../utils'

/**
 * Steps to apply a "belongsTo" relationship
 * 1. Choose the localField and localKey
 * 2. Configure property descriptor, possibly including custom getter/setter
 * 3. Add property to prototype of target Resource
 *
 * The added property is where an instance of the related Resource will be
 * attached to an instance of the target Resource, e.g. if Comment belongsTo
 * User and "localField" is set to "user", "comment.user" will be a reference to
 * the user.
 */
function applyBelongsTo (Resource, Relation, opts = {}) {
  // Choose field where the relation will be attached
  const localField = opts.localField = opts.localField || Relation.name.toLowerCase()
  // Choose field that holds the primary key of the relation
  const localKey = opts.localKey = opts.localKey || Relation.name.toLowerCase() + '_id'

  // Setup configuration of the property
  const descriptor = {
    // Whether the field specified by "localField" will show up in "for...in"
    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    // Set default method for retrieving the linked relation
    get () {
      const key = get(this, localKey)
      return key !== undefined ? Relation.get(key) : undefined
    },
    // Set default method for setting the linked relation
    set (parent) {
      set(this, localKey, parent[Relation.idAttribute])
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
    descriptor.set = function (parent) {
      // Call user-defined getter, passing in:
      //  - target Resource
      //  - related Resource
      //  - instance of target Resource
      //  - instance of related Resource
      //  - the original setter function, in case the user wants to use it
      return opts.set(Resource, Relation, this, parent, originalSet ? (...args) => originalSet.apply(this, args) : undefined)
    }
  }

  // Finally, added property to prototype of target Resource
  Object.defineProperty(Resource.prototype, localField, descriptor)

  if (!Resource.relationList) {
    Resource.relationList = []
  }
  if (!Resource.relationFields) {
    Resource.relationFields = []
  }
  opts.type = 'belongsTo'
  opts.name = Resource.name
  opts.relation = Relation.name
  opts.Relation = Relation
  Resource.relationList.push(opts)
  Resource.relationFields.push(localField)

  // Return target Resource for chaining
  return Resource
}

/**
 * Usage:
 *
 * ES7 Usage:
 * import {belongsTo, Resource} from 'js-data'
 * class User extends Resource {}
 * @belongsTo(User, {...})
 * class Post extends Resource {}
 *
 * ES6 Usage:
 * import {belongsTo, Resource} from 'js-data'
 * class User extends Resource {}
 * class Comment extends Resource {}
 * belongsTo(User, {...})(Comment)
 *
 * ES5 Usage:
 * var JSData = require('js-data')
 * var User = JSData.Resource.extend()
 * var Comment = JSDataResource.extend()
 * JSData.belongsTo(User, {...})(Comment)
 */
export function belongsTo (Resource, opts) {
  return function (target) {
    return applyBelongsTo(target, Resource, opts)
  }
}
