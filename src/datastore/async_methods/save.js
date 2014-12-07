var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function save(resourceName, id, options) {
  var _this = this;
  var definition = _this.definitions[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
    id = DSUtils.resolveId(definition, id);
    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA('"id" must be a string or a number!'));
    } else if (!_this.get(resourceName, id)) {
      reject(new DSErrors.R('id "' + id + '" not found in cache!'));
    } else {
      item = _this.get(resourceName, id);
      options = DSUtils._(definition, options);
      resolve(item);
    }
  }).then(function (attrs) {
      return options.beforeValidate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.validate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.afterValidate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      return options.beforeUpdate.call(attrs, options, attrs);
    })
    .then(function (attrs) {
      if (options.notify) {
        _this.emit(options, 'beforeUpdate', DSUtils.copy(attrs));
      }
      if (options.changesOnly) {
        var resource = _this.store[resourceName];
        if (DSUtils.w) {
          resource.observers[id].deliver();
        }
        var toKeep = [];
        var changes = _this.changes(resourceName, id);

        for (var key in changes.added) {
          toKeep.push(key);
        }
        for (key in changes.changed) {
          toKeep.push(key);
        }
        changes = DSUtils.pick(attrs, toKeep);
        if (DSUtils.isEmpty(changes)) {
          // no changes, return
          return attrs;
        } else {
          attrs = changes;
        }
      }
      return _this.getAdapter(options).update(definition, id, attrs, options);
    })
    .then(function (data) {
      return options.afterUpdate.call(data, options, data);
    })
    .then(function (attrs) {
      if (options.notify) {
        _this.emit(options, 'afterUpdate', DSUtils.copy(attrs));
      }
      if (options.cacheResponse) {
        return _this.inject(definition.name, attrs, options);
      } else {
        return attrs;
      }
    });
}

module.exports = save;
