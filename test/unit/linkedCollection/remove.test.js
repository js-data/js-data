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
    it('should unlink upon ejection', function () {
      const Test = this

      Test.UserCollection.add(Test.data.user10)
      Test.OrganizationCollection.add(Test.data.organization15)
      Test.CommentCollection.add(Test.data.comment19)
      Test.ProfileCollection.add(Test.data.profile21)

      // user10 relations
      Test.assert.isArray(Test.UserCollection.get(10).comments)
      Test.CommentCollection.remove(11)
      Test.assert.isUndefined(Test.CommentCollection.get(11))
      Test.assert.equal(Test.UserCollection.get(10).comments.length, 2)
      Test.CommentCollection.remove(12)
      Test.assert.isUndefined(Test.CommentCollection.get(12))
      Test.assert.equal(Test.UserCollection.get(10).comments.length, 1)
      Test.CommentCollection.remove(13)
      Test.assert.isUndefined(Test.CommentCollection.get(13))
      Test.assert.equal(Test.UserCollection.get(10).comments.length, 0)
      Test.OrganizationCollection.remove(14)
      Test.assert.isUndefined(Test.OrganizationCollection.get(14))
      Test.assert.isUndefined(Test.UserCollection.get(10).organization)

      // organization15 relations
      Test.assert.isArray(Test.OrganizationCollection.get(15).users)
      Test.UserCollection.remove(16)
      Test.assert.isUndefined(Test.UserCollection.get(16))
      Test.assert.equal(Test.OrganizationCollection.get(15).users.length, 2)
      Test.UserCollection.remove(17)
      Test.assert.isUndefined(Test.UserCollection.get(17))
      Test.assert.equal(Test.OrganizationCollection.get(15).users.length, 1)
      Test.UserCollection.remove(18)
      Test.assert.isUndefined(Test.UserCollection.get(18))
      Test.assert.equal(Test.OrganizationCollection.get(15).users.length, 0)

      // comment19 relations
      Test.assert.deepEqual(Test.UserCollection.get(20), Test.CommentCollection.get(19).user)
      Test.assert.deepEqual(Test.UserCollection.get(19), Test.CommentCollection.get(19).approvedByUser)
      Test.UserCollection.remove(20)
      Test.assert.isUndefined(Test.CommentCollection.get(19).user)
      Test.UserCollection.remove(19)
      Test.assert.isUndefined(Test.CommentCollection.get(19).approvedByUser)

      // profile21 relations
      Test.assert.deepEqual(Test.UserCollection.get(22), Test.ProfileCollection.get(21).user)
      Test.UserCollection.remove(22)
      Test.assert.isUndefined(Test.ProfileCollection.get(21).user)
    })
  })
}
