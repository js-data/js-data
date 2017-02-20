import utils from './utils'
import Component from './Component'
import Mapper from './Mapper'

const DOMAIN = 'Container'

export const proxiedMapperMethods = [
  /**
   * Wrapper for {@link Mapper#count}.
   *
   * @example
   * // Get the number of published blog posts
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.count('post', { status: 'published' }).then((numPublished) => {
   *   console.log(numPublished) // e.g. 45
   * })
   *
   * @method Container#count
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] See {@link Mapper#count}.
   * @param {Object} [opts] See {@link Mapper#count}.
   * @returns {Promise} See {@link Mapper#count}.
   * @see Mapper#count
   * @since 3.0.0
   */
  'count',

  /**
   * Fired during {@link Container#create}. See
   * {@link Container~beforeCreateListener} for how to listen for this event.
   *
   * @event Container#beforeCreate
   * @see Container~beforeCreateListener
   * @see Container#create
   */
  /**
   * Callback signature for the {@link Container#event:beforeCreate} event.
   *
   * @example
   * function onBeforeCreate (mapperName, props, opts) {
   *   // do something
   * }
   * store.on('beforeCreate', onBeforeCreate)
   *
   * @callback Container~beforeCreateListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeCreate}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeCreate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeCreate}.
   * @see Container#event:beforeCreate
   * @see Container#create
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#create}. See
   * {@link Container~afterCreateListener} for how to listen for this event.
   *
   * @event Container#afterCreate
   * @see Container~afterCreateListener
   * @see Container#create
   */
  /**
   * Callback signature for the {@link Container#event:afterCreate} event.
   *
   * @example
   * function onAfterCreate (mapperName, props, opts, result) {
   *   // do something
   * }
   * store.on('afterCreate', onAfterCreate)
   *
   * @callback Container~afterCreateListener
   * @param {string} name The `name` argument received by {@link Mapper#afterCreate}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterCreate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterCreate}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterCreate}.
   * @see Container#event:afterCreate
   * @see Container#create
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#create}.
   *
   * @example
   * // Create and save a new blog post
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.create('post', {
   *   title: 'Modeling your data',
   *   status: 'draft'
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'draft', ... }
   * })
   *
   * @fires Container#beforeCreate
   * @fires Container#afterCreate
   * @method Container#create
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} props See {@link Mapper#create}.
   * @param {Object} [opts] See {@link Mapper#create}.
   * @returns {Promise} See {@link Mapper#create}.
   * @see Mapper#create
   * @since 3.0.0
   */
  'create',

  /**
   * Fired during {@link Container#createMany}. See
   * {@link Container~beforeCreateManyListener} for how to listen for this event.
   *
   * @event Container#beforeCreateMany
   * @see Container~beforeCreateManyListener
   * @see Container#createMany
   */
  /**
   * Callback signature for the {@link Container#event:beforeCreateMany} event.
   *
   * @example
   * function onBeforeCreateMany (mapperName, records, opts) {
   *   // do something
   * }
   * store.on('beforeCreateMany', onBeforeCreateMany)
   *
   * @callback Container~beforeCreateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeCreateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#beforeCreateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeCreateMany}.
   * @see Container#event:beforeCreateMany
   * @see Container#createMany
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#createMany}. See
   * {@link Container~afterCreateManyListener} for how to listen for this event.
   *
   * @event Container#afterCreateMany
   * @see Container~afterCreateManyListener
   * @see Container#createMany
   */
  /**
   * Callback signature for the {@link Container#event:afterCreateMany} event.
   *
   * @example
   * function onAfterCreateMany (mapperName, records, opts, result) {
   *   // do something
   * }
   * store.on('afterCreateMany', onAfterCreateMany)
   *
   * @callback Container~afterCreateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterCreateMany}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterCreateMany}.
   * @see Container#event:afterCreateMany
   * @see Container#createMany
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#createMany}.
   *
   * @example
   * // Create and save several new blog posts
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.createMany('post', [{
   *   title: 'Modeling your data',
   *   status: 'draft'
   * }, {
   *   title: 'Reading data',
   *   status: 'draft'
   * }]).then((posts) => {
   *   console.log(posts[0]) // { id: 1234, status: 'draft', ... }
   *   console.log(posts[1]) // { id: 1235, status: 'draft', ... }
   * })
   *
   * @fires Container#beforeCreateMany
   * @fires Container#afterCreateMany
   * @method Container#createMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Record[]} records See {@link Mapper#createMany}.
   * @param {Object} [opts] See {@link Mapper#createMany}.
   * @returns {Promise} See {@link Mapper#createMany}.
   * @see Mapper#createMany
   * @since 3.0.0
   */
  'createMany',

  /**
   * Wrapper for {@link Mapper#createRecord}.
   *
   * __Note:__ This method does __not__ interact with any adapter, and does
   * __not__ save any data. It only creates new objects in memory.
   *
   * @example
   * // Create empty unsaved record instance
   * import {Container} from 'js-data'
   * const store = new Container()
   * store.defineMapper('post')
   * const post = PostMapper.createRecord()
   *
   * @method Container#createRecord
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object|Object[]} props See {@link Mapper#createRecord}.
   * @param {Object} [opts] See {@link Mapper#createRecord}.
   * @returns {Promise} See {@link Mapper#createRecord}.
   * @see Mapper#createRecord
   * @since 3.0.0
   */
  'createRecord',

  /**
   * Fired during {@link Container#destroy}. See
   * {@link Container~beforeDestroyListener} for how to listen for this event.
   *
   * @event Container#beforeDestroy
   * @see Container~beforeDestroyListener
   * @see Container#destroy
   */
  /**
   * Callback signature for the {@link Container#event:beforeDestroy} event.
   *
   * @example
   * function onBeforeDestroy (mapperName, id, opts) {
   *   // do something
   * }
   * store.on('beforeDestroy', onBeforeDestroy)
   *
   * @callback Container~beforeDestroyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeDestroy}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeDestroy}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeDestroy}.
   * @see Container#event:beforeDestroy
   * @see Container#destroy
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#destroy}. See
   * {@link Container~afterDestroyListener} for how to listen for this event.
   *
   * @event Container#afterDestroy
   * @see Container~afterDestroyListener
   * @see Container#destroy
   */
  /**
   * Callback signature for the {@link Container#event:afterDestroy} event.
   *
   * @example
   * function onAfterDestroy (mapperName, id, opts, result) {
   *   // do something
   * }
   * store.on('afterDestroy', onAfterDestroy)
   *
   * @callback Container~afterDestroyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterDestroy}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterDestroy}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterDestroy}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterDestroy}.
   * @see Container#event:afterDestroy
   * @see Container#destroy
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#destroy}.
   *
   * @example
   * // Destroy a specific blog post
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.destroy('post', 1234).then(() => {
   *   // Blog post #1234 has been destroyed
   * })
   *
   * @fires Container#beforeDestroy
   * @fires Container#afterDestroy
   * @method Container#destroy
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link Mapper#destroy}.
   * @param {Object} [opts] See {@link Mapper#destroy}.
   * @returns {Promise} See {@link Mapper#destroy}.
   * @see Mapper#destroy
   * @since 3.0.0
   */
  'destroy',

  /**
   * Fired during {@link Container#destroyAll}. See
   * {@link Container~beforeDestroyAllListener} for how to listen for this event.
   *
   * @event Container#beforeDestroyAll
   * @see Container~beforeDestroyAllListener
   * @see Container#destroyAll
   */
  /**
   * Callback signature for the {@link Container#event:beforeDestroyAll} event.
   *
   * @example
   * function onBeforeDestroyAll (mapperName, query, opts) {
   *   // do something
   * }
   * store.on('beforeDestroyAll', onBeforeDestroyAll)
   *
   * @callback Container~beforeDestroyAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeDestroyAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeDestroyAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeDestroyAll}.
   * @see Container#event:beforeDestroyAll
   * @see Container#destroyAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#destroyAll}. See
   * {@link Container~afterDestroyAllListener} for how to listen for this event.
   *
   * @event Container#afterDestroyAll
   * @see Container~afterDestroyAllListener
   * @see Container#destroyAll
   */
  /**
   * Callback signature for the {@link Container#event:afterDestroyAll} event.
   *
   * @example
   * function onAfterDestroyAll (mapperName, query, opts, result) {
   *   // do something
   * }
   * store.on('afterDestroyAll', onAfterDestroyAll)
   *
   * @callback Container~afterDestroyAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterDestroyAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterDestroyAll}.
   * @see Container#event:afterDestroyAll
   * @see Container#destroyAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#destroyAll}.
   *
   * @example
   * // Destroy all "draft" blog posts
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.destroyAll('post', { status: 'draft' }).then(() => {
   *   // All "draft" blog posts have been destroyed
   * })
   *
   * @fires Container#beforeDestroyAll
   * @fires Container#afterDestroyAll
   * @method Container#destroyAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] See {@link Mapper#destroyAll}.
   * @param {Object} [opts] See {@link Mapper#destroyAll}.
   * @returns {Promise} See {@link Mapper#destroyAll}.
   * @see Mapper#destroyAll
   * @since 3.0.0
   */
  'destroyAll',

  /**
   * Fired during {@link Container#find}. See
   * {@link Container~beforeFindListener} for how to listen for this event.
   *
   * @event Container#beforeFind
   * @see Container~beforeFindListener
   * @see Container#find
   */
  /**
   * Callback signature for the {@link Container#event:beforeFind} event.
   *
   * @example
   * function onBeforeFind (mapperName, id, opts) {
   *   // do something
   * }
   * store.on('beforeFind', onBeforeFind)
   *
   * @callback Container~beforeFindListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeFind}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeFind}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeFind}.
   * @see Container#event:beforeFind
   * @see Container#find
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#find}. See
   * {@link Container~afterFindListener} for how to listen for this event.
   *
   * @event Container#afterFind
   * @see Container~afterFindListener
   * @see Container#find
   */
  /**
   * Callback signature for the {@link Container#event:afterFind} event.
   *
   * @example
   * function onAfterFind (mapperName, id, opts, result) {
   *   // do something
   * }
   * store.on('afterFind', onAfterFind)
   *
   * @callback Container~afterFindListener
   * @param {string} name The `name` argument received by {@link Mapper#afterFind}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterFind}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterFind}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterFind}.
   * @see Container#event:afterFind
   * @see Container#find
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#find}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.find('post', 1).then((post) => {
   *   console.log(post) // { id: 1, ...}
   * })
   *
   * @fires Container#beforeFind
   * @fires Container#afterFind
   * @method Container#find
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link Mapper#find}.
   * @param {Object} [opts] See {@link Mapper#find}.
   * @returns {Promise} See {@link Mapper#find}.
   * @see Mapper#find
   * @since 3.0.0
   */
  'find',

  /**
   * Fired during {@link Container#findAll}. See
   * {@link Container~beforeFindAllListener} for how to listen for this event.
   *
   * @event Container#beforeFindAll
   * @see Container~beforeFindAllListener
   * @see Container#findAll
   */
  /**
   * Callback signature for the {@link Container#event:beforeFindAll} event.
   *
   * @example
   * function onBeforeFindAll (mapperName, query, opts) {
   *   // do something
   * }
   * store.on('beforeFindAll', onBeforeFindAll)
   *
   * @callback Container~beforeFindAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeFindAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeFindAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeFindAll}.
   * @see Container#event:beforeFindAll
   * @see Container#findAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#findAll}. See
   * {@link Container~afterFindAllListener} for how to listen for this event.
   *
   * @event Container#afterFindAll
   * @see Container~afterFindAllListener
   * @see Container#findAll
   */
  /**
   * Callback signature for the {@link Container#event:afterFindAll} event.
   *
   * @example
   * function onAfterFindAll (mapperName, query, opts, result) {
   *   // do something
   * }
   * store.on('afterFindAll', onAfterFindAll)
   *
   * @callback Container~afterFindAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterFindAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterFindAll}.
   * @see Container#event:afterFindAll
   * @see Container#findAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#createRecord}.
   *
   * @example
   * // Find all "published" blog posts
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.findAll('post', { status: 'published' }).then((posts) => {
   *   console.log(posts) // [{ id: 1, ...}, ...]
   * })
   *
   * @fires Container#beforeFindAll
   * @fires Container#afterFindAll
   * @method Container#findAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} [query] See {@link Mapper#findAll}.
   * @param {Object} [opts] See {@link Mapper#findAll}.
   * @returns {Promise} See {@link Mapper#findAll}.
   * @see Mapper#findAll
   * @since 3.0.0
   */
  'findAll',

  /**
   * Wrapper for {@link Mapper#getSchema}.
   *
   * @method Container#getSchema
   * @param {string} name Name of the {@link Mapper} to target.
   * @returns {Schema} See {@link Mapper#getSchema}.
   * @see Mapper#getSchema
   * @since 3.0.0
   */
  'getSchema',

  /**
   * Wrapper for {@link Mapper#is}.
   *
   * @example
   * import {Container} from 'js-data'
   * const store = new Container()
   * store.defineMapper('post')
   * const post = store.createRecord()
   *
   * console.log(store.is('post', post)) // true
   * // Equivalent to what's above
   * console.log(post instanceof store.getMapper('post').recordClass) // true
   *
   * @method Container#is
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object|Record} record See {@link Mapper#is}.
   * @returns {boolean} See {@link Mapper#is}.
   * @see Mapper#is
   * @since 3.0.0
   */
  'is',

  /**
   * Wrapper for {@link Mapper#sum}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('purchase_order')
   *
   * store.sum('purchase_order', 'amount', { status: 'paid' }).then((amountPaid) => {
   *   console.log(amountPaid) // e.g. 451125.34
   * })
   *
   * @method Container#sum
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {string} field See {@link Mapper#sum}.
   * @param {Object} [query] See {@link Mapper#sum}.
   * @param {Object} [opts] See {@link Mapper#sum}.
   * @returns {Promise} See {@link Mapper#sum}.
   * @see Mapper#sum
   * @since 3.0.0
   */
  'sum',

  /**
   * Wrapper for {@link Mapper#toJSON}.
   *
   * @example
   * import { Container } from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('person', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' },
   *       id: { type: 'string' }
   *     }
   *   }
   * })
   * const person = store.createRecord('person', { id: 1, name: 'John', foo: 'bar' })
   * // "foo" is stripped by toJSON()
   * console.log(store.toJSON('person', person)) // {"id":1,"name":"John"}
   *
   * store.defineMapper('personRelaxed', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' },
   *       id: { type: 'string' }
   *     },
   *     additionalProperties: true
   *   }
   * })
   * const person2 = store.createRecord('personRelaxed', { id: 1, name: 'John', foo: 'bar' })
   * // "foo" is not stripped by toJSON
   * console.log(store.toJSON('personRelaxed', person2)) // {"id":1,"name":"John","foo":"bar"}
   *
   * @method Container#toJSON
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Record|Record[]} records See {@link Mapper#toJSON}.
   * @param {Object} [opts] See {@link Mapper#toJSON}.
   * @returns {Object|Object[]} See {@link Mapper#toJSON}.
   * @see Mapper#toJSON
   * @since 3.0.0
   */
  'toJSON',

  /**
   * Fired during {@link Container#update}. See
   * {@link Container~beforeUpdateListener} for how to listen for this event.
   *
   * @event Container#beforeUpdate
   * @see Container~beforeUpdateListener
   * @see Container#update
   */
  /**
   * Callback signature for the {@link Container#event:beforeUpdate} event.
   *
   * @example
   * function onBeforeUpdate (mapperName, id, props, opts) {
   *   // do something
   * }
   * store.on('beforeUpdate', onBeforeUpdate)
   *
   * @callback Container~beforeUpdateListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdate}.
   * @param {string|number} id The `id` argument received by {@link Mapper#beforeUpdate}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeUpdate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdate}.
   * @see Container#event:beforeUpdate
   * @see Container#update
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#update}. See
   * {@link Container~afterUpdateListener} for how to listen for this event.
   *
   * @event Container#afterUpdate
   * @see Container~afterUpdateListener
   * @see Container#update
   */
  /**
   * Callback signature for the {@link Container#event:afterUpdate} event.
   *
   * @example
   * function onAfterUpdate (mapperName, id, props, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdate', onAfterUpdate)
   *
   * @callback Container~afterUpdateListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdate}.
   * @param {string|number} id The `id` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdate}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdate}.
   * @see Container#event:afterUpdate
   * @see Container#update
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#update}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.update('post', 1234, {
   *   status: 'published',
   *   published_at: new Date()
   * }).then((post) => {
   *   console.log(post) // { id: 1234, status: 'published', ... }
   * })
   *
   * @fires Container#beforeUpdate
   * @fires Container#afterUpdate
   * @method Container#update
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(string|number)} id See {@link Mapper#update}.
   * @param {Object} record See {@link Mapper#update}.
   * @param {Object} [opts] See {@link Mapper#update}.
   * @returns {Promise} See {@link Mapper#update}.
   * @see Mapper#update
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/saving-data","Saving data"]
   */
  'update',

  /**
   * Fired during {@link Container#updateAll}. See
   * {@link Container~beforeUpdateAllListener} for how to listen for this event.
   *
   * @event Container#beforeUpdateAll
   * @see Container~beforeUpdateAllListener
   * @see Container#updateAll
   */
  /**
   * Callback signature for the {@link Container#event:beforeUpdateAll} event.
   *
   * @example
   * function onBeforeUpdateAll (mapperName, props, query, opts) {
   *   // do something
   * }
   * store.on('beforeUpdateAll', onBeforeUpdateAll)
   *
   * @callback Container~beforeUpdateAllListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} props The `props` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#beforeUpdateAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdateAll}.
   * @see Container#event:beforeUpdateAll
   * @see Container#updateAll
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#updateAll}. See
   * {@link Container~afterUpdateAllListener} for how to listen for this event.
   *
   * @event Container#afterUpdateAll
   * @see Container~afterUpdateAllListener
   * @see Container#updateAll
   */
  /**
   * Callback signature for the {@link Container#event:afterUpdateAll} event.
   *
   * @example
   * function onAfterUpdateAll (mapperName, props, query, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdateAll', onAfterUpdateAll)
   *
   * @callback Container~afterUpdateAllListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} props The `props` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} query The `query` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdateAll}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdateAll}.
   * @see Container#event:afterUpdateAll
   * @see Container#updateAll
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#updateAll}.
   *
   * @example
   * // Turn all of John's blog posts into drafts.
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * const update = { status: draft: published_at: null }
   * const query = { userId: 1234 }
   * store.updateAll('post', update, query).then((posts) => {
   *   console.log(posts) // [...]
   * })
   *
   * @fires Container#beforeUpdateAll
   * @fires Container#afterUpdateAll
   * @method Container#updateAll
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {Object} update See {@link Mapper#updateAll}.
   * @param {Object} [query] See {@link Mapper#updateAll}.
   * @param {Object} [opts] See {@link Mapper#updateAll}.
   * @returns {Promise} See {@link Mapper#updateAll}.
   * @see Mapper#updateAll
   * @since 3.0.0
   */
  'updateAll',

  /**
   * Fired during {@link Container#updateMany}. See
   * {@link Container~beforeUpdateManyListener} for how to listen for this event.
   *
   * @event Container#beforeUpdateMany
   * @see Container~beforeUpdateManyListener
   * @see Container#updateMany
   */
  /**
   * Callback signature for the {@link Container#event:beforeUpdateMany} event.
   *
   * @example
   * function onBeforeUpdateMany (mapperName, records, opts) {
   *   // do something
   * }
   * store.on('beforeUpdateMany', onBeforeUpdateMany)
   *
   * @callback Container~beforeUpdateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#beforeUpdateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#beforeUpdateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#beforeUpdateMany}.
   * @see Container#event:beforeUpdateMany
   * @see Container#updateMany
   * @since 3.0.0
   */
  /**
   * Fired during {@link Container#updateMany}. See
   * {@link Container~afterUpdateManyListener} for how to listen for this event.
   *
   * @event Container#afterUpdateMany
   * @see Container~afterUpdateManyListener
   * @see Container#updateMany
   */
  /**
   * Callback signature for the {@link Container#event:afterUpdateMany} event.
   *
   * @example
   * function onAfterUpdateMany (mapperName, records, opts, result) {
   *   // do something
   * }
   * store.on('afterUpdateMany', onAfterUpdateMany)
   *
   * @callback Container~afterUpdateManyListener
   * @param {string} name The `name` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} records The `records` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} opts The `opts` argument received by {@link Mapper#afterUpdateMany}.
   * @param {Object} result The `result` argument received by {@link Mapper#afterUpdateMany}.
   * @see Container#event:afterUpdateMany
   * @see Container#updateMany
   * @since 3.0.0
   */
  /**
   * Wrapper for {@link Mapper#updateMany}.
   *
   * @example
   * import {Container} from 'js-data'
   * import RethinkDBAdapter from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   * store.defineMapper('post')
   *
   * store.updateMany('post', [
   *   { id: 1234, status: 'draft' },
   *   { id: 2468, status: 'published', published_at: new Date() }
   * ]).then((posts) => {
   *   console.log(posts) // [...]
   * })
   *
   * @fires Container#beforeUpdateMany
   * @fires Container#afterUpdateMany
   * @method Container#updateMany
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records See {@link Mapper#updateMany}.
   * @param {Object} [opts] See {@link Mapper#updateMany}.
   * @returns {Promise} See {@link Mapper#updateMany}.
   * @see Mapper#updateMany
   * @since 3.0.0
   */
  'updateMany',

  /**
   * Wrapper for {@link Mapper#validate}.
   *
   * @example
   * import {Container} from 'js-data'
   * const store = new Container()
   * store.defineMapper('post', {
   *   schema: {
   *     properties: {
   *       name: { type: 'string' },
   *       id: { type: 'string' }
   *     }
   *   }
   * })
   * let errors = store.validate('post', { name: 'John' })
   * console.log(errors) // undefined
   * errors = store.validate('post', { name: 123 })
   * console.log(errors) // [{ expected: 'one of (string)', actual: 'number', path: 'name' }]
   *
   * @method Container#validate
   * @param {string} name Name of the {@link Mapper} to target.
   * @param {(Object[]|Record[])} records See {@link Mapper#validate}.
   * @param {Object} [opts] See {@link Mapper#validate}.
   * @returns {Promise} See {@link Mapper#validate}.
   * @see Mapper#validate
   * @since 3.0.0
   */
  'validate'
]

