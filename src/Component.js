import utils from './utils'

/**
 * @class Component
 */
export default function Component () {
  /**
   * Event listeners attached to this Component. Do not modify. Use
   * {@link Component#on} and {@link Component#off} instead.
   *
   * @name Component#_listeners
   * @instance
   * @type {Object}
   */
  Object.defineProperty(this, '_listeners', { value: {} })
}

/**
 * Create a subclass of this component.
 *
 * @method Component.extend
 * @static
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this component.
 */
Component.extend = utils.extend

/**
 * Log the provided values at the "debug" level.
 *
 * @method Component#dbg
 * @param {...*} [args] Values to log.
 */
/**
 * Log the provided values. By default sends values to `console[level]`.
 *
 * @method Component#log
 * @param {string} level Log level
 * @param {...*} [args] Values to log.
 */
utils.logify(Component.prototype)

/**
 * Register a new event listener on this Component.
 *
 * @example <caption>Listen for the "add" event on a collection</caption>
 * collection.on('add', (records) => {
 *   console.log(records) // [...]
 * })
 *
 * @example <caption>Listen for "change" events on a record</caption>
 * post.on('change', (record, changes) => {
 *   console.log(changes) // { changed: { title: 'Modeling your data' } }
 * })
 * post.title = 'Modeling your data'
 *
 * @example <caption>Listen for all "afterCreate" events in a DataStore</caption>
 * store.on('afterCreate', (mapperName, props, opts, result) => {
 *   console.log(mapperName) // "post"
 *   console.log(props.id) // undefined
 *   console.log(result.id) // 1234
 * })
 * store.create('post', { title: 'Modeling your data' }).then((post) => {
 *   console.log(post.id) // 1234
 * })
 *
 * @method Component#on
 * @param {string} event Name of event to subsribe to.
 * @param {Function} listener Listener function to handle the event.
 * @param {*} [ctx] Optional content in which to invoke the listener.
 */
/**
 * Remove an event listener from this Component. If no listener is provided,
 * then all listeners for the specified event will be removed. If no event is
 * specified then all listeners for all events will be removed.
 *
 * @example <caption>Remove a listener to a single event</caption>
 * collection.off('add', handler)
 *
 * @example <caption>Remove all listeners to a single event</caption>
 * record.off('change')
 *
 * @example <caption>Remove all listeners to all events</caption>
 * store.off()
 *
 * @method Component#off
 * @param {string} [event] Name of event to unsubsribe to.
 * @param {Function} [listener] Listener to remove.
 */
/**
 * Trigger an event on this Component.
 *
 * @example
 * collection.on('foo', (msg) => {
 *   console.log(msg) // "bar"
 * })
 * collection.emit('foo', 'bar')
 *
 * @method Component#emit
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
