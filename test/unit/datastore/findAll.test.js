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
test('should findAll', async (t) => {
  const query = { name: 'John' }
  const props = [{ id: 1, name: 'John' }]
  let callCount = 0
  t.context.store.registerAdapter('mock', {
    findAll () {
      callCount++
      return JSData.utils.resolve(props)
    }
  }, { 'default': true })
  const users = await t.context.store.findAll('user', query)
  t.is(callCount, 1, 'findAll should have been called once')
  t.is(typeof t.context.store._completedQueries.user[t.context.store.hashQuery('user', query)], 'number')
  t.context.objectsEqual(t, users, props, 'users should have been found')
  t.ok(users[0] instanceof t.context.User.recordClass, 'user is a record')
  t.context.objectsEqual(t, await t.context.store.findAll('user', query), users, 'should return the cached users')
  t.is(callCount, 1, 'findAll should have been called once')
  t.context.objectsEqual(t, await t.context.store.findAll('user', query, { force: true }), props, 'should make a new query')
  t.is(callCount, 2, 'findAll should have been called twice')
  t.context.objectsEqual(t, await t.context.store.findAll('user', query), props, 'should return the cached users')
  t.is(callCount, 2, 'findAll should have been called twice')
})
test('should return pending query', async (t) => {
  const query = { name: 'John' }
  const props = [{ id: 1, name: 'John' }]
  let callCount = 0
  t.context.store.registerAdapter('mock', {
    findAll () {
      callCount++
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(props)
        }, 300)
      })
    }
  }, { 'default': true })
  const results = await Promise.all([
    t.context.store.findAll('user', query),
    t.context.store.findAll('user', query)
  ])
  t.is(callCount, 1, 'findAll should have been called once')
  t.context.objectsEqual(t, results[0], props, 'users should have been found')
  t.context.objectsEqual(t, results[1], props, 'users should have been found')
  t.ok(results[0][0] === results[1][0], 'users are the same object')
})
test('should delete pending query on error', (t) => {
  const query = { name: 'John' }
  let callCount = 0
  t.context.store.registerAdapter('mock', {
    findAll () {
      callCount++
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject('foo')
        }, 300)
      })
    }
  }, { 'default': true })
  const pendingQuery = t.context.store.findAll('user', query)
  t.ok(t.context.store._pendingQueries.user[t.context.store.hashQuery('user', query)])
  return pendingQuery.catch(function (err) {
    t.is(callCount, 1, 'findAll should have been called once')
    t.notOk(t.context.store._pendingQueries.user[t.context.store.hashQuery('user', query)])
    t.is(err, 'foo')
  })
})
