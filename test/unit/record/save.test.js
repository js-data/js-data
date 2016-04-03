import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.save, 'function')
  t.ok(record.save === Record.prototype.save)
})

test('can create itself', async (t) => {
  let id = 1
  const store = new JSData.DataStore()
  const mockAdapter = {
    create (mapper, props, opts) {
      props.id = id
      id++
      return Promise.resolve(JSON.parse(JSON.stringify(props)))
    }
  }
  store.registerAdapter('mock', mockAdapter, { default: true })
  const FooMapper = store.defineMapper('foo')
  let foo = store.createRecord('foo', { foo: 'bar' })
  let createdFoo = await foo.save()
  t.context.objectsEqual(createdFoo, { id: 1, foo: 'bar' })
  t.ok(createdFoo instanceof FooMapper.recordClass)
  t.ok(store.get('foo', 1) === createdFoo)

  const BarMapper = new JSData.Mapper({ name: 'bar' })
  BarMapper.registerAdapter('mock', mockAdapter, { default: true })
  let bar = BarMapper.createRecord({ bar: 'foo' })
  let createdBar = await bar.save()
  t.context.objectsEqual(createdBar, { id: 2, bar: 'foo' })
  t.ok(createdBar instanceof BarMapper.recordClass)
})

test('can update itself', async (t) => {
  const store = new JSData.DataStore()
  const mockAdapter = {
    update (mapper, id, props, opts) {
      props.beep = 'boop'
      return Promise.resolve(JSON.parse(JSON.stringify(props)))
    }
  }
  store.registerAdapter('mock', mockAdapter, { default: true })
  const FooMapper = store.defineMapper('foo')
  let foo = store.add('foo', { id: 1, foo: 'bar' })
  let updateFoo = await foo.save()
  t.context.objectsEqual(updateFoo, { id: 1, foo: 'bar', beep: 'boop' })
  t.ok(updateFoo instanceof FooMapper.recordClass)
  t.ok(store.get('foo', 1) === updateFoo)
  t.ok(foo === updateFoo)

  const BarMapper = new JSData.Mapper({ name: 'bar' })
  BarMapper.registerAdapter('mock', mockAdapter, { default: true })
  let bar = BarMapper.createRecord({ id: 1, bar: 'foo' })
  let updatedBar = await bar.save()
  t.context.objectsEqual(updatedBar, { id: 1, bar: 'foo', beep: 'boop' })
  t.ok(updatedBar instanceof BarMapper.recordClass)
})

test('can update itself with changes only', async (t) => {
  const mockAdapter = {
    update (mapper, id, props, opts) {
      t.context.objectsEqual(props, { bar: 'bar', bing: 'bang', beep: null })
      return Promise.resolve(JSON.parse(JSON.stringify(props)))
    }
  }
  const BarMapper = new JSData.Mapper({
    name: 'bar'
  })
  BarMapper.registerAdapter('mock', mockAdapter, { default: true })
  let bar = BarMapper.createRecord({ id: 1, bar: 'foo', beep: 'boop' })
  bar.bing = 'bang'
  bar.bar = 'bar'
  let updatedBar = await bar.save({ changesOnly: true })
  t.context.objectsEqual(updatedBar, { id: 1, bar: 'bar', bing: 'bang', beep: null })
  t.ok(updatedBar instanceof BarMapper.recordClass)
})