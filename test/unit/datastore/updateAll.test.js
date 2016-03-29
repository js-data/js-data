import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.updateAll, 'function')
  t.ok(store.updateAll === DataStore.prototype.updateAll)
})
test('should updateAll', async (t) => {
  const query = { name: 'John' }
  const props = [{ id: 1, name: 'John' }]
  t.context.store.registerAdapter('mock', {
    updateAll () {
      props[0].foo = 'bar'
      return JSData.utils.resolve(props)
    }
  }, { 'default': true })
  const users = await t.context.store.updateAll('user', query, props)
  t.is(users[0].foo, 'bar', 'user was updated')
  t.ok(users[0] instanceof t.context.store.getMapper('user').recordClass, 'user is a record')
})
