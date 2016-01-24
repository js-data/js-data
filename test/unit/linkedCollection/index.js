import * as add from './add.test'
import * as remove from './remove.test'
import * as removeAll from './removeAll.test'

export function init () {
  describe('LinkedCollection', function () {
    it('should be a constructor function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Collection, 'should be a function')
      let collection = new Test.JSData.Collection()
      Test.assert.isTrue(collection instanceof Test.JSData.Collection, 'collection should be an instance')
      Test.assert.equal(collection.recordId(), 'id', 'collection should get initialization properties')
    })

    it('should accept initialization data', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      Test.assert.deepEqual(collection.getAll(), [data[2], data[0], data[1]], 'data should be in order')
    })

    add.init()
    remove.init()
    removeAll.init()
  })
}
