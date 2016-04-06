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
export const version = '<%= version %>'

import utils from './utils'

/**
 * {@link Collection} class.
 * @name module:js-data.Collection
 */
import Collection from './Collection'

/**
 * {@link Component} class.
 * @name module:js-data.Component
 */
import Component from './Component'

/**
 * {@link Container} class.
 * @name module:js-data.Container
 */
import Container from './Container'

/**
 * {@link DataStore} class.
 * @name module:js-data.DataStore
 */
import DataStore from './DataStore'

/**
 * {@link Index} class.
 * @name module:js-data.Index
 */
import Index from '../lib/mindex/index'

/**
 * {@link LinkedCollection} class.
 * @name module:js-data.LinkedCollection
 */
import LinkedCollection from './LinkedCollection'

/**
 * {@link Mapper} class.
 * @name module:js-data.Mapper
 */
import Mapper from './Mapper'

/**
 * {@link Query} class.
 * @name module:js-data.Query
 */
import Query from './Query'

/**
 * {@link Record} class.
 * @name module:js-data.Record
 */
import Record from './Record'

/**
 * {@link Schema} class.
 * @name module:js-data.Schema
 */
import Schema from './Schema'

export * from './decorators'

export {
  Collection,
  Component,
  Container,
  DataStore,
  Index,
  LinkedCollection,
  Mapper,
  Query,
  Record,
  Schema,
  utils
}
