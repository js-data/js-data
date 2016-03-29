import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be a constructor function', (t) => {
  const DataStore = JSData.DataStore
  t.is(typeof DataStore, 'function')
  const store = new DataStore()
  t.ok(store instanceof DataStore)
  t.ok(JSData.utils.getSuper(store) === JSData.Container)
})
test('should initialize with defaults', (t) => {
  const DataStore = JSData.DataStore
  const store = new DataStore()
  t.same(store._adapters, {})
  t.same(store._mappers, {})
  t.same(store._collections, {})
  t.same(store.mapperDefaults, {})
  t.ok(store.mapperClass === JSData.Mapper)
  t.ok(store.collectionClass === JSData.LinkedCollection)
  t.is(store.linkRelations, JSData.utils.isBrowser)
})
test('should accept overrides', (t) => {
  const DataStore = JSData.DataStore
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
  t.same(store._adapters, {})
  t.same(store._mappers, {})
  t.same(store._collections, {})
  t.is(store.foo, 'bar')
  t.same(store.mapperDefaults, {
    idAttribute: '_id'
  })
  t.ok(store.mapperClass === Foo)
  t.ok(store.CollectionClass === Bar)
  t.ok(store.linkRelations)
})
