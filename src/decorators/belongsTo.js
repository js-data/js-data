import {get, set} from '../utils'

const op = 'belongsTo'

/**
 * Steps to apply a "belongsTo" relationship
 * 1. Choose the localField and localKey
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
  // Choose field where the relation will be attached
  const localField = opts.localField = opts.localField || Relation.name.toLowerCase()
  // Choose field that holds the primary key of the relation
  const localKey = opts.localKey = opts.localKey || `${Relation.name.toLowerCase()}_id`

  // Setup configuration of the property
  const descriptor = {
    // Whether the field specified by "localField" will show up in "for...in"
    enumerable: opts.enumerable !== undefined ? !!opts.enumerable : false,
    // Set default method for retrieving the linked relation
    get () {
      if (!this._get('$')) {
        return this._get(`links.${localField}`)
      }
      const key = get(this, localKey)
      const item = key !== undefined ? Relation.get(key) : undefined
      this._set(`links.${localField}`, item)
      return item
    },
    // Set default method for setting the linked relation
    set (parent) {
      this._set(`links.${localField}`, parent)
      set(this, localKey, parent[Relation.idAttribute])
      return get(this, localField)
    }
  }

  const originalGet = descriptor.get
  const originalSet = descriptor.set

  // Check whether the relation shouldn't actually be linked via a getter
  if (opts.link === false || (opts.link === undefined && !Model.linkRelations)) {
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
      return opts.get(Model, Relation, this, () => originalGet.call(this))
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
      return opts.set(Model, Relation, this, parent, value => originalSet.call(this, value === undefined ? parent : value))
    }
    delete descriptor.writable
  }

  if (descriptor.get) {
    descriptor.set || (descriptor.set = function () {})
  }

  // Finally, added property to prototype of target Model
  Object.defineProperty(Model.prototype, localField, descriptor)
  Object.defineProperty(Model.prototype, localKey, {
    configurable: true,
    enumerable: true,
    get () {
      return this._get(`props.${localKey}`)
    },
    set (value) {
      this._set(`props.${localKey}`, value)
      if (this._get('$')) {
        Model.collection.indexes[localKey].updateRecord(this, { index: localKey })
      }
    }
  })

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
  Model.relationList.push(opts)
  Model.relationFields.push(localField)
  Model.collection.createIndex(localKey)

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
 * @param {Model} Model - The Model the target belongs to.
 * @param {Object} [opts] - Configuration options.
 * @param {string} [opts.localField] - The field on the target where the relation
 * will be attached.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function belongsTo (Model, opts) {
  return function (target) {
    target.dbg(op, 'Model:', Model, 'opts:', opts)
    return applyBelongsTo(target, Model, opts)
  }
}
