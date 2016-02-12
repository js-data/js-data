export function init () {
  describe('updateAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.updateAll)
      Test.assert.isTrue(store.updateAll === DataStore.prototype.updateAll)
    })
    it('should updateAll', async function () {
      const Test = this
      const query = { name: 'John' }
      const props = [{ id: 1, name: 'John' }]
      Test.store.registerAdapter('mock', {
        updateAll () {
          props[0].foo = 'bar'
          return Test.JSData.utils.resolve(props)
        }
      }, { 'default': true })
      const users = await Test.store.updateAll('user', query, props)
      Test.assert.equal(users[0].foo, 'bar', 'user was updated')
      Test.assert.isTrue(users[0] instanceof Test.store.getMapper('user').RecordClass, 'user is a record')
    })
  })
}
