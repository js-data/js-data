import { assert, JSData } from '../../_setup'

describe('Record#destroy', function () {
  it('should be an instance method', function () {
    const Record = JSData.Record
    const record = new Record()
    assert.equal(typeof record.destroy, 'function')
    assert.strictEqual(record.destroy, Record.prototype.destroy)
  })

  it('can destroy itself', async function () {
    const store = new JSData.DataStore()
    const mockAdapter = {
      destroy (mapper, id, opts) {
        assert.equal(id, 1)
        return Promise.resolve()
      }
    }
    store.registerAdapter('mock', mockAdapter, { default: true })
    const FooMapper = store.defineMapper('foo') // eslint-disable-line
    const foo = store.add('foo', { id: 1 })
    let result = await foo.destroy()
    assert(!store.get('foo', 1))
    assert.strictEqual(foo, result)

    const BarMapper = new JSData.Mapper({ name: 'bar' })
    BarMapper.registerAdapter('mock', mockAdapter, { default: true })
    const bar = BarMapper.createRecord({ id: 1 })
    result = await bar.destroy()
    assert.equal(result, undefined)
  })
})
