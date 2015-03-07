export default function loadRelations(resourceName, instance, relations, options) {
  let _this = this;
  let {utils: DSUtils, errors: DSErrors} = _this;
  let definition = _this.defs[resourceName];
  let fields = [];

  return new DSUtils.Promise((resolve, reject) => {
    if (DSUtils._sn(instance)) {
      instance = _this.get(resourceName, instance);
    }

    if (DSUtils._s(relations)) {
      relations = [relations];
    }

    if (!definition) {
      reject(new DSErrors.NER(resourceName));
    } else if (!DSUtils._o(instance)) {
      reject(new DSErrors.IA('"instance(id)" must be a string, number or object!'));
    } else if (!DSUtils._a(relations)) {
      reject(new DSErrors.IA('"relations" must be a string or an array!'));
    } else {
      let _options = DSUtils._(definition, options);
      if (!_options.hasOwnProperty('findBelongsTo')) {
        _options.findBelongsTo = true;
      }
      if (!_options.hasOwnProperty('findHasMany')) {
        _options.findHasMany = true;
      }
      _options.logFn('loadRelations', instance, relations, _options);

      let tasks = [];

      DSUtils.forEach(definition.relationList, def => {
        let relationName = def.relation;
        let relationDef = definition.getResource(relationName);
        let __options = DSUtils._(relationDef, options);
        if (DSUtils.contains(relations, relationName) || DSUtils.contains(relations, def.localField)) {
          let task;
          let params = {};
          if (__options.allowSimpleWhere) {
            params[def.foreignKey] = instance[definition.idAttribute];
          } else {
            params.where = {};
            params.where[def.foreignKey] = {
              '==': instance[definition.idAttribute]
            };
          }

          if (def.type === 'hasMany' && params[def.foreignKey]) {
            task = _this.findAll(relationName, params, __options.orig());
          } else if (def.type === 'hasOne') {
            if (def.localKey && instance[def.localKey]) {
              task = _this.find(relationName, instance[def.localKey], __options.orig());
            } else if (def.foreignKey && params[def.foreignKey]) {
              task = _this.findAll(relationName, params, __options.orig()).then(hasOnes => hasOnes.length ? hasOnes[0] : null);
            }
          } else if (instance[def.localKey]) {
            task = _this.find(relationName, instance[def.localKey], options);
          }

          if (task) {
            tasks.push(task);
            fields.push(def.localField);
          }
        }
      });

      resolve(tasks);
    }
  }).then(tasks => DSUtils.Promise.all(tasks))
    .then(loadedRelations => {
      DSUtils.forEach(fields, (field, index) => instance[field] = loadedRelations[index]);
      return instance;
    });
}
