var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function update(resourceName, id, attrs, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      if (!('cacheResponse' in options)) {
        options.cacheResponse = true;
      }
      resolve(attrs);
    }
  }).then(function (attrs) {
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
      var func = options.beforeUpdate ? promisify(options.beforeUpdate) : definition.beforeUpdate;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'beforeUpdate', DSUtils.merge({}, attrs));
      return _this.getAdapter(definition, options).update(definition, id, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), options);
    })
    .then(function (res) {
      var func = options.afterUpdate ? promisify(options.afterUpdate) : definition.afterUpdate;
      var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      _this.notify(definition, 'afterUpdate', DSUtils.merge({}, attrs));
      if (options.cacheResponse) {
        var resource = _this.store[resourceName];
        var updated = _this.inject(definition.name, attrs, options);
        var id = updated[definition.idAttribute];
        resource.previousAttributes[id] = DSUtils.deepMixIn({}, updated);
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        resource.observers[id].discardChanges();
        return _this.get(definition.name, id);
      } else {
        return attrs;
      }
    });
}

module.exports = update;
