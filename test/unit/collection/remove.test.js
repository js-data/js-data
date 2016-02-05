export function init () {
  describe('#remove', function () {
    it('should remove an item from the collection', function () {
      const Test = this
      Test.UserCollection.createIndex('age')
      const user = Test.UserCollection.add({ id: 1, age: 30 })
      const user2 = Test.UserCollection.add({ id: 2, age: 31 })
      const user3 = Test.UserCollection.add({ id: 3, age: 32 })
      const users = [user, user2, user3]
      Test.assert.isTrue(Test.UserCollection.get(1) === user, 'user 1 is in the store')
      Test.assert.isTrue(Test.UserCollection.get(2) === user2, 'user 2 is in the store')
      Test.assert.isTrue(Test.UserCollection.get(3) === user3, 'user 3 is in the store')
      Test.assert.deepEqual(Test.UserCollection.between([30], [32], {
        rightInclusive: true,
        index: 'age'
      }), users, 'users can be selected by age index')
      Test.UserCollection.remove(1)
      Test.assert.isUndefined(Test.UserCollection.get(1), 'user 1 is no longer in the store')
      users.shift()
      Test.assert.deepEqual(Test.UserCollection.between([30], [32], {
        rightInclusive: true,
        index: 'age'
      }), users, 'user 1 cannot be retrieved by index')
    })
  })
}
