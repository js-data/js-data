export function init () {
  describe('Collection', function () {
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
  })
}
