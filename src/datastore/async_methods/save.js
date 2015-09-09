/**
 * Save a single item in its present state.
 *
 * @param resourceName The name of the type of resource of the item.
 * @param id The primary key of the item.
 * @param options Optional congifuration.
 * @returns The item, now saved.
 */
module.exports = function save (resourceName, id, options) {
  let _this = this
  let {utils: DSUtils, errors: DSErrors} = _this
  let definition = _this.definitions[resourceName]
  let resource = _this.store[resourceName]
  let item, noChanges, adapter

  return new DSUtils.Promise(function (resolve, reject) {
    id = DSUtils.resolveId(definition, id)
    if (!definition) {
      reject(new DSErrors.NER(resourceName))
    } else if (!DSUtils._sn(id)) {
      reject(DSUtils._snErr('id'))
    } else if (!definition.get(id)) {
      reject(new DSErrors.R(`id "${id}" not found in cache!`))
    } else {
      item = definition.get(id)
      options = DSUtils._(definition, options)
      options.logFn('save', id, options)
      resolve(item)
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
      // only send changed properties to the adapter
      if (options.changesOnly) {
        if (resource.observers[id] && typeof resource.observers[id] === 'function') {
          resource.observers[id].deliver()
        }
        let toKeep = []
        let changes = definition.changes(id)

        for (var key in changes.added) {
          toKeep.push(key)
        }
        for (key in changes.changed) {
          toKeep.push(key)
        }
        changes = DSUtils.pick(attrs, toKeep)
        // no changes? no save
        if (DSUtils.isEmpty(changes)) {
          // no changes, return
          options.logFn('save - no changes', id, options)
          noChanges = true
          return attrs
        } else {
          attrs = changes
        }
      }
      adapter = definition.getAdapterName(options)
      return _this.adapters[adapter].update(definition, id, DSUtils.omit(attrs, options.omit), options)
    })
    .then(function (data) { return options.afterUpdate.call(data, options, data) })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs)
      }
      if (noChanges) {
        // no changes, just return
        return attrs
      } else if (options.cacheResponse) {
        // inject the reponse into the store, updating the item
        let injected = definition.inject(attrs, options.orig())
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
