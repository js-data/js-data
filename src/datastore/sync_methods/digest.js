var observe = require('../../../lib/observe-js/observe-js');

/**
 * @doc method
 * @id DS.sync methods:digest
 * @name digest
 * @description
 * Trigger a digest loop that checks for changes and updates the `lastModified` timestamp if an object has changed.
 * If your browser supports `Object.observe` then this function has no effect.
 *
 * ## Signature:
 * ```js
 * DS.digest()
 * ```
 *
 */
function digest() {
  observe.Platform.performMicrotaskCheckpoint();
}

module.exports = digest;
