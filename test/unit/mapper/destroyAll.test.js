import { assert, JSData } from '../../_setup'

describe('Mapper#destroyAll', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.destroyAll, 'function')
    assert.strictEqual(mapper.destroyAll, Mapper.prototype.destroyAll)
  })
  it('should destroyAll', async function () {
    const query = {}
    let destroyAllCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      destroyAll (mapper, _query, Opts) {
        destroyAllCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, false, 'Opts are provided')
          resolve('foo')
        })
      }
    })
    const result = await User.destroyAll()
    assert(destroyAllCalled, 'Adapter#destroyAll should have been called')
    assert.equal(result, 'foo', 'returned data')
  })
  it('should return raw', async function () {
    const query = {}
    let destroyAllCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      destroyAll (mapper, _query, Opts) {
        destroyAllCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, true, 'Opts are provided')
          resolve({
            data: 'foo',
            deleted: 1
          })
        })
      }
    })
    const data = await User.destroyAll()
    assert(destroyAllCalled, 'Adapter#destroyAll should have been called')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.deleted, 1, 'should have other metadata in response')
    assert.equal(data.data, 'foo', 'returned data')
  })
})
