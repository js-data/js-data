import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.getCollection, 'function')
  t.ok(store.getCollection === DataStore.prototype.getCollection)
})
test('should get a collection', (t) => {
  t.ok(t.context.UserCollection === t.context.store.getCollection('user'))
})
test('should throw an error', (t) => {
  t.throws(function () {
    t.context.store.getCollection('foo')
  }, ReferenceError, 'foo is not a registered collection!')
})
