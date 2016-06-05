import utils from './utils'

// TODO: remove this when the rest of the project is cleaned
export const belongsToType = 'belongsTo'
export const hasManyType = 'hasMany'
export const hasOneType = 'hasOne'

const DOMAIN = 'Relation'

export function Relation (relatedMapper, options = {}) {
  utils.classCallCheck(this, Relation)

  options.type = this.constructor.TYPE_NAME
  this.validateOptions(relatedMapper, options)

  if (typeof relatedMapper === 'object') {
    Object.defineProperty(this, 'relatedMapper', { value: relatedMapper })
  }

  Object.defineProperty(this, 'inverse', { writable: true })
  utils.fillIn(this, options)
}

Relation.extend = utils.extend

utils.addHiddenPropsToTarget(Relation.prototype, {
  get canAutoAddLinks() {
    return utils.isUndefined(this.add) || !!this.add
  },

  get relatedCollection() {
    return this.mapper.datastore.getCollection(this.relation)
  },

  validateOptions (related, opts) {
    const DOMAIN_ERR = `new ${DOMAIN}`

    const localField = opts.localField
    if (!localField) {
      throw utils.err(DOMAIN_ERR, 'opts.localField')(400, 'string', localField)
    }

    const foreignKey = opts.foreignKey = opts.foreignKey || opts.localKey
    if (!foreignKey && (opts.type === belongsToType || opts.type === hasOneType)) {
      throw utils.err(DOMAIN_ERR, 'opts.foreignKey')(400, 'string', foreignKey)
    }

    if (utils.isString(related)) {
      opts.relation = related
      if (!utils.isFunction(opts.getRelation)) {
        throw utils.err(DOMAIN_ERR, 'opts.getRelation')(400, 'function', opts.getRelation)
      }
    } else if (related) {
      opts.relation = related.name
    } else {
      throw utils.err(DOMAIN_ERR, 'related')(400, 'Mapper or string', related)
    }
  },

  assignTo (mapper) {
    this.name = mapper.name
    Object.defineProperty(this, 'mapper', { value: mapper })

    mapper.relationList || Object.defineProperty(mapper, 'relationList', { value: [] })
    mapper.relationFields || Object.defineProperty(mapper, 'relationFields', { value: [] })
    mapper.relationList.push(this)
    mapper.relationFields.push(this.localField)
  },

  canFindLinkFor() {
    return Boolean(this.foreignKey || this.localKey)
  },

  getRelation () {
    return this.relatedMapper
  },

  getForeignKey (record) {
    return utils.get(record, this.mapper.idAttribute)
  },

  setForeignKey (record, relatedRecord) {
    if (!record || !relatedRecord) {
      return
    }

    this._setForeignKey(record, relatedRecord)
  },

  _setForeignKey (record, relatedRecord) {
    const idAttribute = this.mapper.idAttribute

    if (!utils.isArray(relatedRecord)) {
      relatedRecord = [relatedRecord]
    }

    relatedRecord.forEach((relatedRecordItem) => {
      utils.set(relatedRecordItem, this.foreignKey, utils.get(record, idAttribute))
    })
  },

  getLocalField (record) {
    return utils.get(record, this.localField)
  },

  setLocalField (record, data) {
    return utils.set(record, this.localField, data)
  },

  getInverse (mapper) {
    if (!this.inverse) {
      this.findInverseRelation(mapper)
    }

    return this.inverse
  },

  findInverseRelation (mapper) {
    this.getRelation().relationList.forEach((def) => {
      if (def.getRelation() === mapper && this.isInversedTo(def)) {
        this.inverse = def
        return true
      }
    })
  },

  isInversedTo (def) {
    return !def.foreignKey || def.foreignKey === this.foreignKey
  },

  linkRecords (relatedMapper, records) {
    const datastore = this.mapper.datastore

    records.forEach((record) => {
      let relatedData = this.getLocalField(record)

      if (utils.isFunction(this.add)) {
        relatedData = this.add(datastore, this, record)
      } else if (relatedData) {
        relatedData = this.linkRecord(record, relatedData)
      }

      const isEmptyLinks = !relatedData || utils.isArray(relatedData) && !relatedData.length

      if (isEmptyLinks && this.canFindLinkFor(record)) {
        relatedData = this.findExistingLinksFor(relatedMapper, record)
      }

      if (relatedData) {
        this.setLocalField(record, relatedData)
      }
    })
  },

  linkRecord (record, relatedRecord) {
    const relatedId = utils.get(relatedRecord, this.mapper.idAttribute)

    if (relatedRecord !== this.relatedCollection.get(relatedId)) {
      this.setForeignKey(record, relatedRecord)

      if (this.canAutoAddLinks) {
        relatedRecord = this.relatedCollection.add(relatedRecord)
      }
    }

    return relatedRecord
  },

  findExistingLinksByForeignKey (foreignId) {
    return this.relatedCollection.filter({
      [this.foreignKey]: foreignId
    })
  }
})
