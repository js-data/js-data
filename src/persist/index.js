import {schema} from '../core/decorators'

@schema({
  $$saved: {
    enumerable: false
  }
})
export class Persist {
  /* Instance methods */
  create (...args) {
    return this.constructor.create(this, ...args)
  }

  destroy (...args) {
    return this.constructor.destroy(this, ...args)
  }

  loadRelations (...args) {
    return this.constructor.loadRelations(this, ...args)
  }

  save (...args) {
    return this.constructor.save(this, ...args)
  }

  touchSaved () {
    let saved = new Date().getTime()
    if (saved === this.$$saved) {
      saved++
    }
    this.$$saved = saved
    return this.$$saved
  }

  /* Static methods */
  static create = require('./create')
  static find () {

  }
  static findAll () {

  }
  static save () {

  }
  static update () {

  }
  static updateAll () {

  }
  static updateEach () {

  }
  static destroy () {

  }
  static destroyAll () {

  }
  static loadRelations () {

  }
}
