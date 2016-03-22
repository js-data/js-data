import * as collection_methods from './collection_methods.test'
import * as create from './create.test'
import * as createMany from './createMany.test'
import * as defineMapper from './defineMapper.test'
import * as destroy from './destroy.test'
import * as destroyAll from './destroyAll.test'
import * as find from './find.test'
import * as findAll from './findAll.test'
import * as getCollection from './getCollection.test'
import * as update from './update.test'
import * as updateMany from './updateMany.test'
import * as updateAll from './updateAll.test'

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
      Test.assert.isTrue(store.mapperClass === Test.JSData.Mapper)
      Test.assert.isTrue(store.collectionClass === Test.JSData.LinkedCollection)
      Test.assert.equal(store.linkRelations, Test.JSData.utils.isBrowser)
    })
    it('should accept overrides', function () {
      const Test = this
      const DataStore = Test.JSData.DataStore
      class Foo {}
      class Bar {}
      const store = new DataStore({
        mapperClass: Foo,
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
      Test.assert.isTrue(store.mapperClass === Foo)
      Test.assert.isTrue(store.CollectionClass === Bar)
      Test.assert.isTrue(store.linkRelations)
    })

    collection_methods.init()
    create.init()
    createMany.init()
    defineMapper.init()
    destroy.init()
    destroyAll.init()
    find.init()
    findAll.init()
    getCollection.init()
    update.init()
    updateMany.init()
    updateAll.init()
  })
}
