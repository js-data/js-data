export default {
  create: require('./create'),
  destroy: require('./destroy'),
  destroyAll: require('./destroyAll'),
  find: require('./find'),
  findAll: require('./findAll'),
  loadRelations: require('./loadRelations'),
  reap: require('./reap'),
  refresh (resourceName, id, options) {
    let _this = this
    let DSUtils = _this.utils

    return new DSUtils.Promise(function (resolve, reject) {
      let definition = _this.definitions[resourceName]
      id = DSUtils.resolveId(_this.definitions[resourceName], id)
      if (!definition) {
        reject(new _this.errors.NER(resourceName))
      } else if (!DSUtils._sn(id)) {
        reject(DSUtils._snErr('id'))
      } else {
        options = DSUtils._(definition, options)
        options.bypassCache = true
        options.logFn('refresh', id, options)
        resolve(_this.get(resourceName, id))
      }
    }).then(function (item) { return item ? _this.find(resourceName, id, options) : item })
      .catch(_this.errorFn('refresh', resourceName, id, options))
  },
  refreshAll (resourceName, params, options) {
    let _this = this
    let DSUtils = _this.utils
    let definition = _this.definitions[resourceName]
    params = params || {}

    return new DSUtils.Promise(function (resolve, reject) {
      if (!definition) {
        reject(new _this.errors.NER(resourceName))
      } else if (!DSUtils._o(params)) {
        reject(DSUtils._oErr('params'))
      } else {
        options = DSUtils._(definition, options)
        options.bypassCache = true
        options.logFn('refreshAll', params, options)
        resolve(_this.filter(resourceName, params, options))
      }
    }).then(function (existing) {
      options.bypassCache = true
      return _this.findAll(resourceName, params, options).then(function (found) {
        DSUtils.forEach(existing, function (item) {
          if (found.indexOf(item) === -1) {
            definition.eject(item)
          }
        })
        return found
      })
    }).catch(_this.errorFn('refreshAll', resourceName, params, options))
  },
  save: require('./save'),
  update: require('./update'),
  updateAll: require('./updateAll')
}
