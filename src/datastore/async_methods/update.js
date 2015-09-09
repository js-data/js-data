/**
 * Update a single item using the supplied properties hash.
 *
 * @param resourceName The name of the type of resource of the item to update.
 * @param id The primary key of the item to update.
 * @param attrs The attributes with which to update the item.
 * @param options Optional configuration.
 * @returns The item, now updated.
 */
module.exports = function update (resourceName, id, attrs, options) {
  let _this = this
  let {utils: DSUtils, errors: DSErrors} = _this
  let definition = _this.definitions[resourceName]
  let adapter

  return new DSUtils.Promise(function (resolve, reject) {
    id = DSUtils.resolveId(definition, id)
    if (!definition) {
      reject(new DSErrors.NER(resourceName))
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'))
    } else {
      options = DSUtils._(definition, options)
      options.logFn('update', id, attrs, options)
      resolve(attrs)
    }
  })
    // start lifecycle
    .then(function (attrs) { return options.beforeValidate.call(attrs, options, attrs) })
    .then(function (attrs) { return options.validate.call(attrs, options, attrs) })
    .then(function (attrs) { return options.afterValidate.call(attrs, options, attrs) })
    .then(function (attrs) { return options.beforeUpdate.call(attrs, options, attrs) })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.beforeUpdate', definition, attrs)
      }
      adapter = definition.getAdapterName(options)
      return _this.adapters[adapter].update(definition, id, DSUtils.omit(attrs, options.omit), options)
    })
    .then(function (data) { return options.afterUpdate.call(data, options, data) })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs)
      }
      if (options.cacheResponse) {
        // inject the updated item into the store
        let injected = definition.inject(attrs, options.orig())
        let resource = _this.store[resourceName]
        let id = injected[definition.idAttribute]
        // mark the item as "saved"
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id])
        if (!definition.resetHistoryOnInject) {
          resource.previousAttributes[id] = DSUtils.copy(injected, null, null, null, definition.relationFields)
        }
        return injected
      } else {
        // just return an instance
        return definition.createInstance(attrs, options.orig())
      }
    })
    .then(function (item) {
      return DSUtils.respond(item, {adapter}, options)
    })
}
