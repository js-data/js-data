import { assert, JSData } from '../../_setup'

describe('Collection#updateIndex', function () {
  it('should update record in a single index', function () {
    const data = [
      { id: 2, age: 19 },
      { id: 1, age: 27 }
    ]
    const collection = new JSData.Collection(data)
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
})
