import * as add from './add.test'
import * as between from './between.test'
import * as createIndex from './createIndex.test'
import * as filter from './filter.test'
import * as forEach from './forEach.test'
import * as get from './get.test'
import * as getAll from './getAll.test'
import * as limit from './limit.test'
import * as map from './map.test'
import * as mapCall from './mapCall.test'
import * as query from './query.test'
import * as recordId from './recordId.test'
import * as reduce from './reduce.test'
import * as remove from './remove.test'
import * as removeAll from './removeAll.test'
import * as skip from './skip.test'
import * as toJSON from './toJSON.test'
import * as updateIndex from './updateIndex.test'
import * as updateIndexes from './updateIndexes.test'

export function init () {
  describe('Collection', function () {
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
    between.init()
    createIndex.init()
    filter.init()
    forEach.init()
    get.init()
    getAll.init()
    limit.init()
    map.init()
    mapCall.init()
    query.init()
    recordId.init()
    reduce.init()
    remove.init()
    removeAll.init()
    skip.init()
    toJSON.init()
    updateIndex.init()
    updateIndexes.init()
  })
}
