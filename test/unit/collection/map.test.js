import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should map', (t) => {
  const data = [
    { id: 2 },
    { id: 3 },
    { id: 1 }
  ]
  const collection = new JSData.Collection(data)
  const ctx = {}
  const mapping = collection.map(function (item) {
    t.ok(this === ctx, 'should have correct context')
    return item.id
  }, ctx)
  t.ok(mapping.indexOf(1) !== -1)
  t.ok(mapping.indexOf(2) !== -1)
  t.ok(mapping.indexOf(3) !== -1)
  t.is(mapping.length, 3)
})
