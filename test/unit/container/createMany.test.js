import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.createMany, 'function')
  t.ok(store.createMany === DataStore.prototype.createMany)
})
test.todo('should work')
