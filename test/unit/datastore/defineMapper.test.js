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
          id: { type: 'number' },
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
  it('can get a scoped reference', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    const fooMapper = store.defineMapper('foo')
    const fooStore = store.as('foo')

    assert.strictEqual(fooStore._adapters, store._adapters)
    assert.strictEqual(fooStore._mappers, store._mappers)
    assert.strictEqual(fooStore._collections, store._collections)
    assert.strictEqual(fooStore._listeners, store._listeners)
    assert.strictEqual(fooStore.getMapper(), store.getMapper('foo'))
    assert.strictEqual(fooStore.getCollection(), store.getCollection('foo'))
    assert.deepEqual(fooStore.createRecord({ foo: 'bar' }), store.createRecord('foo', { foo: 'bar' }))
    assert.strictEqual(fooMapper, store.getMapper('foo'))
    assert.strictEqual(fooStore.getMapper(), store.getMapper('foo'))
  })
})
