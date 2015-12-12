import {fillIn} from '../utils'

const op = 'registerAdapter'

export function registerAdapter (name, adapter, opts) {
  opts || (opts = {})
  opts.op = op
  return function (target) {
    target.dbg(op, 'name:', name, 'adapter:', adapter, 'opts:', opts)
    if (target.adapters && target.adapters === Object.getPrototypeOf(target).adapters) {
      target.adapters = {}
      fillIn(target.adapters, Object.getPrototypeOf(target).adapters)
    }
    target.adapters[name] = adapter
    if (opts === true || opts.default) {
      target.defaultAdapter = name
    }
  }
}
