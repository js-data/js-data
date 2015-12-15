/**
 * js-data module.
 * @module js-data
 */

if (!Promise.prototype.spread) {
  Promise.prototype.spread = function (cb) {
    return this.then(function (arr) {
      return cb.apply(this, arr)
    })
  }
}

export * from './collection'
export * from './datastore'
export * from './decorators'
export * from './model'
export * from './validate'
import * as _utils from './utils'
/**
 * The utils module.
 */
export const utils = _utils

/**
 * The current version of js-data.
 * @object
 */
export const version = {
  /**
   * The full semver value.
   * @string
   */
  full: '<%= pkg.version %>',
  major: parseInt('<%= major %>', 10),
  minor: parseInt('<%= minor %>', 10),
  patch: parseInt('<%= patch %>', 10),
  alpha: '<%= alpha %>' !== 'false' ? '<%= alpha %>' : false,
  beta: '<%= beta %>' !== 'false' ? '<%= beta %>' : false
}