/**
 * The `Container` class is a place to define and store {@link Mapper} instances.
 *
 * `Container` makes it easy to manage your Mappers. Without a container, you
 * need to manage Mappers yourself, including resolving circular dependencies
 * among relations. All Mappers in a container share the same adapters, so you
 * don't have to register adapters for every single Mapper.
 *
 * @example <caption>Container#constructor</caption>
 * // import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Container} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * const store = new Container()
 *
 * @class Container
 * @extends Component
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.debug=false] See {@link Component#debug}.
 * @param {Constructor} [opts.mapperClass] See {@link Container#mapperClass}.
 * @param {Object} [opts.mapperDefaults] See {@link Container#mapperDefaults}.
 * @since 3.0.0
 */
export function Container (opts) {
  utils.classCallCheck(this, Container)
  Component.call(this)
  opts || (opts = {})

  Object.defineProperties(this, {
    /**
     * The adapters registered with this Container, which are also shared by all
     * Mappers in this Container.
     *
     * @name Container#_adapters
     * @see Container#registerAdapter
     * @since 3.0.0
     * @type {Object}
     */
    _adapters: {
      value: {}
    },

    /**
     * The the mappers in this container
     *
     * @name Container#_mappers
     * @see Mapper
     * @since 3.0.0
     * @type {Object}
     */
    _mappers: {
      value: {}
    },

    /**
     * Constructor function to use in {@link Container#defineMapper} to create new
     * {@link Mapper} instances. {@link Container#mapperClass} should extend
     * {@link Mapper}. By default {@link Mapper} is used to instantiate Mappers.
     *
     * @example <caption>Container#mapperClass</caption>
     * // import {Container, Mapper} from 'js-data'
     * const JSData = require('js-data@3.0.0-rc.4')
     * const {Container} = JSData
     * console.log('Using JSData v' + JSData.version.full)
     *
     * class MyMapperClass extends Mapper {
     *   foo () { return 'bar' }
     * }
     * const store = new Container({
     *   mapperClass: MyMapperClass
     * })
     * store.defineMapper('user')
     * console.log(store.getMapper('user').foo())
     *
     * @name Container#mapperClass
     * @see Mapper
     * @since 3.0.0
     * @type {Constructor}
     */
    mapperClass: {
      value: undefined,
      writable: true
    }
  })

  // Apply options provided by the user
  utils.fillIn(this, opts)

  /**
   * Defaults options to pass to {@link Container#mapperClass} when creating a
   * new {@link Mapper}.
   *
   * @example <caption>Container#mapperDefaults</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container({
   *   mapperDefaults: {
   *     idAttribute: '_id'
   *   }
   * })
   * store.defineMapper('user')
   * console.log(store.getMapper('user').idAttribute)
   *
   * @default {}
   * @name Container#mapperDefaults
   * @since 3.0.0
   * @type {Object}
   */
  this.mapperDefaults = this.mapperDefaults || {}

  // Use the Mapper class if the user didn't provide a mapperClass
  this.mapperClass || (this.mapperClass = Mapper)
}

