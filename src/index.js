/**
 * Registered as `js-data` in NPM and Bower.
 *
 * Also available from CDN.JS and JSDelivr.
 *
 * @module js-data
 *
 * @example <caption>Install from NPM</caption>
 * npm i --save js-data@beta
 * @example <caption>Install from Bower</caption>
 * bower i --save js-data@3.0.0-beta.1
 * @example <caption>Install from CDN.JS</caption>
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/js-data/3.0.0-beta.1/js-data.min.js"></script>
 * @example <caption>Install from JSDelivr</caption>
 * <script src="https://cdn.jsdelivr.net/js-data/3.0.0-beta.1/js-data.min.js"></script>
 * @example <caption>Load into your app via script tag</caption>
 * <script src="/path/to/js-data.min.js"></script>
 * <script>
 *   console.log(JSData.version.full); // "3.0.0-beta.1"
 * </script>
 * @example <caption>Load into your app via CommonJS</caption>
 * var JSData = require('js-data');
 * @example <caption>Load into your app via ES2015 Modules</caption>
 * import * as JSData from 'js-data';
 * @example <caption>Load into your app via AMD</caption>
 * define('myApp', ['js-data'], function (JSData) { ... })
 */

/**
 * JSData's utility methods.
 *
 * @example
 * import {utils} from 'js-data'
 * console.log(utils.isString('foo')) // true
 *
 * @name module:js-data.utils
 * @property {Function} Promise See {@link utils.Promise}.
 * @see utils
 * @since 3.0.0
 * @type {Object}
 */
import utils from './utils'

/**
 * JSData's {@link Collection} class.
 *
 * @example
 * import {Collection} from 'js-data'
 * const collection = new Collection()
 *
 * @name module:js-data.Collection
 * @see Collection
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#collection","Components of JSData: Collection"]
 * @type {Constructor}
 */
import Collection from './Collection'

/**
 * JSData's {@link Component} class. Most components in JSData extend this
 * class.
 *
 * @example
 * import {Component} from 'js-data'
 * // Make a custom component.
 * const MyComponent = Component.extend({
 *   myMethod (someArg) { ... }
 * })
 *
 * @name module:js-data.Component
 * @see Component
 * @since 3.0.0
 * @type {Constructor}
 */
import Component from './Component'

/**
 * JSData's {@link Container} class. Defines and manages {@link Mapper}s. Used
 * in Node.js and in the browser, though in the browser you may want to use
 * {@link DataStore} instead.
 *
 * @example
 * import {Container} from 'js-data'
 * const store = new Container()
 *
 * @name module:js-data.Container
 * @see Container
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#container","Components of JSData: Container"]
 * @type {Constructor}
 */
import {Container} from './Container'

/**
 * JSData's {@link DataStore} class. Primarily for use in the browser. In
 * Node.js you probably want to use {@link Container} instead.
 *
 * @example
 * import {DataStore} from 'js-data'
 * const store = new DataStore()
 *
 * @name module:js-data.DataStore
 * @see DataStore
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#datastore","Components of JSData: DataStore"]
 * @type {Constructor}
 */
import DataStore from './DataStore'

/**
 * JSData's {@link Index} class, based on [mindex]{@link https://github.com/internalfx/mindex}.
 *
 * @name module:js-data.Index
 * @see Index
 * @since 3.0.0
 * @type {Constructor}
 */
import Index from '../lib/mindex/index'

/**
 * JSData's {@link LinkedCollection} class. Used by the {@link DataStore}
 * component. If you need to create a collection manually, you should probably
 * use the {@link Collection} class.
 *
 * @name module:js-data.LinkedCollection
 * @see DataStore
 * @see LinkedCollection
 * @since 3.0.0
 * @type {Constructor}
 */
import LinkedCollection from './LinkedCollection'

/**
 * JSData's {@link Mapper} class. The core of the ORM.
 *
 * @example <caption>Recommended use</caption>
 * import {Container} from 'js-data'
 * const store = new Container()
 * store.defineMapper('user')
 *
 * @example <caption>Create Mapper manually</caption>
 * import {Mapper} from 'js-data'
 * const UserMapper = new Mapper({ name: 'user' })
 *
 * @name module:js-data.Mapper
 * @see Container
 * @see Mapper
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/modeling-your-data","Modeling your data"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#mapper","Components of JSData: Mapper"]
 * @type {Constructor}
 */
import Mapper from './Mapper'

/**
 * JSData's {@link Query} class. Used by the {@link Collection} component.
 *
 * @name module:js-data.Query
 * @see Query
 * @since 3.0.0
 * @type {Constructor}
 */
import Query from './Query'

/**
 * JSData's {@link Record} class.
 *
 * @example
 * import {Container} from 'js-data'
 * const store = new Container()
 * store.defineMapper('user')
 * const user = store.createRecord('user')
 *
 * @name module:js-data.Record
 * @see Record
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#record","Components of JSData: Record"]
 * @type {Constructor}
 */
import Record from './Record'

/**
 * JSData's {@link Schema} class. Implements http://json-schema.org/draft-04.
 *
 * @example
 * import {Container, Schema} from 'js-data'
 * const userSchema = new Schema({
 *   properties: {
 *     id: { type: 'string' },
 *     name: { type: 'string' }
 *   }
 * })
 * const store = new Container()
 * store.defineMapper('user', {
 *   schema: userSchema
 * })
 *
 * @name module:js-data.Schema
 * @see Schema
 * @see http://json-schema.org/
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#schema","Components of JSData: schema"]
 * @tutorial ["http://www.js-data.io/v3.0/docs/schemas","JSData's Schema Syntax"]
 * @type {Constructor}
 */
import Schema from './Schema'

/**
 * JSData's {@link Settable} class.
 *
 * @example
 * import {Settable} from 'js-data'
 * const obj = new Settable()
 * obj.set('secret', 'value')
 * console.log(JSON.stringify(obj)) // {}
 *
 * @name module:js-data.Settable
 * @see Settable
 * @since 3.0.0
 * @type {Constructor}
 */
import Settable from './Settable'

/**
 * JSData's {@link SimpleStore} class. Primarily for use in the browser. In
 * Node.js you probably want to use {@link Container} instead.
 *
 * @example
 * import {SimpleStore} from 'js-data'
 * const store = new SimpleStore()
 *
 * @name module:js-data.SimpleStore
 * @see SimpleStore
 * @since 3.0.0
 * @tutorial ["http://www.js-data.io/v3.0/docs/components-of-jsdata#SimpleStore","Components of JSData: SimpleStore"]
 * @type {Constructor}
 */
import SimpleStore from './SimpleStore'

/**
 * Describes the version of this `JSData` object.
 *
 * @example
 * console.log(JSData.version.full) // "3.0.0-beta.1"
 *
 * @name version
 * @memberof module:js-data
 * @property {string} full The full semver value.
 * @property {number} major The major version number.
 * @property {number} minor The minor version number.
 * @property {number} patch The patch version number.
 * @property {(string|boolean)} alpha The alpha version value, otherwise `false`
 * if the current version is not alpha.
 * @property {(string|boolean)} beta The beta version value, otherwise `false`
 * if the current version is not beta.
 * @since 2.0.0
 * @type {Object}
 */
export const version = '<%= version %>'

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
  Settable,
  SimpleStore,
  utils
}
