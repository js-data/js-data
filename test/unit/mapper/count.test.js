import { assert, JSData } from '../../_setup'

describe('Mapper#count', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.count, 'function')
    assert.strictEqual(mapper.count, Mapper.prototype.count)
  })
  it('should count', async function () {
    const query = { id: 1 }
    let countCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      count (mapper, _query, Opts) {
        countCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, false, 'Opts are provided')
          resolve(1)
        })
      }
    })
    const count = await User.count(query)
    assert(countCalled, 'Adapter#count should have been called')
    assert.equal(count, 1, 'count should be 1')
  })
  it('should return raw', async function () {
    const query = { id: 1 }
    let countCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      count (mapper, _query, Opts) {
        countCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert(Opts.raw, 'Opts are provided')
          resolve({
            data: 1
          })
        })
      }
    })
    const data = await User.count(query)
    assert(countCalled, 'Adapter#count should have been called')
    assert.equal(data.data, 1, 'count should be 1')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
  })
})
