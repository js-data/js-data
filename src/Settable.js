import utils from './utils'

/**
 * A base class which gives instances private properties.
 *
 * Typically you won't instantiate this class directly, but you may find it
 * useful as an abstract class for your own components.
 *
 * See {@link Settable.extend} for an example of using {@link Settable} as a
 * base class.
 *
 *```javascript
 * import {Settable} from 'js-data'
 * ```
 *
 * @class Settable
 * @returns {Settable} A new {@link Settable} instance.
 * @since 3.0.0
 */
export default function Settable () {
  const _props = {}
  Object.defineProperties(this, {
    /**
     * Get a private property of this instance.
     *
     * __Don't use the method unless you know what you're doing.__
     *
     * @method Settable#_get
     * @param {string} key The property to retrieve.
     * @returns {*} The value of the property.
     * @since 3.0.0
     */
    _get: { value (key) { return utils.get(_props, key) } },

    /**
     * Set a private property of this instance.
     *
     * __Don't use the method unless you know what you're doing.__
     *
     * @method __Don't use the method unless you know what you're doing.__#_set
     * @param {(string|Object)} key The key or path to the property. Can also
     * pass in an object of key/value pairs, which will all be set on the instance.
     * @param {*} [value] The value to set.
     * @since 3.0.0
     */
    _set: { value (key, value) { return utils.set(_props, key, value) } },

    /**
     * Unset a private property of this instance.
     *
     * __Don't use the method unless you know what you're doing.__
     *
     * @method __Don't use the method unless you know what you're doing.__#_unset
     * @param {string} key The property to unset.
     * @since 3.0.0
     */
    _unset: { value (key) { return utils.unset(_props, key) } }
  })
}

/**
 * Create a subclass of this Settable:
 *
 * @example <caption>Settable.extend</caption>
 * // Normally you would do: import {Settable} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Settable} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomSettableClass extends Settable {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customSettable = new CustomSettableClass()
 * console.log(customSettable.foo())
 * console.log(CustomSettableClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherSettableClass = Settable.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherSettable = new OtherSettableClass()
 * console.log(otherSettable.foo())
 * console.log(OtherSettableClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherSettableClass () {
 *   Settable.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * Settable.extend({
 *   constructor: AnotherSettableClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherSettable = new AnotherSettableClass()
 * console.log(anotherSettable.created_at)
 * console.log(anotherSettable.foo())
 * console.log(AnotherSettableClass.beep())
 *
 * @method Settable.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Settable class.
 * @since 3.0.0
 */
Settable.extend = utils.extend
