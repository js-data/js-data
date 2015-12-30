/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('#changes', function () {
    it('should be an instance function', function () {
      assert.isFunction(Model.prototype.changes)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.changes)
      assert.isFunction(User2.prototype.changes)
      assert.isTrue(Model.prototype.changes === User.prototype.changes)
      assert.isTrue(Model.prototype.changes === User2.prototype.changes)
      assert.isTrue(User.prototype.changes === User2.prototype.changes)
      assert.isTrue(User2.prototype.changes === User3.prototype.changes)
    })
    it('should be empty right after an instance is created', function () {
      const post = new this.Post(this.data.p1)
      assert.deepEqual(post.changes(), {})
    })
    it('should stay empty if an untracked field changes', function () {
      const post = new this.Post(this.data.p1)
      assert.deepEqual(post.changes(), {})
      post.author = 'Jake'
      assert.deepEqual(post.changes(), {})
    })
    it('should show changed tracked fields', function () {
      this.Post.setSchema({
        author: {
          type: 'string',
          track: true
        }
      })
      const post = new this.Post(this.data.p1)
      assert.deepEqual(post.changes(), {})
      post.author = 'Jake'
      assert.deepEqual(post.changes(), {
        author: 'Jake'
      })
      post.author = 'John'
      assert.deepEqual(post.changes(), {})
    })
  })
}
