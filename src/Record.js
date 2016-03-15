import _ from './utils'

/**
 * js-data's Record class.
 *
 * ```javascript
 * import {Record} from 'js-data'
 * ```
 *
 * @class Record
 * @param {Object} [props] The initial properties of the new Record instance.
 * @param {Object} [opts] Configuration options.
 * @param {boolean} [opts.noValidate=false] Whether to skip validation on the
 * initial properties.
 */
export default function Record (props, opts) {
  const self = this
  _.classCallCheck(self, Record)

  props || (props = {})
  opts || (opts = {})
  const _props = {}
  Object.defineProperties(self, {
    _get: {
      value (key) {
        return _.get(_props, key)
      }
    },
    _set: {
      value (key, value) {
        return _.set(_props, key, value)
      }
    },
    _unset: {
      value (key) {
        return _.unset(_props, key)
      }
    }
  })
  const _set = self._set
  // TODO: Optimize these strings
  _set('creating', true)
  if (opts.noValidate) {
    _set('noValidate', true)
  }
  _.fillIn(self, props)
  _set('creating') // unset
  _set('noValidate') // unset
  _set('previous', _.copy(props))
}

/**
 * Create a Record subclass.
 *
 * ```javascript
 * var MyRecord = Record.extend({
 *   foo: function () { return 'bar' }
 * })
 * var record = new MyRecord()
 * record.foo() // "bar"
 * ```
 *
 * @name Record.extend
 * @method
 * @param {Object} [props={}] Properties to add to the prototype of the
 * subclass.
 * @param {Object} [classProps={}] Static properties to add to the subclass.
 * @return {Function} Subclass of Record.
 */
Record.extend = _.extend

