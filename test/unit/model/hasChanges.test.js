/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#hasChanges', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.hasChanges)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.hasChanges)
      assert.isFunction(User2.prototype.hasChanges)
      assert.isTrue(Model.prototype.hasChanges === User.prototype.hasChanges)
      assert.isTrue(Model.prototype.hasChanges === User2.prototype.hasChanges)
      assert.isTrue(User.prototype.hasChanges === User2.prototype.hasChanges)
      assert.isTrue(User2.prototype.hasChanges === User3.prototype.hasChanges)
    })
    it('should return false if untracked fields are changed', function () {
      const post = new this.Post(this.data.p1)
      assert.isFalse(post.hasChanges())
      post.author = 'Jake'
      assert.isFalse(post.hasChanges())
    })
    it('should return true if a tracked field is changed', function () {
      this.Post.setSchema({
        author: {
          type: 'string',
          track: true
        }
      })
      const post = new this.Post(this.data.p1)
      assert.isFalse(post.hasChanges())
      post.author = 'Jake'
      assert.isTrue(post.hasChanges())
      post.author = 'John'
      assert.isFalse(post.hasChanges())
    })
  })
}
