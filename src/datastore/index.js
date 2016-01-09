import {
  addHiddenPropsToTarget,
  classCallCheck,
  fillIn,
  forOwn,
  isObject,
  isString
} from '../utils'
import {Collection} from '../collection/index'
import {Model} from '../model/index'

export function DS (opts) {
  const self = this
  classCallCheck(self, DS)

  opts || (opts = {})
  self.defaults = {}

  for (var key in opts) {
    self.defaults[key] = opts[key]
  }
  self.models = {}
  self.collections = {}
}

addHiddenPropsToTarget(DS.prototype, {
  defineModel (name, opts) {
    const self = this

    if (isObject(name)) {
      opts = name
      name = opts.name
    }
    opts || (opts = {})
    fillIn(opts, self.defaults)

    const methods = opts.methods || {}
    delete opts.methods
    const Parent = self.models[opts.extends]

    const Child = (Parent || Model).extend(methods, opts)
    self.models[name] = Child

    Child.getModel = function (name) {
      return self.models[name]
    }

    return Child
  },

  defineCollection (name, opts, Ctor) {
    const self = this
    opts || (opts = {})
    if (isString(opts.model)) {
      opts.model = self.models[name]
    }
    const collection = new (Ctor || Collection)([], opts)
    self.collection[name] = collection
    return collection
  },

  model (name) {
    return this.models[name]
  },

  collection (name) {
    return this.collections[name]
  },

  registerAdapter (...args) {
    forOwn(this.models, function (Model) {
      Model.registerAdapter(...args)
    })
  }
})

DS.prototype.defineResource = DS.prototype.defineModel
