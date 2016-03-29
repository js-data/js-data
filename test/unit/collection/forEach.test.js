import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should visit all data', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]
  let count = 0
  let prev
  let isInOrder = true
  const collection = new JSData.Collection(data)
  collection.forEach(function (value) {
    if (prev) {
      isInOrder = isInOrder && value.id > prev.id
    }
    value.visited = true
    count++
    prev = value
  })
  t.same(collection.getAll(), [
    { id: 1, visited: true },
    { id: 2, visited: true },
    { id: 3, visited: true }
  ], 'data should all have been visited')
  t.is(count, 3, 'should have taken 3 iterations to visit all data')
  t.ok(isInOrder, 'items should have been visited in order')
})
test('should forEach', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]
  const collection = new JSData.Collection(data)
  let sum = 0
  const expectedSum = data.reduce(function (prev, curr) {
    return prev + curr.id
  }, 0)
  const ctx = {}
  collection.forEach(function (item) {
    sum = sum + item.id
    t.ok(this === ctx, 'should have correct context')
  }, ctx)
  t.is(sum, expectedSum, 'should have iterated over all items, producing expectedSum')
})
