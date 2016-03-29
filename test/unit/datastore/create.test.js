import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.create, 'function')
  t.ok(store.create === DataStore.prototype.create)
})
test('should create', async (t) => {
  const props = { name: 'John' }
  t.context.store.registerAdapter('mock', {
    create () {
      props.id = 1
      return JSData.utils.resolve(props)
    }
  }, { 'default': true })
  const user = await t.context.store.create('user', props)
  t.ok(user[t.context.store.getMapper('user').idAttribute], 'new user has an id')
  t.ok(user instanceof t.context.store.getMapper('user').recordClass, 'user is a record')
})
