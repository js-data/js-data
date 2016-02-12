export function init () {
  describe('destroy', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.destroy)
      Test.assert.isTrue(store.destroy === DataStore.prototype.destroy)
    })
    it('should destroy', async function () {
      const Test = this
      const id = 1
      let destroyCalled
      Test.store._pendingQueries.user[id] = new Date().getTime()
      Test.store._completedQueries.user[id] = new Date().getTime()
      const user = Test.store.add('user', { id, name: 'John' })
      Test.store.registerAdapter('mock', {
        destroy () {
          destroyCalled = true
          return Test.JSData.utils.resolve()
        }
      }, { 'default': true })
      const result = await Test.store.destroy('user', id)
      Test.assert.isTrue(destroyCalled, 'Adapter#destroy should have been called')
      Test.assert.isUndefined(Test.store._pendingQueries.user[id])
      Test.assert.isUndefined(Test.store._completedQueries.user[id])
      Test.assert.isUndefined(Test.store.get('user', id))
      Test.assert.isTrue(result === user, 'ejected user should have been returned')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      let destroyCalled
      Test.store._pendingQueries.user[id] = new Date().getTime()
      Test.store._completedQueries.user[id] = new Date().getTime()
      const user = Test.store.add('user', { id, name: 'John' })
      Test.store.registerAdapter('mock', {
        destroy () {
          destroyCalled = true
          return Test.JSData.utils.resolve({
            deleted: 1
          })
        }
      }, { 'default': true })
      const result = await Test.store.destroy('user', id, { raw: true })
      Test.assert.isTrue(destroyCalled, 'Adapter#destroy should have been called')
      Test.assert.isUndefined(Test.store._pendingQueries.user[id])
      Test.assert.isUndefined(Test.store._completedQueries.user[id])
      Test.assert.isUndefined(Test.store.get('user', id))
      Test.assert.equal(result.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(result.deleted, 1, 'should have other metadata in response')
      Test.assert.isTrue(result.data === user, 'ejected user should have been returned')
    })
  })
}
