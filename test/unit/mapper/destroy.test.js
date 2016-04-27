import { assert, JSData } from '../../_setup'

describe('Mapper#createRecord', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.destroy, 'function')
    assert.strictEqual(mapper.destroy, Mapper.prototype.destroy)
  })
  it('should destroy', async function () {
    const id = 1
    let destroyCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      destroy (mapper, _id, Opts) {
        destroyCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_id, id, 'should pass in the id')
          assert.equal(Opts.raw, false, 'Opts are provided')
          resolve('foo')
        })
      }
    })
    const result = await User.destroy(id)
    assert(destroyCalled, 'Adapter#destroy should have been called')
    assert.equal(result, 'foo', 'returned data')
  })
  it('should return raw', async function () {
    const id = 1
    let destroyCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      destroy (mapper, _id, Opts) {
        destroyCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_id, id, 'should pass in the id')
          assert.equal(Opts.raw, true, 'Opts are provided')
          resolve({
            deleted: 1,
            data: 'foo'
          })
        })
      }
    })
    const data = await User.destroy(id)
    assert(destroyCalled, 'Adapter#destroy should have been called')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.deleted, 1, 'should have other metadata in response')
    assert.equal(data.data, 'foo', 'foo should have been returned')
  })
})
