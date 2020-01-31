import { assert, JSData, objectsEqual } from '../../_setup'

describe('Mapper#toJSON', () => {
  it('should be an instance method', () => {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'user' })
    assert.equal(typeof mapper.toJSON, 'function')
    assert.strictEqual(mapper.toJSON, Mapper.prototype.toJSON)
  })
  it('should make json when not an instance', function () {
    const props = { name: 'John' }
    objectsEqual(this.User.toJSON(props), props, 'should return passed in data')

    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        }
      }
    })
    const CommentMapper = new JSData.Mapper({
      name: 'comment'
    })
    JSData.belongsTo(UserMapper, {
      localField: 'user',
      foreignKey: 'userId'
    })(UserMapper)
    JSData.hasMany(CommentMapper, {
      localField: 'comments',
      foreignKey: 'userId'
    })(UserMapper)

    objectsEqual(
      UserMapper.toJSON(
        {
          name: 'John',
          id: 1,
          comments: [{ userId: 1 }]
        },
        { with: 'comments' }
      ),
      {
        name: 'John',
        id: 1,
        comments: [{ userId: 1 }]
      }
    )
  })
  it('should strictly keep schema props', () => {
    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    })
    const json = UserMapper.toJSON(
      {
        name: 'John',
        age: 30,
        foo: 'bar'
      },
      { strict: true }
    )
    objectsEqual(json, {
      name: 'John',
      age: 30
    })
  })
  it('should allow custom getters/setters', () => {
    const UserMapper = new JSData.Mapper({
      name: 'user',
      schema: {
        properties: {
          first: { type: 'string' },
          last: { type: 'string' },
          name: {
            type: 'string',
            get () {
              return `${this.first} ${this.last}`
            },
            set (value) {
              const parts = value.split(' ')
              this.first = parts[0] || this.first
              this.last = parts[1] || this.last
            }
          },
          age: { type: 'number' }
        }
      }
    })
    const user = UserMapper.createRecord({
      first: 'John',
      last: 'Anderson'
    })
    assert.equal(user.name, 'John Anderson')
  })
  it('should make json when the record class does not have a mapper', () => {
    const props = { name: 'John' }
    const record = new JSData.Record(props)
    assert.notStrictEqual(record.toJSON(), props, 'should not return passed in data')
    objectsEqual(record.toJSON(), props, 'should be deeply equal')
  })
  it('should make json when an instance', function () {
    const props = { name: 'John', organizationId: 5 }
    const user = this.User.createRecord(props)
    assert(this.User.toJSON(user) !== props, 'should return copy of data')
    objectsEqual(this.User.toJSON(user), props, 'copy should equal passed in data')
    objectsEqual(user.toJSON(), props, 'copy should equal passed in data')
  })
  it('should keep only enumerable properties', function () {
    const props = { name: 'John' }
    const user = this.User.createRecord(props)
    Object.defineProperty(user, 'foo', {
      enumerable: true,
      value: 'foo'
    })
    Object.defineProperty(user, 'bar', {
      enumerable: false,
      value: 'bar'
    })
    assert(this.User.toJSON(user) !== props, 'should return copy of data')
    const expected = {
      name: 'John',
      foo: 'foo'
    }
    objectsEqual(this.User.toJSON(user), expected, 'should return enumerable properties')
    objectsEqual(user.toJSON(), expected, 'should return enumerable properties')
  })
  it('should work when not a Record instance', function () {
    const user = {
      name: 'John',
      organization: {
        name: 'Company Inc.'
      },
      comments: [
        {
          text: 'foo'
        },
        {
          text: 'bar'
        }
      ]
    }
    objectsEqual(this.User.toJSON(user), { name: 'John' }, 'returned data should not have relations')
    objectsEqual(this.User.toJSON(user, { withAll: true }), user, 'returned data should have all relations')
  })
  it('should remove relations when an instance', function () {
    const user = this.store.add('user', {
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
    assert(this.User.toJSON(user) !== user, 'should return copy of data')
    assert(user.toJSON() !== user, 'should return copy of data')
    const expected = {
      id: 1,
      name: 'John',
      organizationId: 2
    }
    objectsEqual(this.User.toJSON(user), expected, 'returned data should not have relations')
    objectsEqual(user.toJSON(), expected, 'returned data should not have relations')
  })
  it('should keep specified relations when an instance', function () {
    const store = this.store
    const user = store.add('user', {
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
    let expected: any = {
      id: 1,
      name: 'John',
      organizationId: 2,
      organization: user.organization.toJSON()
    }

    objectsEqual(
      this.User.toJSON(user, {
        with: ['organization']
      }),
      expected,
      'should keep organization'
    )
    objectsEqual(
      user.toJSON({
        with: ['organization']
      }),
      expected,
      'should keep organization'
    )

    expected = {
      id: 1,
      name: 'John',
      organizationId: 2,
      organization: user.organization.toJSON(),
      comments: user.comments.map(comment => comment.toJSON())
    }

    objectsEqual(
      this.User.toJSON(user, {
        with: ['organization', 'comments']
      }),
      expected,
      'should keep organization and comments'
    )
    objectsEqual(
      user.toJSON({
        with: ['organization', 'comments']
      }),
      expected,
      'should keep organization and comments'
    )

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
          approvedByUser: store.get('user', 5).toJSON()
        },
        store.get('comment', 4)
      ]
    }

    objectsEqual(
      this.User.toJSON(user, {
        with: ['organization', 'comments', 'comments.approvedByUser']
      }),
      expected,
      'should keep organization and comments and comments.approvedByUser'
    )
    objectsEqual(
      user.toJSON({
        with: ['organization', 'comments', 'comments.approvedByUser']
      }),
      expected,
      'should keep organization and comments and comments.approvedByUser'
    )

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
            organization: store.get('organization', 6).toJSON()
          }
        },
        this.store.get('comment', 4).toJSON()
      ]
    }

    objectsEqual(
      this.User.toJSON(user, {
        with: ['organization', 'comments', 'comments.approvedByUser', 'comments.approvedByUser.organization']
      }),
      expected,
      'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization'
    )

    objectsEqual(
      user.toJSON({
        with: ['organization', 'comments', 'comments.approvedByUser', 'comments.approvedByUser.organization']
      }),
      expected,
      'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization'
    )
  })
})
