function link(resourceName, id, relations) {
  var _this = this;
  var DSUtils = _this.utils;
  var definition = _this.defs[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  } else if (!DSUtils._a(relations)) {
    throw DSUtils._aErr('relations');
  }

  definition.logFn('link', id, relations);

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
        linked[def.localField] = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.s[relationName].collection, relationName, params, { allowSimpleWhere: true });
      } else if (def.type === 'hasOne') {
        params[def.foreignKey] = linked[definition.idAttribute];
        var children = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.s[relationName].collection, relationName, params, { allowSimpleWhere: true });
        if (children.length) {
          linked[def.localField] = children[0];
        }
      }
    });
  }

  return linked;
}

export default link;
