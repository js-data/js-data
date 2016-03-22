import utils from './utils'
import Component from './Component'

/**
 * js-data's Record class.
 *
 * ```javascript
 * import {Record} from 'js-data'
 * ```
 *
 * @class Record
 * @extends Component
 * @param {Object} [props] The initial properties of the new Record instance.
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
 * initial properties.
 */
const Record = Component.extend({
  constructor: function Record (props, opts) {
    const self = this
    utils.classCallCheck(self, Record)

    props || (props = {})
    opts || (opts = {})
    const _props = {}
    Object.defineProperties(self, {
      _get: {
        enumerable: false,
        value (key) {
          return utils.get(_props, key)
        }
      },
      _set: {
        enumerable: false,
        value (key, value) {
          return utils.set(_props, key, value)
        }
      },
      _unset: {
        enumerable: false,
        value (key) {
          return utils.unset(_props, key)
        }
      }
    })
    const _set = self._set
    // TODO: Optimize these strings
    _set('creating', true)
    if (opts.noValidate) {
      _set('noValidate', true)
    }
    utils.fillIn(self, props)
    _set('creating', false)
    _set('noValidate', false)
    _set('previous', utils.copy(props))
  },

  /**
   * TODO
   *
   * @name Record#_mapper
   * @method
   * @ignore
   */
  _mapper () {
    if (!this.constructor.mapper) {
      throw new Error('This recordClass has no Mapper!')
    }
    return this.constructor.mapper
  },

  /**
   * TODO
   *
   * @name Record#afterLoadRelations
   * @method
   * @param {string[]} relations TODO
   * @param {Object} opts TODO
   */
  afterLoadRelations () {},

  /**
   * TODO
   *
   * @name Record#afterSave
   * @method
   * @param {Object} opts TODO
   */
  afterSave () {},

  /**
   * TODO
   *
   * @name Record#beforeLoadRelations
   * @method
   * @param {string[]} relations TODO
   * @param {Object} opts TODO
   */
  beforeLoadRelations () {},

  /**
   * TODO
   *
   * @name Record#beforeSave
   * @method
   * @param {Object} opts TODO
   */
  beforeSave () {},

  /**
   * Return changes to this record since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @name Record#changes
   * @method
   * @param [opts] Configuration options.
   * @param {Function} [opts.equalsFn] Equality function. Default uses `===`.
   * @param {Array} [opts.ignore] Array of strings or RegExp of fields to ignore.
   */
  changes (opts) {
    const self = this
    opts || (opts = {})
    return utils.diffObjects(self, self._get('previous'), opts)
  },

  /**
   * TODO
   *
   * @name Record#commit
   * @method
   */
  commit () {
    const self = this
    self._set('changed') // unset
    self._set('previous', utils.copy(self))
    return self
  },

  /**
   * TODO
   *
   * @name Record#create
   * @method
   * @param {Object} [opts] Configuration options. See {@link Mapper#create}.
   */
  create (opts) {
    return this._mapper().create(this, opts)
  },

  /**
   * TODO
   *
   * @name Record#destroy
   * @method
   * @param {Object} [opts] Configuration options. @see {@link Model.destroy}.
   */
  destroy (opts) {
    // TODO: move actual destroy logic here
    const mapper = this._mapper()
    return mapper.destroy(utils.get(this, mapper.idAttribute), opts)
  },

  /**
   * Return the value at the given path for this instance.
   *
   * @name Record#get
   * @method
   * @param {string} key - Path of value to retrieve.
   * @return {*} Value at path.
   */
  'get' (key) {
    return utils.get(this, key)
  },

  /**
   * Return whether this record has changed since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @name Record#hasChanges
   * @method
   * @param [opts] Configuration options.
   * @param {Function} [opts.equalsFn] Equality function. Default uses `===`.
   * @param {Array} [opts.ignore] Array of strings or RegExp of fields to ignore.
   */
  hasChanges (opts) {
    const self = this
    const quickHasChanges = !!(self._get('changed') || []).length
    return quickHasChanges || utils.areDifferent(self, self._get('previous'), opts)
  },

  /**
   * TODO
   *
   * @name Record#hashCode
   * @method
   */
  hashCode () {
    const self = this
    return utils.get(self, self._mapper().idAttribute)
  },

  /**
   * TODO
   *
   * @name Record#loadRelations
   * @method
   * @param {string[]} [relations] TODO
   * @param {Object} [opts] TODO
   */
  loadRelations (relations, opts) {
    let op
    const self = this
    const mapper = self._mapper()
    const relationList = mapper.relationList || []

    // Default values for arguments
    relations || (relations = [])
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(mapper, opts)
    opts.adapter = mapper.getAdapterName(opts)

    // beforeLoadRelations lifecycle hook
    op = opts.op = 'beforeLoadRelations'
    return utils.resolve(self[op](relations, opts)).then(function () {
      if (utils.isString(relations)) {
        relations = [relations]
      }
      // Now delegate to the adapter
      op = opts.op = 'loadRelations'
      mapper.dbg(op, self, relations, opts)
      return Promise.all(relationList.map(function (def) {
        if (utils.isFunction(def.load)) {
          return def.load(mapper, def, self, opts)
        }
        let task
        if (def.type === 'hasMany' && def.foreignKey) {
          // hasMany
          task = def.getRelation().findAll({
            [def.foreignKey]: utils.get(self, mapper.idAttribute)
          }, opts)
        } else if (def.foreignKey) {
          // belongsTo or hasOne
          const key = utils.get(self, def.foreignKey)
          if (utils.isSorN(key)) {
            task = def.getRelation().find(key, opts)
          }
        } else if (def.localKeys) {
          // hasMany
          task = def.getRelation().findAll({
            [def.getRelation().idAttribute]: {
              'in': utils.get(self, def.localKeys)
            }
          }, opts)
        } else if (def.foreignKeys) {
          // hasMany
          task = def.getRelation().findAll({
            [def.getRelation().idAttribute]: {
              'contains': utils.get(self, mapper.idAttribute)
            }
          }, opts)
        }
        if (task) {
          task = task.then(function (data) {
            if (opts.raw) {
              data = data.data
            }
            utils.set(self, def.localField, def.type === 'hasOne' ? (data.length ? data[0] : undefined) : data)
          })
        }
        return task
      }))
    }).then(function () {
      // afterLoadRelations lifecycle hook
      op = opts.op = 'afterLoadRelations'
      return utils.resolve(self[op](relations, opts)).then(function () {
        return self
      })
    })
  },

  /**
   * TODO
   *
   * @name Record#previous
   * @method
   * @param {string} [key] TODO
   */
  previous (key) {
    const self = this
    if (key) {
      return self._get(`previous.${key}`)
    }
    return self._get('previous')
  },

  /**
   * TODO
   *
   * @name Record#revert
   * @method
   * @param {Object} [opts] Configuration options.
   */
  revert (opts) {
    const self = this
    const previous = self._get('previous') || {}
    opts || (opts = {})
    opts.preserve || (opts.preserve = [])
    utils.forOwn(self, (value, key) => {
      if (key !== self._mapper().idAttribute && !previous.hasOwnProperty(key) && self.hasOwnProperty(key) && opts.preserve.indexOf(key) === -1) {
        delete self[key]
      }
    })
    utils.forOwn(previous, (value, key) => {
      if (opts.preserve.indexOf(key) === -1) {
        self[key] = value
      }
    })
    self.commit()
    return self
  },

  /**
   * TODO
   *
   * @name Record#save
   * @method
   * @param {Object} [opts] Configuration options. See {@link Mapper#create}.
   */
  save (opts) {
    let op, adapter
    const self = this
    const mapper = self._mapper()

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    utils._(self, opts)
    adapter = opts.adapter = mapper.getAdapterName(opts)

    // beforeSave lifecycle hook
    op = opts.op = 'beforeSave'
    return utils.resolve(self[op](opts)).then(function () {
      // Now delegate to the adapter
      op = opts.op = 'save'
      mapper.dbg(op, self, opts)
      return mapper.getAdapter(adapter)[op](mapper, self, opts)
    }).then(function (data) {
      // afterSave lifecycle hook
      op = opts.op = 'afterSave'
      return utils.resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          self.set(data.data)
          data.data = self
        } else {
          self.set(data)
        }
        return mapper.end(data, opts)
      })
    })
  },

  /**
   * Set the value for a given key, or the values for the given keys if "key" is
   * an object.
   *
   * @name Record#set
   * @method
   * @param {(string|Object)} key - Key to set or hash of key-value pairs to set.
   * @param {*} [value] - Value to set for the given key.
   * @param {Object} [opts] - Optional configuration.
   * @param {boolean} [opts.silent=false] - Whether to trigger change events.
   */
  'set' (key, value, opts) {
    const self = this
    if (utils.isObject(key)) {
      opts = value
    }
    opts || (opts = {})
    if (opts.silent) {
      self._set('silent', true)
    }
    utils.set(self, key, value)
    if (!self._get('eventId')) {
      self._set('silent') // unset
    }
  },

  // TODO: move logic for single-item async operations onto the instance.

  /**
   * Return a plain object representation of this record. If the class from
   * which this record was created has a mapper, then {@link Mapper#toJSON} will
   * be called instead.
   *
   * @name Record#toJSON
   * @method
   * @param {Object} [opts] Configuration options.
   * @param {string[]} [opts.with] Array of relation names or relation fields
   * to include in the representation. Only available as an option if the class
   * from which this record was created has a mapper.
   * @return {Object} Plain object representation of this record.
   */
  toJSON (opts) {
    const mapper = this.constructor.mapper
    if (mapper) {
      return mapper.toJSON(this, opts)
    } else {
      const json = {}
      utils.forOwn(this, function (prop, key) {
        json[key] = utils.copy(prop)
      })
      return json
    }
  },

  /**
   * Unset the value for a given key.
   *
   * @name Record#unset
   * @method
   * @param {string} key - Key to unset.
   * @param {Object} [opts] - Optional configuration.
   * @param {boolean} [opts.silent=false] - Whether to trigger change events.
   */
  unset (key, opts) {
    this.set(key, undefined, opts)
  }
})

/**
 * Allow records to emit events.
 *
 * An record's registered listeners are stored in the record's private data.
 */
utils.eventify(
  Record.prototype,
  function () {
    return this._get('events')
  },
  function (value) {
    this._set('events', value)
  }
)

export default Record
