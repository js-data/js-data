export function init () {
  describe('hasChanges', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.hasChanges)
      Test.assert.isTrue(record.hasChanges === Record.prototype.hasChanges)
    })
    it('should detect when untracked fields are changed', function () {
      const Test = this
      const post = new Test.Post.recordClass(Test.data.p1)
      Test.assert.isFalse(post.hasChanges())
      post.author = 'Jake'
      Test.assert.isTrue(post.hasChanges())
    })
    it('should return true if a tracked field is changed', function () {
      const Test = this
      const PostMapper = new Test.JSData.Mapper({
        name: 'post',
        schema: {
          properties: {
            author: {
              type: 'string',
              track: true
            }
          }
        }
      })
      const post = PostMapper.createRecord(Test.data.p1)
      Test.assert.isFalse(post.hasChanges())
      post.author = 'Jake'
      Test.assert.isTrue(post.hasChanges())
      post.author = 'John'
      Test.assert.isFalse(post.hasChanges())
    })
  })
}
