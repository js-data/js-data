import { assert, JSData } from '../../_setup'

describe('DataStore#destroy', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.destroy, 'function')
    assert.strictEqual(store.destroy, DataStore.prototype.destroy)
  })
  it('should destroy', async function () {
    const id = 1
    let destroyCalled
    this.store._pendingQueries.user[id] = new Date().getTime()
    this.store._completedQueries.user[id] = new Date().getTime()
    const user = this.store.add('user', { id, name: 'John' })
    this.store.registerAdapter('mock', {
      destroy () {
        destroyCalled = true
        return JSData.utils.resolve()
      }
    }, { 'default': true })
    const result = await this.store.destroy('user', id)
    assert(destroyCalled, 'Adapter#destroy should have been called')
    assert(!this.store._pendingQueries.user[id])
    assert(!this.store._completedQueries.user[id])
    assert(!this.store.get('user', id))
    assert.strictEqual(result, user, 'ejected user should have been returned')
  })
  it('should return raw', async function () {
    const id = 1
    let destroyCalled
    this.store._pendingQueries.user[id] = new Date().getTime()
    this.store._completedQueries.user[id] = new Date().getTime()
    const user = this.store.add('user', { id, name: 'John' })
    this.store.registerAdapter('mock', {
      destroy () {
        destroyCalled = true
        return JSData.utils.resolve({
          deleted: 1
        })
      }
    }, { 'default': true })
    const result = await this.store.destroy('user', id, { raw: true })
    assert(destroyCalled, 'Adapter#destroy should have been called')
    assert(!this.store._pendingQueries.user[id])
    assert(!this.store._completedQueries.user[id])
    assert(!this.store.get('user', id))
    assert.equal(result.adapter, 'mock', 'should have adapter name in response')
    assert.equal(result.deleted, 1, 'should have other metadata in response')
    assert.strictEqual(result.data, user, 'ejected user should have been returned')
  })
})
