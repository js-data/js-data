/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static hasChanges', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.hasChanges)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.hasChanges)
      assert.isFunction(User2.hasChanges)
      assert.isTrue(Model.hasChanges === User.hasChanges)
      assert.isTrue(Model.hasChanges === User2.hasChanges)
      assert.isTrue(User.hasChanges === User2.hasChanges)
      assert.isTrue(User2.hasChanges === User3.hasChanges)
    })
    it('should return false if untracked fields are changed', function () {
      this.Post.inject(this.data.p1)
      assert.isFalse(this.Post.hasChanges(5))
      this.Post.get(5).author = 'Jake'
      assert.isFalse(this.Post.hasChanges(5))
    })
    it('should return true if a tracked field is changed', function () {
      this.Post.setSchema({
        author: {
          type: 'string',
          track: true
        }
      })
      this.Post.inject(this.data.p1)
      assert.isFalse(this.Post.hasChanges(5))
      this.Post.get(5).author = 'Jake'
      assert.isTrue(this.Post.hasChanges(5))
      this.Post.get(5).author = 'John'
      assert.isFalse(this.Post.hasChanges(5))
    })
    it('should return undefined if the item is not in the store', function () {
      assert.isUndefined(this.Post.hasChanges(5))
    });
  })
}
