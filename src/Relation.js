import utils from './utils'

const DOMAIN = 'Relation'

// TODO: remove this when the rest of the project is cleaned
export const belongsToType = 'belongsTo'
export const hasManyType = 'hasMany'
export const hasOneType = 'hasOne'

export class Relation {

  static create (type, relatedMapper, options = {}) {
    options.type = type

    return new Relation(relatedMapper, options)
  }

  constructor (relatedMapper, options) {
    validateOptions(relatedMapper, options)

    if (typeof relatedMapper === 'object') {
      Object.defineProperty(this, 'relatedMapper', { value: relatedMapper })
    }

    Object.defineProperty(this, 'inverse', { writable: true })
    utils.fillIn(this, options)
  }

  assignTo (mapper) {
    this.name = mapper.name
    Object.defineProperty(this, 'mapper', { value: mapper })

    mapper.relationList || Object.defineProperty(mapper, 'relationList', { value: [] })
    mapper.relationFields || Object.defineProperty(mapper, 'relationFields', { value: [] })
    mapper.relationList.push(this)
    mapper.relationFields.push(this.localField)
  }

  getRelation () {
    return this.relatedMapper
  }

  getForeignKey (record) {
    if (this.type === belongsToType) {
      return utils.get(record, this.foreignKey)
    }

    return utils.get(record, this.mapper.idAttribute)
  }

  setForeignKey (record, relatedRecord) {
    if (!record || !relatedRecord) {
      return
    }

    if (this.type === belongsToType) {
      utils.set(record, this.foreignKey, utils.get(relatedRecord, this.getRelation().idAttribute))
    } else {
      const idAttribute = this.mapper.idAttribute

      if (!utils.isArray(relatedRecord)) {
        relatedRecord = [relatedRecord]
      }

      relatedRecord.forEach((relatedRecordItem) => {
        utils.set(relatedRecordItem, this.foreignKey, utils.get(record, idAttribute))
      })
    }
  }

  getLocalField (record) {
    return utils.get(record, this.localField)
  }

  setLocalField (record, data) {
    return utils.set(record, this.localField, data)
  }

  getInverse (mapper) {
    if (!this.inverse) {
      this.findInverseRelation(mapper)
    }

    return this.inverse
  }

  findInverseRelation (mapper) {
    this.getRelation().relationList.forEach((def) => {
      if (def.getRelation() === mapper && this.isAssociatedWith(def)) {
        this.inverse = def
        return true
      }
    })
  }

  isAssociatedWith (def) {
    return !def.foreignKey || def.foreignKey === this.foreignKey
  }
}

Relation.HAS_MANY = hasManyType
Relation.HAS_ONE = hasOneType
Relation.BELONGS_TO = belongsToType

function validateOptions (related, opts) {
  const DOMAIN_ERR = `new ${DOMAIN}`

  const localField = opts.localField
  if (!localField) {
    throw utils.err(DOMAIN_ERR, 'opts.localField')(400, 'string', localField)
  }

  const foreignKey = opts.foreignKey = opts.foreignKey || opts.localKey
  if (!foreignKey && (opts.type === belongsToType || opts.type === hasOneType)) {
    throw utils.err(DOMAIN_ERR, 'opts.foreignKey')(400, 'string', foreignKey)
  }

  const { localKeys, foreignKeys } = opts
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
  } else {
    throw utils.err(DOMAIN_ERR, 'related')(400, 'Mapper or string', related)
  }
}
