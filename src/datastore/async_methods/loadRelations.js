/**
 * Load the specified relations for the given instance.
 *
 * @param resourceName The name of the type of resource of the instance for which to load relations.
 * @param instance The instance or the primary key of the instance.
 * @param relations An array of the relations to load.
 * @param options Optional configuration.
 * @returns The instance, now with its relations loaded.
 */
module.exports = function loadRelations (resourceName, instance, relations, options) {
  let _this = this
  let {utils: DSUtils, errors: DSErrors} = _this
  let definition = _this.definitions[resourceName]
  let _options

  return new DSUtils.Promise(function (resolve, reject) {
    if (DSUtils._sn(instance)) {
      instance = definition.get(instance)
    }

    if (DSUtils._s(relations)) {
      relations = [relations]
    }

    relations = relations || []

    if (!definition) {
      reject(new DSErrors.NER(resourceName))
    } else if (!DSUtils._o(instance)) {
      reject(new DSErrors.IA('"instance(id)" must be a string, number or object!'))
    } else if (!DSUtils._a(relations)) {
      reject(new DSErrors.IA('"relations" must be a string or an array!'))
    } else {
      _options = DSUtils._(definition, options)
      _options.logFn('loadRelations', instance, relations, _options)

      let tasks = []

      DSUtils.forEach(definition.relationList, function (def) {
        let relationName = def.relation
        let relationDef = definition.getResource(relationName)
        let __options = DSUtils._(relationDef, options)

        // relations can be loaded based on resource name or field name
        if (!relations.length || DSUtils.contains(relations, relationName) || DSUtils.contains(relations, def.localField)) {
          let task
          let params = {}
          if (__options.allowSimpleWhere) {
            params[def.foreignKey] = instance[definition.idAttribute]
          } else {
            params.where = {}
            params.where[def.foreignKey] = {
              '==': instance[definition.idAttribute]
            }
          }

          let orig = __options.orig()
          let defKey = def.localKey ? DSUtils.get(instance, def.localKey) : null
          let hasDefKey = !!(defKey || defKey === 0)

          if (typeof def.load === 'function') {
            task = def.load(definition, def, instance, orig)
          } else {
            if (def.type === 'hasMany') {
              if (def.localKeys) {
                delete params[def.foreignKey]
                let keys = DSUtils.get(instance, def.localKeys) || []
                keys = DSUtils._a(keys) ? keys : DSUtils.keys(keys)
                params.where = {
                  [relationDef.idAttribute]: {
                    'in': keys
                  }
                }
                orig.localKeys = keys
              } else if (def.foreignKeys) {
                delete params[def.foreignKey]
                params.where = {
                  [def.foreignKeys]: {
                    contains: instance[definition.idAttribute]
                  }
                }
              }
              task = relationDef.findAll(params, orig)
            } else if (def.type === 'hasOne') {
              if (def.localKey && hasDefKey) {
                task = relationDef.find(defKey, orig)
              } else if (def.foreignKey) {
                task = relationDef.findAll(params, orig).then(function (hasOnes) { return hasOnes.length ? hasOnes[0] : null })
              }
            } else if (hasDefKey) {
              task = relationDef.find(defKey, orig)
            }
          }

          if (task) {
            if (!_options.linkRelations) {
              task = task.then(function (data) {
                instance[def.localField] = data
              })
            }
            tasks.push(task)
          }
        }
      })

      resolve(tasks)
    }
  }).then(function (tasks) { return DSUtils.Promise.all(tasks) })
    .then(function () { return _options.afterLoadRelations.call(instance, _options, instance) })
    .catch(_this.errorFn('loadRelations', resourceName, instance, relations, options))
}