const props = {
  constructor: Container,

  /**
   * Register a new event listener on this Container.
   *
   * Proxy for {@link Component#on}. If an event was emitted by a {@link Mapper}
   * in the Container, then the name of the {@link Mapper} will be prepended to
   * the arugments passed to the listener.
   *
   * @example <caption>Container#on</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container()
   * store.on('foo', function (...args) { console.log(args.join(':')) })
   * store.defineMapper('user')
   * store.emit('foo', 'arg1', 'arg2')
   * store.getMapper('user').emit('foo', 'arg1', 'arg2')
   *
   * @method Container#on
   * @param {string} event Name of event to subsribe to.
   * @param {Function} listener Listener function to handle the event.
   * @param {*} [ctx] Optional content in which to invoke the listener.
   * @since 3.0.0
   */

  /**
   * Used to bind to events emitted by mappers in this container.
   *
   * @method Container#_onMapperEvent
   * @param {string} name Name of the mapper that emitted the event.
   * @param {...*} [args] Args See {@link Mapper#emit}.
   * @private
   * @since 3.0.0
   */
  _onMapperEvent (name, ...args) {
    const type = args.shift()
    this.emit(type, name, ...args)
  },

  /**
   * Return a container scoped to a particular mapper.
   *
   * @example <caption>Container#as</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container()
   * const UserMapper = store.defineMapper('user')
   * const UserStore = store.as('user')
   *
   * const user1 = store.createRecord('user', { name: 'John' })
   * const user2 = UserStore.createRecord({ name: 'John' })
   * const user3 = UserMapper.createRecord({ name: 'John' })
   * console.log(user1 === user2)
   * console.log(user2 === user3)
   * console.log(user1 === user3)
   *
   * @method Container#as
   * @param {string} name Name of the {@link Mapper}.
   * @returns {Object} A container scoped to a particular mapper.
   * @since 3.0.0
   */
  as (name) {
    const props = {}
    const original = this
    proxiedMapperMethods.forEach(function (method) {
      props[method] = {
        writable: true,
        value (...args) {
          return original[method](name, ...args)
        }
      }
    })
    props.getMapper = {
      writable: true,
      value () {
        return original.getMapper(name)
      }
    }
    return Object.create(this, props)
  },

  /**
   * Create a new mapper and register it in this container.
   *
   * @example <caption>Container#defineMapper</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container({
   *   mapperDefaults: { foo: 'bar' }
   * })
   * // Container#defineMapper returns a direct reference to the newly created
   * // Mapper.
   * const UserMapper = store.defineMapper('user')
   * console.log(UserMapper === store.getMapper('user'))
   * console.log(UserMapper === store.as('user').getMapper())
   * console.log(UserMapper.foo)
   *
   * @method Container#defineMapper
   * @param {string} name Name under which to register the new {@link Mapper}.
   * {@link Mapper#name} will be set to this value.
   * @param {Object} [opts] Configuration options. Passed to
   * {@link Container#mapperClass} when creating the new {@link Mapper}.
   * @returns {Mapper} The newly created instance of {@link Mapper}.
   * @see Container#as
   * @since 3.0.0
   */
  defineMapper (name, opts) {
    // For backwards compatibility with defineResource
    if (utils.isObject(name)) {
      opts = name
      name = opts.name
    }
    if (!utils.isString(name)) {
      throw utils.err(`${DOMAIN}#defineMapper`, 'name')(400, 'string', name)
    }

    // Default values for arguments
    opts || (opts = {})
    // Set Mapper#name
    opts.name = name
    opts.relations || (opts.relations = {})

    // Check if the user is overriding the datastore's default mapperClass
    const mapperClass = opts.mapperClass || this.mapperClass
    delete opts.mapperClass

    // Apply the datastore's defaults to the options going into the mapper
    utils.fillIn(opts, this.mapperDefaults)

    // Instantiate a mapper
    const mapper = this._mappers[name] = new mapperClass(opts) // eslint-disable-line
    mapper.relations || (mapper.relations = {})
    // Make sure the mapper's name is set
    mapper.name = name
    // All mappers in this datastore will share adapters
    mapper._adapters = this.getAdapters()

    mapper.datastore = this

    mapper.on('all', (...args) => this._onMapperEvent(name, ...args))
    mapper.defineRelations()

    return mapper
  },

  defineResource (name, opts) {
    console.warn('DEPRECATED: defineResource is deprecated, use defineMapper instead')
    return this.defineMapper(name, opts)
  },

  /**
   * Return the registered adapter with the given name or the default adapter if
   * no name is provided.
   *
   * @method Container#getAdapter
   * @param {string} [name] The name of the adapter to retrieve.
   * @returns {Adapter} The adapter.
   * @since 3.0.0
   */
  getAdapter (name) {
    const adapter = this.getAdapterName(name)
    if (!adapter) {
      throw utils.err(`${DOMAIN}#getAdapter`, 'name')(400, 'string', name)
    }
    return this.getAdapters()[adapter]
  },

  /**
   * Return the name of a registered adapter based on the given name or options,
   * or the name of the default adapter if no name provided.
   *
   * @method Container#getAdapterName
   * @param {(Object|string)} [opts] The name of an adapter or options, if any.
   * @returns {string} The name of the adapter.
   * @since 3.0.0
   */
  getAdapterName (opts) {
    opts || (opts = {})
    if (utils.isString(opts)) {
      opts = { adapter: opts }
    }
    return opts.adapter || this.mapperDefaults.defaultAdapter
  },

  /**
   * Return the registered adapters of this container.
   *
   * @method Container#getAdapters
   * @returns {Adapter}
   * @since 3.0.0
   */
  getAdapters () {
    return this._adapters
  },

  /**
   * Return the mapper registered under the specified name.
   *
   * @example <caption>Container#getMapper</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container()
   * // Container#defineMapper returns a direct reference to the newly created
   * // Mapper.
   * const UserMapper = store.defineMapper('user')
   * console.log(UserMapper === store.getMapper('user'))
   * console.log(UserMapper === store.as('user').getMapper())
   * store.getMapper('profile') // throws Error, there is no mapper with name "profile"
   *
   * @method Container#getMapper
   * @param {string} name {@link Mapper#name}.
   * @returns {Mapper}
   * @since 3.0.0
   */
  getMapper (name) {
    const mapper = this.getMapperByName(name)
    if (!mapper) {
      throw utils.err(`${DOMAIN}#getMapper`, name)(404, 'mapper')
    }
    return mapper
  },

  /**
   * Return the mapper registered under the specified name.
   * Doesn't throw error if mapper doesn't exist.
   *
   * @example <caption>Container#getMapperByName</caption>
   * // import {Container} from 'js-data'
   * const JSData = require('js-data@3.0.0-rc.4')
   * const {Container} = JSData
   * console.log('Using JSData v' + JSData.version.full)
   *
   * const store = new Container()
   * // Container#defineMapper returns a direct reference to the newly created
   * // Mapper.
   * const UserMapper = store.defineMapper('user')
   * console.log(UserMapper === store.getMapper('user'))
   * console.log(UserMapper === store.as('user').getMapper())
   * console.log(store.getMapper('profile')) // Does NOT throw an error
   *
   * @method Container#getMapperByName
   * @param {string} name {@link Mapper#name}.
   * @returns {Mapper}
   * @since 3.0.0
   */
  getMapperByName (name) {
    return this._mappers[name]
  },

  /**
   * Register an adapter on this container under the given name. Adapters
   * registered on a container are shared by all mappers in the container.
   *
   * @example
   * import {Container} from 'js-data'
   * import {RethinkDBAdapter} from 'js-data-rethinkdb'
   * const store = new Container()
   * store.registerAdapter('rethinkdb', new RethinkDBAdapter(), { default: true })
   *
   * @method Container#registerAdapter
   * @param {string} name The name of the adapter to register.
   * @param {Adapter} adapter The adapter to register.
   * @param {Object} [opts] Configuration options.
   * @param {boolean} [opts.default=false] Whether to make the adapter the
   * default adapter for all Mappers in this container.
   * @since 3.0.0
   * @tutorial ["http://www.js-data.io/v3.0/docs/connecting-to-a-data-source","Connecting to a data source"]
   */
  registerAdapter (name, adapter, opts) {
    opts || (opts = {})
    this.getAdapters()[name] = adapter
    // Optionally make it the default adapter for the target.
    if (opts === true || opts.default) {
      this.mapperDefaults.defaultAdapter = name
      utils.forOwn(this._mappers, function (mapper) {
        mapper.defaultAdapter = name
      })
    }
  }
}

