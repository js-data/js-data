var DSUtils = require('../utils');

function Defaults() {

}

/**
 * @doc property
 * @id DSHttpAdapter.properties:defaults.queryTransform
 * @name defaults.queryTransform
 * @description
 * Transform the js-data query to something your server understands. You might just do this on the server instead.
 *
 * ## Example:
 * ```js
 * DSHttpAdapter.defaults.queryTransform = function (resourceName, params) {
 *   if (params && params.userId) {
 *     params.user_id = params.userId;
 *     delete params.userId;
 *   }
 *   return params;
 * };
 * ```
 *
 * @param {string} resourceName The name of the resource.
 * @param {object} params Params that will be passed to `http`.
 * @returns {*} By default just returns `params` as-is.
 */
Defaults.prototype.queryTransform = function (resourceName, params) {
  return params;
};

/**
 * @doc property
 * @id DSHttpAdapter.properties:defaults.httpConfig
 * @name defaults.httpConfig
 * @description
 * Default http configuration options used whenever `DSHttpAdapter` uses `http`.
 *
 * ## Example:
 * ```js
 * var dsHttpAdapter = new DSHttpAdapter({
 *   httpConfig: {
 *     headers: {
 *       Authorization: 'Basic YmVlcDpib29w'
 *     },
 *     timeout: 20000
 *   });
 * });
 * ```
 */
Defaults.prototype.httpConfig = {};

/**
 * @doc constructor
 * @id DSHttpAdapter
 * @name DSHttpAdapter
 * @description
 * Default adapter used by js-data. This adapter uses AJAX and JSON to send/retrieve data to/from a server.
 * Developers may provide custom adapters that implement the adapter interface.
 */
function DSHttpAdapter(options) {
  /**
   * @doc property
   * @id DSHttpAdapter.properties:defaults
   * @name defaults
   * @description
   * Reference to [DSHttpAdapter.defaults](/documentation/api/api/DSHttpAdapter.properties:defaults).
   */
  this.defaults = new Defaults();
  DSUtils.deepMixIn(this.defaults, options);
}

