import { assert } from '../../_setup'

describe('DataStore collection methods', function () {
  it('add should work', function () {
    let user = this.store.add('user', { id: 1, name: 'John' })
    assert.objectsEqual(user, { id: 1, name: 'John' })
  })
  it('remove should remove relations', function () {
    let user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    let removedUser = this.store.remove('user', user.id, { with: ['organization'] })

    assert(user === removedUser)
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUser.organization)
    assert.equal(this.store.getAll('profile').length, 2)
  })
  it('remove should remove multiple relations', function () {
    let user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    let removedUser = this.store.remove('user', user.id, { with: ['organization', 'comment', 'profile'] })

    assert(user === removedUser)
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 0)
    assert.equal(removedUser.comments.length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUser.organization)
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 0)
    assert(!removedUser.profile)
  })
  it('removeAll should remove relations', function () {
    let user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    let removedUsers = this.store.removeAll('user', {}, { with: ['organization'] })

    assert(user === removedUsers[0])
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUsers[0].organization)
    assert.equal(this.store.getAll('profile').length, 2)
  })
  it('removeAll should remove multiple relations', function () {
    let user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    let removedUsers = this.store.removeAll('user', {}, { with: ['organization', 'comment', 'profile'] })

    assert(user === removedUsers[0])
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 0)
    assert.equal(removedUsers[0].comments.length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUsers[0].organization)
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 0)
    assert(!removedUsers[0].profile)
  })
})
