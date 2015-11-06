/**
 * Using an adapter, create a new item.
 *
 * Generally a primary key will NOT be provided in the properties hash,
 * because the adapter's persistence layer should be generating one.
 *
 * @param resourceName The name of the type of resource of the new item.
 * @param attrs Hash of properties with which to create the new item.
 * @param options Optional configuration.
 * @param options.cacheResponse Whether the newly created item as returned by the adapter should be injected into the data store.
 * @param options.upsert If the properties hash contains a primary key, attempt to call DS#update instead.
 * @param options.notify Whether to emit the "DS.beforeCreate" and "DS.afterCreate" events.
 * @param options.beforeValidate Lifecycle hook.
 * @param options.validate Lifecycle hook.
 * @param options.afterValidate Lifecycle hook.
 * @param options.beforeCreate Lifecycle hook.
 * @param options.afterCreate Lifecycle hook.
 */
export function create (props = {}, opts = {}) {
  let _this = this
  let adapter
  let Opts = _this.extend(null, opts)

  if (Opts.upsert && props[_this.idAttribute]) {
    return _this.update(props[_this.idAttribute], props, opts)
  }
  _this.logFn('create', props, opts)

  return _this.try()
    .then(function () { return Opts.beforeValidate.call(_this, props, opts) })
    .then(function (props) { return Opts.validate.call(_this, props, opts) })
    .then(function (props) { return Opts.afterValidate.call(_this, props, opts) })
    .then(function (props) { return Opts.beforeCreate.call(_this, props, opts) })
    .then(function (props) {
      if (Opts.notify) {
        _this.emit('DS.beforeCreate', props, opts)
      }
      adapter = _this.getAdapterName(Opts)
      return _this.adapters[adapter].create(_this, Opts.omit(props), Opts)
    })
    .then(function (props) { return Opts.afterCreate.call(_this, props, opts) })
    .then(function (props) {
      if (Opts.notify) {
        _this.emit('DS.afterCreate', props, opts)
      }
      let created = _this.createInstance(props)
      created.touchSaved()
      if (Opts.autoInject) {
        // injected created item into the store
        created = _this.inject(created, opts)
        let id = created[_this.idAttribute]
        // mark item's `find` query as completed, so a subsequent `find` call for this item will resolve immediately
        _this.$$queries[id] = new Date().getTime()
      }
      return created
    })
    .then(function (instance) {
      return _this.respond(instance, {adapter}, Opts)
    })
    .catch(_this.errorFn('create', props, opts))
}
