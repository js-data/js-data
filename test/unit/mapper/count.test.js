import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.count, 'function')
  t.ok(mapper.count === Mapper.prototype.count)
})
test('should count', async (t) => {
  const query = { id: 1 }
  const id = 1
  const props = [{ id, name: 'John' }]
  let countCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    count (mapper, _query, Opts) {
      countCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, false, 'Opts are provided')
        resolve(1)
      })
    }
  })
  const count = await User.count(query)
  t.ok(countCalled, 'Adapter#count should have been called')
  t.same(count, 1, 'count should be 1')
})
test('should return raw', async (t) => {
  const query = { id: 1 }
  const id = 1
  const props = [{ id, name: 'John' }]
  let countCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    raw: true,
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    count (mapper, _query, Opts) {
      countCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, true, 'Opts are provided')
        resolve({
          data: 1
        })
      })
    }
  })
  let data = await User.count(query)
  t.ok(countCalled, 'Adapter#count should have been called')
  t.context.objectsEqual(t, data.data, 1, 'count should be 1')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
})
