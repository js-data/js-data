import { assert, JSData } from '../../_setup'

describe('Collection#forEach', function () {
  it('should visit all data', function () {
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
    assert.deepEqual(collection.getAll(), [
      { id: 1, visited: true },
      { id: 2, visited: true },
      { id: 3, visited: true }
    ], 'data should all have been visited')
    assert.equal(count, 3, 'should have taken 3 iterations to visit all data')
    assert(isInOrder, 'items should have been visited in order')
  })
  it('should forEach', function () {
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
      assert(this === ctx, 'should have correct context')
    }, ctx)
    assert.equal(sum, expectedSum, 'should have iterated over all items, producing expectedSum')
  })
})
