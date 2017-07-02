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
  get canAutoAddLinks () {
    return this.add === undefined || !!this.add
  },

  get relatedCollection () {
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

  canFindLinkFor () {
    return !!(this.foreignKey || this.localKey)
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

  _setForeignKey (record, relatedRecords) {
    const idAttribute = this.mapper.idAttribute

    if (!utils.isArray(relatedRecords)) {
      relatedRecords = [relatedRecords]
    }

    relatedRecords.forEach((relatedRecord) => {
      utils.set(relatedRecord, this.foreignKey, utils.get(record, idAttribute))
    })
  },

  getLocalField (record) {
    return utils.get(record, this.localField)
  },

  setLocalField (record, relatedData) {
    return utils.set(record, this.localField, relatedData)
  },

  getInverse (mapper) {
    if (!this.inverse) {
      this.findInverseRelation(mapper)
    }

    return this.inverse
  },

  findInverseRelation (mapper) {
    this.getRelation().relationList.forEach((def) => {
      if (def.getRelation() === mapper && this.isInversedTo(def) && this !== def) {
        this.inverse = def
        return true
      }
    })
  },

  isInversedTo (def) {
    return !def.foreignKey || def.foreignKey === this.foreignKey
  },

  addLinkedRecords (records) {
    const datastore = this.mapper.datastore

    records.forEach((record) => {
      let relatedData = this.getLocalField(record)

      if (utils.isFunction(this.add)) {
        relatedData = this.add(datastore, this, record)
      } else if (relatedData) {
        relatedData = this.linkRecord(record, relatedData)
      }

      const isEmptyLinks = !relatedData || (utils.isArray(relatedData) && !relatedData.length)

      if (isEmptyLinks && this.canFindLinkFor(record)) {
        relatedData = this.findExistingLinksFor(record)
      }

      if (relatedData) {
        this.setLocalField(record, relatedData)
      }
    })
  },

  removeLinkedRecords (relatedMapper, records) {
    const localField = this.localField
    records.forEach((record) => {
      utils.set(record, localField, undefined)
    })
  },

  linkRecord (record, relatedRecord) {
    const relatedId = utils.get(relatedRecord, this.mapper.idAttribute)

    if (relatedId === undefined) {
      const unsaved = this.relatedCollection.unsaved()
      if (unsaved.indexOf(relatedRecord) === -1) {
        if (this.canAutoAddLinks) {
          relatedRecord = this.relatedCollection.add(relatedRecord)
        }
      }
    } else {
      if (relatedRecord !== this.relatedCollection.get(relatedId)) {
        this.setForeignKey(record, relatedRecord)

        if (this.canAutoAddLinks) {
          relatedRecord = this.relatedCollection.add(relatedRecord)
        }
      }
    }

    return relatedRecord
  },

  // e.g. user hasMany post via "foreignKey", so find all posts of user
  findExistingLinksByForeignKey (id) {
    if (id === undefined || id === null) {
      return
    }
    return this.relatedCollection.filter({
      [this.foreignKey]: id
    })
  },

  ensureLinkedDataHasProperType (props, opts) {
    const relatedMapper = this.getRelation()
    const relationData = this.getLocalField(props)

    if (utils.isArray(relationData) && (!relationData.length || relatedMapper.is(relationData[0]))) {
      return
    }

    if (relationData && !relatedMapper.is(relationData)) {
      utils.set(props, this.localField, relatedMapper.createRecord(relationData, opts))
    }
  },

  isRequiresParentId () {
    return false
  },

  isRequiresChildId () {
    return false
  },

  createChildRecord (props, relationData, opts) {
    this.setForeignKey(props, relationData)

    return this.createLinked(relationData, opts).then((result) => {
      this.setLocalField(props, result)
    })
  },

  createLinked (props, opts) {
    const create = utils.isArray(props) ? 'createMany' : 'create'

    return this.getRelation()[create](props, opts)
  }
})
