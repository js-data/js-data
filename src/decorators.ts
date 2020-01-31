import { Relation } from './relations'

export { belongsToType, hasManyType, hasOneType } from './relations'

/**
 * BelongsTo relation decorator. You probably won't use this directly.
 *
 * @method
 * @param {Mapper} related The relation the target belongs to.
 * @param {object} opts Configuration options.
 * @param {string} opts.foreignKey The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @returns {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function belongsTo (related, opts) {
  return mapper => {
    Relation.belongsTo(related, opts).assignTo(mapper)
  }
}

/**
 * HasMany relation decorator. You probably won't use this directly.
 *
 * @method
 * @param {Mapper} related The relation of which the target has many.
 * @param {object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @returns {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function hasMany (related, opts) {
  return mapper => {
    Relation.hasMany(related, opts).assignTo(mapper)
  }
}

/**
 * HasOne relation decorator. You probably won't use this directly.
 *
 * @method
 * @param {Mapper} related The relation of which the target has one.
 * @param {object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @returns {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function hasOne (related, opts) {
  return mapper => {
    Relation.hasOne(related, opts).assignTo(mapper)
  }
}
