var DSUtils = require('../../utils');
var DSErrors = require('../../errors');

function link(resourceName, id, relations) {
  var _this = this;
  var definition = _this.definitions[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA('"id" must be a string or a number!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA('"relations" must be an array!');
  }
  var linked = _this.get(resourceName, id);

  if (linked) {
    DSUtils.forEach(definition.relationList, function (def) {
      var relationName = def.relation;
      if (relations.length && !DSUtils.contains(relations, relationName)) {
        return;
      }
      var params = {};
      if (def.type === 'belongsTo') {
        var parent = linked[def.localKey] ? _this.get(relationName, linked[def.localKey]) : null;
        if (parent) {
          linked[def.localField] = parent;
        }
      } else if (def.type === 'hasMany') {
        params[def.foreignKey] = linked[definition.idAttribute];
        linked[def.localField] = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
      } else if (def.type === 'hasOne') {
        params[def.foreignKey] = linked[definition.idAttribute];
        var children = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.store[relationName].collection, relationName, params, { allowSimpleWhere: true });
        if (children.length) {
          linked[def.localField] = children[0];
        }
      }
    });
  }

  return linked;
}

module.exports = link;
