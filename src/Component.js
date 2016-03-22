import utils from './utils'

export default function Component () {
  /**
   * Event listeners attached to this Component.
   *
   * @name Component#_listeners
   * @instance
   * @type {Object}
   * @private
   */
  this._listeners = {}
}

/**
 * Create a subclass of this component.
 *
 * @name Component.extend
 * @method
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @return {Function} Subclass of this component.
 */
Component.extend = utils.extend

/**
 * @name Component#dbg
 * @method
 */
/**
 * @name Component#log
 * @method
 */
utils.logify(Component.prototype)

/**
 * Register a new event listener on this Mapper.
 *
 * @name Mapper#on
 * @method
 */
/**
 * Remove an event listener from this Mapper.
 *
 * @name Mapper#off
 * @method
 */
/**
 * Trigger an event on this Mapper.
 *
 * @name Mapper#emit
 * @method
 * @param {string} event Name of event to emit.
 */
utils.eventify(
  Component.prototype,
  function () {
    return this._listeners
  },
  function (value) {
    this._listeners = value
  }
)
