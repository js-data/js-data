/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('#toJSON', function () {
    it('should be an instance function', function () {
      assert.isFunction(Resource.prototype.toJSON)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.prototype.toJSON)
      assert.isFunction(User2.prototype.toJSON)
      assert.isTrue(Resource.prototype.toJSON === User.prototype.toJSON)
      assert.isTrue(Resource.prototype.toJSON === User2.prototype.toJSON)
      assert.isTrue(User.prototype.toJSON === User2.prototype.toJSON)
      assert.isTrue(User2.prototype.toJSON === User3.prototype.toJSON)
    })
    it('should make json when not an instance', function () {
      const props = { name: 'John' }
      assert.isTrue(this.User.prototype.toJSON.call(props) === props, 'should return passed in data')
    })
    it('should make json when an instance', function () {
      const props = { name: 'John' }
      const user = new this.User(props)
      assert.isTrue(user.toJSON() !== props, 'should return copy of data')
      assert.deepEqual(user.toJSON(), props, 'copy should equal passed in data')
    })
    it('should keep only enumerable properties', function () {
      const props = { name: 'John' }
      const user = new this.User(props)
      Object.defineProperty(user, 'foo', {
        enumerable: true,
        value: 'foo'
      })
      Object.defineProperty(user, 'bar', {
        enumerable: false,
        value: 'bar'
      })
      assert.isTrue(user.toJSON() !== props, 'should return copy of data')
      assert.deepEqual(user.toJSON(), {
        name: 'John',
        foo: 'foo'
      }, 'should return enumerable properties')
    })
    it('should keep relations when not an instance', function () {
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
      assert.isTrue(this.User.prototype.toJSON.call(user) === user, 'should return the same data')
      assert.deepEqual(this.User.prototype.toJSON.call(user), user, 'returned data should be equal to passed in data')
    })
    it('should remove relations when an instance', function () {
      const user = this.User.inject({
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
      assert.isTrue(user.toJSON() !== user, 'should return copy of data')
      assert.deepEqual(user.toJSON(), {
        id: 1,
        name: 'John',
        organizationId: 2
      }, 'returned data should not have relations')
    })
    it('should keep specified relations when an instance', function () {
      const user = this.User.inject({
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
      assert.objectsEqual(user.toJSON({
        with: ['organization']
      }), {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization
      }, 'should keep organization')
      assert.objectsEqual(user.toJSON({
        with: ['organization', 'comments']
      }), {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization,
        comments: user.comments
      }, 'should keep organization and comments')
      assert.objectsEqual(user.toJSON({
        with: ['organization', 'comments', 'comments.approvedByUser']
      }), {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization,
        comments: [
          {
            id: 3,
            userId: 1,
            text: 'foo',
            approvedBy: 5,
            approvedByUser: this.User.get(5)
          },
          this.Comment.get(4)
        ]
      }, 'should keep organization and comments and comments.approvedByUser')
      assert.objectsEqual(user.toJSON({
        with: [
          'organization',
          'comments',
          'comments.approvedByUser',
          'comments.approvedByUser.organization'
        ]
      }), {
        id: 1,
        name: 'John',
        organizationId: 2,
        organization: user.organization,
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
              organization: this.Organization.get(6)
            }
          },
          this.Comment.get(4)
        ]
      }, 'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization')
    })
  })
}
