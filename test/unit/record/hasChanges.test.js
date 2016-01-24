export function init () {
  describe('hasChanges', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.hasChanges)
      Test.assert.isTrue(record.hasChanges === Record.prototype.hasChanges)
    })
    it('should return false if untracked fields are changed', function () {
      const Test = this
      const post = new Test.Post.RecordClass(Test.data.p1)
      Test.assert.isFalse(post.hasChanges())
      post.author = 'Jake'
      Test.assert.isFalse(post.hasChanges())
    })
    // it('should return true if a tracked field is changed', function () {
    //   const Test = this
    //   Test.Post.setSchema({
    //     author: {
    //       type: 'string',
    //       track: true
    //     }
    //   })
    //   const post = new Test.Post(Test.data.p1)
    //   Test.assert.isFalse(post.hasChanges())
    //   post.author = 'Jake'
    //   Test.assert.isTrue(post.hasChanges())
    //   post.author = 'John'
    //   Test.assert.isFalse(post.hasChanges())
    // })
  })
}
