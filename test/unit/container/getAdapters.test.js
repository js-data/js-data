import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.getAdapters, 'function')
  t.ok(store.getAdapters === DataStore.prototype.getAdapters)
})
test('should return the adapters of the container', (t) => {
  const Container = JSData.Container
  const container = new Container()
  t.ok(container.getAdapters() === container._adapters)
})
