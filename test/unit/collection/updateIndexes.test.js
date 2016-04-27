import { assert, JSData } from '../../_setup'

describe('Collection#updateIndexes', function () {
  it('should update a record in all indexes', function () {
    const data = [
      { id: 2, age: 19 },
      { id: 1, age: 27 }
    ]
    const collection = new JSData.Collection(data)
    collection.createIndex('age')
    assert.equal(collection.getAll(27, { index: 'age' }).length, 1, 'should have one item with age 27')
    data[1].age = 26
    collection.updateIndexes(data[1])
    assert.equal(collection.getAll(26, { index: 'age' }).length, 1, 'should have one item with age 26')
    assert.equal(collection.getAll(27, { index: 'age' }).length, 0, 'should have no items with age 27')
  })
})
