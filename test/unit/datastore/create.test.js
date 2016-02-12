export function init () {
  describe('create', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.create)
      Test.assert.isTrue(store.create === DataStore.prototype.create)
    })
    it('should create', async function () {
      const Test = this
      const props = { name: 'John' }
      Test.store.registerAdapter('mock', {
        create () {
          props.id = 1
          return Test.JSData.utils.resolve(props)
        }
      }, { 'default': true })
      const user = await Test.store.create('user', props)
      Test.assert.isDefined(user[Test.store.getMapper('user').idAttribute], 'new user has an id')
      Test.assert.isTrue(user instanceof Test.store.getMapper('user').RecordClass, 'user is a record')
    })
  })
}
