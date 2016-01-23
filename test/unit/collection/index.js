import * as add from './add.test'
import * as get from './get.test'
import * as getAll from './getAll.test'
import * as query from './query.test'
import * as remove from './remove.test'
import * as removeAll from './removeAll.test'

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

    it('should visit all data', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      let count = 0
      let prev
      let isInOrder = true
      const collection = new Test.JSData.Collection(data)
      collection.forEach(function (value) {
        if (prev) {
          isInOrder = isInOrder && value.id > prev.id
        }
        value.visited = true
        count++
        prev = value
      })
      Test.assert.deepEqual(collection.getAll(), [
        { id: 1, visited: true },
        { id: 2, visited: true },
        { id: 3, visited: true }
      ], 'data should all have been visited')
      Test.assert.equal(count, 3, 'should have taken 3 iterations to visit all data')
      Test.assert.isTrue(isInOrder, 'items should have been visited in order')
    })

    it('should skip', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      Test.TYPES_EXCEPT_NUMBER.forEach(function (type) {
        Test.assert.throws(
          function () {
            collection.skip(type)
          },
          TypeError,
          `skip: Expected number but found ${typeof type}!`,
          'should throw on unacceptable type'
        )
      })
      Test.assert.deepEqual(collection.skip(1), [
        { id: 2 },
        { id: 3 }
      ], 'should have skipped 1')
      Test.assert.deepEqual(collection.skip(2), [
        { id: 3 }
      ], 'should have skipped 2')
      Test.assert.deepEqual(collection.skip(3), [], 'should have skipped all')
      Test.assert.deepEqual(collection.skip(4), [], 'should have skipped all')
    })

    it('should limit', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      Test.TYPES_EXCEPT_NUMBER.forEach(function (type) {
        Test.assert.throws(
          function () {
            collection.limit(type)
          },
          TypeError,
          `limit: Expected number but found ${typeof type}!`,
          'should throw on unacceptable type'
        )
      })
      Test.assert.deepEqual(collection.limit(1), [
        { id: 1 }
      ], 'should have limited to 1')
      Test.assert.deepEqual(collection.limit(2), [
        { id: 1 },
        { id: 2 }
      ], 'should have limited to 2')
      Test.assert.deepEqual(collection.limit(3), [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ], 'should have limited to 3')
      Test.assert.deepEqual(collection.limit(4), [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ], 'should have limited none')
    })

    it('should skip and limit', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 5 },
        { id: 6 },
        { id: 4 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      Test.assert.deepEqual(collection.query().skip(1).limit(1).run(), [
        { id: 2 }
      ], 'should have skipped 1 and limited to 1')
      Test.assert.deepEqual(collection.query().skip(4).limit(2).run(), [
        { id: 5 },
        { id: 6 }
      ], 'should have skipped 4 and limited to 2')
      Test.assert.deepEqual(collection.query().skip(5).limit(3).run(), [
        { id: 6 }
      ], 'should have skipped 5 and limited to 3')
      Test.assert.deepEqual(collection.query().skip(1).limit(7).run(), [
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 }
      ], 'should have skipped 1 and limited to 5')
    })

    it('should support complex queries', function () {
      const Test = this
      const data = [
        { id: 2, age: 18, role: 'admin' },
        { id: 3, age: 19, role: 'admin' },
        { id: 5, age: 19, role: 'admin' },
        { id: 6, age: 19, role: 'owner' },
        { id: 4, age: 22, role: 'owner' },
        { id: 1, age: 23, role: 'owner' }
      ]
      const collection = new Test.JSData.Collection(data)
      collection.createIndex('ageRole', ['age', 'role'])
      Test.assert.deepEqual(
        collection.getAll(19, { index: 'ageRole' }),
        [
          { id: 3, age: 19, role: 'admin' },
          { id: 5, age: 19, role: 'admin' },
          { id: 6, age: 19, role: 'owner' }
        ],
        'should have found all of age:19 using 1 keyList'
      )
      Test.assert.deepEqual(
        collection.getAll([19, 'admin'], { index: 'ageRole' }),
        [
          { id: 3, age: 19, role: 'admin' },
          { id: 5, age: 19, role: 'admin' }
        ],
        'should have found age:19, role:admin'
      )
      Test.assert.deepEqual(
        collection.getAll([19, 'admin'], [19, 'owner'], { index: 'ageRole' }),
        [
          { id: 3, age: 19, role: 'admin' },
          { id: 5, age: 19, role: 'admin' },
          { id: 6, age: 19, role: 'owner' }
        ],
        'should have found all of age:19 using 2 keyLists'
      )
      Test.assert.deepEqual(
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
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      let sum = 0
      const expectedSum = data.reduce(function (prev, curr) {
        return prev + curr.id
      }, 0)
      const ctx = {}
      collection.forEach(function (item) {
        sum = sum + item.id
        Test.assert.isTrue(this === ctx, 'should have correct context')
      }, ctx)
      Test.assert.equal(sum, expectedSum, 'should have iterated over all items, producing expectedSum')
    })

    it('should reduce', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      const expectedSum = data.reduce(function (prev, curr) {
        return prev + curr.id
      }, 0)
      const reduction = collection.reduce(function (prev, item) {
        return prev + item.id
      }, 0)
      Test.assert.equal(reduction, expectedSum, 'should have correctly reduce the items to a single value')
    })

    it('should map', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      const ctx = {}
      const mapping = collection.map(function (item) {
        Test.assert.isTrue(this === ctx, 'should have correct context')
        return item.id
      }, ctx)
      Test.assert.isTrue(mapping.indexOf(1) !== -1)
      Test.assert.isTrue(mapping.indexOf(2) !== -1)
      Test.assert.isTrue(mapping.indexOf(3) !== -1)
      Test.assert.equal(mapping.length, 3)
    })

    it('should insert a record into all indexes', function () {
      const Test = this
      const data = [
        { id: 2, age: 19 },
        { id: 1, age: 27 }
      ]
      const collection = new Test.JSData.Collection(data)
      collection.createIndex('age')
      collection.add({ id: 3, age: 20 })
      Test.assert.isTrue(collection.get(1) === data[1])
      Test.assert.equal(collection.getAll(20, { index: 'age' }).length, 1)
    })

    it('should update a record in all indexes', function () {
      const Test = this
      const data = [
        { id: 2, age: 19 },
        { id: 1, age: 27 }
      ]
      const collection = new Test.JSData.Collection(data)
      collection.createIndex('age')
      Test.assert.equal(collection.getAll(27, { index: 'age' }).length, 1, 'should have one item with age 27')
      data[1].age = 26
      collection.updateIndexes(data[1])
      Test.assert.equal(collection.getAll(26, { index: 'age' }).length, 1, 'should have one item with age 26')
      Test.assert.equal(collection.getAll(27, { index: 'age' }).length, 0, 'should have no items with age 27')
    })

    it('should update record in a single index', function () {
      const Test = this
      const data = [
        { id: 2, age: 19 },
        { id: 1, age: 27 }
      ]
      const collection = new Test.JSData.Collection(data)
      collection.createIndex('age')
      Test.assert.equal(collection.getAll(3).length, 0, 'should have no items with id 3')
      Test.assert.equal(collection.getAll(27, { index: 'age' }).length, 1, 'should have one item with age 27')
      data[1].age = 26
      data[1].id = 3
      collection.updateIndex(data[1], { index: 'age' })
      Test.assert.equal(collection.getAll(3).length, 0, 'should have no items with id 3')
      Test.assert.equal(collection.getAll(26, { index: 'age' }).length, 1, 'should have one item with age 26')
      Test.assert.equal(collection.getAll(27, { index: 'age' }).length, 0, 'should have no items with age 27')
      collection.updateIndex(data[1])
      Test.assert.equal(collection.getAll(1).length, 0, 'should have no items with id 1')
      Test.assert.equal(collection.getAll(3).length, 1, 'should have one item with id 3')
    })

    it('should bubble up record events', function (done) {
      const Test = this
      const mapper = new Test.JSData.Mapper()
      const data = [
        mapper.createRecord({ id: 2, age: 19 }),
        mapper.createRecord({ id: 1, age: 27 })
      ]
      const collection = new Test.JSData.Collection(data, {
        mapper
      })
      const listener = Test.sinon.stub()
      const listener2 = Test.sinon.stub()
      collection.on('foo', listener)
      collection.on('all', listener2)
      data[0].emit('foo', 'bar', 'biz', 'baz')
      setTimeout(function () {
        Test.assert.isTrue(listener.calledOnce, 'listener should have been called once')
        Test.assert.deepEqual(listener.firstCall.args, ['bar', 'biz', 'baz'], 'should have been called with the correct args')
        Test.assert.isTrue(listener2.calledOnce, 'listener2 should have been called once')
        Test.assert.deepEqual(listener2.firstCall.args, [ 'foo', 'bar', 'biz', 'baz' ], 'should have been called with the correct args')
        done()
      }, 10)
    })

    add.init()
    get.init()
    getAll.init()
    query.init()
    remove.init()
    removeAll.init()
  })
}
