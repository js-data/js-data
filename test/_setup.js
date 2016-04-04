import * as JSData from '../src/index'
import sinon from 'sinon'

// Setup global data once
export {
  JSData,
  sinon
}
export const TYPES_EXCEPT_STRING = [123, 123.123, null, undefined, {}, [], true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_ARRAY = [123, 123.123, null, undefined, {}, true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_NUMBER = [null, undefined, {}, [], true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_OBJECT = [123, 123.123, null, undefined, [], true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT = [null, undefined, [], true, false, function () {}]
export const TYPES_EXCEPT_ARRAY = ['string', 123, 123.123, null, undefined, {}, true, false, function () {}]
export const TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER = [null, undefined, {}, true, false, function () {}]
export const TYPES_EXCEPT_NUMBER = ['string', null, undefined, {}, [], true, false, function () {}]
export const TYPES_EXCEPT_OBJECT = ['string', 123, 123.123, null, undefined, true, false, function () {}]
export const TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], function () {}]
export const TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false]

// Clean setup for each test
export const beforeEach = function (t) {
  t.context.objectsEqual = function (t, a, b, msg) {
    t.same(
      JSON.parse(JSON.stringify(a)),
      JSON.parse(JSON.stringify(b)),
      msg || 'Expected objects or arrays to be equal'
    )
  }
  t.context.objectsNotEqual = function (t, a, b, msg) {
    t.notSame(
      JSON.parse(JSON.stringify(a)),
      JSON.parse(JSON.stringify(b)),
      msg || 'Expected objects or arrays to be equal'
    )
  }
  t.context.fail = function (msg) {
    t.is('should not reach this!: ' + msg, 'failure')
  }
  t.context.data = {}
  t.context.data.p1 = { author: 'John', age: 30, id: 5 }
  t.context.data.p2 = { author: 'Sally', age: 31, id: 6 }
  t.context.data.p3 = { author: 'Mike', age: 32, id: 7 }
  t.context.data.p4 = { author: 'Adam', age: 33, id: 8 }
  t.context.data.p5 = { author: 'Adam', age: 33, id: 9 }
  var store = t.context.store = new JSData.DataStore({
    linkRelations: true
  })
  t.context.Post = store.defineMapper('post', {
    endpoint: '/posts'
  })
  t.context.PostCollection = store.getCollection('post')
  t.context.User = store.defineMapper('user', {
    relations: {
      belongsTo: {
        organization: {
          localField: 'organization',
          foreignKey: 'organizationId'
        }
      },
      hasMany: {
        comment: [
          {
            localField: 'comments',
            foreignKey: 'userId'
          },
          {
            localField: 'approvedComments',
            foreignKey: 'approvedBy'
          }
        ],
        group: {
          localField: 'groups',
          foreignKeys: 'userIds'
        }
      },
      hasOne: {
        profile: {
          localField: 'profile',
          foreignKey: 'userId'
        }
      }
    }
  })
  t.context.UserCollection = store.getCollection('user')
  t.context.Group = store.defineMapper('group', {
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          localKeys: 'userIds'
        }
      }
    }
  })
  t.context.GroupCollection = store.getCollection('group')
  t.context.Organization = store.defineMapper('organization', {
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          foreignKey: 'organizationId'
        }
      }
    }
  })
  t.context.OrganizationCollection = store.getCollection('organization')
  t.context.Profile = store.defineMapper('profile', {
    relations: {
      belongsTo: {
        user: {
          localField: 'user',
          foreignKey: 'userId'
        }
      }
    }
  })
  t.context.ProfileCollection = store.getCollection('profile')
  t.context.Comment = store.defineMapper('comment', {
    relations: {
      belongsTo: {
        user: [
          {
            localField: 'user',
            foreignKey: 'userId'
          },
          {
            localField: 'approvedByUser',
            foreignKey: 'approvedBy'
          }
        ]
      }
    }
  })
  t.context.CommentCollection = store.getCollection('comment')
  t.context.data.user1 = {
    name: 'John Anderson',
    id: 1,
    organizationId: 2
  }
  t.context.data.organization2 = {
    name: 'Test Corp 2',
    id: 2
  }
  t.context.data.comment3 = {
    content: 'test comment 3',
    id: 3,
    userId: 1
  }
  t.context.data.profile4 = {
    content: 'test profile 4',
    id: 4,
    userId: 1
  }

  t.context.data.comment11 = {
    id: 11,
    userId: 10,
    content: 'test comment 11'
  }
  t.context.data.comment12 = {
    id: 12,
    userId: 10,
    content: 'test comment 12'
  }
  t.context.data.comment13 = {
    id: 13,
    userId: 10,
    content: 'test comment 13'
  }
  t.context.data.organization14 = {
    id: 14,
    name: 'Test Corp'
  }
  t.context.data.profile15 = {
    id: 15,
    userId: 10,
    email: 'john.anderson@t.context.com'
  }
  t.context.data.user10 = {
    name: 'John Anderson',
    id: 10,
    organizationId: 14,
    comments: [
      t.context.data.comment11,
      t.context.data.comment12,
      t.context.data.comment13
    ],
    organization: t.context.data.organization14,
    profile: t.context.data.profile15
  }
  t.context.data.user16 = {
    id: 16,
    organizationId: 15,
    name: 'test user 16'
  }
  t.context.data.user17 = {
    id: 17,
    organizationId: 15,
    name: 'test user 17'
  }
  t.context.data.user18 = {
    id: 18,
    organizationId: 15,
    name: 'test user 18'
  }
  t.context.data.group1 = {
    name: 'group 1',
    id: 1,
    userIds: [10]
  }
  t.context.data.group2 = {
    name: 'group 2',
    id: 2,
    userIds: [10]
  }
  t.context.data.organization15 = {
    name: 'Another Test Corp',
    id: 15,
    users: [
      t.context.data.user16,
      t.context.data.user17,
      t.context.data.user18
    ]
  }
  t.context.data.user19 = {
    id: 19,
    name: 'test user 19'
  }
  t.context.data.user20 = {
    id: 20,
    name: 'test user 20'
  }
  t.context.data.comment19 = {
    content: 'test comment 19',
    id: 19,
    approvedBy: 19,
    approvedByUser: t.context.data.user19,
    userId: 20,
    user: t.context.data.user20
  }
  t.context.data.user22 = {
    id: 22,
    name: 'test user 22'
  }
  t.context.data.profile21 = {
    content: 'test profile 21',
    id: 21,
    userId: 22,
    user: t.context.data.user22
  }
}
