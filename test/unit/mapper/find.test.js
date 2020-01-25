import { assert, JSData } from '../../_setup'

describe('Mapper#find', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.find, 'function')
    assert.strictEqual(mapper.find, Mapper.prototype.find)
  })
  it('should find', async function () {
    const id = 1
    const props = { id, name: 'John' }
    let findCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      find (mapper, _id, Opts) {
        findCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_id, id, 'should pass in the id')
          assert.equal(Opts.raw, false, 'Opts are provided')
          resolve(props)
        })
      }
    })
    const user = await User.find(id)
    assert(findCalled, 'Adapter#find should have been called')
    assert.objectsEqual(user, props, 'user should have been found')
    assert(user instanceof User.recordClass, 'user is a record')
  })
  it('should return raw', async function () {
    const id = 1
    const props = { id, name: 'John' }
    let findCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      find (mapper, _id, Opts) {
        findCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.deepEqual(_id, id, 'should pass in the id')
          assert.equal(Opts.raw, true, 'Opts are provided')
          resolve({
            data: props,
            found: 1
          })
        })
      }
    })
    const data = await User.find(id)
    assert(findCalled, 'Adapter#find should have been called')
    assert.objectsEqual(data.data, props, 'user should have been found')
    assert(data.data instanceof User.recordClass, 'user is a record')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.found, 1, 'should have other metadata in response')
  })
})
