import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should update record in a single index', (t) => {
  const data = [
    { id: 2, age: 19 },
    { id: 1, age: 27 }
  ]
  const collection = new JSData.Collection(data)
  collection.createIndex('age')
  t.is(collection.getAll(3).length, 0, 'should have no items with id 3')
  t.is(collection.getAll(27, { index: 'age' }).length, 1, 'should have one item with age 27')
  data[1].age = 26
  data[1].id = 3
  collection.updateIndex(data[1], { index: 'age' })
  t.is(collection.getAll(3).length, 0, 'should have no items with id 3')
  t.is(collection.getAll(26, { index: 'age' }).length, 1, 'should have one item with age 26')
  t.is(collection.getAll(27, { index: 'age' }).length, 0, 'should have no items with age 27')
  collection.updateIndex(data[1])
  t.is(collection.getAll(1).length, 0, 'should have no items with id 1')
  t.is(collection.getAll(3).length, 1, 'should have one item with id 3')
})
