'use strict'

require('babel-polyfill');
var assert = require('chai').assert;
var sinon = require('sinon')
var mocha = require('mocha')
var JSData = require('./dist/js-data')
var JSDataTests = require('./dist/js-data-tests')

var store

var lifecycle = {}

var globals = module.exports = {
  store: undefined,
  JSData: JSData
}

for (var key in JSData) {
  globals[key] = JSData[key]
}
for (var key in JSDataTests) {
  if (key !== 'init') {
    globals[key] = JSDataTests[key]
  }
}

var test = new mocha()

var testGlobals = []

for (var key in globals) {
  global[key] = globals[key]
  testGlobals.push(globals[key])
}
test.globals(testGlobals)

beforeEach(function () {
  globals.sinon = global.sinon = sinon
  this.data = {}
  this.data.p1 = globals.p1 = global.p1 = { author: 'John', age: 30, id: 5 }
  this.data.p2 = globals.p2 = global.p2 = { author: 'Sally', age: 31, id: 6 }
  this.data.p3 = globals.p3 = global.p3 = { author: 'Mike', age: 32, id: 7 }
  this.data.p4 = globals.p4 = global.p4 = { author: 'Adam', age: 33, id: 8 }
  this.data.p5 = globals.p5 = global.p5 = { author: 'Adam', age: 33, id: 9 }
  var Base = JSData.Model.extend({}, {
    name: 'base',
    linkRelations: true
  });
  this.Post = Base.extend({}, {
    name: 'post',
    endpoint: '/posts'
  })
  this.PostCollection = new JSData.Collection({ model: this.Post })
  this.User = Base.extend({}, {
    name: 'user'
  })
  this.UserCollection = new JSData.Collection({ model: this.User })
  this.Group = Base.extend({}, {
    name: 'group'
  })
  this.GroupCollection = new JSData.Collection({ model: this.Group })
  this.Organization = Base.extend({}, {
    name: 'organization'
  })
  this.OrganizationCollection = new JSData.Collection({ model: this.Organization })
  this.Profile = Base.extend({}, {
    name: 'profile'
  })
  this.ProfileCollection = new JSData.Collection({ model: this.Profile })
  this.Comment = Base.extend({}, {
    name: 'comment'
  })
  this.CommentCollection = new JSData.Collection({ model: this.Comment })
  this.User.belongsTo(this.Organization, {
    localField: 'organization',
    localKey: 'organizationId'
  })
  this.User.hasMany(this.Comment, {
    localField: 'comments',
    foreignKey: 'userId'
  })
  this.User.hasMany(this.Comment, {
    localField: 'approvedComments',
    foreignKey: 'approvedBy'
  })
  this.User.hasMany(this.Group, {
    localField: 'groups',
    foreignKeys: 'userIds'
  })
  this.User.hasOne(this.Profile, {
    localField: 'profile',
    foreignKey: 'userId'
  })
  this.Group.hasMany(this.User, {
    localField: 'users',
    localKeys: 'userIds'
  })
  this.Organization.hasMany(this.User, {
    localField: 'users',
    foreignKey: 'organizationId'
  })
  this.Profile.belongsTo(this.User, {
    localField: 'user',
    localKey: 'userId'
  })
  this.Comment.belongsTo(this.User, {
    localField: 'user',
    localKey: 'userId'
  })
  this.Comment.belongsTo(this.User, {
    localField: 'approvedByUser',
    localKey: 'approvedBy'
  })
  this.data.user1 = {
    name: 'John Anderson',
    id: 1,
    organizationId: 2
  }
  this.data.organization2 = {
    name: 'Test Corp 2',
    id: 2
  }
  this.data.comment3 = {
    content: 'test comment 3',
    id: 3,
    userId: 1
  }
  this.data.profile4 = {
    content: 'test profile 4',
    id: 4,
    userId: 1
  }

  this.data.comment11 = {
    id: 11,
    userId: 10,
    content: 'test comment 11'
  }
  this.data.comment12 = {
    id: 12,
    userId: 10,
    content: 'test comment 12'
  }
  this.data.comment13 = {
    id: 13,
    userId: 10,
    content: 'test comment 13'
  }
  this.data.organization14 = {
    id: 14,
    name: 'Test Corp'
  }
  this.data.profile15 = {
    id: 15,
    userId: 10,
    email: 'john.anderson@test.com'
  }
  this.data.user10 = {
    name: 'John Anderson',
    id: 10,
    organizationId: 14,
    comments: [
      this.data.comment11,
      this.data.comment12,
      this.data.comment13
    ],
    organization: this.data.organization14,
    profile: this.data.profile15
  }
  this.data.user16 = {
    id: 16,
    organizationId: 15,
    name: 'test user 16'
  }
  this.data.user17 = {
    id: 17,
    organizationId: 15,
    name: 'test user 17'
  }
  this.data.user18 = {
    id: 18,
    organizationId: 15,
    name: 'test user 18'
  }
  this.data.group1 = {
    name: 'group 1',
    id: 1,
    userIds: [10]
  }
  this.data.group2 = {
    name: 'group 2',
    id: 2,
    userIds: [10]
  }
  this.data.organization15 = {
    name: 'Another Test Corp',
    id: 15,
    users: [
      this.data.user16,
      this.data.user17,
      this.data.user18
    ]
  }
  this.data.user19 = {
    id: 19,
    name: 'test user 19'
  }
  this.data.user20 = {
    id: 20,
    name: 'test user 20'
  }
  this.data.comment19 = {
    content: 'test comment 19',
    id: 19,
    approvedBy: 19,
    approvedByUser: this.data.user19,
    userId: 20,
    user: this.data.user20
  }
  this.data.user22 = {
    id: 22,
    name: 'test user 22'
  }
  this.data.profile21 = {
    content: 'test profile 21',
    id: 21,
    userId: 22,
    user: this.data.user22
  }
})

