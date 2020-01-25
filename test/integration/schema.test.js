import { assert, JSData } from '../_setup'

describe('Mapper#update', function () {
  it('should update', async function () {
    const id = 1
    const props = { name: 'John' }
    const propsUpdate = { name: 'Bill', foo: undefined }
    let updateCalled = false
    let createCalled = false
    const schema = new JSData.Schema({
      type: 'object',
      track: true,
      properties: {
        name: { type: 'string' },
        foo: { type: 'string' }
      }
    })
    const store = new JSData.DataStore()
    store.registerAdapter('mock', {
      update (mapper, _id, _props, Opts) {
        updateCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the Mapper')
          assert.deepEqual(_id, id, 'should pass in the id')
          assert.deepEqual(_props, propsUpdate, 'should pass in the props')
          assert.equal(Opts.raw, false, 'Opts are provided')
          _props.foo = 'bar'
          _props.id = id
          resolve(_props)
        })
      },
      create (mapper, _props, Opts) {
        createCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the JSData.Mapper')
          assert.objectsEqual(_props, props, 'should pass in the props')
          assert(!Opts.raw, 'Opts are provided')
          _props[mapper.idAttribute] = id
          resolve(_props)
        })
      }
    }, { default: true })
    const User = store.defineMapper('user', { schema })
    const rec = store.createRecord('user', { name: 'John' })
    const user = await rec.save()
    assert(createCalled, 'Adapter#create should have been called')
    assert(user instanceof User.recordClass, 'user is a record')
    user.name = 'Bill'
    const u2 = await user.save()
    assert(updateCalled, 'Adapter#update should have been called')
    assert.equal(user.foo, 'bar', 'user has a new field')
    assert(u2 instanceof User.recordClass, 'user is a record')
  })
})
