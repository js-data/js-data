var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function changes(resourceName, id) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  }

  var item = _this.get(resourceName, id);
  if (item) {
    _this.store[resourceName].observers[id].deliver();
    var diff = DSUtils.diffObjectFromOldObject(item, _this.store[resourceName].previousAttributes[id]);
    DSUtils.forOwn(diff, function (changeset, name) {
      var toKeep = [];
      DSUtils.forOwn(changeset, function (value, field) {
        if (!DSUtils.isFunction(value)) {
          toKeep.push(field);
        }
      });
      diff[name] = DSUtils.pick(diff[name], toKeep);
    });
    DSUtils.forEach(definition.relationFields, function (field) {
      delete diff.added[field];
      delete diff.removed[field];
      delete diff.changed[field];
    });
    return diff;
  }
}

module.exports = changes;