/*
beforeEach(function () {
  lifecycle.beforeValidate = function (resourceName, attrs, cb) {
    lifecycle.beforeValidate.callCount += 1
    cb(null, attrs)
  }
  lifecycle.validate = function (resourceName, attrs, cb) {
    lifecycle.validate.callCount += 1
    cb(null, attrs)
  }
  lifecycle.afterValidate = function (resourceName, attrs, cb) {
    lifecycle.afterValidate.callCount += 1
    cb(null, attrs)
  }
  lifecycle.beforeCreate = function (resourceName, attrs, cb) {
    lifecycle.beforeCreate.callCount += 1
    cb(null, attrs)
  }
  lifecycle.afterCreate = function (resourceName, attrs, cb) {
    lifecycle.afterCreate.callCount += 1
    cb(null, attrs)
  }
  lifecycle.beforeUpdate = function (resourceName, attrs, cb) {
    lifecycle.beforeUpdate.callCount += 1
    cb(null, attrs)
  }
  lifecycle.afterUpdate = function (resourceName, attrs, cb) {
    lifecycle.afterUpdate.callCount += 1
    cb(null, attrs)
  }
  lifecycle.beforeDestroy = function (resourceName, attrs, cb) {
    console.log(resourceName, attrs, cb)
    lifecycle.beforeDestroy.callCount += 1
    cb(null, attrs)
  }
  lifecycle.afterDestroy = function (resourceName, attrs, cb) {
    lifecycle.afterDestroy.callCount += 1
    cb(null, attrs)
  }
  lifecycle.beforeInject = function () {
    lifecycle.beforeInject.callCount += 1
  }
  lifecycle.afterInject = function () {
    lifecycle.afterInject.callCount += 1
  }
  lifecycle.serialize = function (resourceName, data) {
    lifecycle.serialize.callCount += 1
    return data
  }
  lifecycle.deserialize = function (resourceName, data) {
    lifecycle.deserialize.callCount += 1
    return data ? ('data' in data ? data.data : data) : data
  }
  lifecycle.queryTransform = function (resourceName, query) {
    lifecycle.queryTransform.callCount += 1
    return query
  }
  store = new JSData.DS({
    basePath: 'http://test.js-data.io',
    beforeValidate: lifecycle.beforeValidate,
    cacheResponse: true,
    notify: true,
    upsert: true,
    validate: lifecycle.validate,
    afterValidate: lifecycle.afterValidate,
    beforeCreate: lifecycle.beforeCreate,
    afterCreate: lifecycle.afterCreate,
    beforeUpdate: lifecycle.beforeUpdate,
    afterUpdate: lifecycle.afterUpdate,
    beforeDestroy: lifecycle.beforeDestroy,
    afterDestroy: lifecycle.afterDestroy,
    beforeInject: lifecycle.beforeInject,
    afterInject: lifecycle.afterInject,
    linkRelations: true,
    log: false,
    methods: {
      say: function () {
        return 'hi'
      }
    }
  })

  lifecycle.beforeValidate.callCount = 0
  lifecycle.validate.callCount = 0
  lifecycle.afterValidate.callCount = 0
  lifecycle.beforeCreate.callCount = 0
  lifecycle.afterCreate.callCount = 0
  lifecycle.beforeUpdate.callCount = 0
  lifecycle.afterUpdate.callCount = 0
  lifecycle.beforeDestroy.callCount = 0
  lifecycle.afterDestroy.callCount = 0
  lifecycle.beforeInject.callCount = 0
  lifecycle.afterInject.callCount = 0
  lifecycle.serialize.callCount = 0
  lifecycle.deserialize.callCount = 0
  lifecycle.queryTransform.callCount = 0

  globals.store = store
  global.store = globals.store

  globals.JSData = JSData
  global.JSData = globals.JSData

  globals.lifecycle = lifecycle
  global.lifecycle = globals.lifecycle

  globals.isNode = true
  global.isNode = true
  this.isNode = true
})
*/

JSDataTests.init()

afterEach(function () {
  globals.store = null
  global.store = null
})
