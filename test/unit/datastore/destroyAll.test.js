import { assert, JSData } from '../../_setup'

describe('DataStore#destroyAll', function () {
  it('should be an instance method', function () {
    const DataStore = JSData.DataStore
    const store = new DataStore()
    assert.equal(typeof store.destroyAll, 'function')
    assert.strictEqual(store.destroyAll, DataStore.prototype.destroyAll)
  })
  it('should destroyAll', async function () {
    const query = { name: 'John' }
    let destroyCalled
    this.store._pendingQueries.user[this.store.hashQuery('user', query)] = new Date().getTime()
    this.store._completedQueries.user[this.store.hashQuery('user', query)] = new Date().getTime()
    const users = this.store.add('user', [{ id: 1, name: 'John' }])
    this.store.registerAdapter('mock', {
      destroyAll () {
        destroyCalled = true
        return JSData.utils.resolve()
      }
    }, { default: true })
    const result = await this.store.destroyAll('user', query)
    assert(destroyCalled, 'Adapter#destroyAll should have been called')
    assert.objectsEqual(result, users, 'returned data')
  })
  it('should return raw', async function () {
    const query = { name: 'John' }
    let destroyCalled
    this.store._pendingQueries.user[this.store.hashQuery('user', query)] = new Date().getTime()
    this.store._completedQueries.user[this.store.hashQuery('user', query)] = new Date().getTime()
    const users = this.store.add('user', [{ id: 1, name: 'John' }])
    this.store.registerAdapter('mock', {
      destroyAll () {
        destroyCalled = true
        return JSData.utils.resolve({
          deleted: 1
        })
      }
    }, { default: true })
    const result = await this.store.destroyAll('user', query, { raw: true })
    assert(destroyCalled, 'Adapter#destroyAll should have been called')
    assert(!this.store._pendingQueries.user[this.store.hashQuery('user', query)])
    assert(!this.store._completedQueries.user[this.store.hashQuery('user', query)])
    assert(!this.store.get('user', 1))
    assert.equal(result.adapter, 'mock', 'should have adapter name in response')
    assert.equal(result.deleted, 1, 'should have other metadata in response')
    assert.objectsEqual(result.data, users, 'ejected users should have been returned')
  })
})
