import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Record = JSData.Record
  const record = new Record()
  t.is(typeof record.destroy, 'function')
  t.ok(record.destroy === Record.prototype.destroy)
})

test('can destroy itself', async (t) => {
  const store = new JSData.DataStore()
  const mockAdapter = {
    destroy (mapper, id, opts) {
      t.is(id, 1)
      return Promise.resolve()
    }
  }
  store.registerAdapter('mock', mockAdapter, { default: true })
  const FooMapper = store.defineMapper('foo')
  let foo = store.add('foo', { id: 1 })
  let result = await foo.destroy()
  t.notOk(store.get('foo', 1))
  t.ok(foo === result)

  const BarMapper = new JSData.Mapper({ name: 'bar' })
  BarMapper.registerAdapter('mock', mockAdapter, { default: true })
  let bar = BarMapper.createRecord({ id: 1 })
  result = await bar.destroy()
  t.is(result, undefined)
})
