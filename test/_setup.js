import { assert } from 'chai'
import * as JSData from '../src/index'
import sinon from 'sinon'

assert.objectsEqual = function (a, b, msg) {
  assert.deepEqual(
    JSON.parse(JSON.stringify(a)),
    JSON.parse(JSON.stringify(b)),
    msg || 'Expected objects or arrays to be equal'
  )
}

assert.objectsNotEqual = function (a, b, msg) {
  assert.notDeepEqual(
    JSON.parse(JSON.stringify(a)),
    JSON.parse(JSON.stringify(b)),
    msg || 'Expected objects or arrays to be equal'
  )
}

assert.fail = function (msg) {
  assert.equal('should not reach this!: ' + msg, 'failure')
}

// Setup global data once
export {
  assert,
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
export const TYPES_EXCEPT_OBJECT_OR_ARRAY = ['string', 123, 123.123, null, undefined, true, false, function () {}]
export const TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], function () {}]
export const TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false]

export function createRelation (name, defs) {
  return { [name]: defs }
}

export function createStore (options) {
  const store = new JSData.DataStore(options)
  registerInMemoryAdapterFor(store)

  return store
}

export function createMapper (options) {
  const mapper = new JSData.Mapper(options)
  registerInMemoryAdapterFor(mapper)

  return mapper
}

let idCounter = 1
function generateId () {
  return Date.now() + (idCounter++)
}

function createInMemoryAdapter () {
  const adapter = {
    create (mapper, props, options) {
      props[mapper.idAttribute] = generateId()
      return adapter.resolve(props, options)
    },

    createMany (mapper, records, options) {
      records.forEach(props => {
        props[mapper.idAttribute] = generateId()
      })

      return adapter.resolve(records, options)
    },

    resolve (data, options) {
      if (options.raw) {
        return JSData.utils.resolve({
          data,
          processedAt: new Date()
        })
      }

      return JSData.utils.resolve(data)
    }
  }

  return adapter
}

function registerInMemoryAdapterFor (storeOrMapper, options = { default: true }) {
  storeOrMapper.registerAdapter('inMemory', createInMemoryAdapter(), options)

  const adapter = storeOrMapper.getAdapter('inMemory')
  Object.keys(adapter).forEach(name => sinon.spy(adapter, name))

  return adapter
}

// Clean setup for each test
beforeEach(function () {
  this.data = {}
  this.data.p1 = { author: 'John', age: 30, id: 5 }
  this.data.p2 = { author: 'Sally', age: 31, id: 6 }
  this.data.p3 = { author: 'Mike', age: 32, id: 7 }
  this.data.p4 = { author: 'Adam', age: 33, id: 8 }
  this.data.p5 = { author: 'Adam', age: 33, id: 9 }
  const store = this.store = new JSData.DataStore({
    linkRelations: true
  })
  this.Post = store.defineMapper('post', {
    endpoint: '/posts'
  })
  this.PostCollection = store.getCollection('post')
  this.User = store.defineMapper('user', {
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
  this.UserCollection = store.getCollection('user')
  this.Group = store.defineMapper('group', {
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          localKeys: 'userIds'
        }
      }
    }
  })
  this.GroupCollection = store.getCollection('group')
  this.Organization = store.defineMapper('organization', {
    relations: {
      hasMany: {
        user: {
          localField: 'users',
          foreignKey: 'organizationId'
        }
      }
    }
  })
  this.OrganizationCollection = store.getCollection('organization')
  this.Profile = store.defineMapper('profile', {
    relations: {
      belongsTo: {
        user: {
          localField: 'user',
          foreignKey: 'userId'
        }
      }
    }
  })
  this.ProfileCollection = store.getCollection('profile')
  this.Comment = store.defineMapper('comment', {
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
  this.CommentCollection = store.getCollection('comment')
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
    email: 'john.anderson@this.com'
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
  this.data.group3 = {
    name: 'group 3',
    id: 3,
    userIds: [1]
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

after(function () { // eslint-disable-line
  var tests = []
  var duration = 0
  var passed = 0
  var failed = 0
  this.test.parent.suites.forEach(function (suite) {
    suite.tests.forEach(function (test) {
      if (test.state !== 'passed' && test.state !== 'failed') {
        return
      }
      duration += test.duration

      var report = {
        name: suite.title + ':' + test.title,
        result: test.state === 'passed',
        message: test.state,
        duration: test.duration
      }

      if (report.result) {
        passed++
      } else {
        failed++
        if (test.$errors && test.$errors.length) {
          report.message = test.$errors[0]
        }
      }
      tests.push(report)
    })
  })
  try {
    window.global_test_results = {
      passed: passed,
      failed: failed,
      total: passed + failed,
      duration: duration,
      tests: tests
    }
  } catch (err) {
  }
})
