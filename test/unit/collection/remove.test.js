/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#remove', function () {
    it('should remove an item from the collection', function () {
      this.UserCollection.createIndex('age')
      const user = this.UserCollection.add({ id: 1, age: 30 })
      const user2 = this.UserCollection.add({ id: 2, age: 31 })
      const user3 = this.UserCollection.add({ id: 3, age: 32 })
      const users = [user, user2, user3]
      assert.isTrue(this.UserCollection.get(1) === user, 'user 1 is in the store')
      assert.isTrue(this.UserCollection.get(2) === user2, 'user 2 is in the store')
      assert.isTrue(this.UserCollection.get(3) === user3, 'user 3 is in the store')
      assert.deepEqual(this.UserCollection.between([30], [32], {
        rightInclusive: true,
        index: 'age'
      }), users, 'users can be selected by age index')
      this.UserCollection.remove(1)
      assert.isUndefined(this.UserCollection.get(1), 'user 1 is no longer in the store')
      users.shift()
      assert.deepEqual(this.UserCollection.between([30], [32], {
        rightInclusive: true,
        index: 'age'
      }), users, 'user 1 cannot be retrieved by index')
    })
    // it('should unlink upon ejection', function () {
    //   const user = this.UserCollection.add(this.data.user10)
    //   this.OrganizationCollection.add(this.data.organization15)
    //   this.CommentCollection.add(this.data.comment19)
    //   this.ProfileCollection.add(this.data.profile21)

    //   // user10 relations
    //   assert.isArray(this.UserCollection.get(10).comments)
    //   this.CommentCollection.remove(11)
    //   assert.isUndefined(this.CommentCollection.get(11))
    //   assert.equal(this.UserCollection.get(10).comments.length, 2)
    //   this.CommentCollection.remove(12)
    //   assert.isUndefined(this.CommentCollection.get(12))
    //   assert.equal(this.UserCollection.get(10).comments.length, 1)
    //   this.CommentCollection.remove(13)
    //   assert.isUndefined(this.CommentCollection.get(13))
    //   assert.equal(this.UserCollection.get(10).comments.length, 0)
    //   this.OrganizationCollection.remove(14)
    //   assert.isUndefined(this.OrganizationCollection.get(14))
    //   assert.isUndefined(this.UserCollection.get(10).organization)

    //   // organization15 relations
    //   assert.isArray(this.OrganizationCollection.get(15).users)
    //   this.UserCollection.remove(16)
    //   assert.isUndefined(this.UserCollection.get(16))
    //   assert.equal(this.OrganizationCollection.get(15).users.length, 2)
    //   this.UserCollection.remove(17)
    //   assert.isUndefined(this.UserCollection.get(17))
    //   assert.equal(this.OrganizationCollection.get(15).users.length, 1)
    //   this.UserCollection.remove(18)
    //   assert.isUndefined(this.UserCollection.get(18))
    //   assert.equal(this.OrganizationCollection.get(15).users.length, 0)

    //   // comment19 relations
    //   assert.deepEqual(this.UserCollection.get(20), this.CommentCollection.get(19).user)
    //   assert.deepEqual(this.UserCollection.get(19), this.CommentCollection.get(19).approvedByUser)
    //   this.UserCollection.remove(20)
    //   assert.isUndefined(this.CommentCollection.get(19).user)
    //   this.UserCollection.remove(19)
    //   assert.isUndefined(this.CommentCollection.get(19).approvedByUser)

    //   // profile21 relations
    //   assert.deepEqual(this.UserCollection.get(22), this.ProfileCollection.get(21).user)
    //   this.UserCollection.remove(22)
    //   assert.isUndefined(this.ProfileCollection.get(21).user)
    // })
  })
}
