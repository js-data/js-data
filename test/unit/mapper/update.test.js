import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.update, 'function')
  t.ok(mapper.update === Mapper.prototype.update)
})
test('should update', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Mapper')
        t.same(_id, id, 'should pass in the id')
        t.same(_props, props, 'should pass in the props')
        t.is(Opts.raw, false, 'Opts are provided')
        _props.foo = 'bar'
        _props.id = id
        resolve(_props)
      })
    }
  })
  const user = await User.update(id, props)
  t.ok(updateCalled, 'Adapter#update should have been called')
  t.is(user.foo, 'bar', 'user has a new field')
  t.ok(user instanceof User.recordClass, 'user is a record')
})
test('should return raw', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Mapper')
        t.same(_id, id, 'should pass in the id')
        t.same(_props, props, 'should pass in the props')
        t.is(Opts.raw, true, 'Opts are provided')
        _props.foo = 'bar'
        _props.id = id
        resolve({
          data: _props,
          updated: 1
        })
      })
    }
  })
  let data = await User.update(id, props)
  t.ok(updateCalled, 'Adapter#update should have been called')
  t.is(data.data.foo, 'bar', 'user has a new field')
  t.ok(data.data instanceof User.recordClass, 'user is a record')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.updated, 1, 'should have other metadata in response')
})
