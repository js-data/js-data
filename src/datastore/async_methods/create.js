var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function create(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  options = options || {};
  attrs = attrs || {};

  var promise = new DSUtils.Promise(function (resolve, reject) {
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isObject(attrs)) {
      reject(new DSErrors.IA('"attrs" must be an object!'));
    }  else {
      options = DSUtils._(definition, options);
      resolve(attrs);
    }
  });

  if (definition && (options.hasOwnProperty('upsert') ? options.upsert : definition.upsert) && attrs[definition.idAttribute]) {
    return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
  } else {
    return promise
      .then(function (attrs) {
        return options.beforeValidate.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        return options.validate.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        return options.afterValidate.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        return options.beforeCreate.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        if (options.notify) {
          _this.emit(definition, 'beforeCreate', DSUtils.merge({}, attrs));
        }
        return _this.getAdapter(definition, options).create(definition, attrs, options);
      })
      .then(function (data) {
        return options.afterCreate.call(data, resourceName, data);
      })
      .then(function (attrs) {
        if (options.notify) {
          _this.emit(definition, 'afterCreate', DSUtils.merge({}, attrs));
        }
        if (options.cacheResponse) {
          var created = _this.inject(definition.name, attrs, options);
          var id = created[definition.idAttribute];
          _this.store[resourceName].completedQueries[id] = new Date().getTime();
          return created;
        } else {
          return _this.createInstance(resourceName, attrs, options);
        }
      });
  }
}

module.exports = create;
