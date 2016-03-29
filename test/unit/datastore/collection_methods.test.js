import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('add should work', (t) => {
  let user = t.context.store.add('user', { id: 1, name: 'John' })
  t.context.objectsEqual(user, { id: 1, name: 'John' })
})
test('remove should remove relations', (t) => {
  let user = t.context.store.add('user', t.context.data.user10)
  let comments = t.context.store.add('organization', t.context.data.organization15)
  t.context.store.add('comment', t.context.data.comment19)
  t.context.store.add('profile', t.context.data.profile21)

  t.is(t.context.store.filter('comment', { userId: user.id }).length, 3)
  t.ok(t.context.store.get('organization', user.organizationId))
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 1)

  let removedUser = t.context.store.remove('user', user.id, { with: ['organization'] })

  t.ok(user === removedUser)
  t.is(t.context.store.filter('comment', { userId: user.id }).length, 3)
  t.notOk(t.context.store.get('organization', user.organizationId))
  t.ok(removedUser.organization)
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 1)
})
test('remove should remove multiple relations', (t) => {
  let user = t.context.store.add('user', t.context.data.user10)
  let comments = t.context.store.add('organization', t.context.data.organization15)
  t.context.store.add('comment', t.context.data.comment19)
  t.context.store.add('profile', t.context.data.profile21)

  t.is(t.context.store.filter('comment', { userId: user.id }).length, 3)
  t.ok(t.context.store.get('organization', user.organizationId))
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 1)

  let removedUser = t.context.store.remove('user', user.id, { with: ['organization', 'comment', 'profile'] })

  t.ok(user === removedUser)
  t.is(t.context.store.filter('comment', { userId: user.id }).length, 0)
  t.is(removedUser.comments.length, 3)
  t.notOk(t.context.store.get('organization', user.organizationId))
  t.ok(removedUser.organization)
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 0)
  t.ok(removedUser.profile)
})
test('removeAll should remove relations', (t) => {
  let user = t.context.store.add('user', t.context.data.user10)
  let comments = t.context.store.add('organization', t.context.data.organization15)
  t.context.store.add('comment', t.context.data.comment19)
  t.context.store.add('profile', t.context.data.profile21)

  t.is(t.context.store.filter('comment', { userId: user.id }).length, 3)
  t.ok(t.context.store.get('organization', user.organizationId))
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 1)

  let removedUsers = t.context.store.removeAll('user', {}, { with: ['organization'] })

  t.ok(user === removedUsers[0])
  t.is(t.context.store.filter('comment', { userId: user.id }).length, 3)
  t.notOk(t.context.store.get('organization', user.organizationId))
  t.ok(removedUsers[0].organization)
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 1)
})
test('removeAll should remove multiple relations', (t) => {
  let user = t.context.store.add('user', t.context.data.user10)
  let comments = t.context.store.add('organization', t.context.data.organization15)
  t.context.store.add('comment', t.context.data.comment19)
  t.context.store.add('profile', t.context.data.profile21)

  t.is(t.context.store.filter('comment', { userId: user.id }).length, 3)
  t.ok(t.context.store.get('organization', user.organizationId))
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 1)

  let removedUsers = t.context.store.removeAll('user', {}, { with: ['organization', 'comment', 'profile'] })

  t.ok(user === removedUsers[0])
  t.is(t.context.store.filter('comment', { userId: user.id }).length, 0)
  t.is(removedUsers[0].comments.length, 3)
  t.notOk(t.context.store.get('organization', user.organizationId))
  t.ok(removedUsers[0].organization)
  t.is(t.context.store.filter('profile', { userId: user.id }).length, 0)
  t.ok(removedUsers[0].profile)
})
