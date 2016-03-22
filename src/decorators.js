import utils from './utils'

export const belongsToType = 'belongsTo'
export const hasManyType = 'hasMany'
export const hasOneType = 'hasOne'

function Relation (related, opts) {
  const self = this

  opts || (opts = {})

  const localField = opts.localField
  if (!localField) {
    throw new Error('localField is required')
  }

  const foreignKey = opts.foreignKey = opts.foreignKey || opts.localKey
  if (!foreignKey && (opts.type === belongsToType || opts.type === hasOneType)) {
    throw new Error('foreignKey is required')
  }
  const localKeys = opts.localKeys
  const foreignKeys = opts.foreignKeys
  if (!foreignKey && !localKeys && !foreignKeys && opts.type === hasManyType) {
    throw new Error('one of (foreignKey, localKeys, foreignKeys) is required')
  }

  if (utils.isString(related)) {
    opts.relation = related
    if (!utils.isFunction(opts.getRelation)) {
      throw new Error('you must provide a reference to the related mapper!')
    }
  } else if (related) {
    opts.relation = related.name
    Object.defineProperty(self, 'relatedMapper', {
      value: related
    })
  }

  utils.fillIn(self, opts)
}

utils.addHiddenPropsToTarget(Relation.prototype, {
  getRelation () {
    return this.relatedMapper
  },
  getLocalKeys (record) {

  },
  getForeignKey (record) {
    if (this.type === belongsToType) {
      return utils.get(record, this.foreignKey)
    }
    return utils.get(record, this.mapper.idAttribute)
  },
  setForeignKey (record, relatedRecord) {
    const self = this
    if (!record || !relatedRecord) {
      return
    }
    if (self.type === belongsToType) {
      utils.set(record, self.foreignKey, utils.get(relatedRecord, self.getRelation().idAttribute))
    } else {
      const idAttribute = self.mapper.idAttribute
      if (utils.isArray(relatedRecord)) {
        relatedRecord.forEach(function (relatedRecordItem) {
          utils.set(relatedRecordItem, self.foreignKey, utils.get(record, idAttribute))
        })
      } else {
        utils.set(relatedRecord, self.foreignKey, utils.get(record, idAttribute))
      }
    }
  },
  getLocalField (record) {
    return utils.get(record, this.localField)
  },
  setLocalField (record, data) {
    return utils.set(record, this.localField, data)
  }
})

const relatedTo = function (mapper, related, opts) {
  opts || (opts = {})
  if (!opts.type) {
    throw new Error('must specify relation type!')
  }
  opts.mapper = mapper
  opts.name = mapper.name
  const relation = new Relation(related, opts)

  mapper.relationList || Object.defineProperty(mapper, 'relationList', { value: [] })
  mapper.relationFields || Object.defineProperty(mapper, 'relationFields', { value: [] })
  mapper.relationList.push(relation)
  mapper.relationFields.push(relation.localField)
}

/**
 * TODO
 *
 * @name module:js-data.belongsTo
 * @method
 * @param {Mapper} related The relation the target belongs to.
 * @param {Object} opts Configuration options.
 * @param {string} opts.foreignKey The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export const belongsTo = function (related, opts) {
  opts || (opts = {})
  opts.type = belongsToType
  return function (target) {
    relatedTo(target, related, opts)
  }
}

/**
 * TODO
 *
 * @name module:js-data.hasMany
 * @method
 * @param {Mapper} related The relation of which the target has many.
 * @param {Object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export const hasMany = function (related, opts) {
  opts || (opts = {})
  opts.type = hasManyType
  return function (target) {
    relatedTo(target, related, opts)
  }
}

/**
 * TODO
 *
 * @name module:js-data.hasOne
 * @method
 * @param {Mapper} related The relation of which the target has one.
 * @param {Object} opts Configuration options.
 * @param {string} [opts.foreignKey] The field that holds the primary key of the
 * related record.
 * @param {string} opts.localField The field that holds a reference to the
 * related record object.
 * @return {Function} Invocation function, which accepts the target as the only
 * parameter.
 */
export const hasOne = function (related, opts) {
  opts || (opts = {})
  opts.type = hasOneType
  return function (target) {
    relatedTo(target, related, opts)
  }
}
