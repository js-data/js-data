import {
  fillIn,
  isFunction,
  isString
} from './utils'

export const belongsToType = 'belongsTo'
export const hasManyType = 'hasMany'
export const hasOneType = 'hasOne'

function Relation (related, opts) {
  const self = this

  opts || (opts = {})

  const localField = opts.localField
  if (!localField) {
    throw new Error('localField is required')
  }

  const foreignKey = opts.foreignKey || opts.localKey
  if (!foreignKey && (opts.type === belongsToType || opts.type === hasOneType)) {
    throw new Error('foreignKey is required')
  }
  const localKeys = opts.localKeys
  const foreignKeys = opts.foreignKeys
  if (!foreignKey && !localKeys && !foreignKeys && opts.type === hasManyType) {
    throw new Error('one of (foreignKey, localKeys, foreignKeys) is required')
  }

  if (isString(related)) {
    opts.relation = related
  } else if (related) {
    opts.relation = related.name
  }

  if (!related || (isString(related) && !isFunction(opts.getRelation))) {
    throw new Error('you must provide a reference to the related mapper!')
  }

  fillIn(self, opts)
}

const relatedTo = function (mapper, related, opts) {
  opts || (opts = {})
  if (!opts.type) {
    throw new Error('must specify relation type!')
  }
  opts.mapper = mapper
  opts.name = mapper.name
  const relation = new Relation(related, opts)

  mapper.relationList || (mapper.relationList = [])
  mapper.relationFields || (mapper.relationFields = [])
  mapper.relationList.push(relation)
  mapper.relationFields.push(relation.localField)
}

/**
 * TODO
 *
 * @name module:js-data.belongsTo
 * @method
 * @param {Mapper} related The relation the target belongs to.
 * @param {Object} opts Configuration options.
 * @param {string} opts.foreignKey The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export const belongsTo = function (related, opts) {
  opts || (opts = {})
  opts.type = belongsToType
  return function (target) {
    relatedTo(target, related, opts)
  }
}

/**
 * TODO
 *
 * @name module:js-data.hasMany
 * @method
 * @param {Mapper} related The relation of which the target has many.
 * @param {Object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export const hasMany = function (related, opts) {
  opts || (opts = {})
  opts.type = hasManyType
  return function (target) {
    relatedTo(target, related, opts)
  }
}

/**
 * TODO
 *
 * @name module:js-data.hasOne
 * @method
 * @param {Mapper} related The relation of which the target has one.
 * @param {Object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export const hasOne = function (related, opts) {
  opts || (opts = {})
  opts.type = hasOneType
  return function (target) {
    relatedTo(target, related, opts)
  }
}
