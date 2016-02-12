export function init () {
  describe('updateMany', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.updateMany)
      Test.assert.isTrue(store.updateMany === DataStore.prototype.updateMany)
    })
    it('should updateMany', async function () {
      const Test = this
      const props = [{ id: 1, name: 'John' }]
      Test.store.registerAdapter('mock', {
        updateMany () {
          props[0].foo = 'bar'
          return Test.JSData.utils.resolve(props)
        }
      }, { 'default': true })
      const users = await Test.store.updateMany('user', props)
      Test.assert.equal(users[0].foo, 'bar', 'user was updated')
      Test.assert.isTrue(users[0] instanceof Test.store.getMapper('user').RecordClass, 'user is a record')
    })
  })
}
