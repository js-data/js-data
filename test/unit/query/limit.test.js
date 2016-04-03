import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should correctly apply "limit" predicates', (t) => {
  const p1 = t.context.data.p1
  const p2 = t.context.data.p2
  const p3 = t.context.data.p3
  const p4 = t.context.data.p4
  t.context.store.add('post', [p1, p2, p3, p4])
  let params = {
    limit: 1
  }

  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p1], 'should limit to 1')
  t.context.objectsEqual(t, t.context.store.query('post').limit(params.limit).run(), [p1], 'should limit to 1')

  params.limit = 2
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p1, p2], 'should limit to 2')
  t.context.objectsEqual(t, t.context.store.query('post').limit(params.limit).run(), [p1, p2], 'should limit to 2')

  params.limit = 3
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p1, p2, p3], 'should limit to 3')
  t.context.objectsEqual(t, t.context.store.query('post').limit(params.limit).run(), [p1, p2, p3], 'should limit to 3')

  params.limit = 4
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should limit to 4')
  t.context.objectsEqual(t, t.context.store.query('post').limit(params.limit).run(), [p1, p2, p3, p4], 'should limit to 4')
})
test('should correctly apply "limit" and "skip" predicates together', (t) => {
  const p1 = t.context.data.p1
  const p2 = t.context.data.p2
  const p3 = t.context.data.p3
  const p4 = t.context.data.p4
  t.context.store.add('post', [p1, p2, p3, p4])
  let params = {
    limit: 1,
    skip: 1
  }

  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p2], 'should limit to 1 and skip 2')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).limit(params.limit).run(), [p2], 'should limit to 1 and skip 2')

  params.limit = 2
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p2, p3], 'should limit to 2 and skip 1')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).limit(params.limit).run(), [p2, p3], 'should limit to 2 and skip 1')

  params.skip = 2
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p3, p4], 'should limit to 2 and skip 2')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).limit(params.limit).run(), [p3, p4], 'should limit to 2 and skip 2')

  params.limit = 1
  params.skip = 3
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p4], 'should limit to 1 and skip 3')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).limit(params.limit).run(), [p4], 'should limit to 1 and skip 3')

  params.limit = 8
  params.skip = 0
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should return all items')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).limit(params.limit).run(), [p1, p2, p3, p4], 'should return all items')

  params.limit = 1
  params.skip = 5
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
  t.context.objectsEqual(t, t.context.store.query('post').skip(params.skip).limit(params.limit).run(), [], 'should return nothing if skip if greater than the number of items')

  params.limit = 8
  delete params.skip
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should return all items')
  t.throws(function () {
    t.context.store.query('post').skip(params.skip).limit(params.limit).run()
  }, TypeError, 'skip: Expected number but found undefined!', 'skip() should throw error if "num" is not a number')

  delete params.limit
  params.skip = 5
  t.context.objectsEqual(t, t.context.store.query('post').filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
  t.throws(function () {
    t.context.store.query('post').skip(params.skip).limit(params.limit).run()
  }, TypeError, 'limit: Expected number but found undefined!', 'limit() should throw error if "num" is not a number')
})
