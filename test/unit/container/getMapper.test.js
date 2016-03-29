import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.getMapper, 'function')
  t.ok(store.getMapper === DataStore.prototype.getMapper)
})
test('should return the specified mapper', (t) => {
  const Container = JSData.Container
  const container = new Container()
  const foo = container.defineMapper('foo')
  t.ok(foo === container.getMapper('foo'))
  t.throws(function () {
    container.getMapper('bar')
  }, ReferenceError, 'bar is not a registered mapper!')
})
