/**
 * Registered as `js-data` in NPM and Bower.
 * #### Script tag
 * ```js
 * window.JSData
 * ```
 * #### CommonJS
 * ```js
 * var JSData = require('js-data')
 * ```
 * #### ES6 Modules
 * ```js
 * import JSData from 'js-data'
 * ```
 * #### AMD
 * ```js
 * define('myApp', ['js-data'], function (JSData) { ... })
 * ```
 *
 * @module js-data
 * @property {Function} belongsTo - {@link module:js-data.exports.belongsTo belongsTo}
 * decorator function.
 * @property {Function} configure - {@link module:js-data.exports.configure configure}
 * decorator function.
 * @property {Function} Collection - {@link Collection} class.
 * @property {Function} DS - {@link DS} class.
 * @property {Function} hasMany - {@link module:js-data.exports.hasMany hasMany}
 * decorator function.
 * @property {Function} hasOne - {@link module:js-data.exports.hasOne hasOne}
 * decorator function.
 * @property {Function} initialize - {@link module:js-data.exports.initialize initialize}
 * decorator function.
 * @property {Function} Model - {@link Model} class.
 * @property {Function} registerAdapter - {@link registerAdapter} decorator
 * function.
 * @property {Function} setSchema - {@link setSchema} decorator function.
 * @property {Function} Query - {@link Query} class.
 * @property {Object} utils - Utility methods used by the `js-data` module. See
 * {@link module:js-data.module:utils utils}.
 * @property {Object} version - Details of the current version of the `js-data`
 * module.
 * @property {string} version.full - The full semver value.
 * @property {number} version.major - The major version number.
 * @property {number} version.minor - The minor version number.
 * @property {number} version.patch - The patch version number.
 * @property {(string|boolean)} version.alpha - The alpha version value,
 * otherwise `false` if the current version is not alpha.
 * @property {(string|boolean)} version.beta - The beta version value,
 * otherwise `false` if the current version is not beta.
 */

export * from './collection/index'
export * from './datastore/index'

export * from './decorators/index'
export * from './model/index'
export * from './validate/index'
import * as _utils from './utils'
export const utils = _utils

export const version = {
  full: '<%= pkg.version %>',
  major: parseInt('<%= major %>', 10),
  minor: parseInt('<%= minor %>', 10),
  patch: parseInt('<%= patch %>', 10),
  alpha: '<%= alpha %>' !== 'false' ? '<%= alpha %>' : false,
  beta: '<%= beta %>' !== 'false' ? '<%= beta %>' : false
}
