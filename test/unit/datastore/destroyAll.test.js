import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.destroyAll, 'function')
  t.ok(store.destroyAll === DataStore.prototype.destroyAll)
})
test('should destroyAll', async (t) => {
  const query = { name: 'John' }
  let destroyCalled
  t.context.store._pendingQueries.user[t.context.store.hashQuery('user', query)] = new Date().getTime()
  t.context.store._completedQueries.user[t.context.store.hashQuery('user', query)] = new Date().getTime()
  const users = t.context.store.add('user', [{ id: 1, name: 'John' }])
  t.context.store.registerAdapter('mock', {
    destroyAll () {
      destroyCalled = true
      return JSData.utils.resolve()
    }
  }, { 'default': true })
  const result = await t.context.store.destroyAll('user', query)
  t.ok(destroyCalled, 'Adapter#destroyAll should have been called')
  t.context.objectsEqual(t, result, users, 'returned data')
})
test('should return raw', async (t) => {
  const query = { name: 'John' }
  let destroyCalled
  t.context.store._pendingQueries.user[t.context.store.hashQuery('user', query)] = new Date().getTime()
  t.context.store._completedQueries.user[t.context.store.hashQuery('user', query)] = new Date().getTime()
  const users = t.context.store.add('user', [{ id: 1, name: 'John' }])
  t.context.store.registerAdapter('mock', {
    destroyAll () {
      destroyCalled = true
      return JSData.utils.resolve({
        deleted: 1
      })
    }
  }, { 'default': true })
  const result = await t.context.store.destroyAll('user', query, { raw: true })
  t.ok(destroyCalled, 'Adapter#destroyAll should have been called')
  t.notOk(t.context.store._pendingQueries.user[t.context.store.hashQuery('user', query)])
  t.notOk(t.context.store._completedQueries.user[t.context.store.hashQuery('user', query)])
  t.notOk(t.context.store.get('user', 1))
  t.is(result.adapter, 'mock', 'should have adapter name in response')
  t.is(result.deleted, 1, 'should have other metadata in response')
  t.context.objectsEqual(t, result.data, users, 'ejected users should have been returned')
})
