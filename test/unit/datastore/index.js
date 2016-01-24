export function init () {
  describe('DataStore', function () {
    it('should be a constructor function', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      Test.assert.isFunction(DataStore)
      const store = new DataStore()
      Test.assert.isTrue(store instanceof DataStore)
      Test.assert.isTrue(Test.JSData.utils.getSuper(store) === Test.JSData.Container)
    })
    it('should initialize with defaults', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      const store = new DataStore()
      Test.assert.deepEqual(store._adapters, {})
      Test.assert.deepEqual(store._mappers, {})
      Test.assert.deepEqual(store._collections, {})
      Test.assert.deepEqual(store.mapperDefaults, {})
      Test.assert.isTrue(store.MapperClass === Test.JSData.Mapper)
      Test.assert.isTrue(store.CollectionClass === Test.JSData.LinkedCollection)
      Test.assert.equal(store.linkRelations, Test.JSData.utils.isBrowser)
    })
    it('should accept overrides', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      class Foo {}
      class Bar {}
      const store = new DataStore({
        MapperClass: Foo,
        CollectionClass: Bar,
        foo: 'bar',
        linkRelations: true,
        mapperDefaults: {
          idAttribute: '_id'
        }
      })
      Test.assert.deepEqual(store._adapters, {})
      Test.assert.deepEqual(store._mappers, {})
      Test.assert.deepEqual(store._collections, {})
      Test.assert.equal(store.foo, 'bar')
      Test.assert.deepEqual(store.mapperDefaults, {
        idAttribute: '_id'
      })
      Test.assert.isTrue(store.MapperClass === Foo)
      Test.assert.isTrue(store.CollectionClass === Bar)
      Test.assert.isTrue(store.linkRelations)
    })
  })
}
