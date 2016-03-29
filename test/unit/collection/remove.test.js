import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should remove an item from the collection', (t) => {
  t.context.UserCollection.createIndex('age')
  const user = t.context.UserCollection.add({ id: 1, age: 30 })
  const user2 = t.context.UserCollection.add({ id: 2, age: 31 })
  const user3 = t.context.UserCollection.add({ id: 3, age: 32 })
  const users = [user, user2, user3]
  t.ok(t.context.UserCollection.get(1) === user, 'user 1 is in the store')
  t.ok(t.context.UserCollection.get(2) === user2, 'user 2 is in the store')
  t.ok(t.context.UserCollection.get(3) === user3, 'user 3 is in the store')
  t.same(t.context.UserCollection.between([30], [32], {
    rightInclusive: true,
    index: 'age'
  }), users, 'users can be selected by age index')
  t.context.UserCollection.remove(1)
  t.notOk(t.context.UserCollection.get(1), 'user 1 is no longer in the store')
  users.shift()
  t.same(t.context.UserCollection.between([30], [32], {
    rightInclusive: true,
    index: 'age'
  }), users, 'user 1 cannot be retrieved by index')
})
