export function init () {
  describe('createMany', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.createMany)
      Test.assert.isTrue(store.createMany === DataStore.prototype.createMany)
    })
    it('should createMany', async function () {
      const Test = this
      const props = [{ name: 'John' }]
      Test.store.registerAdapter('mock', {
        createMany () {
          props[0].id = 1
          return Test.JSData.utils.resolve(props)
        }
      }, { 'default': true })
      const users = await Test.store.createMany('user', props)
      Test.assert.isDefined(users[0][Test.store.getMapper('user').idAttribute], 'new user has an id')
      Test.assert.isTrue(users[0] instanceof Test.store.getMapper('user').RecordClass, 'user is a record')
    })
  })
}
