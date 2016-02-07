import * as create from './create.test'
import * as createRecord from './createRecord.test'
import * as createMany from './createMany.test'
import * as destroy from './destroy.test'
import * as destroyAll from './destroyAll.test'
import * as find from './find.test'
import * as findAll from './findAll.test'
import * as toJSON from './toJSON.test'
import * as update from './update.test'
import * as updateMany from './updateMany.test'
import * as updateAll from './updateAll.test'

export function init () {
  describe('Mapper', function () {
    it('should be a constructor function', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      Test.assert.isFunction(Mapper)
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isTrue(mapper instanceof Mapper)
    })

    it('should have events', function () {
      const Test = this
      const User = new Test.JSData.Mapper({ name: 'user' })
      const listener = Test.sinon.stub()
      User.on('bar', listener)
      User.emit('bar')
      Test.assert.isTrue(listener.calledOnce)
    })

    create.init()
    createRecord.init()
    createMany.init()
    destroy.init()
    destroyAll.init()
    find.init()
    findAll.init()
    toJSON.init()
    update.init()
    updateMany.init()
    updateAll.init()
  })
}
