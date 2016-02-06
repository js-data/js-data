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
    // it('should allow schema definition with basic indexes', function () {
    //   class User extends Model {}
    //   User.setSchema({
    //     age: { indexed: true },
    //     role: { indexed: true }
    //   })
    //   User.inject([
    //     { id: 2, age: 18, role: 'admin' },
    //     { id: 3, age: 19, role: 'dev' },
    //     { id: 9, age: 19, role: 'admin' },
    //     { id: 6, age: 19, role: 'owner' },
    //     { id: 4, age: 22, role: 'dev' },
    //     { id: 1, age: 23, role: 'owner' }
    //   ])
    //   Test.assert.deepEqual(
    //     User.getAll(19, { index: 'age' }),
    //     [
    //       { id: 3, age: 19, role: 'dev' },
    //       { id: 6, age: 19, role: 'owner' },
    //       { id: 9, age: 19, role: 'admin' }
    //     ],
    //     'should have found all of age:19 using 1 keyList'
    //   )
    // })

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
