import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.updateAll, 'function')
  t.ok(mapper.updateAll === Mapper.prototype.updateAll)
})
test('should update', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Mapper')
        t.same(_props, props, 'should pass in the props')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, false, 'Opts are provided')
        _props.foo = 'bar'
        _props.id = id
        resolve([_props])
      })
    }
  })
  const users = await User.updateAll(props, query)
  t.ok(updateAllCalled, 'Adapter#updateAll should have been called')
  t.is(users[0].foo, 'bar', 'user has a new field')
  t.ok(users[0] instanceof User.recordClass, 'user is a record')
})
test('should return raw', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Mapper')
        t.same(_props, props, 'should pass in the props')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, true, 'Opts are provided')
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
  t.ok(updateAllCalled, 'Adapter#update should have been called')
  t.is(data.data[0].foo, 'bar', 'user has a new field')
  t.ok(data.data[0] instanceof User.recordClass, 'user is a record')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.updated, 1, 'should have other metadata in response')
})
