const op = 'registerAdapter'

/**
 * Add the provided adapter to the target's "adapters" property, registering it
 * with the specified.
 * @memberof! module:js-data
 * @param {string} name - The name under which to register the adapter.
 * @param {Adapter} adapter - The adapter to register.
 * @param {Object} opts - Configuration options.
 * @param {boolean} [opts.default=false] - Whether to make the adapter the
 * default adapter for the target.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export function registerAdapter (name, adapter, opts) {
  opts || (opts = {})
  opts.op = op
  return function (target) {
    target.dbg(op, 'name:', name, 'adapter:', adapter, 'opts:', opts)
    // Register the adapter
    target.getAdapters()[name] = adapter
    // Optionally make it the default adapter for the target.
    if (opts === true || opts.default) {
      target.defaultAdapter = name
    }
  }
}
