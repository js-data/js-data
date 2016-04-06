import { assert, JSData, TYPES_EXCEPT_NUMBER } from '../../_setup'

describe('Collection#limit', function () {
  it('should limit', function () {
    const data = [
      { id: 2 },
      { id: 3 },
      { id: 1 }
    ]
    const collection = new JSData.Collection(data)
    TYPES_EXCEPT_NUMBER.forEach(function (value) {
      assert.throws(function () {
        collection.limit(value)
      }, Error, `[Query#limit:num] expected: number, found: ${typeof value}\nhttp://www.js-data.io/v3.0/docs/errors#400`)
    })
    assert.deepEqual(collection.limit(1), [
      { id: 1 }
    ], 'should have limited to 1')
    assert.deepEqual(collection.limit(2), [
      { id: 1 },
      { id: 2 }
    ], 'should have limited to 2')
    assert.deepEqual(collection.limit(3), [
      { id: 1 },
      { id: 2 },
      { id: 3 }
    ], 'should have limited to 3')
    assert.deepEqual(collection.limit(4), [
      { id: 1 },
      { id: 2 },
      { id: 3 }
    ], 'should have limited none')
  })
})
