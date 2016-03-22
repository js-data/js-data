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
 */

/**
 * Details of the current version of the `js-data` module.
 *
 * @name version
 * @memberof module:js-data
 * @type {Object}
 * @property {string} full The full semver value.
 * @property {number} major The major version number.
 * @property {number} minor The minor version number.
 * @property {number} patch The patch version number.
 * @property {(string|boolean)} alpha The alpha version value, otherwise `false`
 * if the current version is not alpha.
 * @property {(string|boolean)} beta The beta version value, otherwise `false`
 * if the current version is not beta.
 */
export const version = {
  alpha: '<%= alpha %>' !== 'false' ? '<%= alpha %>' : false,
  beta: '<%= beta %>' !== 'false' ? '<%= beta %>' : false,
  full: '<%= pkg.version %>',
  major: parseInt('<%= major %>', 10),
  minor: parseInt('<%= minor %>', 10),
  patch: parseInt('<%= patch %>', 10)
}

export utils from './utils'

export * from './decorators'

/**
 * {@link Collection} class.
 * @name module:js-data.Collection
 */
export Collection from './Collection'

/**
 * {@link Container} class.
 * @name module:js-data.Container
 */
export Container from './Container'

/**
 * {@link DataStore} class.
 * @name module:js-data.DataStore
 */
export DataStore from './DataStore'

/**
 * {@link LinkedCollection} class.
 * @name module:js-data.LinkedCollection
 */
export LinkedCollection from './LinkedCollection'

/**
 * {@link Mapper} class.
 * @name module:js-data.Mapper
 */
export Mapper from './Mapper'

/**
 * {@link Query} class.
 * @name module:js-data.Query
 */
export Query from './Query'

/**
 * {@link Record} class.
 * @name module:js-data.Record
 */
export Record from './Record'

/**
 * {@link Schema} class.
 * @name module:js-data.Schema
 */
export Schema from './Schema'
