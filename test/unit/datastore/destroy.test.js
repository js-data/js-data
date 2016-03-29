import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.destroy, 'function')
  t.ok(store.destroy === DataStore.prototype.destroy)
})
test('should destroy', async (t) => {
  const id = 1
  let destroyCalled
  t.context.store._pendingQueries.user[id] = new Date().getTime()
  t.context.store._completedQueries.user[id] = new Date().getTime()
  const user = t.context.store.add('user', { id, name: 'John' })
  t.context.store.registerAdapter('mock', {
    destroy () {
      destroyCalled = true
      return JSData.utils.resolve()
    }
  }, { 'default': true })
  const result = await t.context.store.destroy('user', id)
  t.ok(destroyCalled, 'Adapter#destroy should have been called')
  t.notOk(t.context.store._pendingQueries.user[id])
  t.notOk(t.context.store._completedQueries.user[id])
  t.notOk(t.context.store.get('user', id))
  t.ok(result === user, 'ejected user should have been returned')
})
test('should return raw', async (t) => {
  const id = 1
  let destroyCalled
  t.context.store._pendingQueries.user[id] = new Date().getTime()
  t.context.store._completedQueries.user[id] = new Date().getTime()
  const user = t.context.store.add('user', { id, name: 'John' })
  t.context.store.registerAdapter('mock', {
    destroy () {
      destroyCalled = true
      return JSData.utils.resolve({
        deleted: 1
      })
    }
  }, { 'default': true })
  const result = await t.context.store.destroy('user', id, { raw: true })
  t.ok(destroyCalled, 'Adapter#destroy should have been called')
  t.notOk(t.context.store._pendingQueries.user[id])
  t.notOk(t.context.store._completedQueries.user[id])
  t.notOk(t.context.store.get('user', id))
  t.is(result.adapter, 'mock', 'should have adapter name in response')
  t.is(result.deleted, 1, 'should have other metadata in response')
  t.ok(result.data === user, 'ejected user should have been returned')
})
