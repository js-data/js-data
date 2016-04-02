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
 * Register a new event listener on this Component.
 *
 * @name Component#on
 * @method
 * @param {string} event Name of event to subsribe to.
 * @param {Function} listener Listener function to handle the event.
 * @param {*} [ctx] Optional content in which to invoke the listener.
 */
/**
 * Remove an event listener from this Component. If no listener is provided,
 * then all listeners for the specified event will be removed. If no event is
 * specified then all listeners for all events will be removed.
 *
 * @name Component#off
 * @method
 * @param {string} [event] Name of event to unsubsribe to.
 * @param {Function} [listener] Listener to remove.
 */
/**
 * Trigger an event on this Component.
 *
 * @name Component#emit
 * @method
 * @param {string} event Name of event to emit.
 * @param {...*} [args] Arguments to pass to any listeners.
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
