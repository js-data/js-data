import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should reduce', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]
  const collection = new JSData.Collection(data)
  const expectedSum = data.reduce(function (prev, curr) {
    return prev + curr.id
  }, 0)
  const reduction = collection.reduce(function (prev, item) {
    return prev + item.id
  }, 0)
  t.is(reduction, expectedSum, 'should have correctly reduce the items to a single value')
})
