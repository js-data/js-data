export default function linkInverse(resourceName, id, relations) {
  let _this = this;
  let DSUtils = _this.utils;
  let definition = _this.defs[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new _this.errors.NER(resourceName);
  } else if (!DSUtils._sn(id)) {
    throw DSUtils._snErr('id');
  } else if (!DSUtils._a(relations)) {
    throw DSUtils._aErr('relations');
  }

  definition.logFn('linkInverse', id, relations);

  let linked = _this.get(resourceName, id);

  if (linked) {
    DSUtils.forOwn(_this.defs, d => {
      DSUtils.forOwn(d.relations, relatedModels => {
        DSUtils.forOwn(relatedModels, (defs, relationName) => {
          if (relations.length && !DSUtils.contains(relations, d.n)) {
            return;
          }
          if (definition.n === relationName) {
            _this.linkAll(d.n, {}, [definition.n]);
          }
        });
      });
    });
  }

  return linked;
}
