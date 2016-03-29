import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.destroyAll, 'function')
  t.ok(mapper.destroyAll === Mapper.prototype.destroyAll)
})
test('should destroyAll', async (t) => {
  const query = {}
  let destroyAllCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    destroyAll (mapper, _query, Opts) {
      destroyAllCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, false, 'Opts are provided')
        resolve('foo')
      })
    }
  })
  const result = await User.destroyAll()
  t.ok(destroyAllCalled, 'Adapter#destroyAll should have been called')
  t.is(result, 'foo', 'returned data')
})
test('should return raw', async (t) => {
  const query = {}
  let destroyAllCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    raw: true,
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    destroyAll (mapper, _query, Opts) {
      destroyAllCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, true, 'Opts are provided')
        resolve({
          data: 'foo',
          deleted: 1
        })
      })
    }
  })
  const data = await User.destroyAll()
  t.ok(destroyAllCalled, 'Adapter#destroyAll should have been called')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.deleted, 1, 'should have other metadata in response')
  t.is(data.data, 'foo', 'returned data')
})
