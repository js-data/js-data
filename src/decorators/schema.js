import {forOwn} from '../utils'
import {Collection} from '../collection'

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
    // TODO: Test whether there already exists a schema
    const collection = new Collection([], target.idAttribute)
    target.data = function () {
      // TODO: Do I need this?
      if (this.data === Object.getPrototypeOf(this).data) { // eslint-disable-line
        throw new Error(`${this.name}: Schemas are not inheritable, did you forget to define a schema?`)
      }
      return collection
    }
    forOwn(opts, function (prop, key) {
      let descriptor = {
        enumerable: prop.enumerable !== undefined ? prop.enumerable : true,
        writable: prop.writable ? prop.writable : true,
        configurable: prop.configurable ? prop.configurable : true
      }
      if (prop.indexed) {
        delete descriptor.writable
        // Update index
        // TODO: Make this configurable, ie. immediate or lazy update
        target.createIndex(key)
        descriptor.get = function () {
          return this.$$props[key]
        }
        descriptor.set = function (value) {
          this.$$props[key] = value
          if (this.$$s) {
            target.data().updateRecord(this, { index: key })
          }
          return value
        }
      }
      if (prop.get) {
        delete descriptor.writable
        descriptor.get = prop.get
      }
      if (prop.set) {
        delete descriptor.writable
        if (descriptor.set) {
          const originalSet = descriptor.set
          descriptor.set = function (value) {
            return prop.set.call(this, originalSet.call(this, value))
          }
        } else {
          descriptor.set = prop.set
        }
      }
      // TODO: This won't work for properties of Object type, because all
      // instances will share the prototype value
      if (!descriptor.writable) {
        Object.defineProperty(target.prototype, key, descriptor)
      }
    })
    return target
  }
}
