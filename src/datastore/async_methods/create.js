var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function create(resourceName, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  var promise = new DSUtils.Promise(function (resolve, reject) {

    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      if (!('upsert' in options)) {
        options.upsert = true;
      }
      resolve(attrs);
    }
  });

  if (options.upsert && attrs[definition.idAttribute]) {
    return _this.update(resourceName, attrs[definition.idAttribute], attrs, options);
  } else {
    return promise
      .then(function (attrs) {
        var func = options.beforeValidate ? promisify(options.beforeValidate) : definition.beforeValidate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.validate ? promisify(options.validate) : definition.validate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.afterValidate ? promisify(options.afterValidate) : definition.afterValidate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.beforeCreate ? promisify(options.beforeCreate) : definition.beforeCreate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        _this.notify(definition, 'beforeCreate', DSUtils.merge({}, attrs));
        return _this.getAdapter(definition, options).create(definition, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), options);
      })
      .then(function (res) {
        var func = options.afterCreate ? promisify(options.afterCreate) : definition.afterCreate;
        var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        _this.notify(definition, 'afterCreate', DSUtils.merge({}, attrs));
        if (options.cacheResponse) {
          var resource = _this.store[resourceName];
          var created = _this.inject(definition.name, attrs, options);
          var id = created[definition.idAttribute];
          resource.completedQueries[id] = new Date().getTime();
          resource.previousAttributes[id] = DSUtils.deepMixIn({}, created);
          resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
          return _this.get(definition.name, id);
        } else {
          return _this.createInstance(resourceName, attrs, options);
        }
      });
  }
}

module.exports = create;
