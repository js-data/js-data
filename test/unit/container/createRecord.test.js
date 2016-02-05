export function init () {
  describe('createRecord', function () {
    it('should be an instance method', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.isFunction(store.createRecord)
      Test.assert.isTrue(store.createRecord === DataStore.prototype.createRecord)
    })
    it('should work')
  })
}
