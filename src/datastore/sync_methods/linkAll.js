var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function linkAll(resourceName, params, relations) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  relations = relations || [];

  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA('"relations" must be an array!');
  }
  var linked = _this.filter(resourceName, params);

  if (linked) {
    DSUtils.forEach(definition.relationList, function (def) {
      var relationName = def.relation;
      if (relations.length && !DSUtils.contains(relations, relationName)) {
        return;
      }
      if (def.type === 'belongsTo') {
        DSUtils.forEach(linked, function (injectedItem) {
          var parent = injectedItem[def.localKey] ? _this.get(relationName, injectedItem[def.localKey]) : null;
          if (parent) {
            injectedItem[def.localField] = parent;
          }
        });
      } else if (def.type === 'hasMany') {
        DSUtils.forEach(linked, function (injectedItem) {
          var params = {};
          params[def.foreignKey] = injectedItem[definition.idAttribute];
          injectedItem[def.localField] = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
        });
      } else if (def.type === 'hasOne') {
        DSUtils.forEach(linked, function (injectedItem) {
          var params = {};
          params[def.foreignKey] = injectedItem[definition.idAttribute];
          var children = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
          if (children.length) {
            injectedItem[def.localField] = children[0];
          }
        });
      }
    });
  }

  return linked;
}

module.exports = linkAll;
