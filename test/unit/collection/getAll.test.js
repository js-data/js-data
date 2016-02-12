export function init () {
  describe('getAll', function () {
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
  })
}
