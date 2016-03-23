import * as create from './create.test'
import * as createMany from './createMany.test'
import * as createRecord from './createRecord.test'
import * as defineMapper from './defineMapper.test'
import * as destroy from './destroy.test'
import * as destroyAll from './destroyAll.test'
import * as find from './find.test'
import * as findAll from './findAll.test'
import * as getAdapter from './getAdapter.test'
import * as getAdapterName from './getAdapterName.test'
import * as getAdapters from './getAdapters.test'
import * as getMapper from './getMapper.test'
import * as registerAdapter from './registerAdapter.test'
import * as update from './update.test'
import * as updateMany from './updateMany.test'
import * as updateAll from './updateAll.test'

export function init () {
  describe('Container', function () {
    it('should be a constructor function', function () {
      const Test = this
      const Container = Test.JSData.Container
      Test.assert.isFunction(Container)
      const container = new Container()
      Test.assert.isTrue(container instanceof Container)
    })
    it('should initialize with defaults', function () {
      const Test = this
      const Container = Test.JSData.Container
      const container = new Container()
      Test.assert.deepEqual(container._adapters, {})
      Test.assert.deepEqual(container._mappers, {})
      Test.assert.deepEqual(container.mapperDefaults, {})
      Test.assert.isTrue(container.mapperClass === Test.JSData.Mapper)
    })
    it('should accept overrides', function () {
      const Test = this
      const Container = Test.JSData.Container
      class Foo {}
      const container = new Container({
        mapperClass: Foo,
        foo: 'bar',
        mapperDefaults: {
          idAttribute: '_id'
        }
      })
      Test.assert.deepEqual(container._adapters, {})
      Test.assert.deepEqual(container._mappers, {})
      Test.assert.equal(container.foo, 'bar')
      Test.assert.deepEqual(container.mapperDefaults, {
        idAttribute: '_id'
      })
      Test.assert.isTrue(container.mapperClass === Foo)
    })

    create.init()
    createMany.init()
    createRecord.init()
    defineMapper.init()
    destroy.init()
    destroyAll.init()
    find.init()
    findAll.init()
    getAdapter.init()
    getAdapterName.init()
    getAdapters.init()
    getMapper.init()
    registerAdapter.init()
    update.init()
    updateMany.init()
    updateAll.init()
  })
}
