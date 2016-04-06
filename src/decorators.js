import utils from './utils'

export const belongsToType = 'belongsTo'
export const hasManyType = 'hasMany'
export const hasOneType = 'hasOne'

const DOMAIN = 'Relation'

function Relation (related, opts) {
  const self = this
  const DOMAIN_ERR = `new ${DOMAIN}`

  opts || (opts = {})

  const localField = opts.localField
  if (!localField) {
    throw utils.err(DOMAIN_ERR, 'opts.localField')(400, 'string', localField)
  }

  const foreignKey = opts.foreignKey = opts.foreignKey || opts.localKey
  if (!foreignKey && (opts.type === belongsToType || opts.type === hasOneType)) {
    throw utils.err(DOMAIN_ERR, 'opts.foreignKey')(400, 'string', foreignKey)
  }
  const localKeys = opts.localKeys
  const foreignKeys = opts.foreignKeys
  if (!foreignKey && !localKeys && !foreignKeys && opts.type === hasManyType) {
    throw utils.err(DOMAIN_ERR, 'opts.<foreignKey|localKeys|foreignKeys>')(400, 'string', foreignKey)
  }

  if (utils.isString(related)) {
    opts.relation = related
    if (!utils.isFunction(opts.getRelation)) {
      throw utils.err(DOMAIN_ERR, 'opts.getRelation')(400, 'function', opts.getRelation)
    }
  } else if (related) {
    opts.relation = related.name
    Object.defineProperty(self, 'relatedMapper', {
      value: related
    })
  } else {
    throw utils.err(DOMAIN_ERR, 'related')(400, 'Mapper or string', related)
  }

  Object.defineProperty(self, 'inverse', {
    value: undefined,
    writable: true
  })

  utils.fillIn(self, opts)
}

utils.addHiddenPropsToTarget(Relation.prototype, {
  getRelation () {
    return this.relatedMapper
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
  },
  getInverse (mapper) {
    const self = this
    if (self.inverse) {
      return self.inverse
    }
    self.getRelation().relationList.forEach(function (def) {
      if (def.getRelation() === mapper) {
        if (def.foreignKey && def.foreignKey !== self.foreignKey) {
          return
        }
        self.inverse = def
        return false
      }
    })
    return self.inverse
  }
})

const relatedTo = function (mapper, related, opts) {
  opts.name = mapper.name
  const relation = new Relation(related, opts)
  Object.defineProperty(relation, 'mapper', {
    value: mapper
  })

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
