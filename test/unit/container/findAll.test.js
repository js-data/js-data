import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.findAll, 'function')
  t.ok(store.findAll === DataStore.prototype.findAll)
})
test.todo('should work')
