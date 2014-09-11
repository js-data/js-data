function errorPrefix(resourceName) {
  return 'DS.unlinkInverse(' + resourceName + ', id[, relations]): ';
}

function _unlinkInverse(definition, linked) {
  var DS = this;
  DS.utils.forOwn(DS.definitions, function (d) {
    DS.utils.forOwn(d.relations, function (relatedModels) {
      DS.utils.forOwn(relatedModels, function (defs, relationName) {
        if (definition.name === relationName) {
          DS.utils.forEach(defs, function (def) {
            DS.utils.forEach(DS.store[def.name].collection, function (item) {
              if (def.type === 'hasMany' && item[def.localField]) {
                var index;
                DS.utils.forEach(item[def.localField], function (subItem, i) {
                  if (subItem === linked) {
                    index = i;
                  }
                });
                item[def.localField].splice(index, 1);
              } else if (item[def.localField] === linked) {
                delete item[def.localField];
              }
            });
          });
        }
      });
    });
  });
}

/**
 * @doc method
 * @id DS.sync methods:unlinkInverse
 * @name unlinkInverse
 * @description
 * Find relations of the item with the given primary key that are already in the data store and _unlink_ this item from those
 * relations. This unlinks links that would be created by `DS.linkInverse`.
 *
 * ## Signature:
 * ```js
 * DS.unlinkInverse(resourceName, id[, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `organization` has `hasMany` relationship to `user` and `post` has a `belongsTo` relationship to `user`.
 * ```js
 * DS.get('organization', 5); // { id: 5, users: [{ organizationId: 5, id: 1 }] }
 *
 * // unlink user 1 from its relations
 * DS.unlinkInverse('user', 1, ['organization']);
 *
 * DS.get('organization', 5); // { id: 5, users: [] }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for which to unlink relations.
 * @param {array=} relations The relations to be unlinked. If not provided then all relations will be unlinked. Default: `[]`.
 * @returns {object|array} A reference to the item that has been unlinked.
 */
function unlinkInverse(resourceName, id, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.get(resourceName, id);

  if (linked) {
    _unlinkInverse.call(DS, definition, linked, relations);
  }

  return linked;
}

module.exports = unlinkInverse;
