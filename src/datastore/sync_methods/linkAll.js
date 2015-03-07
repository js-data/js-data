export default function linkAll(resourceName, params, relations) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];

  relations = relations || [];

  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (!DSUtils._a(relations)) {
    throw DSUtils._aErr('relations');
  }

  definition.logFn('linkAll', params, relations);

  let linked = _this.filter(resourceName, params);

  if (linked) {
    DSUtils.forEach(definition.relationList, def => {
      let relationName = def.relation;
      if (relations.length && !DSUtils.contains(relations, relationName)) {
        return;
      }
      if (def.type === 'belongsTo') {
        DSUtils.forEach(linked, injectedItem => {
          let parent = injectedItem[def.localKey] ? _this.get(relationName, injectedItem[def.localKey]) : null;
          if (parent) {
            injectedItem[def.localField] = parent;
          }
        });
      } else if (def.type === 'hasMany') {
        DSUtils.forEach(linked, injectedItem => {
          let params = {};
          params[def.foreignKey] = injectedItem[definition.idAttribute];
          injectedItem[def.localField] = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.s[relationName].collection, relationName, params, { allowSimpleWhere: true });
        });
      } else if (def.type === 'hasOne') {
        DSUtils.forEach(linked, injectedItem => {
          let params = {};
          params[def.foreignKey] = injectedItem[definition.idAttribute];
          let children = _this.defaults.constructor.prototype.defaultFilter.call(_this, _this.s[relationName].collection, relationName, params, { allowSimpleWhere: true });
          if (children.length) {
            injectedItem[def.localField] = children[0];
          }
        });
      }
    });
  }

  return linked;
}
