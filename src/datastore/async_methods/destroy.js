var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function destroy(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else {
      item = _this.get(resourceName, id) || { id: id };
      options = DSUtils._(definition, options);
      resolve(item);
    }
  })
    .then(function (attrs) {
      return options.beforeDestroy.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        _this.emit(options, 'beforeDestroy', DSUtils.copy(attrs));
      }
      if (options.eagerEject) {
        _this.eject(resourceName, id);
      }
      return _this.getAdapter(options).destroy(definition, id, options);
    })
    .then(function () {
      return options.afterDestroy.call(item, options, item);
    })
    .then(function (item) {
      if (options.notify) {
        _this.emit(options, 'afterDestroy', DSUtils.copy(item));
      }
      _this.eject(resourceName, id);
      return id;
    })['catch'](function (err) {
    if (options && options.eagerEject && item) {
      _this.inject(resourceName, item, { notify: false });
    }
    throw err;
  });
}

module.exports = destroy;
