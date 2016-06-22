import { assert, JSData } from '../../_setup'

describe('Record#changes', function () {
  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.changes, 'function')
    assert.strictEqual(record.changes, Record.prototype.changes)
  })
  it('should be empty right after an instance is created', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
  })
  it('should detect tracked field changes', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.author = 'Jake'
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    })
  })
  it('should detect untracked field changes', function () {
    const post = new this.Post.recordClass(this.data.p1) // eslint-disable-line
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.foo = 'bar'
    assert.objectsEqual(post.changes(), {
      added: {
        foo: 'bar'
      },
      removed: {},
      changed: {}
    })
  })
  it('should show changed tracked fields', function () {
    const PostMapper = new JSData.Mapper({
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
    const post = PostMapper.createRecord(this.data.p1)
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.author = 'Jake'
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    })
    post.author = 'John'
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
  })
  it('should show changed tracked fields (tracking all fields)', function () {
    const PostMapper = new JSData.Mapper({
      name: 'post',
      schema: {
        track: true,
        properties: {
          author: {
            type: 'string'
          }
        }
      }
    })
    const post = PostMapper.createRecord(this.data.p1)
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.author = 'Jake'
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    })
    post.author = 'John'
    assert.objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
  })
})
