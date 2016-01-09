/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#revert', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.revert)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.revert)
      assert.isFunction(User2.prototype.revert)
      assert.isTrue(Model.prototype.revert === User.prototype.revert)
      assert.isTrue(Model.prototype.revert === User2.prototype.revert)
      assert.isTrue(User.prototype.revert === User2.prototype.revert)
      assert.isTrue(User2.prototype.revert === User3.prototype.revert)
    })
    it('should return the previous version of an item', function () {
      const post = new this.Post(this.data.p1)
      post.author = 'Jake'
      post.revert()
      assert.objectsEqual(post, this.data.p1)
    })
    it('should preserve fields in the optional preserve array', function () {
      const post = new this.Post(this.data.p1)
      post.author = 'Jake'
      post.age = 20
      post.revert({ preserve: ['age'] })
      assert.equal(post.age, 20, 'The age of the post should have been preserved')
      assert.equal(post.author, 'John', 'The author of the post should have been reverted')
    })
    it('should revert key which has not been injected', function() {
      const post = new this.Post(this.data.p1)
      assert.isUndefined(post.newProperty)
      post.newProperty = 'new Property'
      post.revert()
      assert.isUndefined(post.newProperty)
    })
  })
}
