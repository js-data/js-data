import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.update, 'function')
  t.ok(store.update === DataStore.prototype.update)
})
test('should update', async (t) => {
  const id = 1
  const props = { id, name: 'John' }
  t.context.store.registerAdapter('mock', {
    update () {
      props.foo = 'bar'
      return JSData.utils.resolve(props)
    }
  }, { 'default': true })
  const user = await t.context.store.update('user', id, props)
  t.is(user.foo, 'bar', 'user was updated')
  t.ok(user instanceof t.context.store.getMapper('user').recordClass, 'user is a record')
})
