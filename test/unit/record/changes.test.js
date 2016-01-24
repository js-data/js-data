export function init () {
  describe('changes', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.changes)
      Test.assert.isTrue(record.changes === Record.prototype.changes)
    })
    it('should be empty right after an instance is created', function () {
      const Test = this
      const post = new Test.Post.RecordClass(Test.data.p1)
      Test.assert.deepEqual(post.changes(), {})
    })
    it('should stay empty if an untracked field changes', function () {
      const Test = this
      const post = new Test.Post.RecordClass(Test.data.p1)
      Test.assert.deepEqual(post.changes(), {})
      post.author = 'Jake'
      Test.assert.deepEqual(post.changes(), {})
    })
    // it('should show changed tracked fields', function () {
    //   const Test = this
    //   Test.Post.setSchema({
    //     author: {
    //       type: 'string',
    //       track: true
    //     }
    //   })
    //   const post = new Test.Post(Test.data.p1)
    //   Test.assert.deepEqual(post.changes(), {})
    //   post.author = 'Jake'
    //   Test.assert.deepEqual(post.changes(), {
    //     author: 'Jake'
    //   })
    //   post.author = 'John'
    //   Test.assert.deepEqual(post.changes(), {})
    // })
  })
}
