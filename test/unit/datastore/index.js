import * as create from './create.test'
import * as createMany from './createMany.test'
import * as destroy from './destroy.test'
import * as destroyAll from './destroyAll.test'
import * as find from './find.test'
import * as findAll from './findAll.test'
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
    it('should allow schema definition with basic indexes', function () {
      const Test = this
      const store = new Test.JSData.DataStore()
      store.defineMapper('user', {
        schema: {
          properties: {
            age: { indexed: true },
            role: { indexed: true }
          }
        }
      })
      store.add('user', [
        { id: 2, age: 18, role: 'admin' },
        { id: 3, age: 19, role: 'dev' },
        { id: 9, age: 19, role: 'admin' },
        { id: 6, age: 19, role: 'owner' },
        { id: 4, age: 22, role: 'dev' },
        { id: 1, age: 23, role: 'owner' }
      ])

      Test.assert.objectsEqual(
        store.getAll('user', 19, { index: 'age' }).map(function (user) {
          return user.toJSON()
        }),
        [
          { id: 3, age: 19, role: 'dev' },
          { id: 6, age: 19, role: 'owner' },
          { id: 9, age: 19, role: 'admin' }
        ],
        'should have found all of age:19 using 1 keyList'
      )
    })
    it('should allow enhanced relation getters', function () {
      const Test = this

      let wasItActivated = false
      const store = new Test.JSData.DataStore({
        linkRelations: true
      })
      store.defineMapper('foo', {
        relations: {
          belongsTo: {
            bar: {
              localField: 'bar',
              foreignKey: 'barId',
              get (def, foo, orig) {
                // "relation.name" has relationship "relation.type" to "relation.relation"
                wasItActivated = true
                return orig()
              }
            }
          }
        }
      })
      store.defineMapper('bar', {
        relations: {
          hasMany: {
            foo: {
              localField: 'foos',
              foreignKey: 'barId'
            }
          }
        }
      })
      const foo = store.add('foo', {
        id: 1,
        barId: 1,
        bar: {
          id: 1
        }
      })
      Test.assert.equal(foo.bar.id, 1)
      Test.assert.isTrue(wasItActivated)
    })
    it('should update links', function () {
      const Test = this

      const store = new Test.JSData.DataStore({
        linkRelations: true
      })
      store.defineMapper('foo', {
        relations: {
          hasMany: {
            bar: {
              localField: 'bars',
              foreignKey: 'foo_id'
            }
          }
        }
      })
      store.defineMapper('bar', {
        relations: {
          belongsTo: {
            foo: {
              localField: 'foo',
              foreignKey: 'foo_id'
            }
          }
        }
      })
      const foo66 = store.add('foo', {
        id: 66
      })
      const foo77 = store.add('foo', {
        id: 77
      })
      const bar88 = store.add('bar', {
        id: 88,
        foo_id: 66
      })
      Test.assert.isTrue(bar88.foo === foo66)
      Test.assert.equal(66, bar88.foo_id)
      bar88.foo_id = 77
      Test.assert.isTrue(bar88.foo === foo77)
      Test.assert.equal(77, bar88.foo_id)
      bar88.foo = foo66
      Test.assert.isTrue(bar88.foo === foo66)
      Test.assert.equal(66, bar88.foo_id)
      Test.assert.objectsEqual(foo77.bars, [])
      foo77.bars = [bar88]
      Test.assert.isTrue(foo77.bars[0] === store.getAll('bar')[0])
      Test.assert.equal(bar88.foo_id, 77)
      Test.assert.objectsEqual(foo66.bars, [])
      foo66.bars = [bar88]
      Test.assert.isTrue(foo66.bars[0] === store.getAll('bar')[0])
      Test.assert.equal(bar88.foo_id, 66)
      Test.assert.objectsEqual(foo77.bars, [])
    })

    create.init()
    createMany.init()
    destroy.init()
    destroyAll.init()
    find.init()
    findAll.init()
    update.init()
    updateMany.init()
    updateAll.init()
  })
}
