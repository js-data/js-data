import {
  beforeEach
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should eject items that meet the criteria from the store', (t) => {
  t.context.User.debug = true
  t.context.UserCollection.add([t.context.data.p1, t.context.data.p2, t.context.data.p3, t.context.data.p4, t.context.data.p5])
  t.ok(t.context.UserCollection.get(5))
  t.ok(t.context.UserCollection.get(6))
  t.ok(t.context.UserCollection.get(7))
  t.ok(t.context.UserCollection.get(8))
  t.ok(t.context.UserCollection.get(9))
  t.notThrows(function () {
    t.context.UserCollection.removeAll({ where: { author: 'Adam' } })
  })
  t.ok(t.context.UserCollection.get(5))
  t.ok(t.context.UserCollection.get(6))
  t.ok(t.context.UserCollection.get(7))
  t.notOk(t.context.UserCollection.get(8))
  t.notOk(t.context.UserCollection.get(9))
})
test('should eject all items from the store', (t) => {
  t.context.PostCollection.add([t.context.data.p1, t.context.data.p2, t.context.data.p3, t.context.data.p4])

  t.context.objectsEqual(t.context.PostCollection.get(5), t.context.data.p1)
  t.context.objectsEqual(t.context.PostCollection.get(6), t.context.data.p2)
  t.context.objectsEqual(t.context.PostCollection.get(7), t.context.data.p3)
  t.context.objectsEqual(t.context.PostCollection.get(8), t.context.data.p4)

  t.notThrows(function () {
    t.context.PostCollection.removeAll()
  })

  t.notOk(t.context.PostCollection.get(5))
  t.notOk(t.context.PostCollection.get(6))
  t.notOk(t.context.PostCollection.get(7))
  t.notOk(t.context.PostCollection.get(8))
})
