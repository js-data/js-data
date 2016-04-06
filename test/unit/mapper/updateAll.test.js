import { assert, JSData } from '../../_setup'

describe('Mapper#updateAll', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.updateAll, 'function')
    assert.strictEqual(mapper.updateAll, Mapper.prototype.updateAll)
  })
  it('should update', async function () {
    const id = 1
    const query = { a: 'b' }
    const props = { name: 'John' }
    let updateAllCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      updateAll (mapper, _props, _query, Opts) {
        updateAllCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Mapper')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, false, 'Opts are provided')
          _props.foo = 'bar'
          _props.id = id
          resolve([_props])
        })
      }
    })
    const users = await User.updateAll(props, query)
    assert(updateAllCalled, 'Adapter#updateAll should have been called')
    assert.equal(users[0].foo, 'bar', 'user has a new field')
    assert(users[0] instanceof User.recordClass, 'user is a record')
  })
  it('should return raw', async function () {
    const id = 1
    const query = { a: 'b' }
    const props = { name: 'John' }
    let updateAllCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      updateAll (mapper, _props, _query, Opts) {
        updateAllCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Mapper')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, true, 'Opts are provided')
          _props.foo = 'bar'
          _props.id = id
          resolve({
            data: [_props],
            updated: 1
          })
        })
      }
    })
    let data = await User.updateAll(props, query)
    assert(updateAllCalled, 'Adapter#update should have been called')
    assert.equal(data.data[0].foo, 'bar', 'user has a new field')
    assert(data.data[0] instanceof User.recordClass, 'user is a record')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.updated, 1, 'should have other metadata in response')
  })
})
