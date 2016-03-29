import {
  beforeEach,
  JSData,
  TYPES_EXCEPT_NUMBER
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should limit', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]
  const collection = new JSData.Collection(data)
  TYPES_EXCEPT_NUMBER.forEach(function (type) {
    t.throws(
      function () {
        collection.limit(type)
      },
      TypeError,
      `limit: Expected number but found ${typeof type}!`,
      'should throw on unacceptable type'
    )
  })
  t.same(collection.limit(1), [
    { id: 1 }
  ], 'should have limited to 1')
  t.same(collection.limit(2), [
    { id: 1 },
    { id: 2 }
  ], 'should have limited to 2')
  t.same(collection.limit(3), [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ], 'should have limited to 3')
  t.same(collection.limit(4), [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ], 'should have limited none')
})
