import {
  addHiddenPropsToTarget,
  classCallCheck,
  extend,
  fillIn,
  forOwn,
  isObject,
  isString
} from './utils'
import {
  registerAdapter
} from './decorators/index'
import Mapper from './mapper'

const belongsToType = 'belongsTo'
const hasManyType = 'hasMany'
const hasOneType = 'hasOne'

const CONTAINER_DEFAULTS = {}

/**
 * TODO
 *
 * @class Container
 * @param {Object} [opts] Configuration options.
 * @return {Container}
 */
export default function Container (opts) {
  const self = this
  classCallCheck(self, Container)

  opts || (opts = {})
  fillIn(self, opts)
  fillIn(self, CONTAINER_DEFAULTS)

  self._adapters = {}
  self._mappers = {}
  self.mapperDefaults = self.mapperDefaults || {}
  self.MapperClass = self.MapperClass || Mapper
}

Container.extend = extend

addHiddenPropsToTarget(Container.prototype, {
  /**
   * TODO
   *
   * @name Container#defineMapper
   * @method
   * @param {string} name {@link Mapper#name}.
   * @param {Object} [opts] Configuration options. Passed to {@link Mapper}.
   * @return {Mapper}
   */
  defineMapper (name, opts) {
    const self = this

    // For backwards compatibility with defineResource
    if (isObject(name)) {
      opts = name
      if (!opts.name) {
        throw new Error('name is required!')
      }
      name = opts.name
    } else if (!isString(name)) {
      throw new Error('name is required!')
    }

    // Default values for arguments
    opts || (opts = {})
    opts.name = name
    opts.relations || (opts.relations = {})

    // Check if the user is overriding the datastore's default MapperClass
    const MapperClass = opts.MapperClass || self.MapperClass
    delete opts.MapperClass

    // Apply the datastore's defaults to the options going into the mapper
    fillIn(opts, self.mapperDefaults)

    // Instantiate a mapper
    const mapper = self._mappers[name] = new MapperClass(opts)
    // Make sure the mapper's name is set
    mapper.name = name
    // All mappers in this datastore will share adapters
    mapper._adapters = self.getAdapters()

    // Setup the mapper's relations, including generating Mapper#relationList
    // and Mapper#relationFields
    forOwn(mapper.relations, function (group, type) {
      forOwn(group, function (relations, _name) {
        if (isObject(relations)) {
          relations = [relations]
        }
        relations.forEach(function (def) {
          def.getRelation = function () {
            return self.getMapper(_name)
          }
          const Relation = self._mappers[_name] || _name
          if (type === belongsToType) {
            mapper.belongsTo(Relation, def)
          } else if (type === hasOneType) {
            mapper.hasOne(Relation, def)
          } else if (type === hasManyType) {
            mapper.hasMany(Relation, def)
          }
        })
      })
    })

    return mapper
  },

  /**
   * TODO
   *
   * @name Container#getAdapters
   * @method
   * @return {Adapter}
   */
  getAdapters () {
    return this._adapters
  },

  /**
   * TODO
   *
   * @name Container#getMapper
   * @method
   * @param {string} name {@link Mapper#name}.
   * @return {Mapper}
   */
  getMapper (name) {
    const mapper = this._mappers[name]
    if (!mapper) {
      throw new ReferenceError(`${name} is not a registered mapper!`)
    }
    return mapper
  },

  /**
   * TODO
   *
   * @name Container#registerAdapter
   * @method
   * @param {string} name {@link Mapper#name}.
   * @param {Adapter} adapter Adapter to register.
   * @param {Object} [opts] Configuration options.
   */
  registerAdapter (name, adapter, opts) {
    registerAdapter(name, adapter, opts)(this)
  }
})
