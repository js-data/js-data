import {copy, forOwn} from '../utils'

/**
 * Usage:
 *
 * @configure({
 *   idAttribute: '_id'
 * })
 * class User extends JSData.Model {...}
 */
export function configure (props, overwrite = true) {
  props = props || {}
  return function (target) {
    forOwn(props, function (value, key) {
      if (target[key] === undefined || overwrite) {
        target[key] = copy(value)
      }
    })
    return target
  }
}
