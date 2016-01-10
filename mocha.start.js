'use strict'

require('babel-polyfill')

before(function () {
  var Test = this
  Test.assert = require('chai').assert
  Test.sinon = require('sinon')
  Test.JSData = require('./dist/js-data')
  Test.assert.objectsEqual = function (a, b, msg) {
    Test.assert.deepEqual(
      JSON.parse(JSON.stringify(a)),
      JSON.parse(JSON.stringify(b)),
      msg || 'Expected objects or arrays to be equal'
    )
  }
  Test.assert.fail = function (msg) {
    Test.assert.equal('should not reach this!: ' + msg, 'failure')
  }
  Test.TYPES_EXCEPT_STRING = [123, 123.123, null, undefined, {}, [], true, false, function () {}]
  Test.TYPES_EXCEPT_STRING_OR_ARRAY = [123, 123.123, null, undefined, {}, true, false, function () {}]
  Test.TYPES_EXCEPT_STRING_OR_NUMBER = [null, undefined, {}, [], true, false, function () {}]
  Test.TYPES_EXCEPT_STRING_OR_OBJECT = [123, 123.123, null, undefined, [], true, false, function () {}]
  Test.TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT = [null, undefined, [], true, false, function () {}]
  Test.TYPES_EXCEPT_ARRAY = ['string', 123, 123.123, null, undefined, {}, true, false, function () {}]
  Test.TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER = [null, undefined, {}, true, false, function () {}]
  Test.TYPES_EXCEPT_NUMBER = ['string', null, undefined, {}, [], true, false, function () {}]
  Test.TYPES_EXCEPT_OBJECT = ['string', 123, 123.123, null, undefined, true, false, function () {}]
  Test.TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], function () {}]
  Test.TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false]
})

beforeEach(function () {
  var Test = this
  Test.data = {}
  Test.data.p1 = { author: 'John', age: 30, id: 5 }
  Test.data.p2 = { author: 'Sally', age: 31, id: 6 }
  Test.data.p3 = { author: 'Mike', age: 32, id: 7 }
  Test.data.p4 = { author: 'Adam', age: 33, id: 8 }
  Test.data.p5 = { author: 'Adam', age: 33, id: 9 }
  var Base = Test.JSData.Model.extend({}, {
    name: 'base',
    linkRelations: true
  });
  Test.Post = Base.extend({}, {
    name: 'post',
    endpoint: '/posts'
  })
  Test.PostCollection = new Test.JSData.Collection({ model: Test.Post })
  Test.User = Base.extend({}, {
    name: 'user'
  })
  Test.UserCollection = new Test.JSData.Collection({ model: Test.User })
  Test.Group = Base.extend({}, {
    name: 'group'
  })
  Test.GroupCollection = new Test.JSData.Collection({ model: Test.Group })
  Test.Organization = Base.extend({}, {
    name: 'organization'
  })
  Test.OrganizationCollection = new Test.JSData.Collection({ model: Test.Organization })
  Test.Profile = Base.extend({}, {
    name: 'profile'
  })
  Test.ProfileCollection = new Test.JSData.Collection({ model: Test.Profile })
  Test.Comment = Base.extend({}, {
    name: 'comment'
  })
  Test.CommentCollection = new Test.JSData.Collection({ model: Test.Comment })
  Test.User.belongsTo(Test.Organization, {
    localField: 'organization',
    localKey: 'organizationId'
  })
  Test.User.hasMany(Test.Comment, {
    localField: 'comments',
    foreignKey: 'userId'
  })
  Test.User.hasMany(Test.Comment, {
    localField: 'approvedComments',
    foreignKey: 'approvedBy'
  })
  Test.User.hasMany(Test.Group, {
    localField: 'groups',
    foreignKeys: 'userIds'
  })
  Test.User.hasOne(Test.Profile, {
    localField: 'profile',
    foreignKey: 'userId'
  })
  Test.Group.hasMany(Test.User, {
    localField: 'users',
    localKeys: 'userIds'
  })
  Test.Organization.hasMany(Test.User, {
    localField: 'users',
    foreignKey: 'organizationId'
  })
  Test.Profile.belongsTo(Test.User, {
    localField: 'user',
    localKey: 'userId'
  })
  Test.Comment.belongsTo(Test.User, {
    localField: 'user',
    localKey: 'userId'
  })
  Test.Comment.belongsTo(Test.User, {
    localField: 'approvedByUser',
    localKey: 'approvedBy'
  })
  Test.data.user1 = {
    name: 'John Anderson',
    id: 1,
    organizationId: 2
  }
  Test.data.organization2 = {
    name: 'Test Corp 2',
    id: 2
  }
  Test.data.comment3 = {
    content: 'test comment 3',
    id: 3,
    userId: 1
  }
  Test.data.profile4 = {
    content: 'test profile 4',
    id: 4,
    userId: 1
  }

  Test.data.comment11 = {
    id: 11,
    userId: 10,
    content: 'test comment 11'
  }
  Test.data.comment12 = {
    id: 12,
    userId: 10,
    content: 'test comment 12'
  }
  Test.data.comment13 = {
    id: 13,
    userId: 10,
    content: 'test comment 13'
  }
  Test.data.organization14 = {
    id: 14,
    name: 'Test Corp'
  }
  Test.data.profile15 = {
    id: 15,
    userId: 10,
    email: 'john.anderson@test.com'
  }
  Test.data.user10 = {
    name: 'John Anderson',
    id: 10,
    organizationId: 14,
    comments: [
      Test.data.comment11,
      Test.data.comment12,
      Test.data.comment13
    ],
    organization: Test.data.organization14,
    profile: Test.data.profile15
  }
  Test.data.user16 = {
    id: 16,
    organizationId: 15,
    name: 'test user 16'
  }
  Test.data.user17 = {
    id: 17,
    organizationId: 15,
    name: 'test user 17'
  }
  Test.data.user18 = {
    id: 18,
    organizationId: 15,
    name: 'test user 18'
  }
  Test.data.group1 = {
    name: 'group 1',
    id: 1,
    userIds: [10]
  }
  Test.data.group2 = {
    name: 'group 2',
    id: 2,
    userIds: [10]
  }
  Test.data.organization15 = {
    name: 'Another Test Corp',
    id: 15,
    users: [
      Test.data.user16,
      Test.data.user17,
      Test.data.user18
    ]
  }
  Test.data.user19 = {
    id: 19,
    name: 'test user 19'
  }
  Test.data.user20 = {
    id: 20,
    name: 'test user 20'
  }
  Test.data.comment19 = {
    content: 'test comment 19',
    id: 19,
    approvedBy: 19,
    approvedByUser: Test.data.user19,
    userId: 20,
    user: Test.data.user20
  }
  Test.data.user22 = {
    id: 22,
    name: 'test user 22'
  }
  Test.data.profile21 = {
    content: 'test profile 21',
    id: 21,
    userId: 22,
    user: Test.data.user22
  }
})

require('./dist/js-data-tests').init()
