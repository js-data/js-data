
export class Persist {
  /* Instance methods */
  create(...args) {
    return this.constructor.create(this, ...args)
  }

  save(...args) {
    return this.constructor.save(this, ...args)
  }

  destroy(...args) {
    return this.constructor.destroy(this, ...args)
  }

  loadRelations(...args) {
    return this.constructor.loadRelations(this, ...args)
  }

  /* Static methods */
  static create = require('./create')
  static createEach() {

  }
  static find() {

  }
  static findAll() {

  }
  static save() {

  }
  static update() {

  }
  static updateAll() {

  }
  static updateEach() {

  }
  static destroy() {

  }
  static destroyAll() {

  }
  static loadRelations() {

  }
}
