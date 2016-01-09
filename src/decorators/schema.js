import {
  forOwn,
  get
} from '../utils'
import {validate} from '../validate/index'
import {configure} from './configure'

const op = 'setSchema'

/**
 * @param {Model} target - Target Model.
 * @param {string} key - Key for new property.
 * @param {Object} opts - Configuration options.
 * @ignore
 */
function makeDescriptor (target, key, opts) {
  const descriptor = {
    enumerable: opts.enumerable !== undefined ? opts.enumerable : true
  }
  descriptor.get = function () {
    return this._get(`props.${key}`)
  }
  descriptor.set = function (value) {
    // TODO: rework this
    // if (isFunction(opts.validate) && !opts.validate(value)) {
    //   return false
    // }
    const _get = this._get
    const _set = this._set
    const _unset = this._unset
    if (!_get('noValidate')) {
      const errors = validate(opts, value)
      if (errors) {
        throw new Error(errors.join(', '))
      }
    }
    if (opts.track && !_get('creating')) {
      let changing = _get('changing')
      const previous = _get(`previous.${key}`)
      const current = _get(`props.${key}`)
      let changed = _get('changed')
      if (!changing) {
        changed = []
      }
      const index = changed.indexOf(key)
      if (current !== value && index === -1) {
        changed.push(key)
      }
      if (previous !== value) {
        _set(`changes.${key}`, value)
      } else {
        _unset(`changes.${key}`)
        if (index >= 0) {
          changed.splice(index, 1)
        }
      }
      if (!changed.length) {
        changing = false
        _unset('changing')
        _unset('changed')
        if (_get('eventId')) {
          clearTimeout(_get('eventId'))
          _unset('eventId')
        }
      }
      if (!changing && changed.length) {
        _set('changed', changed)
        _set('changing', true)
        _set('eventId', setTimeout(() => {
          _unset('changed')
          _unset('eventId')
          _unset('changing')
          if (!_get('silent')) {
            let i
            for (i = 0; i < changed.length; i++) {
              this.emit('change:' + changed[i], this, get(this, changed[i]))
            }
            this.emit('change', this, _get('changes'))
          }
          _unset('silent')
        }, 0))
      }
    }
    _set(`props.${key}`, value)
    // if (_get('$') && opts.indexed) {
    //   target.getCollection().updateIndex(this, { index: key })
    // }
    return value
  }
  // if (opts.indexed) {
  //   // Update index
  //   // TODO: Make this configurable, ie. immediate or lazy update
  //   target.createIndex(key)
  // }
  if (opts.get) {
    if (descriptor.get) {
      const originalGet = descriptor.get
      descriptor.get = function () {
        return opts.get.call(this, originalGet)
      }
    } else {
      descriptor.get = opts.get
    }
  }
  if (opts.set) {
    if (descriptor.set) {
      const originalSet = descriptor.set
      descriptor.set = function (value) {
        return opts.set.call(this, value, originalSet)
      }
    } else {
      descriptor.set = opts.set
    }
  }
  return descriptor
}

/**
 * @memberof! module:js-data
 * @example
 * // ES6
 * import {setSchema, Model} from 'js-data'
 * const properties = {
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
 * }
 *
 * // @setSchema(properties) (ES7)
 * class User extends Model {}
 * User.setSchema(properties)
 *
 * // ES5
 * var JSData = require('js-data')
 * var User = JSData.Model.extend({}, { name: 'User' })
 * User.setSchema(properties)
 *
 * @param {Object.<string, Object>} opts - Property configurations.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function setSchema (opts) {
  opts || (opts = {})

  return function (target) {
    target.dbg(op, 'opts:', opts)

    target.schema || (target.schema = {})
    configure(target.schema, opts)

    forOwn(opts, function (prop, key) {
      const descriptor = makeDescriptor(target, key, prop)
      // TODO: This won't work for properties of Object type, because all
      // instances will share the prototype value
      if (!descriptor.writable) {
        Object.defineProperty(target.prototype, key, descriptor)
      }
    })
    return target
  }
}
