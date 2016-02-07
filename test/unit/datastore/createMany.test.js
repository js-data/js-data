export function init () {
  describe('#createMany', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.createMany)
      Test.assert.isTrue(store.createMany === DataStore.prototype.createMany)
    })
    it('should work')
  })
}
