/* global p1:true, p2:true, p3:true, p4:true, p5:true, Model:true */
import {assert} from 'chai'

export function init () {
  describe('static ejectAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.ejectAll)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.ejectAll)
      assert.isFunction(User2.ejectAll)
      assert.isTrue(Model.ejectAll === User.ejectAll)
      assert.isTrue(Model.ejectAll === User2.ejectAll)
      assert.isTrue(User.ejectAll === User2.ejectAll)
      assert.isTrue(User2.ejectAll === User3.ejectAll)
    })
    it('should eject items that meet the criteria from the store', function () {
      class User extends Model {}
      User.setSchema({
        id: {}
      })
      User.inject([p1, p2, p3, p4, p5])
      assert.isDefined(User.get(5))
      assert.isDefined(User.get(6))
      assert.isDefined(User.get(7))
      assert.isDefined(User.get(8))
      assert.isDefined(User.get(9))
      assert.doesNotThrow(function () {
        User.ejectAll({ where: { author: 'Adam' } })
      })
      assert.isDefined(User.get(5))
      assert.isDefined(User.get(6))
      assert.isDefined(User.get(7))
      assert.isUndefined(User.get(8))
      assert.isUndefined(User.get(9))
    })
    it('should eject all items from the store', function () {
      const Post = this.Post
      Post.inject([p1, p2, p3, p4])

      assert.objectsEqual(Post.get(5), p1)
      assert.objectsEqual(Post.get(6), p2)
      assert.objectsEqual(Post.get(7), p3)
      assert.objectsEqual(Post.get(8), p4)

      // TODO?
      // store.store.post.completedQueries.test = 'stuff'

      assert.doesNotThrow(function () {
        Post.ejectAll()
      })

      // TODO?
      // assert.objectsEqual(store.store.post.completedQueries, {})
      assert.isUndefined(Post.get(5))
      assert.isUndefined(Post.get(6))
      assert.isUndefined(Post.get(7))
      assert.isUndefined(Post.get(8))
    })
  })
}
