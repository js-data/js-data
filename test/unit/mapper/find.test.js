import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.find, 'function')
  t.ok(mapper.find === Mapper.prototype.find)
})
test('should find', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_id, id, 'should pass in the id')
        t.is(Opts.raw, false, 'Opts are provided')
        resolve(props)
      })
    }
  })
  const user = await User.find(id)
  t.ok(findCalled, 'Adapter#find should have been called')
  t.context.objectsEqual(t, user, props, 'user should have been found')
  t.ok(user instanceof User.recordClass, 'user is a record')
})
test('should return raw', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_id, id, 'should pass in the id')
        t.is(Opts.raw, true, 'Opts are provided')
        resolve({
          data: props,
          found: 1
        })
      })
    }
  })
  let data = await User.find(id)
  t.ok(findCalled, 'Adapter#find should have been called')
  t.context.objectsEqual(t, data.data, props, 'user should have been found')
  t.ok(data.data instanceof User.recordClass, 'user is a record')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.found, 1, 'should have other metadata in response')
})
