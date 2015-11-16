/* global Collection:true, TYPES_EXCEPT_NUMBER:true */
import {assert} from 'chai'

export function init () {
  describe('Collection', function () {
    it('should be a constructor function', function () {
      assert.isFunction(Collection, 'should be a function')
      let collection = new Collection()
      assert.isTrue(collection instanceof Collection, 'collection should be an instance')
      collection = new Collection([], 'id')
      assert.equal(collection.idAttribute, 'id', 'collection should get initialization properties')
    })

    it('should accept initialization data', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Collection(data, 'id')
      assert.deepEqual(collection.getAll(), [data[2], data[0], data[1]], 'data should be in order')
    })

    it('should visit all data', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      let count = 0
      let prev
      let isInOrder = true
      const collection = new Collection(data, 'id')
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
      assert.isTrue(isInOrder, 'items should have been visited in order')
    })

    it('should skip', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Collection(data, 'id')
      TYPES_EXCEPT_NUMBER.forEach(function (type) {
        assert.throws(
          function () {
            collection.skip(type)
          },
          TypeError,
          `skip: Expected number but found ${typeof type}!`,
          'should throw on unacceptable type'
        )
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

    it('should limit', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Collection(data, 'id')
      TYPES_EXCEPT_NUMBER.forEach(function (type) {
        assert.throws(
          function () {
            collection.limit(type)
          },
          TypeError,
          `limit: Expected number but found ${typeof type}!`,
          'should throw on unacceptable type'
        )
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
}
