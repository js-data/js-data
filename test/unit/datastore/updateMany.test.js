import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.updateMany, 'function')
  t.ok(store.updateMany === DataStore.prototype.updateMany)
})
test('should updateMany', async (t) => {
  const props = [{ id: 1, name: 'John' }]
  t.context.store.registerAdapter('mock', {
    updateMany () {
      props[0].foo = 'bar'
      return JSData.utils.resolve(props)
    }
  }, { 'default': true })
  const users = await t.context.store.updateMany('user', props)
  t.is(users[0].foo, 'bar', 'user was updated')
  t.ok(users[0] instanceof t.context.store.getMapper('user').recordClass, 'user is a record')
})
