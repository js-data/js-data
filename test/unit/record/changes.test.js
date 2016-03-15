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
      Test.assert.objectsEqual(post.changes(), {
        added: {},
        removed: {},
        changed: {}
      })
    })
    it('should detect tracked field changes', function () {
      const Test = this
      const post = new Test.Post.RecordClass(Test.data.p1)
      Test.assert.objectsEqual(post.changes(), {
        added: {},
        removed: {},
        changed: {}
      })
      post.author = 'Jake'
      Test.assert.objectsEqual(post.changes(), {
        added: {},
        removed: {},
        changed: {
          author: 'Jake'
        }
      })
    })
    it('should detect untracked field changes', function () {
      const Test = this
      const post = new Test.Post.RecordClass(Test.data.p1)
      Test.assert.objectsEqual(post.changes(), {
        added: {},
        removed: {},
        changed: {}
      })
      post.foo = 'bar'
      Test.assert.objectsEqual(post.changes(), {
        added: {
          foo: 'bar'
        },
        removed: {},
        changed: {}
      })
    })
    it('should show changed tracked fields', function () {
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
      Test.assert.objectsEqual(post.changes(), {
        added: {},
        removed: {},
        changed: {}
      })
      post.author = 'Jake'
      Test.assert.objectsEqual(post.changes(), {
        added: {},
        removed: {},
        changed: {
          author: 'Jake'
        }
      })
      post.author = 'John'
      Test.assert.objectsEqual(post.changes(), {
        added: {},
        removed: {},
        changed: {}
      })
    })
  })
}
