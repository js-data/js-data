import {fillIn, forOwn, isString, isObject, isSorN, makePath, resolve, reject} from '../utils'
import {configure} from './configure'

// TODO: Make actions part of the http adapter
export function action (name, opts) {
  if (!name || !isString(name)) {
    throw new TypeError('action(name[, opts]): Expected: string, Found: ' + typeof name)
  }
  return function (target) {
    if (target[name]) {
      throw new Error('action(name[, opts]): ' + name + ' already exists on target!')
    }
    opts.request = opts.request || function (config) { return config }
    opts.response = opts.response || function (response) { return response }
    opts.responseError = opts.responseError || function (err) { return reject(err) }
    target[name] = function (id, _opts) {
      if (isObject(id)) {
        _opts = id
      }
      _opts = _opts || {}
      let adapter = this.getAdapter(opts.adapter || this.defaultAdapter || 'http')
      let config = {}
      fillIn(config, opts)
      if (!_opts.hasOwnProperty('endpoint') && config.endpoint) {
        _opts.endpoint = config.endpoint
      }
      if (typeof _opts.getEndpoint === 'function') {
        config.url = _opts.getEndpoint(this, _opts)
      } else {
        let args = [
          _opts.basePath || this.basePath || adapter.defaults.basePath,
          adapter.getEndpoint(this, isSorN(id) ? id : null, _opts)
        ]
        if (isSorN(id)) {
          args.push(id)
        }
        args.push(opts.pathname || name)
        config.url = makePath.apply(null, args)
      }
      config.method = config.method || 'GET'
      config.modelName = this.name
      configure(config)(_opts)
      return resolve(config)
        .then(_opts.request || opts.request)
        .then(function (config) { return adapter.HTTP(config) })
        .then(function (data) {
          if (data && data.config) {
            data.config.modelName = this.name
          }
          return data
        })
        .then(_opts.response || opts.response, _opts.responseError || opts.responseError)
    }
    return target
  }
}

export function actions (opts) {
  opts || (opts = {})
  return function (target) {
    forOwn(target, function (value, key) {
      action(key, value)(target)
    })
    return target
  }
}
