export function init () {
  describe('revert', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.revert)
      Test.assert.isTrue(record.revert === Record.prototype.revert)
    })
    it('should return the previous version of an item', function () {
      const Test = this
      const post = new Test.Post.recordClass(Test.data.p1)
      post.author = 'Jake'
      post.revert()
      Test.assert.objectsEqual(post, Test.data.p1)
    })
    it('should preserve fields in the optional preserve array', function () {
      const Test = this
      const post = new Test.Post.recordClass(Test.data.p1)
      post.author = 'Jake'
      post.age = 20
      post.revert({ preserve: ['age'] })
      Test.assert.equal(post.age, 20, 'The age of the post should have been preserved')
      Test.assert.equal(post.author, 'John', 'The author of the post should have been reverted')
    })
    it('should revert key which has not been injected', function () {
      const Test = this
      const post = new Test.Post.recordClass(Test.data.p1)
      Test.assert.isUndefined(post.newProperty)
      post.newProperty = 'new Property'
      post.revert()
      Test.assert.isUndefined(post.newProperty)
    })
  })
}
