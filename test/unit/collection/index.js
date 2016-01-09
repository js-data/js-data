/* global Collection:true, TYPES_EXCEPT_NUMBER:true, TYPES_EXCEPT_ARRAY:true, Model:true, sinon:true */
import {assert} from 'chai'
import * as add from './add.test'
import * as query from './query.test'
import * as remove from './remove.test'
import * as removeAll from './removeAll.test'

export function init () {
  describe('Collection', function () {
    it('should be a constructor function', function () {
      assert.isFunction(Collection, 'should be a function')
      let collection = new Collection()
      assert.isTrue(collection instanceof Collection, 'collection should be an instance')
      assert.equal(collection.modelId(), 'id', 'collection should get initialization properties')
    })

    it('should accept initialization data', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Collection(data)
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
      const collection = new Collection(data)
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
      const collection = new Collection(data)
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
      const collection = new Collection(data)
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

    it('should skip and limit', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 5 },
        { id: 6 },
        { id: 4 },
        { id: 1 }
      ]
      const collection = new Collection(data)
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

    it('should support complex queries', function () {
      const data = [
        { id: 2, age: 18, role: 'admin' },
        { id: 3, age: 19, role: 'admin' },
        { id: 5, age: 19, role: 'admin' },
        { id: 6, age: 19, role: 'owner' },
        { id: 4, age: 22, role: 'owner' },
        { id: 1, age: 23, role: 'owner' }
      ]
      const collection = new Collection(data)
      collection.createIndex('ageRole', ['age', 'role'])
      assert.deepEqual(
        collection.getAll(19, { index: 'ageRole' }),
        [
          { id: 3, age: 19, role: 'admin' },
          { id: 5, age: 19, role: 'admin' },
          { id: 6, age: 19, role: 'owner' }
        ],
        'should have found all of age:19 using 1 keyList'
      )
      assert.deepEqual(
        collection.getAll([19, 'admin'], { index: 'ageRole' }),
        [
          { id: 3, age: 19, role: 'admin' },
          { id: 5, age: 19, role: 'admin' }
        ],
        'should have found age:19, role:admin'
      )
      assert.deepEqual(
        collection.getAll([19, 'admin'], [19, 'owner'], { index: 'ageRole' }),
        [
          { id: 3, age: 19, role: 'admin' },
          { id: 5, age: 19, role: 'admin' },
          { id: 6, age: 19, role: 'owner' }
        ],
        'should have found all of age:19 using 2 keyLists'
      )
      assert.deepEqual(
        collection.getAll([19, 'admin'], 23, { index: 'ageRole' }),
        [
          { id: 3, age: 19, role: 'admin' },
          { id: 5, age: 19, role: 'admin' },
          { id: 1, age: 23, role: 'owner' }
        ],
        'should have found age:19, role:admin and age:23'
      )
    })

    it('should forEach', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Collection(data)
      let sum = 0
      const expectedSum = data.reduce(function (prev, curr) {
        return prev + curr.id
      }, 0)
      const ctx = {}
      collection.forEach(function (item) {
        sum = sum + item.id
        assert.isTrue(this === ctx, 'should have correct context')
      }, ctx)
      assert.equal(sum, expectedSum, 'should have iterated over all items, producing expectedSum')
    })

    it('should reduce', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Collection(data)
      const expectedSum = data.reduce(function (prev, curr) {
        return prev + curr.id
      }, 0)
      const reduction = collection.reduce(function (prev, item) {
        return prev + item.id
      }, 0)
      assert.equal(reduction, expectedSum, 'should have correctly reduce the items to a single value')
    })

    it('should map', function () {
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Collection(data)
      const ctx = {}
      const mapping = collection.map(function (item) {
        assert.isTrue(this === ctx, 'should have correct context')
        return item.id
      }, ctx)
      assert.isTrue(mapping.indexOf(1) !== -1)
      assert.isTrue(mapping.indexOf(2) !== -1)
      assert.isTrue(mapping.indexOf(3) !== -1)
      assert.equal(mapping.length, 3)
    })

    it('should insert a record into all indexes', function () {
      const data = [
        { id: 2, age: 19 },
        { id: 1, age: 27 }
      ]
      const collection = new Collection(data)
      collection.createIndex('age')
      collection.add({ id: 3, age: 20 })
      assert.isTrue(collection.get(1) === data[1])
      assert.equal(collection.getAll(20, { index: 'age' }).length, 1)
    })

    it('should update a record in all indexes', function () {
      const data = [
        { id: 2, age: 19 },
        { id: 1, age: 27 }
      ]
      const collection = new Collection(data)
      collection.createIndex('age')
      assert.equal(collection.getAll(27, { index: 'age' }).length, 1, 'should have one item with age 27')
      data[1].age = 26
      collection.updateIndexes(data[1])
      assert.equal(collection.getAll(26, { index: 'age' }).length, 1, 'should have one item with age 26')
      assert.equal(collection.getAll(27, { index: 'age' }).length, 0, 'should have no items with age 27')
    })

    it('should update record in a single index', function () {
      const data = [
        { id: 2, age: 19 },
        { id: 1, age: 27 }
      ]
      const collection = new Collection(data)
      collection.createIndex('age')
      assert.equal(collection.getAll(3).length, 0, 'should have no items with id 3')
      assert.equal(collection.getAll(27, { index: 'age' }).length, 1, 'should have one item with age 27')
      data[1].age = 26
      data[1].id = 3
      collection.updateIndex(data[1], { index: 'age' })
      assert.equal(collection.getAll(3).length, 0, 'should have no items with id 3')
      assert.equal(collection.getAll(26, { index: 'age' }).length, 1, 'should have one item with age 26')
      assert.equal(collection.getAll(27, { index: 'age' }).length, 0, 'should have no items with age 27')
      collection.updateIndex(data[1])
      assert.equal(collection.getAll(1).length, 0, 'should have no items with id 1')
      assert.equal(collection.getAll(3).length, 1, 'should have one item with id 3')
    })

    it('should bubble up model events', function (done) {
      class User extends Model {}
      const data = [
        new User({ id: 2, age: 19 }),
        new User({ id: 1, age: 27 })
      ]
      const collection = new Collection(data)
      const listener = sinon.stub()
      const listener2 = sinon.stub()
      collection.on('foo', listener)
      collection.on('all', listener2)
      data[0].emit('foo', 'bar', 'biz', 'baz')
      setTimeout(function () {
        assert.isTrue(listener.calledOnce, 'listener should have been called once')
        assert.deepEqual(listener.firstCall.args, ['bar', 'biz', 'baz' ], 'should have been called with the correct args')
        assert.isTrue(listener2.calledOnce, 'listener2 should have been called once')
        assert.deepEqual(listener2.firstCall.args, [ 'foo', 'bar', 'biz', 'baz' ], 'should have been called with the correct args')
        done()
      }, 10)
    })

    add.init()
    query.init()
    remove.init()
    removeAll.init()
  })
}
