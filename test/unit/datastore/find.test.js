import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.find, 'function')
  t.ok(store.find === DataStore.prototype.find)
})
test('should find', async (t) => {
  const id = 1
  const props = { id, name: 'John' }
  let callCount = 0
  t.context.store.registerAdapter('mock', {
    find () {
      callCount++
      return JSData.utils.resolve(props)
    }
  }, { 'default': true })
  const user = await t.context.store.find('user', id)
  t.is(callCount, 1, 'find should have been called once')
  t.is(typeof t.context.store._completedQueries.user[id], 'function')
  t.context.objectsEqual(t, user, props, 'user should have been found')
  t.ok(user instanceof t.context.User.recordClass, 'user is a record')
  t.ok(user === await t.context.store.find('user', id), 'should return the cached user')
  t.is(callCount, 1, 'find should have been called once')
  t.ok(user === await t.context.store.find('user', id, { force: true }), 'should make a new query')
  t.is(callCount, 2, 'find should have been called twice')
  t.ok(user === await t.context.store.find('user', id), 'should return the cached user')
  t.is(callCount, 2, 'find should have been called twice')
})
test('should return pending query', async (t) => {
  const id = 1
  const props = { id, name: 'John' }
  let callCount = 0
  t.context.store.registerAdapter('mock', {
    find () {
      callCount++
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(props)
        }, 300)
      })
    }
  }, { 'default': true })
  const users = await Promise.all([
    t.context.store.find('user', id),
    t.context.store.find('user', id)
  ])
  t.is(callCount, 1, 'find should have been called once')
  t.context.objectsEqual(t, users[0], props, 'user should have been found')
  t.context.objectsEqual(t, users[1], props, 'user should have been found')
  t.ok(users[0] === users[1], 'users are the same object')
})
test('should delete pending query on error', (t) => {
  const id = 1
  let callCount = 0
  t.context.store.registerAdapter('mock', {
    find () {
      callCount++
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject('foo')
        }, 300)
      })
    }
  }, { 'default': true })
  const pendingQuery = t.context.store.find('user', id)
  t.ok(t.context.store._pendingQueries.user[id])
  return pendingQuery.catch(function (err) {
    t.is(callCount, 1, 'find should have been called once')
    t.notOk(t.context.store._pendingQueries.user[id])
    t.is(err, 'foo')
  })
})
