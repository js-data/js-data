/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static changes', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.changes)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.changes)
      assert.isFunction(User2.changes)
      assert.isTrue(Model.changes === User.changes)
      assert.isTrue(Model.changes === User2.changes)
      assert.isTrue(User.changes === User2.changes)
      assert.isTrue(User2.changes === User3.changes)
    })
    it('should be empty right after an instance is created', function () {
      this.Post.inject(this.data.p1)
      assert.deepEqual(this.Post.changes(5), {})
    })
    it('should stay empty if an untracked field changes', function () {
      this.Post.inject(this.data.p1)
      assert.deepEqual(this.Post.changes(5), {})
      this.Post.get(5).author = 'Jake'
      assert.deepEqual(this.Post.changes(5), {})
    })
    it('should show changed tracked fields', function () {
      this.Post.setSchema({
        author: {
          type: 'string',
          track: true
        }
      })
      this.Post.inject(this.data.p1)
      assert.deepEqual(this.Post.changes(5), {})
      this.Post.get(5).author = 'Jake'
      assert.deepEqual(this.Post.changes(5), {
        author: 'Jake'
      })
      this.Post.get(5).author = 'John'
      assert.deepEqual(this.Post.changes(5), {})
    })
    it('should return undefined if the item is not in the store', function () {
      assert.isUndefined(this.Post.changes(5))
    });
  })
}
