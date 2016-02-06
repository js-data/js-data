import * as add from './add.test'
import * as between from './between.test'
import * as createIndex from './createIndex.test'
import * as filter from './filter.test'
import * as forEach from './forEach.test'
import * as get from './get.test'
import * as getAll from './getAll.test'
import * as limit from './limit.test'
import * as map from './map.test'
import * as mapCall from './mapCall.test'
import * as query from './query.test'
import * as recordId from './recordId.test'
import * as reduce from './reduce.test'
import * as remove from './remove.test'
import * as removeAll from './removeAll.test'
import * as skip from './skip.test'
import * as toJSON from './toJSON.test'
import * as updateIndex from './updateIndex.test'
import * as updateIndexes from './updateIndexes.test'

export function init () {
  describe('Collection', function () {
    it('should be a constructor function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Collection, 'should be a function')
      let collection = new Test.JSData.Collection()
      Test.assert.isTrue(collection instanceof Test.JSData.Collection, 'collection should be an instance')
      Test.assert.equal(collection.recordId(), 'id', 'collection should get initialization properties')
    })

    it('should accept initialization data', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      Test.assert.deepEqual(collection.getAll(), [data[2], data[0], data[1]], 'data should be in order')
    })

    it('should bubble up record events', function (done) {
      const Test = this
      const mapper = new Test.JSData.Mapper({ name: 'user' })
      const data = [
        mapper.createRecord({ id: 2, age: 19 }),
        mapper.createRecord({ id: 1, age: 27 })
      ]
      const collection = new Test.JSData.Collection(data, {
        mapper
      })
      const listener = Test.sinon.stub()
      const listener2 = Test.sinon.stub()
      collection.on('foo', listener)
      collection.on('all', listener2)
      data[0].emit('foo', 'bar', 'biz', 'baz')
      setTimeout(function () {
        Test.assert.isTrue(listener.calledOnce, 'listener should have been called once')
        Test.assert.deepEqual(listener.firstCall.args, ['bar', 'biz', 'baz'], 'should have been called with the correct args')
        Test.assert.isTrue(listener2.calledOnce, 'listener2 should have been called once')
        Test.assert.deepEqual(listener2.firstCall.args, [ 'foo', 'bar', 'biz', 'baz' ], 'should have been called with the correct args')
        done()
      }, 10)
    })

    it('should bubble up change events', function (done) {
      const Test = this
      let changed = false
      const store = new Test.JSData.DataStore()
      store.defineMapper('foo', {
        schema: {
          properties: {
            bar: { type: 'string', track: true }
          }
        }
      })
      const foo = store.add('foo', { id: 1 })

      setTimeout(function () {
        if (!changed) {
          done('failed to fire change event')
        }
      }, 10)

      store.getCollection('foo').on('change', function () {
        changed = true
        done()
      })

      foo.bar = 'baz'
    })

    it('should bubble up change events 2', function (done) {
      const Test = this
      let changed = false
      const store = new Test.JSData.DataStore()
      store.defineMapper('foo', {
        schema: {
          properties: {
            bar: { type: 'string', track: true }
          }
        }
      })
      const foo = store.add('foo', { id: 1 })

      setTimeout(function () {
        if (!changed) {
          done('failed to fire change event')
        }
      }, 10)

      store.getCollection('foo').on('change', function (fooCollection, foo) {
        changed = true
        done()
      })

      foo.set('bar', 'baz')
    })

    add.init()
    between.init()
    createIndex.init()
    filter.init()
    forEach.init()
    get.init()
    getAll.init()
    limit.init()
    map.init()
    mapCall.init()
    query.init()
    recordId.init()
    reduce.init()
    remove.init()
    removeAll.init()
    skip.init()
    toJSON.init()
    updateIndex.init()
    updateIndexes.init()
  })
}
