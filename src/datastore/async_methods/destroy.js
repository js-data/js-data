function errorPrefix(resourceName, id) {
  return 'DS.destroy(' + resourceName + ', ' + id + '[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:destroy
 * @name destroy
 * @description
 * The "D" in "CRUD". Delegate to the `destroy` method of whichever adapter is being used (http by default) and eject the
 * appropriate item from the data store.
 *
 * ## Signature:
 * ```js
 * DS.destroy(resourceName, id[, options]);
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 5); { id: 5, ... }
 *
 * DS.destroy('document', 5).then(function (id) {
 *   id; // 5
 *
 *   // The document is gone
 *   DS.get('document', 5); // undefined
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 * @param {object=} options Configuration options. Also passed along to the adapter's `destroy` method. Properties:
 *
 * - `{function=}` - `beforeDestroy` - Override the resource or global lifecycle hook.
 * - `{function=}` - `afterDestroy` - Override the resource or global lifecycle hook.
 *
 * @returns {Promise} Promise.
 *
 * ## Resolves with:
 *
 * - `{string|number}` - `id` - The primary key of the destroyed item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 */
function destroy(resourceName, id, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var DSErrors = DS.errors;
  var definition = DS.definitions[resourceName];
  var item;

  return new DSUtils.Promise(function (resolve, reject) {
    options = options || {};

    if (!definition) {
      reject(new DSErrors.NER(errorPrefix(resourceName, id) + resourceName));
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      reject(new DSErrors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!'));
    } else if (!DS.get(resourceName, id)) {
      reject(new DSErrors.R(errorPrefix(resourceName, id) + 'id: "' + id + '" not found!'));
    } else {
      item = DS.get(resourceName, id);
      resolve(item);
    }
  })
    .then(function (attrs) {
      var func = options.beforeDestroy ? DSUtils.promisify(options.beforeDestroy) : definition.beforeDestroy;
      return func.call(attrs, resourceName, attrs);
    })
    .then(function (attrs) {
      DS.notify(definition, 'beforeDestroy', DSUtils.merge({}, attrs));
      return DS.adapters[options.adapter || definition.defaultAdapter].destroy(definition, id, options);
    })
    .then(function () {
      var func = options.afterDestroy ? DSUtils.promisify(options.afterDestroy) : definition.afterDestroy;
      return func.call(item, resourceName, item);
    })
    .then(function (item) {
      DS.notify(definition, 'afterDestroy', DSUtils.merge({}, item));
      DS.eject(resourceName, id);
      return id;
    });
}

module.exports = destroy;