proxiedMapperMethods.forEach(function (method) {
  props[method] = function (name, ...args) {
    return this.getMapper(name)[method](...args)
  }
})

Component.extend(props)

/**
 * Create a subclass of this Container:
 * @example <caption>Container.extend</caption>
 * // Normally you would do: import {Container} from 'js-data'
 * const JSData = require('js-data@3.0.0-rc.4')
 * const {Container} = JSData
 * console.log('Using JSData v' + JSData.version.full)
 *
 * // Extend the class using ES2015 class syntax.
 * class CustomContainerClass extends Container {
 *   foo () { return 'bar' }
 *   static beep () { return 'boop' }
 * }
 * const customContainer = new CustomContainerClass()
 * console.log(customContainer.foo())
 * console.log(CustomContainerClass.beep())
 *
 * // Extend the class using alternate method.
 * const OtherContainerClass = Container.extend({
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const otherContainer = new OtherContainerClass()
 * console.log(otherContainer.foo())
 * console.log(OtherContainerClass.beep())
 *
 * // Extend the class, providing a custom constructor.
 * function AnotherContainerClass () {
 *   Container.call(this)
 *   this.created_at = new Date().getTime()
 * }
 * Container.extend({
 *   constructor: AnotherContainerClass,
 *   foo () { return 'bar' }
 * }, {
 *   beep () { return 'boop' }
 * })
 * const anotherContainer = new AnotherContainerClass()
 * console.log(anotherContainer.created_at)
 * console.log(anotherContainer.foo())
 * console.log(AnotherContainerClass.beep())
 *
 * @method Container.extend
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [props.constructor] Provide a custom constructor function
 * to be used as the subclass itself.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @returns {Constructor} Subclass of this Container class.
 * @since 3.0.0
 */
