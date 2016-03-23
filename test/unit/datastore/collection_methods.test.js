export function init () {
  describe('proxied Collection methods', function () {
    describe('add', function () {
      it('should work', function () {
        const Test = this
        let user = Test.store.add('user', { id: 1, name: 'John' })
        Test.assert.objectsEqual(user, { id: 1, name: 'John' })
      })
    })
    describe('between', function () {
      it('should work')
    })
    describe('createIndex', function () {
      it('should work')
    })
    describe('filter', function () {
      it('should work')
    })
    describe('get', function () {
      it('should work')
    })
    describe('getAll', function () {
      it('should work')
    })
    describe('query', function () {
      it('should work')
    })
    describe('remove', function () {
      it('should work')
      it('should remove relations', function () {
        const Test = this

        let user = Test.store.add('user', Test.data.user10)
        let comments = Test.store.add('organization', Test.data.organization15)
        Test.store.add('comment', Test.data.comment19)
        Test.store.add('profile', Test.data.profile21)

        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 3)
        Test.assert.isDefined(Test.store.get('organization', user.organizationId))
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 1)

        let removedUser = Test.store.remove('user', user.id, { with: ['organization'] })

        Test.assert.isTrue(user === removedUser)
        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 3)
        Test.assert.isUndefined(Test.store.get('organization', user.organizationId))
        Test.assert.isDefined(removedUser.organization)
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 1)
      })
      it('should remove relations 2', function () {
        const Test = this

        let user = Test.store.add('user', Test.data.user10)
        let comments = Test.store.add('organization', Test.data.organization15)
        Test.store.add('comment', Test.data.comment19)
        Test.store.add('profile', Test.data.profile21)

        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 3)
        Test.assert.isDefined(Test.store.get('organization', user.organizationId))
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 1)

        let removedUser = Test.store.remove('user', user.id, { with: ['organization', 'comment', 'profile'] })

        Test.assert.isTrue(user === removedUser)
        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 0)
        Test.assert.equal(removedUser.comments.length, 3)
        Test.assert.isUndefined(Test.store.get('organization', user.organizationId))
        Test.assert.isDefined(removedUser.organization)
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 0)
        Test.assert.isDefined(removedUser.profile)
      })
    })
    describe('removeAll', function () {
      it('should work')
      it('should remove relations', function () {
        const Test = this

        let user = Test.store.add('user', Test.data.user10)
        let comments = Test.store.add('organization', Test.data.organization15)
        Test.store.add('comment', Test.data.comment19)
        Test.store.add('profile', Test.data.profile21)

        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 3)
        Test.assert.isDefined(Test.store.get('organization', user.organizationId))
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 1)

        let removedUsers = Test.store.removeAll('user', {}, { with: ['organization'] })

        Test.assert.isTrue(user === removedUsers[0])
        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 3)
        Test.assert.isUndefined(Test.store.get('organization', user.organizationId))
        Test.assert.isDefined(removedUsers[0].organization)
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 1)
      })
      it('should remove relations 2', function () {
        const Test = this

        let user = Test.store.add('user', Test.data.user10)
        let comments = Test.store.add('organization', Test.data.organization15)
        Test.store.add('comment', Test.data.comment19)
        Test.store.add('profile', Test.data.profile21)

        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 3)
        Test.assert.isDefined(Test.store.get('organization', user.organizationId))
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 1)

        let removedUsers = Test.store.removeAll('user', {}, { with: ['organization', 'comment', 'profile'] })

        Test.assert.isTrue(user === removedUsers[0])
        Test.assert.equal(Test.store.filter('comment', { userId: user.id }).length, 0)
        Test.assert.equal(removedUsers[0].comments.length, 3)
        Test.assert.isUndefined(Test.store.get('organization', user.organizationId))
        Test.assert.isDefined(removedUsers[0].organization)
        Test.assert.equal(Test.store.filter('profile', { userId: user.id }).length, 0)
        Test.assert.isDefined(removedUsers[0].profile)
      })
    })
    describe('toJson', function () {
      it('should work')
    })
  })
}