/**
 * @doc method
 * @id DSHttpAdapter.methods:HTTP
 * @name HTTP
 * @description
 * A wrapper for `http()`.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.HTTP(config)
 * ```
 *
 * @param {object} config Configuration object.
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.HTTP = function (config) {
  var start = new Date().getTime();
  config = DSUtils.deepMixIn(config, this.defaults.httpConfig);
  return DSUtils.http(config).then(function (data) {
    console.log(config.method + ' request:' + config.url + ' Time taken: ' + (new Date().getTime() - start) + 'ms', arguments);
    return data;
  });
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:GET
 * @name GET
 * @description
 * A wrapper for `http.get()`.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.GET(url[, config])
 * ```
 *
 * @param {string} url The url of the request.
 * @param {object=} config Optional configuration.
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.GET = function (url, config) {
  config = config || {};
  if (!('method' in config)) {
    config.method = 'get';
  }
  return this.HTTP(DSUtils.deepMixIn(config, {
    url: url
  }));
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:POST
 * @name POST
 * @description
 * A wrapper for `http.post()`.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.POST(url[, attrs][, config])
 * ```
 *
 * @param {string} url The url of the request.
 * @param {object=} attrs Request payload.
 * @param {object=} config Optional configuration.
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.POST = function (url, attrs, config) {
  config = config || {};
  if (!('method' in config)) {
    config.method = 'post';
  }
  return this.HTTP(DSUtils.deepMixIn(config, {
    url: url,
    data: attrs
  }));
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:PUT
 * @name PUT
 * @description
 * A wrapper for `http.put()`.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.PUT(url[, attrs][, config])
 * ```
 *
 * @param {string} url The url of the request.
 * @param {object=} attrs Request payload.
 * @param {object=} config Optional configuration.
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.PUT = function (url, attrs, config) {
  config = config || {};
  if (!('method' in config)) {
    config.method = 'put';
  }
  return this.HTTP(DSUtils.deepMixIn(config, {
    url: url,
    data: attrs || {}
  }));
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:DEL
 * @name DEL
 * @description
 * A wrapper for `http.delete()`.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.DEL(url[, config])
 * ```
 *
 * @param {string} url The url of the request.
 * @param {object=} config Optional configuration.
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.DEL = function (url, config) {
  config = config || {};
  if (!('method' in config)) {
    config.method = 'delete';
  }
  return this.HTTP(DSUtils.deepMixIn(config, {
    url: url
  }));
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:find
 * @name find
 * @description
 * Retrieve a single entity from the server.
 *
 * Makes a `GET` request.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.find(resourceConfig, id[, options])
 * ```
 *
 * @param {object} resourceConfig DS resource definition object:
 * @param {string|number} id Primary key of the entity to update.
 * @param {object=} options Optional configuration. Also passed along to `http([config])`. Properties:
 *
 * - `{string=}` - `baseUrl` - Override the default base url.
 * - `{string=}` - `endpoint` - Override the default endpoint.
 * - `{object=}` - `params` - Additional query string parameters to add to the url.
 *
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.find = function (resourceConfig, id, options) {
  options = options || {};
  return this.GET(
    DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.getEndpoint(id, options), id),
    options
  );
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:findAll
 * @name findAll
 * @description
 * Retrieve a collection of entities from the server.
 *
 * Makes a `GET` request.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.findAll(resourceConfig[, params][, options])
 * ```
 *
 * @param {object} resourceConfig DS resource definition object:
 * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
 * @param {object=} options Optional configuration. Also passed along to `http([config])`. Properties:
 *
 * - `{string=}` - `baseUrl` - Override the default base url.
 * - `{string=}` - `endpoint` - Override the default endpoint.
 * - `{object=}` - `params` - Additional query string parameters to add to the url.
 *
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.findAll = function (resourceConfig, params, options) {
  options = options || {};
  options.params = options.params || {};
  if (params) {
    params = this.defaults.queryTransform(resourceConfig.name, params);
    DSUtils.deepMixIn(options.params, params);
  }
  return this.GET(
    DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.getEndpoint(null, options)),
    options
  );
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:create
 * @name create
 * @description
 * Create a new entity on the server.
 *
 * Makes a `POST` request.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.create(resourceConfig, attrs[, options])
 * ```
 *
 * @param {object} resourceConfig DS resource definition object:
 * @param {object} attrs The attribute payload.
 * @param {object=} options Optional configuration. Also passed along to `http([config])`. Properties:
 *
 * - `{string=}` - `baseUrl` - Override the default base url.
 * - `{string=}` - `endpoint` - Override the default endpoint.
 * - `{object=}` - `params` - Additional query string parameters to add to the url.
 *
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.create = function (resourceConfig, attrs, options) {
  options = options || {};
  return this.POST(
    DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.getEndpoint(attrs, options)),
    attrs,
    options
  );
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:update
 * @name update
 * @description
 * Update an entity on the server.
 *
 * Makes a `PUT` request.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.update(resourceConfig, id, attrs[, options])
 * ```
 *
 * @param {object} resourceConfig DS resource definition object:
 * @param {string|number} id Primary key of the entity to update.
 * @param {object} attrs The attribute payload.
 * @param {object=} options Optional configuration. Also passed along to `http([config])`. Properties:
 *
 * - `{string=}` - `baseUrl` - Override the default base url.
 * - `{string=}` - `endpoint` - Override the default endpoint.
 * - `{object=}` - `params` - Additional query string parameters to add to the url.
 *
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.update = function (resourceConfig, id, attrs, options) {
  options = options || {};
  return this.PUT(
    DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.getEndpoint(id, options), id),
    attrs,
    options
  );
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:updateAll
 * @name updateAll
 * @description
 * Update a collection of entities on the server.
 *
 * Makes a `PUT` request.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.updateAll(resourceConfig, attrs[, params][, options])
 * ```
 *
 * @param {object} resourceConfig DS resource definition object:
 * @param {object} attrs The attribute payload.
 * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
 * @param {object=} options Optional configuration. Also passed along to `http([config])`. Properties:
 *
 * - `{string=}` - `baseUrl` - Override the default base url.
 * - `{string=}` - `endpoint` - Override the default endpoint.
 * - `{object=}` - `params` - Additional query string parameters to add to the url.
 *
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.updateAll = function (resourceConfig, attrs, params, options) {
  options = options || {};
  options.params = options.params || {};
  if (params) {
    params = this.defaults.queryTransform(resourceConfig.name, params);
    DSUtils.deepMixIn(options.params, params);
  }
  return this.PUT(
    DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.getEndpoint(null, options)),
    attrs,
    options
  );
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:destroy
 * @name destroy
 * @description
 * Delete an entity on the server.
 *
 * Makes a `DELETE` request.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.destroy(resourceConfig, id[, options)
 * ```
 *
 * @param {object} resourceConfig DS resource definition object:
 * @param {string|number} id Primary key of the entity to update.
 * @param {object=} options Optional configuration. Also passed along to `http([config])`. Properties:
 *
 * - `{string=}` - `baseUrl` - Override the default base url.
 * - `{string=}` - `endpoint` - Override the default endpoint.
 * - `{object=}` - `params` - Additional query string parameters to add to the url.
 *
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.destroy = function (resourceConfig, id, options) {
  options = options || {};
  return this.DEL(
    DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.getEndpoint(id, options), id),
    options
  );
};

/**
 * @doc method
 * @id DSHttpAdapter.methods:destroyAll
 * @name destroyAll
 * @description
 * Delete a collection of entities on the server.
 *
 * Makes `DELETE` request.
 *
 * ## Signature:
 * ```js
 * DSHttpAdapter.destroyAll(resourceConfig[, params][, options])
 * ```
 *
 * @param {object} resourceConfig DS resource definition object:
 * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
 * @param {object=} options Optional configuration. Also passed along to `http([config])`. Properties:
 *
 * - `{string=}` - `baseUrl` - Override the default base url.
 * - `{string=}` - `endpoint` - Override the default endpoint.
 * - `{object=}` - `params` - Additional query string parameters to add to the url.
 *
 * @returns {Promise} Promise.
 */
DSHttpAdapter.prototype.destroyAll = function (resourceConfig, params, options) {
  options = options || {};
  options.params = options.params || {};
  if (params) {
    params = this.defaults.queryTransform(resourceConfig.name, params);
    DSUtils.deepMixIn(options.params, params);
  }
  return this.DEL(
    DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.getEndpoint(null, options)),
    options
  );
};

module.exports = DSHttpAdapter;
