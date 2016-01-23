export function init () {
  describe('#revert', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.revert)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.revert)
      Test.assert.isFunction(User2.prototype.revert)
      Test.assert.isTrue(Test.JSData.Model.prototype.revert === User.prototype.revert)
      Test.assert.isTrue(Test.JSData.Model.prototype.revert === User2.prototype.revert)
      Test.assert.isTrue(User.prototype.revert === User2.prototype.revert)
      Test.assert.isTrue(User2.prototype.revert === User3.prototype.revert)
    })
    it('should return the previous version of an item', function () {
      const Test = this
      const post = new Test.Post(Test.data.p1)
      post.author = 'Jake'
      post.revert()
      Test.assert.objectsEqual(post, Test.data.p1)
    })
    it('should preserve fields in the optional preserve array', function () {
      const Test = this
      const post = new Test.Post(Test.data.p1)
      post.author = 'Jake'
      post.age = 20
      post.revert({ preserve: ['age'] })
      Test.assert.equal(post.age, 20, 'The age of the post should have been preserved')
      Test.assert.equal(post.author, 'John', 'The author of the post should have been reverted')
    })
    it('should revert key which has not been injected', function () {
      const Test = this
      const post = new Test.Post(Test.data.p1)
      Test.assert.isUndefined(post.newProperty)
      post.newProperty = 'new Property'
      post.revert()
      Test.assert.isUndefined(post.newProperty)
    })
  })
}
