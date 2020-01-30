import utils from './utils'
import Settable from './Settable'

export interface ComponentOpts {
  debug?: boolean
}

/**
 * The base class from which all JSData components inherit some basic
 * functionality.
 *
 * Typically you won't instantiate this class directly, but you may find it
 * useful as an abstract class for your own components.
 *
 * @example
 * import {Component} from 'js-data'
 *
 * class CustomComponentClass extends Component {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 * const customComponent = new CustomComponentClass();
 * console.log(customComponent.foo());
 * console.log(CustomComponentClass.beep());
 * ```
 *
 * @param {object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @returns {Component} A new {@link Component} instance.
 * @since 3.0.0
 */
export default class Component extends Settable {
  /**
   * Whether to enable debug-level logs for this component. Anything that
   * extends `Component` inherits this option and the corresponding logging
   * functionality.
   *
   * @example <caption>Component#debug</caption>
   * const JSData = require('js-data');
   * const { Component } = JSData;
   * console.log('Using JSData v' + JSData.version.full);
   *
   * const component = new Component();
   * component.log('debug', 'some message'); // nothing gets logged
   * // Display debug logs:
   * component.debug = true;
   * component.log('debug', 'other message'); // this DOES get logged
   *
   * @default false
   * @name Component#debug
   * @since 3.0.0
   * @type {boolean}
   */
  protected debug: boolean;

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
  _listeners = {};

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
  dbg: (...args) => void;

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
  log: (...args) => void;

  /**
   * Register a new event listener on this Component.
   *
   * @example
   * // Listen for all "afterCreate" events in a DataStore
   * store.on('afterCreate', (mapperName, props, opts, result) => {
   *   console.log(mapperName); // "post"
   *   console.log(props.id); // undefined
   *   console.log(result.id); // 1234
   * });
   * store.create('post', { title: 'Modeling your data' }).then((post) => {
   *   console.log(post.id); // 1234
   * });
   *
   * @example
   * // Listen for the "add" event on a collection
   * collection.on('add', (records) => {
   *   console.log(records); // [...]
   * });
   *
   * @example
   * // Listen for "change" events on a record
   * post.on('change', (record, changes) => {
   *   console.log(changes); // { changed: { title: 'Modeling your data' } }
   * });
   * post.title = 'Modeling your data';
   *
   * @method Component#on
   * @param {string} event Name of event to subscribe to.
   * @param {Function} listener Listener function to handle the event.
   * @param {*} [ctx] Optional content in which to invoke the listener.
   * @since 3.0.0
   */
  on: (name: string, listener: Function, ctx?) => void;

  /**
   * Remove an event listener from this Component. If no listener is provided,
   * then all listeners for the specified event will be removed. If no event is
   * specified then all listeners for all events will be removed.
   *
   * @example
   * // Remove a particular listener for a particular event
   * collection.off('add', handler);
   *
   * @example
   * // Remove all listeners for a particular event
   * record.off('change');
   *
   * @example
   * // Remove all listeners to all events
   * store.off();
   *
   * @method Component#off
   * @param {string} [event] Name of event to unsubscribe to.
   * @param {Function} [listener] Listener to remove.
   * @since 3.0.0
   */
  off: (event: string, listener?: Function, thisArg?) => void;

  /**
   * Trigger an event on this Component.
   *
   * @example <caption>Component#emit</caption>
   * // import { Collection, DataStore } from 'js-data';
   * const JSData = require('js-data');
   * const { Collection, DataStore } = JSData;
   *
   * const collection = new Collection();
   * collection.on('foo', function (msg) {
   *   console.log(msg);
   * });
   * collection.emit('foo', 'bar');
   *
   * const store = new DataStore();
   * store.on('beep', function (msg) {
   *   console.log(msg);
   * });
   * store.emit('beep', 'boop');
   *
   * @method Component#emit
   * @param {string} event Name of event to emit.
   * @param {...*} [args] Arguments to pass to any listeners.
   * @since 3.0.0
   */
  emit: (event: string, ...args) => void;

  constructor (opts: ComponentOpts | any = {}) {
    super()
    this.debug = opts.debug ?? false
  }
}

utils.logify(Component.prototype)

utils.eventify(
  Component.prototype,
  function () {
    return this._listeners
  },
  function (value) {
    this._listeners = value
  }
)
