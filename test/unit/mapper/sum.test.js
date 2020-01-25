import { assert, JSData } from '../../_setup'

describe('Mapper#sum', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.sum, 'function')
    assert.strictEqual(mapper.sum, Mapper.prototype.sum)
  })
  it('should sum', async function () {
    const query = { id: 1 }
    let sumCalled = false
    const User = new JSData.Mapper({ // eslint-disable-line
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      sum (mapper, _field, _query, Opts) {
        sumCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.equal(_field, 'age', 'should pass in the field')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, false, 'Opts are provided')
          resolve(30)
        })
      }
    })
    const sum = await User.sum('age', query)
    assert(sumCalled, 'Adapter#sum should have been called')
    assert.deepEqual(sum, 30, 'sum should be 30')
  })
  it('should return raw', async function () {
    const query = { id: 1 }
    let sumCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      sum (mapper, _field, _query, Opts) {
        sumCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.equal(_field, 'age', 'should pass in the field')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, true, 'Opts are provided')
          resolve({
            data: 30
          })
        })
      }
    })
    const data = await User.sum('age', query)
    assert(sumCalled, 'Adapter#sum should have been called')
    assert.objectsEqual(data.data, 30, 'sum should be 30')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
  })
})
