import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.changes, 'function')
  t.ok(record.changes === Record.prototype.changes)
})
test('should be empty right after an instance is created', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  t.context.objectsEqual(post.changes(), {
    added: {},
    removed: {},
    changed: {}
  })
})
test('should detect tracked field changes', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  t.context.objectsEqual(post.changes(), {
    added: {},
    removed: {},
    changed: {}
  })
  post.author = 'Jake'
  t.context.objectsEqual(post.changes(), {
    added: {},
    removed: {},
    changed: {
      author: 'Jake'
    }
  })
})
test('should detect untracked field changes', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  t.context.objectsEqual(post.changes(), {
    added: {},
    removed: {},
    changed: {}
  })
  post.foo = 'bar'
  t.context.objectsEqual(post.changes(), {
    added: {
      foo: 'bar'
    },
    removed: {},
    changed: {}
  })
})
test('should show changed tracked fields', (t) => {
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
  const post = PostMapper.createRecord(t.context.data.p1)
  t.context.objectsEqual(post.changes(), {
    added: {},
    removed: {},
    changed: {}
  })
  post.author = 'Jake'
  t.context.objectsEqual(post.changes(), {
    added: {},
    removed: {},
    changed: {
      author: 'Jake'
    }
  })
  post.author = 'John'
  t.context.objectsEqual(post.changes(), {
    added: {},
    removed: {},
    changed: {}
  })
})
