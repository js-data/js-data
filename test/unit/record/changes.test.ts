import { assert, JSData, objectsEqual } from '../../_setup'

describe('Record#changes', () => {
  it('should be an instance method', () => {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.changes, 'function')
    assert.strictEqual(record.changes, Record.prototype.changes)
  })
  it('should be empty right after an instance is created', function () {
    const post = new this.Post.recordClass(this.data.p1); // eslint-disable-line
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
  })
  it('should detect tracked field changes', function () {
    const post = new this.Post.recordClass(this.data.p1); // eslint-disable-line
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.author = 'Jake'
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    })
  })
  it('should detect untracked field changes', function () {
    const post = new this.Post.recordClass(this.data.p1); // eslint-disable-line
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.foo = 'bar'
    objectsEqual(post.changes(), {
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
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.author = 'Jake'
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    })
    post.author = 'John'
    objectsEqual(post.changes(), {
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
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
    post.author = 'Jake'
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {
        author: 'Jake'
      }
    })
    post.author = 'John'
    objectsEqual(post.changes(), {
      added: {},
      removed: {},
      changed: {}
    })
  })
})
