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
test('should createMany', async (t) => {
  const props = [{ name: 'John' }]
  t.context.store.registerAdapter('mock', {
    createMany () {
      props[0].id = 1
      return JSData.utils.resolve(props)
    }
  }, { 'default': true })
  const users = await t.context.store.createMany('user', props)
  t.ok(users[0][t.context.store.getMapper('user').idAttribute], 'new user has an id')
  t.ok(users[0] instanceof t.context.store.getMapper('user').recordClass, 'user is a record')
})
