import {
  beforeEach,
  JSData,
  TYPES_EXCEPT_NUMBER
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should skip', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]
  const collection = new JSData.Collection(data)
  TYPES_EXCEPT_NUMBER.forEach(function (type) {
    t.throws(
      function () {
        collection.skip(type)
      },
      TypeError,
      `skip: Expected number but found ${typeof type}!`,
      'should throw on unacceptable type'
    )
  })
  t.same(collection.skip(1), [
    { id: 2 },
    { id: 3 }
  ], 'should have skipped 1')
  t.same(collection.skip(2), [
    { id: 3 }
  ], 'should have skipped 2')
  t.same(collection.skip(3), [], 'should have skipped all')
  t.same(collection.skip(4), [], 'should have skipped all')
})
test('should skip and limit', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 5 },
    { id: 6 },
    { id: 4 },
    { id: 1 }
  ]
  const collection = new JSData.Collection(data)
  t.same(collection.query().skip(1).limit(1).run(), [
    { id: 2 }
  ], 'should have skipped 1 and limited to 1')
  t.same(collection.query().skip(4).limit(2).run(), [
    { id: 5 },
    { id: 6 }
  ], 'should have skipped 4 and limited to 2')
  t.same(collection.query().skip(5).limit(3).run(), [
    { id: 6 }
  ], 'should have skipped 5 and limited to 3')
  t.same(collection.query().skip(1).limit(7).run(), [
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 }
  ], 'should have skipped 1 and limited to 5')
})
