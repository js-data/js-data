export function init () {
  describe('destroyAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.destroyAll)
      Test.assert.isTrue(store.destroyAll === DataStore.prototype.destroyAll)
    })
    it('should destroyAll', async function () {
      const Test = this
      const query = { name: 'John' }
      let destroyCalled
      Test.store._pendingQueries.user[Test.store.hashQuery('user', query)] = new Date().getTime()
      Test.store._completedQueries.user[Test.store.hashQuery('user', query)] = new Date().getTime()
      const users = Test.store.add('user', [{ id: 1, name: 'John' }])
      Test.store.registerAdapter('mock', {
        destroyAll () {
          destroyCalled = true
          return Test.JSData.utils.resolve()
        }
      }, { 'default': true })
      const result = await Test.store.destroyAll('user', query)
      Test.assert.isTrue(destroyCalled, 'Adapter#destroyAll should have been called')
      Test.assert.objectsEqual(result, users, 'returned data')
    })
    it('should return raw', async function () {
      const Test = this
      const query = { name: 'John' }
      let destroyCalled
      Test.store._pendingQueries.user[Test.store.hashQuery('user', query)] = new Date().getTime()
      Test.store._completedQueries.user[Test.store.hashQuery('user', query)] = new Date().getTime()
      const users = Test.store.add('user', [{ id: 1, name: 'John' }])
      Test.store.registerAdapter('mock', {
        destroyAll () {
          destroyCalled = true
          return Test.JSData.utils.resolve({
            deleted: 1
          })
        }
      }, { 'default': true })
      const result = await Test.store.destroyAll('user', query, { raw: true })
      Test.assert.isTrue(destroyCalled, 'Adapter#destroyAll should have been called')
      Test.assert.isUndefined(Test.store._pendingQueries.user[Test.store.hashQuery('user', query)])
      Test.assert.isUndefined(Test.store._completedQueries.user[Test.store.hashQuery('user', query)])
      Test.assert.isUndefined(Test.store.get('user', 1))
      Test.assert.equal(result.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(result.deleted, 1, 'should have other metadata in response')
      Test.assert.objectsEqual(result.data, users, 'ejected users should have been returned')
    })
  })
}
