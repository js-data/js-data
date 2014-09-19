var DS = require('./datastore');

/**
 * @doc overview
 * @id js-data
 * @name js-data
 * @description
 * __Version:__ 0.0.1
 *
 * ## Install
 *
 * `bower install --save js-data` or `npm install --save js-data`
 *
 * #### Manual download
 * Download js-data from the [Releases](https://github.com/js-data/js-data/releases) section of the js-data GitHub project.
 *
 * - `DS`
 * - `DSHttpAdapter`
 * - `DSLocalStorageAdapter`
 * - `DSUtils`
 * - `DSErrors`
 *
 * [DS](/documentation/api/api/DS) is the Data Store itself, which you will inject often.
 * [DSHttpAdapter](/documentation/api/api/DSHttpAdapter) is useful as a wrapper for `http` and is configurable.
 * [DSLocalStorageAdapter](/documentation/api/api/DSLocalStorageAdapter) is useful as a wrapper for `localStorage` and is configurable.
 * [DSUtils](/documentation/api/api/DSUtils) has some useful utility methods.
 * [DSErrors](/documentation/api/api/DSErrors) provides references to the various errors thrown by the data store.
 */
module.exports = {
  DS: DS,
  createStore: function () {
    return new DS();
  },
  DSUtils: require('./utils'),
  DSErrors: require('./errors')
};
