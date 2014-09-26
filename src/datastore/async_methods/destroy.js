var DSUtils = require('../../utils');
var DSErrors = require('../../errors');
var promisify = DSUtils.promisify;

function destroy(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!_this.get(resourceName, id)) {
      reject(new DSErrors.R('id "' + id + '" not found in cache!'));
    } else if (!DSUtils.isObject(options)) {
      reject(new DSErrors.IA('"options" must be an object!'));
    } else {
      item = _this.get(resourceName, id);
      if (!('notify' in options)) {
        options.notify = definition.notify;
      }
      if (!('eagerEject' in options)) {
        options.eagerEject = definition.eagerEject;
      }
      resolve(item);
    }
  })
    .then(function (attrs) {
      var func = options.beforeDestroy ? promisify(options.beforeDestroy) : definition.beforeDestroy;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        _this.emit(definition, 'beforeDestroy', DSUtils.merge({}, attrs));
      }
      if (options.eagerEject) {
        _this.eject(resourceName, id);
      }
      return _this.getAdapter(definition, options).destroy(definition, id, options);
    })
    .then(function () {
      var func = options.afterDestroy ? promisify(options.afterDestroy) : definition.afterDestroy;
      return func.call(item, resourceName, item);
    })
    .then(function (item) {
      if (options.notify) {
        _this.emit(definition, 'afterDestroy', DSUtils.merge({}, item));
      }
      _this.eject(resourceName, id);
      return id;
    }).catch(function (err) {
      if (options.eagerEject && item) {
        _this.inject(resourceName, item, { notify: false });
      }
      throw err;
    });
}

module.exports = destroy;
