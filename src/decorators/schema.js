import {
  forOwn,
  get
} from '../utils'
import {validate} from '../validate'
import {configure} from './configure'
import {initialize} from './initialize'

const op = 'setSchema'

function makeDescriptor (target, key, prop) {
  const descriptor = {
    enumerable: prop.enumerable !== undefined ? prop.enumerable : true,
    configurable: prop.configurable !== undefined ? prop.configurable : true
  }
  descriptor.get = function () {
    return this._get(`props.${key}`)
  }
  descriptor.set = function (value) {
    // TODO: rework this
    // if (isFunction(prop.validate) && !prop.validate(value)) {
    //   return false
    // }
    const _get = this._get
    const _set = this._set
    const _unset = this._unset
    if (!_get('noValidate')) {
      const errors = validate(prop, value)
      if (errors) {
        throw new Error(errors.join(', '))
      }
    }
    if (prop.track && !_get('creating')) {
      const changing = _get('changing')
      const previous = _get(`previous.${key}`)
      const current = _get(`props.${key}`)
      let changed = _get('changed')
      if (!changing) {
        changed = []
      }
      if (current !== value) {
        changed.push(key)
      }
      if (previous !== value) {
        _set(`changes.${key}`, value)
      } else {
        // TODO: this._unset
        _unset(`changes.${key}`)
      }
      if (!changing && changed.length) {
        _set('changed', changed)
        _set('changing', true)
        _set('eventId', setTimeout(() => {
          _unset('changed')
          _unset('eventId')
          _unset('changing')
          let i
          for (i = 0; i < changed.length; i++) {
            this.emit('change:' + changed[i], this, get(this, changed[i]))
          }
          this.emit('change', this, _get('changes'))
        }, 0))
      }
    }
    _set(`props.${key}`, value)
    if (_get('$') && prop.indexed) {
      target.data().updateRecord(this, { index: key })
    }
    return value
  }
  if (prop.indexed) {
    // Update index
    // TODO: Make this configurable, ie. immediate or lazy update
    target.createIndex(key)
  }
  if (prop.get) {
    if (descriptor.get) {
      const originalGet = descriptor.get
      descriptor.get = function () {
        return prop.get.call(this, originalGet)
      }
    } else {
      descriptor.get = prop.get
    }
  }
  if (prop.set) {
    if (descriptor.set) {
      const originalSet = descriptor.set
      descriptor.set = function (value) {
        return prop.set.call(this, value, originalSet)
      }
    } else {
      descriptor.set = prop.set
    }
  }
  return descriptor
}

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
 * class User extends JSData.Model {...}
 *
 * let user = new User()
 * user.role // "dev"
 * user.name = 'John Anderson'
 * user.first // "John"
 * user.last // "Anderson"
 * user.first = "Bill"
 * user.name // "Bill Anderson"
 */
export function setSchema (opts) {
  opts || (opts = {})

  return function (target) {
    target.dbg(op, 'opts:', opts)
    try {
      target.data()
    } catch (err) {
      initialize(opts)(target)
    }

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
