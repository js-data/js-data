export function init () {
  describe('toJSON', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'user' })
      Test.assert.isFunction(mapper.toJSON)
      Test.assert.isTrue(mapper.toJSON === Mapper.prototype.toJSON)
    })
    it('should make json when not an instance', function () {
      const Test = this
      const props = { name: 'John' }
      Test.assert.isTrue(Test.User.toJSON(props) === props, 'should return passed in data')
    })
    it('should make json when the record class does not have a mapper', function () {
      const Test = this
      const props = { name: 'John' }
      const record = new Test.JSData.Record(props)
      Test.assert.isFalse(record.toJSON() === props, 'should not return passed in data')
      Test.assert.objectsEqual(record.toJSON(), props, 'should be deeply equal')
    })
    it('should make json when an instance', function () {
      const Test = this
      const props = { name: 'John', organizationId: 5 }
      const user = Test.User.createRecord(props)
      Test.assert.isTrue(Test.User.toJSON(user) !== props, 'should return copy of data')
      Test.assert.objectsEqual(Test.User.toJSON(user), props, 'copy should equal passed in data')
      Test.assert.objectsEqual(user.toJSON(), props, 'copy should equal passed in data')
    })
    it('should keep only enumerable properties', function () {
      const Test = this
      const props = { name: 'John' }
      const user = Test.User.createRecord(props)
      Object.defineProperty(user, 'foo', {
        enumerable: true,
        value: 'foo'
      })
      Object.defineProperty(user, 'bar', {
        enumerable: false,
        value: 'bar'
      })
      Test.assert.isTrue(Test.User.toJSON(user) !== props, 'should return copy of data')
      const expected = {
        name: 'John',
        foo: 'foo'
      }
      Test.assert.objectsEqual(Test.User.toJSON(user), expected, 'should return enumerable properties')
      Test.assert.objectsEqual(user.toJSON(), expected, 'should return enumerable properties')
    })
    it('should keep relations when not an instance', function () {
      const Test = this
      const user = {
        name: 'John',
        organization: {
          name: 'Company Inc.'
        },
        comments: [
          {
            text: 'foo',
            approvedByUser: {
              name: 'Sally',
              organization: {
                name: 'Group Inc.'
              }
            }
          },
          {
            text: 'bar'
          }
        ]
      }
      Test.assert.isTrue(Test.User.toJSON(user) === user, 'should return the same data')
      Test.assert.deepEqual(Test.User.toJSON(user), user, 'returned data should be equal to passed in data')
    })
    it('should remove relations when an instance', function () {
      const Test = this
      const user = Test.store.add('user', {
        name: 'John',
        id: 1,
        organization: {
          name: 'Company Inc.',
          id: 2
        },
        comments: [
          {
            text: 'foo',
            id: 3,
            approvedByUser: {
              name: 'Sally',
              id: 5,
              organization: {
                name: 'Group Inc.',
                id: 6
              }
            }
          },
          {
            id: 4,
            text: 'bar'
          }
        ]
      })
      Test.assert.isTrue(Test.User.toJSON(user) !== user, 'should return copy of data')
      Test.assert.isTrue(user.toJSON() !== user, 'should return copy of data')
      const expected = {
        id: 1,
        name: 'John',
        organizationId: 2
      }
      Test.assert.objectsEqual(Test.User.toJSON(user), expected, 'returned data should not have relations')
      Test.assert.objectsEqual(user.toJSON(), expected, 'returned data should not have relations')
    })
    it('should keep specified relations when an instance', function () {
      const Test = this
      const user = Test.store.add('user', {
        name: 'John',
        id: 1,
        organization: {
          name: 'Company Inc.',
          id: 2
        },
        comments: [
          {
            text: 'foo',
            id: 3,
            approvedByUser: {
              name: 'Sally',
              id: 5,
              organization: {
                name: 'Group Inc.',
                id: 6
              }
            }
          },
          {
            id: 4,
            text: 'bar'
          }
        ]
      })
      let expected = {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization.toJSON()
      }

      Test.assert.objectsEqual(Test.User.toJSON(user, {
        with: ['organization']
      }), expected, 'should keep organization')
      Test.assert.objectsEqual(user.toJSON({
        with: ['organization']
      }), expected, 'should keep organization')

      expected = {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization.toJSON(),
        comments: user.comments.map(comment => comment.toJSON())
      }

      Test.assert.objectsEqual(Test.User.toJSON(user, {
        with: ['organization', 'comments']
      }), expected, 'should keep organization and comments')
      Test.assert.objectsEqual(user.toJSON({
        with: ['organization', 'comments']
      }), expected, 'should keep organization and comments')

      expected = {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization.toJSON(),
        comments: [
          {
            id: 3,
            userId: 1,
            text: 'foo',
            approvedBy: 5,
            approvedByUser: Test.store.get('user', 5).toJSON()
          },
          Test.store.get('comment', 4).toJSON()
        ]
      }

      Test.assert.objectsEqual(Test.User.toJSON(user, {
        with: ['organization', 'comments', 'comments.approvedByUser']
      }), expected, 'should keep organization and comments and comments.approvedByUser')
      Test.assert.objectsEqual(user.toJSON({
        with: ['organization', 'comments', 'comments.approvedByUser']
      }), expected, 'should keep organization and comments and comments.approvedByUser')

      expected = {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization.toJSON(),
        comments: [
          {
            id: 3,
            userId: 1,
            text: 'foo',
            approvedBy: 5,
            approvedByUser: {
              name: 'Sally',
              id: 5,
              organizationId: 6,
              organization: Test.store.get('organization', 6).toJSON()
            }
          },
          Test.store.get('comment', 4).toJSON()
        ]
      }

      Test.assert.objectsEqual(Test.User.toJSON(user, {
        with: [
          'organization',
          'comments',
          'comments.approvedByUser',
          'comments.approvedByUser.organization'
        ]
      }), expected, 'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization')

      Test.assert.objectsEqual(user.toJSON({
        with: [
          'organization',
          'comments',
          'comments.approvedByUser',
          'comments.approvedByUser.organization'
        ]
      }), expected, 'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization')
    })
  })
}
