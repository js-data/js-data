var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function create(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.defs[resourceName];

  options = options || {};
  attrs = attrs || {};

  var rejectionError;
  if (!definition) {
    rejectionError = new DSErrors.NER(resourceName);
  } else if (!DSUtils._o(attrs)) {
    rejectionError = DSUtils._oErr('attrs');
  } else {
    options = DSUtils._(definition, options);
    if (options.upsert && DSUtils._sn(attrs[definition.idAttribute])) {
      return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
    }
    options.logFn('create', attrs, options);
  }

  return new DSUtils.Promise(function (resolve, reject) {
    if (rejectionError) {
      reject(rejectionError);
    } else {
      resolve(attrs);
    }
  })
    .then(function (attrs) {
      return options.beforeValidate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.validate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.afterValidate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.beforeCreate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.beforeCreate', definition, attrs);
      }
      return _this.getAdapter(options).create(definition, attrs, options);
    })
    .then(function (attrs) {
      return options.afterCreate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        definition.emit('DS.afterCreate', definition, attrs);
      }
      if (options.cacheResponse) {
        var created = _this.inject(definition.n, attrs, options);
        var id = created[definition.idAttribute];
        var resource = _this.s[resourceName];
        resource.completedQueries[id] = new Date().getTime();
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        return created;
      } else {
        return _this.createInstance(resourceName, attrs, options);
      }
    });
}

module.exports = create;
