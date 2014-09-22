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
    } else {
      item = _this.get(resourceName, id);
      if (!('notify' in options)) {
        options.notify = true;
      }
      resolve(item);
    }
  })
    .then(function (attrs) {
      if (options.notify) {
        var func = options.beforeDestroy ? promisify(options.beforeDestroy) : definition.beforeDestroy;
        return func.call(attrs, resourceName, attrs);
      } else {
        return attrs;
      }
    })
    .then(function (attrs) {
      if (options.notify) {
        _this.notify(definition, 'beforeDestroy', DSUtils.merge({}, attrs));
      }
      if (options.eagerEject) {
        _this.eject(resourceName, id);
      }
      return _this.getAdapter(definition, options).destroy(definition, id, options);
    })
    .then(function () {
      if (options.notify) {
        var func = options.afterDestroy ? promisify(options.afterDestroy) : definition.afterDestroy;
        return func.call(item, resourceName, item);
      } else {
        return item;
      }
    })
    .then(function (item) {
      if (options.notify) {
        _this.notify(definition, 'afterDestroy', DSUtils.merge({}, item));
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
