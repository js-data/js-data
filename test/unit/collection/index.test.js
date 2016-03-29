import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be a constructor function', (t) => {
  t.is(typeof JSData.Collection, 'function', 'should be a function')
  let collection = new JSData.Collection()
  t.ok(collection instanceof JSData.Collection, 'collection should be an instance')
  t.is(collection.recordId(), 'id', 'collection should get initialization properties')
})

test('should accept initialization data', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]
  const collection = new JSData.Collection(data)
  t.same(collection.getAll(), [data[2], data[0], data[1]], 'data should be in order')
})
