import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.findAll, 'function')
  t.ok(mapper.findAll === Mapper.prototype.findAll)
})
test('should findAll', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, false, 'Opts are provided')
        resolve(props)
      })
    }
  })
  const users = await User.findAll(query)
  t.ok(findAllCalled, 'Adapter#findAll should have been called')
  t.context.objectsEqual(users, props, 'user should have been found')
  t.ok(users[0] instanceof User.recordClass, 'user is a record')
})
test('should return raw', async (t) => {
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
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, true, 'Opts are provided')
        resolve({
          data: props,
          found: 1
        })
      })
    }
  })
  let data = await User.findAll(query)
  t.ok(findAllCalled, 'Adapter#findAll should have been called')
  t.context.objectsEqual(data.data, props, 'user should have been found')
  t.ok(data.data[0] instanceof User.recordClass, 'user is a record')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.found, 1, 'should have other metadata in response')
})