_.addHiddenPropsToTarget(Record.prototype, {
  /**
   * TODO
   *
   * @name Record#_mapper
   * @method
   * @ignore
   */
  _mapper () {
    if (!this.constructor.Mapper) {
      throw new Error('This RecordClass has no Mapper!')
    }
    return this.constructor.Mapper
  },

  /**
   * Return the value at the given path for this instance.
   *
   * @name Record#get
   * @method
   * @param {string} key - Path of value to retrieve.
   * @return {*} Value at path.
   */
  get: function (key) {
    return _.get(this, key)
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
  set: function (key, value, opts) {
    const self = this
    if (_.isObject(key)) {
      opts = value
    }
    opts || (opts = {})
    if (opts.silent) {
      self._set('silent', true)
    }
    _.set(self, key, value)
    if (!self._get('eventId')) {
      self._set('silent') // unset
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
  },

  /**
   * TODO
   *
   * @name Record#hashCode
   * @method
   */
  hashCode () {
    const self = this
    return _.get(self, self._mapper().idAttribute)
  },

  /**
   * Return changes to this record since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @name Record#changes
   * @method
   * @param {Function} [equalsFn] Equality function. Default uses `===`.
   * @param {Array} [ignore] Array of strings or RegExp of fields to ignore.
   */
  changes (equalsFn, ignore) {
    const self = this
    return _.diffObjects(self, self._get('previous'), equalsFn, ignore)
  },

  /**
   * Return whether this record has changed since it was instantiated or
   * {@link Record#commit} was called.
   *
   * @name Record#hasChanges
   * @method
   * @param {Function} [equalsFn] Equality function. Default uses `===`.
   * @param {Array} [ignore] Array of strings or RegExp of fields to ignore.
   */
  hasChanges (equalsFn, ignore) {
    const self = this
    const quickHasChanges = !!(self._get('changed') || []).length
    return quickHasChanges || _.areDifferent(self, self._get('previous'), equalsFn, ignore)
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
    self._set('previous', _.copy(self))
    return self
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
    _.forOwn(self, (value, key) => {
      if (key !== self._mapper().idAttribute && !previous.hasOwnProperty(key) && self.hasOwnProperty(key) && opts.preserve.indexOf(key) === -1) {
        delete self[key]
      }
    })
    _.forOwn(previous, (value, key) => {
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
   * @name Record#schema
   * @method
   * @param {string} [key] TODO
   */
  schema (key) {
    let _schema = this._mapper().schema
    return key ? _schema[key] : _schema
  },

  // validate (obj, value) {
  //   let errors = []
  //   let _schema = this.schema()
  //   if (!obj) {
  //     obj = this
  //   } else if (utils.isString(obj)) {
  //     const prop = _schema[obj]
  //     if (prop) {
  //       errors = validate.validate(prop, value) || []
  //     }
  //   } else {
  //     utils. _.forOwn(_schema, function (prop, key) {
  //       errors = errors.concat(validate.validate(prop, utils.get(obj, key)) || [])
  //     })
  //   }
  //   return errors.length ? errors : undefined
  // },

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
   * @name Record#beforeSave
   * @method
   * @param {Object} opts TODO
   */
  beforeSave () {},

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
    const Mapper = self._mapper()

    // Default values for arguments
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    _._(self, opts)
    adapter = opts.adapter = self.getAdapterName(opts)

    // beforeSave lifecycle hook
    op = opts.op = 'beforeSave'
    return _.resolve(self[op](opts)).then(function () {
      // Now delegate to the adapter
      op = opts.op = 'save'
      Mapper.dbg(op, self, opts)
      return self.getAdapter(adapter)[op](Mapper, self, opts)
    }).then(function (data) {
      // afterSave lifecycle hook
      op = opts.op = 'afterSave'
      return _.resolve(self[op](data, opts)).then(function (_data) {
        // Allow for re-assignment from lifecycle hook
        data = _data || data
        if (opts.raw) {
          self.set(data.data)
          data.data = self
        } else {
          self.set(data)
        }
        return Mapper.end(data, opts)
      })
    })
  },

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
   * @name Record#loadRelations
   * @method
   * @param {string[]} [relations] TODO
   * @param {Object} [opts] TODO
   */
  loadRelations (relations, opts) {
    let op
    const self = this
    const Mapper = self._mapper()
    const relationList = Mapper.relationList || []

    // Default values for arguments
    relations || (relations = [])
    opts || (opts = {})

    // Fill in "opts" with the Model's configuration
    _._(Mapper, opts)
    opts.adapter = Mapper.getAdapterName(opts)

    // beforeLoadRelations lifecycle hook
    op = opts.op = 'beforeLoadRelations'
    return _.resolve(self[op](relations, opts)).then(function () {
      if (_.isString(relations)) {
        relations = [relations]
      }
      // Now delegate to the adapter
      op = opts.op = 'loadRelations'
      Mapper.dbg(op, self, relations, opts)
      return Promise.all(relationList.map(function (def) {
        if (_.isFunction(def.load)) {
          return def.load(Mapper, def, self, opts)
        }
        let task
        if (def.type === 'hasMany' && def.foreignKey) {
          // hasMany
          task = def.getRelation().findAll({
            [def.foreignKey]: _.get(self, Mapper.idAttribute)
          }, opts)
        } else if (def.foreignKey) {
          // belongsTo or hasOne
          const key = _.get(self, def.foreignKey)
          if (_.isSorN(key)) {
            task = def.getRelation().find(key, opts)
          }
        } else if (def.localKeys) {
          // hasMany
          task = def.getRelation().findAll({
            [def.getRelation().idAttribute]: {
              'in': _.get(self, def.localKeys)
            }
          }, opts)
        } else if (def.foreignKeys) {
          // hasMany
          task = def.getRelation().findAll({
            [def.getRelation().idAttribute]: {
              'contains': _.get(self, Mapper.idAttribute)
            }
          }, opts)
        }
        if (task) {
          task = task.then(function (data) {
            if (opts.raw) {
              data = data.data
            }
            _.set(self, def.localField, def.type === 'hasOne' ? (data.length ? data[0] : undefined) : data)
          })
        }
        return task
      }))
    }).then(function () {
      // afterLoadRelations lifecycle hook
      op = opts.op = 'afterLoadRelations'
      return _.resolve(self[op](relations, opts)).then(function () {
        return self
      })
    })
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
   * @name Record#destroy
   * @method
   * @param {Object} [opts] Configuration options. @see {@link Model.destroy}.
   */
  destroy (opts) {
    // TODO: move actual destroy logic here
    const Mapper = this._mapper()
    return Mapper.destroy(_.get(this, Mapper.idAttribute), opts)
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
    const mapper = this.constructor.Mapper
    if (mapper) {
      return mapper.toJSON(this, opts)
    } else {
      const json = {}
      _.forOwn(this, function (prop, key) {
        json[key] = _.copy(prop)
      })
      return json
    }
  }
})

/**
 * Register a new event listener on this Record.
 *
 * @name Record#on
 * @method
 */

/**
 * Remove an event listener from this Record.
 *
 * @name Record#off
 * @method
 */

/**
 * Trigger an event on this Record.
 *
 * @name Record#emit
 * @method
 * @param {string} event Name of event to emit.
 */

/**
 * Allow records to emit events.
 *
 * An record's registered listeners are stored in the record's private data.
 */
_.eventify(
  Record.prototype,
  function () {
    return this._get('events')
  },
  function (value) {
    this._set('events', value)
  }
)
