import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.previous, 'function')
  t.ok(record.previous === Record.prototype.previous)
})
test('should hold previous data', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  t.context.objectsEqual(t, post, post.previous())
  post.foo = 'bar'
  t.context.objectsNotEqual(t, post, post.previous())
  delete post.foo
  t.context.objectsEqual(t, post, post.previous())
})
test('should hold previous data for a specified key', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  t.is('John', post.previous('author'))
  post.author = 'Arnold'
  t.is('John', post.previous('author'))
  post.author = 'John'
  t.is('John', post.previous('author'))
})
