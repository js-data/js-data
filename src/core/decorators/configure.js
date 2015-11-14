import {copy,forOwn} from '../utils'

/**
 * Usage:
 *
 * @configure({
 *   idAttribute: '_id'
 * })
 * class User extends JSData.Resource {...}
 */
export function configure (props = {}) {
  return function (target) {
    forOwn(props, function (value, key) {
      target[key] = copy(value)
    })
    return target
  }
}
