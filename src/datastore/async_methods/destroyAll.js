export default function destroyAll(resourceName, params, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];
  let ejected, toEject;

  params = params || {};

  return new DSUtils.Promise((resolve, reject) => {
    if (!definition) {
      reject(new _this.errors.NER(resourceName));
    } else if (!DSUtils._o(params)) {
      reject(DSUtils._oErr('attrs'));
    } else {
      options = DSUtils._(definition, options);
      options.logFn('destroyAll', params, options);
      resolve();
    }
  }).then(() => {
      toEject = _this.defaults.defaultFilter.call(_this, resourceName, params);
      return options.beforeDestroy(options, toEject);
    }).then(() => {
      if (options.notify) {
        definition.emit('DS.beforeDestroy', definition, toEject);
      }
      if (options.eagerEject) {
        ejected = _this.ejectAll(resourceName, params);
      }
      return _this.getAdapter(options).destroyAll(definition, params, options);
    }).then(() => {
      return options.afterDestroy(options, toEject);
    }).then(() => {
      if (options.notify) {
        definition.emit('DS.afterDestroy', definition, toEject);
      }
      return ejected || _this.ejectAll(resourceName, params);
    })['catch'](err => {
    if (options && options.eagerEject && ejected) {
      _this.inject(resourceName, ejected, { notify: false });
    }
    return DSUtils.Promise.reject(err);
  });
}
