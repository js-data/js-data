export default function create(resourceName, attrs, options) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];

  options = options || {};
  attrs = attrs || {};

  let rejectionError;
  if (!definition) {
    rejectionError = new _this.errors.NER(resourceName);
  } else if (!DSUtils._o(attrs)) {
    rejectionError = DSUtils._oErr('attrs');
  } else {
    options = DSUtils._(definition, options);
    if (options.upsert && DSUtils._sn(attrs[definition.idAttribute])) {
      return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
    }
    options.logFn('create', attrs, options);
  }

  return new DSUtils.Promise((resolve, reject) => {
    if (rejectionError) {
      reject(rejectionError);
    } else {
      resolve(attrs);
    }
  }).then(attrs => options.beforeValidate.call(attrs, options, attrs))
    .then(attrs => options.validate.call(attrs, options, attrs))
    .then(attrs => options.afterValidate.call(attrs, options, attrs))
    .then(attrs => options.beforeCreate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.beforeCreate', definition, attrs);
      }
      return _this.getAdapter(options).create(definition, attrs, options);
    })
    .then(attrs => options.afterCreate.call(attrs, options, attrs))
    .then(attrs => {
      if (options.notify) {
        definition.emit('DS.afterCreate', definition, attrs);
      }
      if (options.cacheResponse) {
        let created = _this.inject(definition.n, attrs, options.orig());
        let id = created[definition.idAttribute];
        let resource = _this.s[resourceName];
        resource.completedQueries[id] = new Date().getTime();
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        return created;
      } else {
        return _this.createInstance(resourceName, attrs, options);
      }
    });
}
