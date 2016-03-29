import {
  beforeEach,
  JSData
} from '../_setup'
import test from 'ava'
import sinon from 'sinon'

test.beforeEach(beforeEach)

test.cb('should bubble up record events', (t) => {
  const mapper = new JSData.Mapper({ name: 'user' })
  const data = [
    mapper.createRecord({ id: 2, age: 19 }),
    mapper.createRecord({ id: 1, age: 27 })
  ]
  const collection = new JSData.Collection(data, {
    mapper
  })
  const listener = sinon.stub()
  const listener2 = sinon.stub()
  collection.on('foo', listener)
  collection.on('all', listener2)
  data[0].emit('foo', 'bar', 'biz', 'baz')
  setTimeout(() => {
    t.ok(listener.calledOnce, 'listener should have been called once')
    t.same(listener.firstCall.args, ['bar', 'biz', 'baz'], 'should have been called with the correct args')
    t.ok(listener2.calledOnce, 'listener2 should have been called once')
    t.same(listener2.firstCall.args, [ 'foo', 'bar', 'biz', 'baz' ], 'should have been called with the correct args')
    t.end()
  }, 30)
})

test.cb('should bubble up change events (assignment operator)', (t) => {
  let changed = false
  const store = new JSData.DataStore()
  store.defineMapper('foo', {
    schema: {
      properties: {
        bar: { type: 'string', track: true }
      }
    }
  })
  const foo = store.add('foo', { id: 1 })

  setTimeout(() => {
    if (!changed) {
      t.end('failed to fire change event')
    }
  }, 1000)

  store.getCollection('foo').on('change', (fooCollection, foo) => {
    changed = true
    t.end()
  })

  foo.bar = 'baz'
})

test.cb('should bubble up change events (setter method)', (t) => {
  let changed = false
  const store = new JSData.DataStore()
  store.defineMapper('foo', {
    schema: {
      properties: {
        bar: { type: 'string', track: true }
      }
    }
  })
  const foo = store.add('foo', { id: 1 })

  setTimeout(() => {
    if (!changed) {
      t.end('failed to fire change event')
    }
  }, 1000)

  store.getCollection('foo').on('change', (fooCollection, foo) => {
    changed = true
    t.end()
  })

  foo.set('bar', 'baz')
})
