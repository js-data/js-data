import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should correctly apply "skip" predicates', (t) => {
  const p1 = t.context.data.p1
  const p2 = t.context.data.p2
  const p3 = t.context.data.p3
  const p4 = t.context.data.p4
  t.context.store.add('post', [p1, p2, p3, p4])
  let params = {
    skip: 1
  }

  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p2, p3, p4], 'should skip 1')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).run(), [p2, p3, p4], 'should skip 1')

  params.skip = 2
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p3, p4], 'should skip 2')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).run(), [p3, p4], 'should skip 2')

  params.skip = 3
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p4], 'should skip 3')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).run(), [p4], 'should skip 3')

  params.skip = 4
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [], 'should skip 4')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).run(), [], 'should skip 4')
})
