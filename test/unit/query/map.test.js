import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should work', (t) => {
  const collection = t.context.PostCollection
  const p1 = t.context.data.p1
  const p2 = t.context.data.p2
  const p3 = t.context.data.p3
  const p4 = t.context.data.p4
  const p5 = t.context.data.p5

  t.context.store.add('post', [p1, p2, p3, p4, p5])
  const ids = collection.query().map(function (post) {
    return post.id
  }).run()
  t.same(ids, [5, 6, 7, 8, 9])
})
