import { assert, JSData, TYPES_EXCEPT_NUMBER } from '../../_setup'

describe('Collection#skip', function () {
  it('should skip', function () {
    const data = [
      { id: 2 },
      { id: 3 },
      { id: 1 }
    ]
    const collection = new JSData.Collection(data)
    TYPES_EXCEPT_NUMBER.forEach(function (value) {
      assert.throws(function () {
        collection.skip(value)
      }, Error, `[Query#skip:num] expected: number, found: ${typeof value}\nhttp://www.js-data.io/v3.0/docs/errors#400`)
    })
    assert.deepEqual(collection.skip(1), [
      { id: 2 },
      { id: 3 }
    ], 'should have skipped 1')
    assert.deepEqual(collection.skip(2), [
      { id: 3 }
    ], 'should have skipped 2')
    assert.deepEqual(collection.skip(3), [], 'should have skipped all')
    assert.deepEqual(collection.skip(4), [], 'should have skipped all')
  })
  it('should skip and limit', function () {
    const data = [
      { id: 2 },
      { id: 3 },
      { id: 5 },
      { id: 6 },
      { id: 4 },
      { id: 1 }
    ]
    const collection = new JSData.Collection(data)
    assert.deepEqual(collection.query().skip(1).limit(1).run(), [
      { id: 2 }
    ], 'should have skipped 1 and limited to 1')
    assert.deepEqual(collection.query().skip(4).limit(2).run(), [
      { id: 5 },
      { id: 6 }
    ], 'should have skipped 4 and limited to 2')
    assert.deepEqual(collection.query().skip(5).limit(3).run(), [
      { id: 6 }
    ], 'should have skipped 5 and limited to 3')
    assert.deepEqual(collection.query().skip(1).limit(7).run(), [
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 }
    ], 'should have skipped 1 and limited to 5')
  })
})
