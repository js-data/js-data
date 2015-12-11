import {fillIn} from '../utils'

export function registerAdapter (name, adapter, opts) {
  opts || (opts = {})
  return function (target) {
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
