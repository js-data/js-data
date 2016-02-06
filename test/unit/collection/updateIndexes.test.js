export function init () {
  describe('#updateIndexes', function () {
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
  })
}
