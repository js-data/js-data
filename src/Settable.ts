import utils from './utils'

/**
 * A base class which gives instances private properties.
 *
 * Typically you won't instantiate this class directly, but you may find it
 * useful as an abstract class for your own components.
 *
 * @example
 * import {Settable} from 'js-data';
 *
 * class CustomSettableClass extends Settable {
 *   foo () { return 'bar'; }
 *   static beep () { return 'boop'; }
 * }
 *
 * const customSettable = new CustomSettableClass();
 * console.log(customSettable.foo());
 * console.log(CustomSettableClass.beep());
 *
 * @since 3.0.0
 */
export default class Settable {
  [customAttr: string]: any;

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
  protected _get: (key: string) => any;

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
  protected _set: (key, value?) => any;

  /**
   * Unset a private property of this instance.
   *
   * __Don't use the method unless you know what you're doing.__
   *
   * @method __Don't use the method unless you know what you're doing.__#_unset
   * @param {string} key The property to unset.
   * @since 3.0.0
   */
  protected _unset: (key) => any;

  constructor () {
    const _props = {}

    Object.defineProperties(this, {
      _get: {
        value (key) {
          return utils.get(_props, key)
        }
      },
      _set: {
        value (key, value) {
          return utils.set(_props, key, value)
        }
      },
      _unset: {
        value (key) {
          return utils.unset(_props, key)
        }
      }
    })
  }
}
