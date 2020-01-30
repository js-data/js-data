import { assert, JSData } from '../../_setup'

describe('DataStore#getCollection', () => {
  it('should work', () => {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.getCollection, 'function')
    assert.strictEqual(store.getCollection, DataStore.prototype.getCollection)

    store.defineMapper('user')
    assert.strictEqual(store._collections.user, store.getCollection('user'))

    assert.throws(
      () => {
        store.getCollection('foo')
      },
      Error,
      '[SimpleStore#getCollection:foo] collection not found\nhttp://www.js-data.io/v3.0/docs/errors#404'
    )
  })
})
