export function init () {
  describe('#getAll', function () {
    it('should get multiple items from the store by primary key', function () {
      const Test = this
      const user1 = Test.UserCollection.add({ id: 1 })
      const user4 = Test.UserCollection.add({ id: 4 })
      const user3 = Test.UserCollection.add({ id: 3 })
      const user5 = Test.UserCollection.add({ id: 5 })
      const user2 = Test.UserCollection.add({ id: 2 })
      Test.assert.deepEqual(Test.UserCollection.getAll([1]), [user1], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll([1], [5]), [user1, user5], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll([2], [4]), [user2, user4], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll([3]), [user3], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll([1], [2], [3], [4], [5]), [user1, user2, user3, user4, user5], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll([5]), [user5], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll([]), [], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll(1), [user1], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll(1, 5), [user1, user5], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll(2, 4), [user2, user4], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll(3), [user3], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll(1, 2, 3, 4, 5), [user1, user2, user3, user4, user5], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll(5), [user5], 'should get the users by primary key')
      Test.assert.deepEqual(Test.UserCollection.getAll(), [user1, user2, user3, user4, user5], 'should get the users by primary key')
    })
    it('should return an array of all items in the store', function () {
      const Test = this
      Test.assert.isArray(Test.PostCollection.getAll(), 'should be an array')
      Test.assert.equal(Test.PostCollection.getAll().length, 0, 'should be an empty array')
      Test.PostCollection.add(Test.data.p1)
      Test.PostCollection.add(Test.data.p2)
      Test.PostCollection.add(Test.data.p3)
      Test.assert.isArray(Test.PostCollection.getAll(), 'should be an array')
      Test.assert.equal(Test.PostCollection.getAll().length, 3, 'should be an array of length 3')
      Test.assert.deepEqual(Test.PostCollection.getAll(), Test.PostCollection.filter())
    })
    it('should return results that match a set of ids', function () {
      const Test = this
      Test.PostCollection.add([Test.data.p1, Test.data.p2, Test.data.p3])
      const posts = Test.PostCollection.getAll(5, 7)
      Test.assert.objectsEqual(posts, [Test.data.p1, Test.data.p3])
    })
  })
}
