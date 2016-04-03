import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.sum, 'function')
  t.ok(mapper.sum === Mapper.prototype.sum)
})
test('should sum', async (t) => {
  const query = { id: 1 }
  const id = 1
  const props = [{ id, name: 'John', age: 30 }]
  let sumCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    sum (mapper, _field, _query, Opts) {
      sumCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the Model')
        t.is(_field, 'age', 'should pass in the field')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, false, 'Opts are provided')
        resolve(30)
      })
    }
  })
  const sum = await User.sum('age', query)
  t.ok(sumCalled, 'Adapter#sum should have been called')
  t.same(sum, 30, 'sum should be 30')
})
test('should return raw', async (t) => {
  const query = { id: 1 }
  const id = 1
  const props = [{ id, name: 'John', age: 30 }]
  let sumCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    raw: true,
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    sum (mapper, _field, _query, Opts) {
      sumCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the Model')
        t.is(_field, 'age', 'should pass in the field')
        t.same(_query, query, 'should pass in the query')
        t.is(Opts.raw, true, 'Opts are provided')
        resolve({
          data: 30
        })
      })
    }
  })
  let data = await User.sum('age', query)
  t.ok(sumCalled, 'Adapter#sum should have been called')
  t.context.objectsEqual(t, data.data, 30, 'sum should be 30')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
})
