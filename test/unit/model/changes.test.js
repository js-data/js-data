export function init () {
  describe('#changes', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.changes)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.changes)
      Test.assert.isFunction(User2.prototype.changes)
      Test.assert.isTrue(Test.JSData.Model.prototype.changes === User.prototype.changes)
      Test.assert.isTrue(Test.JSData.Model.prototype.changes === User2.prototype.changes)
      Test.assert.isTrue(User.prototype.changes === User2.prototype.changes)
      Test.assert.isTrue(User2.prototype.changes === User3.prototype.changes)
    })
    it('should be empty right after an instance is created', function () {
      const Test = this
      const post = new Test.Post(Test.data.p1)
      Test.assert.deepEqual(post.changes(), {})
    })
    it('should stay empty if an untracked field changes', function () {
      const Test = this
      const post = new Test.Post(Test.data.p1)
      Test.assert.deepEqual(post.changes(), {})
      post.author = 'Jake'
      Test.assert.deepEqual(post.changes(), {})
    })
    it('should show changed tracked fields', function () {
      const Test = this
      Test.Post.setSchema({
        author: {
          type: 'string',
          track: true
        }
      })
      const post = new Test.Post(Test.data.p1)
      Test.assert.deepEqual(post.changes(), {})
      post.author = 'Jake'
      Test.assert.deepEqual(post.changes(), {
        author: 'Jake'
      })
      post.author = 'John'
      Test.assert.deepEqual(post.changes(), {})
    })
  })
}
