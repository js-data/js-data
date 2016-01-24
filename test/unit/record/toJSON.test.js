export function init () {
  describe('toJSON', function () {
    it('should be an instance method', function () {
      const Test = this
      const Record = Test.JSData.Record
      const record = new Record()
      Test.assert.isFunction(record.toJSON)
      Test.assert.isTrue(record.toJSON === Record.prototype.toJSON)
    })
    it('should make json when not an instance', function () {
      const Test = this
      const props = { name: 'John' }
      Test.assert.isTrue(Test.JSData.Record.prototype.toJSON.call(props) === props, 'should return passed in data')
    })
    it('should make json when an instance', function () {
      const Test = this
      const props = { name: 'John', organizationId: 5 }
      const user = new Test.JSData.Record(props)
      Test.assert.isTrue(user.toJSON() !== props, 'should return copy of data')
      Test.assert.deepEqual(user.toJSON(), props, 'copy should equal passed in data')
    })
    it('should keep only enumerable properties', function () {
      const Test = this
      const props = { name: 'John' }
      const user = new Test.JSData.Record(props)
      Object.defineProperty(user, 'foo', {
        enumerable: true,
        value: 'foo'
      })
      Object.defineProperty(user, 'bar', {
        enumerable: false,
        value: 'bar'
      })
      Test.assert.isTrue(user.toJSON() !== props, 'should return copy of data')
      Test.assert.deepEqual(user.toJSON(), {
        name: 'John',
        foo: 'foo'
      }, 'should return enumerable properties')
    })
    // it('should keep relations when not an instance', function () {
    //   const Test = this
    //   const user = {
    //     name: 'John',
    //     organization: {
    //       name: 'Company Inc.'
    //     },
    //     comments: [
    //       {
    //         text: 'foo',
    //         approvedByUser: {
    //           name: 'Sally',
    //           organization: {
    //             name: 'Group Inc.'
    //           }
    //         }
    //       },
    //       {
    //         text: 'bar'
    //       }
    //     ]
    //   }
    //   Test.assert.isTrue(Test.User.prototype.toJSON.call(user) === user, 'should return the same data')
    //   Test.assert.deepEqual(Test.User.prototype.toJSON.call(user), user, 'returned data should be equal to passed in data')
    // })
    // it('should remove relations when an instance', function () {
    //   const Test = this
    //   const user = Test.User.inject({
    //     name: 'John',
    //     id: 1,
    //     organization: {
    //       name: 'Company Inc.',
    //       id: 2
    //     },
    //     comments: [
    //       {
    //         text: 'foo',
    //         id: 3,
    //         approvedByUser: {
    //           name: 'Sally',
    //           id: 5,
    //           organization: {
    //             name: 'Group Inc.',
    //             id: 6
    //           }
    //         }
    //       },
    //       {
    //         id: 4,
    //         text: 'bar'
    //       }
    //     ]
    //   })
    //   Test.assert.isTrue(user.toJSON() !== user, 'should return copy of data')
    //   Test.assert.deepEqual(user.toJSON(), {
    //     id: 1,
    //     name: 'John',
    //     organizationId: 2
    //   }, 'returned data should not have relations')
    // })
    // it('should keep specified relations when an instance', function () {
    //   const Test = this
    //   const user = Test.User.inject({
    //     name: 'John',
    //     id: 1,
    //     organization: {
    //       name: 'Company Inc.',
    //       id: 2
    //     },
    //     comments: [
    //       {
    //         text: 'foo',
    //         id: 3,
    //         approvedByUser: {
    //           name: 'Sally',
    //           id: 5,
    //           organization: {
    //             name: 'Group Inc.',
    //             id: 6
    //           }
    //         }
    //       },
    //       {
    //         id: 4,
    //         text: 'bar'
    //       }
    //     ]
    //   })
    //   Test.assert.objectsEqual(user.toJSON({
    //     with: ['organization']
    //   }), {
    //     id: 1,
    //     name: 'John',
    //     organizationId: 2,
    //     organization: user.organization
    //   }, 'should keep organization')
    //   Test.assert.objectsEqual(user.toJSON({
    //     with: ['organization', 'comments']
    //   }), {
    //     id: 1,
    //     name: 'John',
    //     organizationId: 2,
    //     organization: user.organization,
    //     comments: user.comments
    //   }, 'should keep organization and comments')
    //   Test.assert.objectsEqual(user.toJSON({
    //     with: ['organization', 'comments', 'comments.approvedByUser']
    //   }), {
    //     id: 1,
    //     name: 'John',
    //     organizationId: 2,
    //     organization: user.organization,
    //     comments: [
    //       {
    //         id: 3,
    //         userId: 1,
    //         text: 'foo',
    //         approvedBy: 5,
    //         approvedByUser: Test.User.get(5)
    //       },
    //       Test.Comment.get(4)
    //     ]
    //   }, 'should keep organization and comments and comments.approvedByUser')
    //   Test.assert.objectsEqual(user.toJSON({
    //     with: [
    //       'organization',
    //       'comments',
    //       'comments.approvedByUser',
    //       'comments.approvedByUser.organization'
    //     ]
    //   }), {
    //     id: 1,
    //     name: 'John',
    //     organizationId: 2,
    //     organization: user.organization,
    //     comments: [
    //       {
    //         id: 3,
    //         userId: 1,
    //         text: 'foo',
    //         approvedBy: 5,
    //         approvedByUser: {
    //           name: 'Sally',
    //           id: 5,
    //           organizationId: 6,
    //           organization: Test.Organization.get(6)
    //         }
    //       },
    //       Test.Comment.get(4)
    //     ]
    //   }, 'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization')
    // })
  })
}
