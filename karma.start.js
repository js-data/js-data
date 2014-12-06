// Setup global test variables
var store, DSUtils, dsHttpAdapter, dsLocalStorageAdapter, p1, p2, p3, p4, p5, p6;

var Post, User, Organization, Comment, Profile;
var user1, organization2, comment3, profile4;
var comment11, comment12, comment13, organization14, profile15, user10, user16, user17, user18, organization15, user19, user20, comment19, user22, profile21;

var lifecycle = {};

// Helper globals
var fail = function (msg) {
    if (msg instanceof Error) {
      console.error(msg.stack);
    } else {
      assert.equal('should not reach this!: ' + msg, 'failure');
    }
  },
  TYPES_EXCEPT_STRING = [123, 123.123, null, undefined, {}, [], true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_ARRAY = [123, 123.123, null, undefined, {}, true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_OBJECT = [123, 123.123, null, undefined, [], true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT = [null, undefined, [], true, false, function () {
  }],
  TYPES_EXCEPT_ARRAY = ['string', 123, 123.123, null, undefined, {}, true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_NUMBER = [null, undefined, {}, [], true, false, function () {
  }],
  TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER = [null, undefined, {}, true, false, function () {
  }],
  TYPES_EXCEPT_NUMBER = ['string', null, undefined, {}, [], true, false, function () {
  }],
  TYPES_EXCEPT_OBJECT = ['string', 123, 123.123, null, undefined, true, false, function () {
  }],
  TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], function () {
  }],
  TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false];

// Setup before each test
beforeEach(function () {
  lifecycle.beforeValidate = function (resourceName, attrs, cb) {
    lifecycle.beforeValidate.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.validate = function (resourceName, attrs, cb) {
    lifecycle.validate.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.afterValidate = function (resourceName, attrs, cb) {
    lifecycle.afterValidate.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.beforeCreate = function (resourceName, attrs, cb) {
    lifecycle.beforeCreate.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.afterCreate = function (resourceName, attrs, cb) {
    lifecycle.afterCreate.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.beforeUpdate = function (resourceName, attrs, cb) {
    lifecycle.beforeUpdate.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.afterUpdate = function (resourceName, attrs, cb) {
    lifecycle.afterUpdate.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.beforeDestroy = function (resourceName, attrs, cb) {
    lifecycle.beforeDestroy.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.afterDestroy = function (resourceName, attrs, cb) {
    lifecycle.afterDestroy.callCount += 1;
    cb(null, attrs);
  };
  lifecycle.beforeInject = function () {
    lifecycle.beforeInject.callCount += 1;
  };
  lifecycle.afterInject = function () {
    lifecycle.afterInject.callCount += 1;
  };
  lifecycle.serialize = function (resourceName, data) {
    lifecycle.serialize.callCount += 1;
    return data;
  };
  lifecycle.deserialize = function (resourceName, data) {
    lifecycle.deserialize.callCount += 1;
    return data ? ('data' in data ? data.data : data) : data;
  };
  lifecycle.queryTransform = function (resourceName, query) {
    lifecycle.queryTransform.callCount += 1;
    return query;
  };
  store = new JSData.DS({
    basePath: 'http://test.js-data.io',
    beforeValidate: lifecycle.beforeValidate,
    validate: lifecycle.validate,
    afterValidate: lifecycle.afterValidate,
    beforeCreate: lifecycle.beforeCreate,
    afterCreate: lifecycle.afterCreate,
    beforeUpdate: lifecycle.beforeUpdate,
    afterUpdate: lifecycle.afterUpdate,
    beforeDestroy: lifecycle.beforeDestroy,
    afterDestroy: lifecycle.afterDestroy,
    beforeInject: lifecycle.beforeInject,
    afterInject: lifecycle.afterInject
  });
  dsHttpAdapter = new DSHttpAdapter({
    queryTransform: lifecycle.queryTransform,
    serialize: lifecycle.serialize,
    deserialize: lifecycle.deserialize,
    log: function () {}
  });
  store.registerAdapter('http', dsHttpAdapter, { default: true });
  dsLocalStorageAdapter = new DSLocalStorageAdapter();
  store.registerAdapter('localstorage', dsLocalStorageAdapter);
  DSUtils = JSData.DSUtils;
  localStorage.clear();
  Post = store.defineResource({
    name: 'post',
    keepChangeHistory: true,
    endpoint: '/posts'
  });

  User = store.defineResource({
    name: 'user',
    relations: {
      hasMany: {
        comment: {
          localField: 'comments',
          foreignKey: 'approvedBy'
        }
      },
      hasOne: {
        profile: {
          localField: 'profile',
          foreignKey: 'userId'
        }
      },
      belongsTo: {
        organization: {
          parent: true,
          localKey: 'organizationId',
          localField: 'organization'
        }
      }
    }
  });

  Organization = store.defineResource({
    name: 'organization',
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          foreignKey: 'organizationId'
        }
      }
    }
  });

  Profile = store.defineResource({
    name: 'profile',
    relations: {
      belongsTo: {
        user: {
          localField: 'user',
          localKey: 'userId'
        }
      }
    }
  });

  Comment = store.defineResource({
    name: 'comment',
    relations: {
      belongsTo: {
        user: [
          {
            localField: 'user',
            localKey: 'userId'
          },
          {
            parent: true,
            localField: 'approvedByUser',
            localKey: 'approvedBy'
          }
        ]
      }
    }
  });

  lifecycle.beforeValidate.callCount = 0;
  lifecycle.validate.callCount = 0;
  lifecycle.afterValidate.callCount = 0;
  lifecycle.beforeCreate.callCount = 0;
  lifecycle.afterCreate.callCount = 0;
  lifecycle.beforeUpdate.callCount = 0;
  lifecycle.afterUpdate.callCount = 0;
  lifecycle.beforeDestroy.callCount = 0;
  lifecycle.afterDestroy.callCount = 0;
  lifecycle.beforeInject.callCount = 0;
  lifecycle.afterInject.callCount = 0;
  lifecycle.serialize.callCount = 0;
  lifecycle.deserialize.callCount = 0;
  lifecycle.queryTransform.callCount = 0;

  p1 = { author: 'John', age: 30, id: 5 };
  p2 = { author: 'Sally', age: 31, id: 6 };
  p3 = { author: 'Mike', age: 32, id: 7 };
  p4 = { author: 'Adam', age: 33, id: 8 };
  p5 = { author: 'Adam', age: 33, id: 9 };
  p6 = { author: 'Adam', age: 33, id: 10 };

  user1 = {
    name: 'John Anderson',
    id: 1,
    organizationId: 2
  };
  organization2 = {
    name: 'Test Corp 2',
    id: 2
  };
  comment3 = {
    content: 'test comment 3',
    id: 3,
    userId: 1
  };
  profile4 = {
    content: 'test profile 4',
    id: 4,
    userId: 1
  };

  comment11 = {
    id: 11,
    userId: 10,
    content: 'test comment 11'
  };
  comment12 = {
    id: 12,
    userId: 10,
    content: 'test comment 12'
  };
  comment13 = {
    id: 13,
    userId: 10,
    content: 'test comment 13'
  };
  organization14 = {
    id: 14,
    name: 'Test Corp'
  };
  profile15 = {
    id: 15,
    userId: 10,
    email: 'john.anderson@test.com'
  };
  user10 = {
    name: 'John Anderson',
    id: 10,
    organizationId: 14,
    comments: [
      comment11,
      comment12,
      comment13
    ],
    organization: organization14,
    profile: profile15
  };
  user16 = {
    id: 16,
    organizationId: 15,
    name: 'test user 16'
  };
  user17 = {
    id: 17,
    organizationId: 15,
    name: 'test user 17'
  };
  user18 = {
    id: 18,
    organizationId: 15,
    name: 'test user 18'
  };
  organization15 = {
    name: 'Another Test Corp',
    id: 15,
    users: [
      user16,
      user17,
      user18
    ]
  };
  user19 = {
    id: 19,
    name: 'test user 19'
  };
  user20 = {
    id: 20,
    name: 'test user 20'
  };
  comment19 = {
    content: 'test comment 19',
    id: 19,
    approvedBy: 19,
    approvedByUser: user19,
    userId: 20,
    user: user20
  };
  user22 = {
    id: 22,
    name: 'test user 22'
  };
  profile21 = {
    content: 'test profile 21',
    id: 21,
    userId: 22,
    user: user22
  };

  try {
    this.xhr = sinon.useFakeXMLHttpRequest();
    // Create an array to store requests
    var requests = this.requests = [];
    // Keep references to created requests
    this.xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  } catch (err) {
    console.error(err);
  }
});

afterEach(function () {
  // Restore the global timer functions to their native implementations
  try {
    this.xhr.restore();
  } catch (err) {
    console.error(err);
  }
});
