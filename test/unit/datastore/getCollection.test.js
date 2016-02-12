export function init () {
  describe('getCollection', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.getCollection)
      Test.assert.isTrue(store.getCollection === DataStore.prototype.getCollection)
    })
    it('should get a collection', function () {
      const Test = this
      Test.assert.isTrue(Test.UserCollection === Test.store.getCollection('user'))
    })
    it('should throw an error', function () {
      const Test = this
      Test.assert.throws(function () {
        Test.store.getCollection('foo')
      }, ReferenceError, 'foo is not a registered collection!')
    })
  })
}
