import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.is(typeof store.defineMapper, 'function')
  t.ok(store.defineMapper === DataStore.prototype.defineMapper)
})
test('should create indexes for indexed properties', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('user', {
    schema: {
      properties: {
        age: { indexed: true },
        role: { indexed: true }
      }
    }
  })
  store.add('user', [
    { id: 2, age: 18, role: 'admin' },
    { id: 3, age: 19, role: 'dev' },
    { id: 9, age: 19, role: 'admin' },
    { id: 6, age: 19, role: 'owner' },
    { id: 4, age: 22, role: 'dev' },
    { id: 1, age: 23, role: 'owner' }
  ])

  t.context.objectsEqual(t,
    store.getAll('user', 19, { index: 'age' }).map(function (user) {
      return user.toJSON()
    }),
    [
      { id: 3, age: 19, role: 'dev' },
      { id: 6, age: 19, role: 'owner' },
      { id: 9, age: 19, role: 'admin' }
    ],
    'should have found all of age:19 using 1 keyList'
  )
})
