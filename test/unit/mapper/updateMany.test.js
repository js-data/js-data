import { assert, JSData } from '../../_setup'

describe('Mapper#updateMany', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.updateMany, 'function')
    assert.strictEqual(mapper.updateMany, Mapper.prototype.updateMany)
  })
  it('should update', async function () {
    const id = 1
    const props = [{ id, name: 'John' }]
    let updateManyCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      updateMany (mapper, _props, Opts) {
        updateManyCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Mapper')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert.equal(Opts.raw, false, 'Opts are provided')
          _props[0].foo = 'bar'
          resolve(_props)
        })
      }
    })
    const users = await User.updateMany(props)
    assert(updateManyCalled, 'Adapter#updateMany should have been called')
    assert.equal(users[0].foo, 'bar', 'user has a new field')
    assert(users[0] instanceof User.recordClass, 'user is a record')
  })
  it('should return raw', async function () {
    const id = 1
    const props = [{ id, name: 'John' }]
    let updateManyCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      updateMany (mapper, _props, Opts) {
        updateManyCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Mapper')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert.equal(Opts.raw, true, 'Opts are provided')
          _props[0].foo = 'bar'
          resolve({
            data: _props,
            updated: 1
          })
        })
      }
    })
    let data = await User.updateMany(props)
    assert(updateManyCalled, 'Adapter#update should have been called')
    assert.equal(data.data[0].foo, 'bar', 'user has a new field')
    assert(data.data[0] instanceof User.recordClass, 'user is a record')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.updated, 1, 'should have other metadata in response')
  })
})
