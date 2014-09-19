function errorPrefix(resourceName) {
  return 'DS.linkInverse(' + resourceName + ', id[, relations]): ';
}

function _linkInverse(definition, relations) {
  var DS = this;
  DS.utils.forOwn(DS.definitions, function (d) {
    DS.utils.forOwn(d.relations, function (relatedModels) {
      DS.utils.forOwn(relatedModels, function (defs, relationName) {
        if (relations.length && !DS.utils.contains(relations, d.name)) {
          return;
        }
        if (definition.name === relationName) {
          DS.linkAll(d.name, {}, [definition.name]);
        }
      });
    });
  });
}

/**
 * @doc method
 * @id DS.sync methods:linkInverse
 * @name linkInverse
 * @description
 * Find relations of the item with the given primary key that are already in the data store and link this item to those
 * relations. This creates links in the opposite direction of `DS.link`.
 *
 * ## Signature:
 * ```js
 * DS.linkInverse(resourceName, id[, relations])
 * ```
 *
 * ## Examples:
 *
 * Assume `organization` has `hasMany` relationship to `user` and `post` has a `belongsTo` relationship to `user`.
 * ```js
 * DS.get('user', 1); // { organizationId: 5, id: 1 }
 * DS.get('organization', 5); // { id: 5 }
 * DS.filter('post', { userId: 1 }); // [ { id: 23, userId: 1 }, { id: 44, userId: 1 }]
 *
 * // link user to its relations
 * DS.linkInverse('user', 1, ['organization']);
 *
 * DS.get('organization', 5); // { id: 5, users: [{ organizationId: 5, id: 1 }] }
 *
 * // link user to all of its all relations
 * DS.linkInverse('user', 1);
 *
 * DS.get('user', 1); // { organizationId: 5, id: 1 }
 * DS.get('organization', 5); // { id: 5, users: [{ organizationId: 5, id: 1 }] }
 * DS.filter('post', { userId: 1 }); // [ { id: 23, userId: 1, user: {...} }, { id: 44, userId: 1, user: {...} }]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item for to link relations.
 * @param {array=} relations The relations to be linked. If not provided then all relations will be linked. Default: `[]`.
 * @returns {object|array} A reference to the item with its linked relations.
 */
function linkInverse(resourceName, id, relations) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];

  relations = relations || [];

  id = DSUtils.resolveId(definition, id);
  if (!definition) {
    throw new DSErrors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isArray(relations)) {
    throw new DSErrors.IA(errorPrefix(resourceName) + 'relations: Must be an array!');
  }
  var linked = DS.get(resourceName, id);

  if (linked) {
    _linkInverse.call(DS, definition, relations);
  }

  return linked;
}

module.exports = linkInverse;
