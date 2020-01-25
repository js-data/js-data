import { assert, JSData } from '../../_setup'

describe('Mapper#getAdapter', function () {
  it('should get an adapter', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'user' })
    assert.equal(typeof mapper.getAdapter, 'function')
    assert.strictEqual(mapper.getAdapter, Mapper.prototype.getAdapter)

    const adapter = {}
    mapper.registerAdapter('foo', adapter)
    mapper.registerAdapter('bar', adapter, { default: true })
    assert.strictEqual(mapper.getAdapter('foo'), adapter)
    assert.strictEqual(mapper.getAdapter('bar'), adapter)
    assert.equal(mapper.defaultAdapter, 'bar')
    assert.throws(() => {
      mapper.getAdapter()
    }, Error, '[Mapper#getAdapter:name] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')
  })
})
