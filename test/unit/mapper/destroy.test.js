import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.destroy, 'function')
  t.ok(mapper.destroy === Mapper.prototype.destroy)
})
test('should destroy', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_id, id, 'should pass in the id')
        t.is(Opts.raw, false, 'Opts are provided')
        resolve('foo')
      })
    }
  })
  const result = await User.destroy(id)
  t.ok(destroyCalled, 'Adapter#destroy should have been called')
  t.is(result, 'foo', 'returned data')
})
test('should return raw', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_id, id, 'should pass in the id')
        t.is(Opts.raw, true, 'Opts are provided')
        resolve({
          deleted: 1,
          data: 'foo'
        })
      })
    }
  })
  const data = await User.destroy(id)
  t.ok(destroyCalled, 'Adapter#destroy should have been called')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.deleted, 1, 'should have other metadata in response')
  t.is(data.data, 'foo', 'foo should have been returned')
})
