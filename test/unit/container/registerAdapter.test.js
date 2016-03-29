import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.registerAdapter, 'function')
  t.ok(store.registerAdapter === DataStore.prototype.registerAdapter)
})
test('should register an adapter', (t) => {
  const Container = JSData.Container
  const container = new Container()
  container.registerAdapter('foo', {}, { 'default': true })
  container.registerAdapter('bar', {})
  t.same(container.getAdapters(), {
    foo: {},
    bar: {}
  })
  const mapper = container.defineMapper('foo')
  t.same(mapper.getAdapters(), {
    foo: {},
    bar: {}
  })
  t.is(container.mapperDefaults.defaultAdapter, 'foo')
})
