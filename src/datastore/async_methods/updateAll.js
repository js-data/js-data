export default function updateAll(resourceName, attrs, params, options) {
  let _this = this;
  let {utils: DSUtils, errors: DSErrors} = _this;
  let definition = _this.defs[resourceName];

  return new DSUtils.Promise((resolve, reject) => {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else {
      options = DSUtils._(definition, options);
      options.logFn('updateAll', attrs, params, options);
      resolve(attrs);
    }
  }).then(attrs => options.beforeValidate.call(attrs, options, attrs))
    .then(attrs => options.validate.call(attrs, options, attrs))
    .then(attrs => options.afterValidate.call(attrs, options, attrs))
    .then(attrs => options.beforeUpdate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.beforeUpdate', definition, attrs);
      }
      return _this.getAdapter(options).updateAll(definition, attrs, params, options);
    })
    .then(data => options.afterUpdate.call(data, options, data))
    .then(data => {
      if (options.notify) {
        definition.emit('DS.afterUpdate', definition, attrs);
      }
      let origOptions = options.orig();
      if (options.cacheResponse) {
        let injected = _this.inject(definition.n, data, origOptions);
        let resource = _this.s[resourceName];
        DSUtils.forEach(injected, i => {
          let id = i[definition.idAttribute];
          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
          if (!definition.resetHistoryOnInject) {
            resource.previousAttributes[id] = DSUtils.copy(i, null, null, null, definition.relationFields);
          }
        });
        return injected;
      } else {
        let instances = [];
        DSUtils.forEach(data, item => {
          instances.push(_this.createInstance(resourceName, item, origOptions));
        });
        return instances;
      }
    });
}
