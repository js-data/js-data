import { assert, JSData } from '../../_setup'

describe('DataStore#defineMapper', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.defineMapper, 'function')
    assert.strictEqual(store.defineMapper, DataStore.prototype.defineMapper)
  })
  it('should create indexes for indexed properties', function () {
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

    assert.objectsEqual(
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
})
