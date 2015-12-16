import {copy, forOwn} from '../utils'

/**
 * @memberof! module:js-data
 * @example
 * // ES6
 * import {configure, Model} from 'js-data'
 *
 * // @configure(opts) (ES7)
 * class User extends JSData.Model {}
 * configure(opts)(User)
 *
 * // ES5
 * var JSData = require('js-data')
 * var User = JSData.Model.extend()
 * User.configure(opts)
 *
 * @param {Object} opts - Properties to apply to the target.
 * @param {boolean} [overwrite=true] - Whether to overwrite properties that
 * already exist on the target.
 */
export function configure (opts, overwrite = true) {
  opts = opts || {}
  return function (target) {
    forOwn(opts, function (value, key) {
      if (target[key] === undefined || overwrite) {
        target[key] = copy(value)
      }
    })
    return target
  }
}
