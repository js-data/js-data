import { assert, JSData } from '../../_setup'

describe('Mapper#update', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.update, 'function')
    assert.strictEqual(mapper.update, Mapper.prototype.update)
  })
  it('should update', async function () {
    const id = 1
    const props = { name: 'John' }
    let updateCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      update (mapper, _id, _props, Opts) {
        updateCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Mapper')
          assert.deepEqual(_id, id, 'should pass in the id')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert.equal(Opts.raw, false, 'Opts are provided')
          _props.foo = 'bar'
          _props.id = id
          resolve(_props)
        })
      }
    })
    const user = await User.update(id, props)
    assert(updateCalled, 'Adapter#update should have been called')
    assert.equal(user.foo, 'bar', 'user has a new field')
    assert(user instanceof User.recordClass, 'user is a record')
  })
  it('should return raw', async function () {
    const id = 1
    const props = { name: 'John' }
    let updateCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      raw: true,
      defaultAdapter: 'mock'
    })
    User.registerAdapter('mock', {
      update (mapper, _id, _props, Opts) {
        updateCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Mapper')
          assert.deepEqual(_id, id, 'should pass in the id')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert.equal(Opts.raw, true, 'Opts are provided')
          _props.foo = 'bar'
          _props.id = id
          resolve({
            data: _props,
            updated: 1
          })
        })
      }
    })
    const data = await User.update(id, props)
    assert(updateCalled, 'Adapter#update should have been called')
    assert.equal(data.data.foo, 'bar', 'user has a new field')
    assert(data.data instanceof User.recordClass, 'user is a record')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.updated, 1, 'should have other metadata in response')
  })
  it('should validate', async function () {
    const props = { name: 1234 }
    let updateCalled = false
    let user
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', required: true }
        }
      }
    })
    User.registerAdapter('mock', {
      update () {
        updateCalled = true
      }
    })
    try {
      user = await User.update(1, props)
      throw new Error('validation error should have been thrown!')
    } catch (err) {
      assert.equal(err.message, 'validation failed')
      assert.deepEqual(err.errors, [
        {
          actual: 'number',
          expected: 'one of (string)',
          path: 'name'
        }
      ])
    }
    assert.equal(updateCalled, false, 'Adapter#update should NOT have been called')
    assert.equal(user, undefined, 'user was not updated')
  })
  it('should update nested', async function () {
    const props = {
      id: 1,
      addresses: [
        {
          id: 45,
          customer_id: 1
        }
      ]
    }
    let updateCalled = false
    const store = new JSData.Container({
      mapperDefaults: {
        defaultAdapter: 'mock'
      }
    })
    store.registerAdapter('mock', {
      update (mapper, id, props) {
        assert.equal(props.id, 1)
        assert.equal(props.addresses.length, 1)
        assert.equal(props.addresses[0].id, 45)
        assert.equal(props.addresses[0].customer_id, 1)
        updateCalled = true
        return props
      }
    })
    store.defineMapper('customer', {
      relations: {
        hasMany: {
          address: {
            localField: 'addresses',
            foreignKey: 'customer_id'
          }
        }
      }
    })
    store.defineMapper('address', {
      relations: {
        belongsTo: {
          customer: {
            localField: 'customer',
            foreignKey: 'customer_id'
          }
        }
      }
    })
    await store.update('customer', 1, props, { with: ['address'] })
    assert.equal(updateCalled, true)
  })
})
