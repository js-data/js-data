import { assert, JSData } from '../../_setup'

describe('Mapper#findAll', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.findAll, 'function')
    assert.strictEqual(mapper.findAll, Mapper.prototype.findAll)
  })
  it('should findAll', async function () {
    const query = { id: 1 }
    const id = 1
    const props = [{ id, name: 'John' }]
    let findAllCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      findAll (mapper, _query, Opts) {
        findAllCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, false, 'Opts are provided')
          resolve(props)
        })
      }
    })
    const users = await User.findAll(query)
    assert(findAllCalled, 'Adapter#findAll should have been called')
    assert.objectsEqual(users, props, 'user should have been found')
    assert(users[0] instanceof User.recordClass, 'user is a record')
  })
  it('should return raw', async function () {
    const query = { id: 1 }
    const id = 1
    const props = [{ id, name: 'John' }]
    let findAllCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      findAll (mapper, _query, Opts) {
        findAllCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_query, query, 'should pass in the query')
          assert.equal(Opts.raw, true, 'Opts are provided')
          resolve({
            data: props,
            found: 1
          })
        })
      }
    })
    const data = await User.findAll(query)
    assert(findAllCalled, 'Adapter#findAll should have been called')
    assert.objectsEqual(data.data, props, 'user should have been found')
    assert(data.data[0] instanceof User.recordClass, 'user is a record')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.found, 1, 'should have other metadata in response')
  })
})
