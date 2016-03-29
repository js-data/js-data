import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should get an item from the collection', (t) => {
  const user = t.context.UserCollection.add({ id: 1 })
  t.ok(t.context.UserCollection.get(1) === user, 'should get the user from the collection')
  t.notOk(t.context.UserCollection.get(2), 'should return undefined if the item is not in the collection')
})
