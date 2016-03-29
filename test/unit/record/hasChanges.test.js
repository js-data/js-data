import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.hasChanges, 'function')
  t.ok(record.hasChanges === Record.prototype.hasChanges)
})
test('should detect when untracked fields are changed', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  t.false(post.hasChanges())
  post.author = 'Jake'
  t.ok(post.hasChanges())
})
test('should return true if a tracked field is changed', (t) => {
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
  t.false(post.hasChanges())
  post.author = 'Jake'
  t.ok(post.hasChanges())
  post.author = 'John'
  t.false(post.hasChanges())
})
