import { assert, JSData } from '../../_setup'

describe('Record#save', function () {
  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.save, 'function')
    assert.strictEqual(record.save, Record.prototype.save)
  })

  it('can create itself', async function () {
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
    const foo = store.createRecord('foo', { foo: 'bar' })
    const createdFoo = await foo.save()
    assert.objectsEqual(createdFoo, { id: 1, foo: 'bar' })
    assert(createdFoo instanceof FooMapper.recordClass)
    assert.strictEqual(foo, createdFoo)
    assert.strictEqual(store.get('foo', 1), createdFoo)

    const BarMapper = new JSData.Mapper({ name: 'bar' })
    BarMapper.registerAdapter('mock', mockAdapter, { default: true })
    const bar = BarMapper.createRecord({ bar: 'foo' })
    const createdBar = await bar.save()
    assert.objectsEqual(createdBar, { id: 2, bar: 'foo' })
    assert(createdBar instanceof BarMapper.recordClass)
  })

  it('can update itself', async function () {
    const store = new JSData.DataStore()
    const mockAdapter = {
      update (mapper, id, props, opts) {
        props.beep = 'boop'
        return Promise.resolve(JSON.parse(JSON.stringify(props)))
      }
    }
    store.registerAdapter('mock', mockAdapter, { default: true })
    const FooMapper = store.defineMapper('foo')
    const foo = store.add('foo', { id: 1, foo: 'bar' })
    const updateFoo = await foo.save()
    assert.objectsEqual(foo, { id: 1, foo: 'bar', beep: 'boop' })
    assert.objectsEqual(updateFoo, { id: 1, foo: 'bar', beep: 'boop' })
    assert(updateFoo instanceof FooMapper.recordClass)
    assert.strictEqual(store.get('foo', 1), updateFoo)
    assert.strictEqual(foo, updateFoo)

    const BarMapper = new JSData.Mapper({ name: 'bar' })
    BarMapper.registerAdapter('mock', mockAdapter, { default: true })
    const bar = BarMapper.createRecord({ id: 1, bar: 'foo' })
    const updatedBar = await bar.save()
    assert.objectsEqual(updatedBar, { id: 1, bar: 'foo', beep: 'boop' })
    assert(updatedBar instanceof BarMapper.recordClass)
  })

  it('can update itself with changes only', async function () {
    const mockAdapter = {
      update (mapper, id, props, opts) {
        assert.objectsEqual(props, { bar: 'bar', bing: 'bang', beep: null })
        props.id = 1
        return Promise.resolve(JSON.parse(JSON.stringify(props)))
      }
    }
    const BarMapper = new JSData.Mapper({
      name: 'bar'
    })
    BarMapper.registerAdapter('mock', mockAdapter, { default: true })
    const bar = BarMapper.createRecord({ id: 1, bar: 'foo', beep: 'boop' })
    bar.bing = 'bang'
    bar.bar = 'bar'
    bar.beep = null
    const updatedBar = await bar.save({ changesOnly: true })
    assert.objectsEqual(updatedBar, { id: 1, bar: 'bar', bing: 'bang', beep: null })
    assert(updatedBar instanceof BarMapper.recordClass)
  })
})
