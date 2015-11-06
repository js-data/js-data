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
function schema (schema) {
  return function (target) {
    for (var key in schema) {
      let descriptor = {
        enumerable: 'enumerable' in schema[key] ? schema[key] : true,
        writable: 'writable' in schema[key] ? schema[key] : false,
        configurable: 'configurable' in schema[key] ? schema[key] : false
      }
      if (schema[key].value) {
        descriptor.value = schema[key].value
      } else {
        if (schema[key].get) {
          descriptor.get = schema[key].get
        }
        if (schema[key].set) {
          descriptor.set = schema[key].set
        }
      }
      Object.defineProperty(target.prototype, key, descriptor)
    }
  }
}

module.exports = schema
