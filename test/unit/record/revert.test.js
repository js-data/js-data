import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.revert, 'function')
  t.ok(record.revert === Record.prototype.revert)
})
test('should return the previous version of an item', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  post.author = 'Jake'
  post.revert()
  t.context.objectsEqual(t, post, t.context.data.p1)
})
test('should preserve fields in the optional preserve array', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  post.author = 'Jake'
  post.age = 20
  post.revert({ preserve: ['age'] })
  t.is(post.age, 20, 'The age of the post should have been preserved')
  t.is(post.author, 'John', 'The author of the post should have been reverted')
})
test('should revert key which has not been injected', (t) => {
  const post = new t.context.Post.recordClass(t.context.data.p1)
  t.notOk(post.newProperty)
  post.newProperty = 'new Property'
  post.revert()
  t.notOk(post.newProperty)
})
