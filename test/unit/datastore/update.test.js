export function init () {
  describe('update', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.update)
      Test.assert.isTrue(store.update === DataStore.prototype.update)
    })
    it('should update', async function () {
      const Test = this
      const id = 1
      const props = { id, name: 'John' }
      Test.store.registerAdapter('mock', {
        update () {
          props.foo = 'bar'
          return Test.JSData.utils.resolve(props)
        }
      }, { 'default': true })
      const user = await Test.store.update('user', id, props)
      Test.assert.equal(user.foo, 'bar', 'user was updated')
      Test.assert.isTrue(user instanceof Test.store.getMapper('user').RecordClass, 'user is a record')
    })
  })
}
