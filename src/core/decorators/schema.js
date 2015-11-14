import {forOwn} from '../utils'

/**
 * Usage:
 *
 * @schema({
 *   first: {},
 *   last: {},
 *   role: {
 *     value: 'dev'
 *   },
 *   // computed property
 *   name: {
 *     get() { return `${this.first} ${this.last}` },
 *     set(value) {
 *       let parts = value.split(' ')
 *       this.first = parts[0]
 *       this.last = parts[1]
 *       return this
 *     }
 *   }
 * })
 * class User extends JSData.Resource {...}
 *
 * let user = new User()
 * user.role // "dev"
 * user.name = 'John Anderson'
 * user.first // "John"
 * user.last // "Anderson"
 * user.first = "Bill"
 * user.name // "Bill Anderson"
 */
export function schema (opts = {}) {
  return function (target) {
    forOwn(opts, function (prop, key) {
      let descriptor = {
        enumerable: prop.enumerable !== undefined ? prop.enumerable : true,
        writable: prop.writable ? prop.writable : true,
        configurable: prop.configurable ? prop.configurable : false
      }
      if (prop.get) {
        descriptor.writable = false
        descriptor.get = prop.get
      }
      if (prop.set) {
        descriptor.writable = false
        descriptor.set = prop.set
      }
      Object.defineProperty(target.prototype, key, descriptor)
    })
    return target
  }
}
