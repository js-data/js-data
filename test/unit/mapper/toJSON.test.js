import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'user' })
  t.is(typeof mapper.toJSON, 'function')
  t.ok(mapper.toJSON === Mapper.prototype.toJSON)
})
test('should make json when not an instance', (t) => {
  const props = { name: 'John' }
  t.context.objectsEqual(t, t.context.User.toJSON(props), props, 'should return passed in data')
})
test('should make json when the record class does not have a mapper', (t) => {
  const props = { name: 'John' }
  const record = new JSData.Record(props)
  t.false(record.toJSON() === props, 'should not return passed in data')
  t.context.objectsEqual(t, record.toJSON(), props, 'should be deeply equal')
})
test('should make json when an instance', (t) => {
  const props = { name: 'John', organizationId: 5 }
  const user = t.context.User.createRecord(props)
  t.ok(t.context.User.toJSON(user) !== props, 'should return copy of data')
  t.context.objectsEqual(t, t.context.User.toJSON(user), props, 'copy should equal passed in data')
  t.context.objectsEqual(t, user.toJSON(), props, 'copy should equal passed in data')
})
test('should keep only enumerable properties', (t) => {
  const props = { name: 'John' }
  const user = t.context.User.createRecord(props)
  Object.defineProperty(user, 'foo', {
    enumerable: true,
    value: 'foo'
  })
  Object.defineProperty(user, 'bar', {
    enumerable: false,
    value: 'bar'
  })
  t.ok(t.context.User.toJSON(user) !== props, 'should return copy of data')
  const expected = {
    name: 'John',
    foo: 'foo'
  }
  t.context.objectsEqual(t, t.context.User.toJSON(user), expected, 'should return enumerable properties')
  t.context.objectsEqual(t, user.toJSON(), expected, 'should return enumerable properties')
})
test('should work when not a Record instance', (t) => {
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
  t.context.objectsEqual(t, t.context.User.toJSON(user), { name: 'John' }, 'returned data should not have relations')
  t.context.objectsEqual(t, t.context.User.toJSON(user, { withAll: true }), user, 'returned data should have all relations')
})
test('should remove relations when an instance', (t) => {
  const user = t.context.store.add('user', {
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
  t.ok(t.context.User.toJSON(user) !== user, 'should return copy of data')
  t.ok(user.toJSON() !== user, 'should return copy of data')
  const expected = {
    id: 1,
    name: 'John',
    organizationId: 2
  }
  t.context.objectsEqual(t, t.context.User.toJSON(user), expected, 'returned data should not have relations')
  t.context.objectsEqual(t, user.toJSON(), expected, 'returned data should not have relations')
})
test('should keep specified relations when an instance', (t) => {
  const user = t.context.store.add('user', {
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

  t.context.objectsEqual(t, t.context.User.toJSON(user, {
    with: ['organization']
  }), expected, 'should keep organization')
  t.context.objectsEqual(t, user.toJSON({
    with: ['organization']
  }), expected, 'should keep organization')

  expected = {
    id: 1,
    name: 'John',
    organizationId: 2,
    organization: user.organization.toJSON(),
    comments: user.comments.map((comment) => comment.toJSON())
  }

  t.context.objectsEqual(t, t.context.User.toJSON(user, {
    with: ['organization', 'comments']
  }), expected, 'should keep organization and comments')
  t.context.objectsEqual(t, user.toJSON({
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
        approvedByUser: t.context.store.get('user', 5).toJSON()
      },
      t.context.store.get('comment', 4).toJSON()
    ]
  }

  t.context.objectsEqual(t, t.context.User.toJSON(user, {
    with: ['organization', 'comments', 'comments.approvedByUser']
  }), expected, 'should keep organization and comments and comments.approvedByUser')
  t.context.objectsEqual(t, user.toJSON({
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
          organization: t.context.store.get('organization', 6).toJSON()
        }
      },
      t.context.store.get('comment', 4).toJSON()
    ]
  }

  t.context.objectsEqual(t, t.context.User.toJSON(user, {
    with: [
      'organization',
      'comments',
      'comments.approvedByUser',
      'comments.approvedByUser.organization'
    ]
  }), expected, 'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization')

  t.context.objectsEqual(t, user.toJSON({
    with: [
      'organization',
      'comments',
      'comments.approvedByUser',
      'comments.approvedByUser.organization'
    ]
  }), expected, 'should keep organization and comments and comments.approvedByUser and comments.approvedByUser.organization')
})
