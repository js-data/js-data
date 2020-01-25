import { assert } from '../../_setup'

describe('DataStore collection methods', function () {
  it('add should work', function () {
    const user = this.store.add('user', { id: 1, name: 'John' })
    assert.objectsEqual(user, { id: 1, name: 'John' })
  })
  it('remove should remove relations', function () {
    const user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    const removedUser = this.store.remove('user', user.id, { with: ['organization'] })

    assert(user === removedUser)
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUser.organization)
    assert.equal(this.store.getAll('profile').length, 2)
  })
  it('remove should remove multiple relations', function () {
    const user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    const removedUser = this.store.remove('user', user.id, { with: ['organization', 'comment', 'profile'] })

    assert(user === removedUser)
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 0)
    assert.equal(removedUser.comments.length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUser.organization)
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 0)
    assert(!removedUser.profile)
  })
  it('removeAll should remove relations', function () {
    const user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    const removedUsers = this.store.removeAll('user', {}, { with: ['organization'] })

    assert(user === removedUsers[0])
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUsers[0].organization)
    assert.equal(this.store.getAll('profile').length, 2)
  })
  it('removeAll should remove multiple relations', function () {
    const user = this.store.add('user', this.data.user10)
    this.store.add('organization', this.data.organization15)
    this.store.add('comment', this.data.comment19)
    this.store.add('profile', this.data.profile21)

    assert.equal(this.store.filter('comment', { userId: user.id }).length, 3)
    assert(this.store.get('organization', user.organizationId))
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 1)

    const removedUsers = this.store.removeAll('user', {}, { with: ['organization', 'comment', 'profile'] })

    assert(user === removedUsers[0])
    assert.equal(this.store.filter('comment', { userId: user.id }).length, 0)
    assert.equal(removedUsers[0].comments.length, 3)
    assert(!this.store.get('organization', user.organizationId))
    assert(removedUsers[0].organization)
    assert.equal(this.store.filter('profile', { userId: user.id }).length, 0)
    assert(!removedUsers[0].profile)
  })
  it('should delete cached findAll query on removeAll', function () {
    const query = { name: 'John' }
    let callCount = 0
    this.store.registerAdapter('mock', {
      findAll () {
        callCount++
        return Promise.resolve([{ id: 1, name: 'John' }])
      }
    }, { default: true })
    return this.store.findAll('user', query)
      .then((users) => {
        assert.equal(callCount, 1)
        return this.store.findAll('user', query)
      })
      .then((users) => {
        // Query was only made once
        assert.equal(callCount, 1)
        this.store.removeAll('user', query)
        return this.store.findAll('user', query)
      })
      .then((users) => {
        assert.equal(callCount, 2)
      })
  })
  it('should remove all queries', function () {
    const queryOne = { name: 'Bob' }
    const queryTwo = { name: 'Alice' }
    let callCount = 0
    this.store.registerAdapter('mock', {
      findAll () {
        callCount++
        return Promise.resolve([])
      }
    }, { default: true })
    return this.store.findAll('user', queryOne)
      .then((users) => {
        assert.equal(callCount, 1)
        return this.store.findAll('user', queryOne)
      })
      .then((users) => {
        assert.equal(callCount, 1)
        return this.store.findAll('user', queryTwo)
      })
      .then((users) => {
        assert.equal(callCount, 2)
        return this.store.findAll('user', queryTwo)
      })
      .then((users) => {
        // Query was only made twice
        assert.equal(callCount, 2)
        this.store.removeAll('user')
        return this.store.findAll('user', queryOne)
      })
      .then((users) => {
        assert.equal(callCount, 3)
        return this.store.findAll('user', queryTwo)
      })
      .then((users) => {
        assert.equal(callCount, 4)
      })
  })
})
