export function init () {
  describe('#hasChanges', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.hasChanges)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.hasChanges)
      Test.assert.isFunction(User2.prototype.hasChanges)
      Test.assert.isTrue(Test.JSData.Model.prototype.hasChanges === User.prototype.hasChanges)
      Test.assert.isTrue(Test.JSData.Model.prototype.hasChanges === User2.prototype.hasChanges)
      Test.assert.isTrue(User.prototype.hasChanges === User2.prototype.hasChanges)
      Test.assert.isTrue(User2.prototype.hasChanges === User3.prototype.hasChanges)
    })
    it('should return false if untracked fields are changed', function () {
      const Test = this
      const post = new Test.Post(Test.data.p1)
      Test.assert.isFalse(post.hasChanges())
      post.author = 'Jake'
      Test.assert.isFalse(post.hasChanges())
    })
    it('should return true if a tracked field is changed', function () {
      const Test = this
      Test.Post.setSchema({
        author: {
          type: 'string',
          track: true
        }
      })
      const post = new Test.Post(Test.data.p1)
      Test.assert.isFalse(post.hasChanges())
      post.author = 'Jake'
      Test.assert.isTrue(post.hasChanges())
      post.author = 'John'
      Test.assert.isFalse(post.hasChanges())
    })
  })
}
