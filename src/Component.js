import utils from './utils'
import Settable from './Settable'

/**
 * The base class from which all JSData components inherit some basic
 * functionality.
 *
 * Typically you won't instantiate this class directly, but you may find it
 * useful as an abstract class for your own components.
 *
 * See {@link Component.extend} for an example of using {@link Component} as a
 * base class.
 *
 *```javascript
 * import {Component} from 'js-data'
 * ```
 *
 * @class Component
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @returns {Component} A new {@link Component} instance.
 * @since 3.0.0
 */
function Component (opts) {
  Settable.call(this)
  opts || (opts = {})

  /**
   * Whether to enable debug-level logs for this component. Anything that
   * extends `Component` inherits this option and the corresponding logging
   * functionality.
   *
   * @example <caption>Component#debug</caption>
   * // Normally you would do: import {Component} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Component} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const component = new Component()
   * component.log('debug', 'some message') // nothing gets logged
   * // Display debug logs:
   * component.debug = true
   * component.log('debug', 'other message') // this DOES get logged
   *
   * @default false
   * @name Component#debug
   * @since 3.0.0
   * @type {boolean}
   */
  this.debug = opts.hasOwnProperty('debug') ? !!opts.debug : false

  /**
   * Event listeners attached to this Component. __Do not modify.__ Use
   * {@link Component#on} and {@link Component#off} instead.
   *
   * @name Component#_listeners
   * @private
   * @instance
   * @since 3.0.0
   * @type {Object}
   */
  Object.defineProperty(this, '_listeners', { value: {}, writable: true })
}

export default Settable.extend({
  constructor: Component
})

/**
 * Create a subclass of this Component:
 *
 * @example <caption>Component.extend</caption>
 * // Normally you would do: import {Component} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Component} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomComponentClass extends Component {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customComponent = new CustomComponentClass()
 * console.log(customComponent.foo())
 * console.log(CustomComponentClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherComponentClass = Component.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherComponent = new OtherComponentClass()
 * console.log(otherComponent.foo())
 * console.log(OtherComponentClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherComponentClass () {
 *   Component.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * Component.extend({
 *   constructor: AnotherComponentClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherComponent = new AnotherComponentClass()
 * console.log(anotherComponent.created_at)
 * console.log(anotherComponent.foo())
 * console.log(AnotherComponentClass.beep())
 *
 * @method Component.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Component class.
 * @since 3.0.0
 */
Component.extend = utils.extend

/**
 * Log the provided values at the "debug" level. Debug-level logs are only
 * logged if {@link Component#debug} is `true`.
 *
 * `.dbg(...)` is shorthand for `.log('debug', ...)`.
 *
 * @method Component#dbg
 * @param {...*} [args] Values to log.
 * @since 3.0.0
 */
/**
 * Log the provided values. By default sends values to `console[level]`.
 * Debug-level logs are only logged if {@link Component#debug} is `true`.
 *
 * Will attempt to use appropriate `console` methods if they are available.
 *
 * @method Component#log
 * @param {string} level Log level.
 * @param {...*} [args] Values to log.
 * @since 3.0.0
 */
utils.logify(Component.prototype)

/**
 * Register a new event listener on this Component.
 *
 * @example
 * // Listen for all "afterCreate" events in a DataStore
 * store.on('afterCreate', (mapperName, props, opts, result) => {
 *   console.log(mapperName) // "post"
 *   console.log(props.id) // undefined
 *   console.log(result.id) // 1234
 * })
 * store.create('post', { title: 'Modeling your data' }).then((post) => {
 *   console.log(post.id) // 1234
 * })
 *
 * @example
 * // Listen for the "add" event on a collection
 * collection.on('add', (records) => {
 *   console.log(records) // [...]
 * })
 *
 * @example
 * // Listen for "change" events on a record
 * post.on('change', (record, changes) => {
 *   console.log(changes) // { changed: { title: 'Modeling your data' } }
 * })
 * post.title = 'Modeling your data'
 *
 * @method Component#on
 * @param {string} event Name of event to subsribe to.
 * @param {Function} listener Listener function to handle the event.
 * @param {*} [ctx] Optional content in which to invoke the listener.
 * @since 3.0.0
 */
/**
 * Remove an event listener from this Component. If no listener is provided,
 * then all listeners for the specified event will be removed. If no event is
 * specified then all listeners for all events will be removed.
 *
 * @example
 * // Remove a particular listener for a particular event
 * collection.off('add', handler)
 *
 * @example
 * // Remove all listeners for a particular event
 * record.off('change')
 *
 * @example
 * // Remove all listeners to all events
 * store.off()
 *
 * @method Component#off
 * @param {string} [event] Name of event to unsubsribe to.
 * @param {Function} [listener] Listener to remove.
 * @since 3.0.0
 */
/**
 * Trigger an event on this Component.
 *
 * @example <caption>Component#emit</caption>
 * // import {Collection, DataStore} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Collection, DataStore} = JSData
 *
 * const collection = new Collection()
 * collection.on('foo', function (msg) {
 *   console.log(msg)
 * })
 * collection.emit('foo', 'bar')
 *
 * const store = new DataStore()
 * store.on('beep', function (msg) {
 *   console.log(msg)
 * })
 * store.emit('beep', 'boop')
 *
 * @method Component#emit
 * @param {string} event Name of event to emit.
 * @param {...*} [args] Arguments to pass to any listeners.
 * @since 3.0.0
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
