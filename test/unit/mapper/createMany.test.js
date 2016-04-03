import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.createMany, 'function')
  t.ok(mapper.createMany === Mapper.prototype.createMany)
})
test('should createMany', async (t) => {
  const props = [{ name: 'John' }]
  let createCalled = false
  const UserMapper = new JSData.Mapper({
    name: 'user',
    defaultAdapter: 'mock'
  })
  const user = new UserMapper.recordClass({ foo: 'bar' })
  UserMapper.registerAdapter('mock', {
    createMany (mapper, _props, Opts) {
      createCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === UserMapper, 'should pass in the Model')
        t.same(_props, props, 'should pass in the props')
        _props[0][mapper.idAttribute] = new Date().getTime()
        resolve(_props)
      })
    }
  })
  const users = await UserMapper.createMany(props)
  t.ok(createCalled, 'Adapter#createMany should have been called')
  t.ok(users[0][UserMapper.idAttribute], 'new user has an id')
  t.ok(users[0] instanceof UserMapper.recordClass, 'user is a record')
})
test('should return raw', async (t) => {
  const props = [{ name: 'John' }]
  let createCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    raw: true,
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    createMany (mapper, _props, Opts) {
      createCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the Model')
        t.same(_props, props, 'should pass in the props')
        t.is(Opts.raw, true, 'Opts are provided')
        _props[0][mapper.idAttribute] = new Date().getTime()
        resolve({
          data: _props,
          created: 1
        })
      })
    }
  })
  let data = await User.createMany(props)
  t.ok(createCalled, 'Adapter#createMany should have been called')
  t.ok(data.data[0][User.idAttribute], 'new user has an id')
  t.ok(data.data[0] instanceof User.recordClass, 'user is a record')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.created, 1, 'should have other metadata in response')
})
test('should nested create everything in opts.with', async (t) => {
  const store = t.context.store
  let createCalledCount = {}
  let id = 1

  const incCreate = function (name) {
    if (!createCalledCount.hasOwnProperty(name)) {
      createCalledCount[name] = 0
    }
    createCalledCount[name]++
  }
  const clear = function () {
    for (var key in store._mappers) {
      store.removeAll(key)
    }
  }
  store.registerAdapter('mock', {
    createMany (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props.forEach(function (__props) {
        __props[mapper.idAttribute] = id
        id++
      })
      return Promise.resolve(_props)
    }
  }, { default: true })

  const userProps = [
    {
      name: 'John',
      organization: {
        name: 'Company Inc'
      },
      profile: {
        email: 'john@email.com'
      }
    },
    {
      name: 'Sally',
      organization: {
        name: 'Company LLC'
      },
      profile: {
        email: 'sally@email.com'
      }
    }
  ]

  const getProps = function () {
    return JSData.utils.copy(userProps).map(function (props) {
      return store.createRecord('user', props)
    })
  }

  // when props are a Record
  let users = await store.createMany('user', getProps(), { with: [] })
  t.ok(store.is('user', users[0]), 'user 1 should be a user record')
  t.ok(store.is('user', users[1]), 'user 2 should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
  t.notOk(users[0].profile, 'users[0].profile should be undefined')
  t.notOk(users[1].profile, 'users[1].profile should be undefined')
  t.same(store.getAll('profile'), [], 'profiles should not be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  users = await store.createMany('user', getProps(), { with: ['profile'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organizations should not be in the store')
  clear()

  users = await store.createMany('user', getProps(), { with: ['profile', 'organization'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.ok(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
  t.ok(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
  t.is(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
  t.is(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
  t.same(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
  clear()

  // when props are NOT a record
  users = await store.createMany('user', JSData.utils.copy(userProps), { with: [] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.notOk(users[0].profile, 'users[0].profile should be undefined')
  t.notOk(users[1].profile, 'users[1].profile should be undefined')
  t.same(store.getAll('profile'), [], 'profiles should not be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organizations should not be in the store')
  clear()

  users = await store.createMany('user', JSData.utils.copy(userProps), { with: ['profile'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organizations should not be in the store')
  clear()

  users = await store.createMany('user', JSData.utils.copy(userProps), { with: ['profile', 'organization'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.ok(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
  t.ok(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
  t.is(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
  t.is(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
  t.same(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
  clear()

  t.is(createCalledCount.user, 6)
  t.notOk(createCalledCount.comment)
  t.is(createCalledCount.profile, 4)
  t.is(createCalledCount.organization, 2)
})
test('should pass everything opts.pass', async (t) => {
  const store = t.context.store
  let createCalledCount = {}
  let id = 1
  const utils = JSData.utils

  const incCreate = function (name) {
    if (!createCalledCount.hasOwnProperty(name)) {
      createCalledCount[name] = 0
    }
    createCalledCount[name]++
  }
  const clear = function () {
    for (var key in store._mappers) {
      store.removeAll(key)
    }
  }
  store.registerAdapter('mock', {
    createMany (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props.forEach(function (__props) {
        __props[mapper.idAttribute] = id
        id++
      })
      mapper.relationFields.forEach(function (field) {
        _props.forEach(function (__props) {
          if (__props[field]) {
            if (utils.isArray(__props[field])) {
              __props[field].forEach(function (item) {
                item.id = id
                id++
              })
            } else if (utils.isObject(__props[field])) {
              __props[field].id = id
              id++
            }
          }
        })
      })
      return Promise.resolve(_props)
    }
  }, { default: true })

  const userProps = [
    {
      name: 'John',
      organization: {
        name: 'Company Inc'
      },
      profile: {
        email: 'john@email.com'
      }
    },
    {
      name: 'Sally',
      organization: {
        name: 'Company LLC'
      },
      profile: {
        email: 'sally@email.com'
      }
    }
  ]

  const getProps = function () {
    return JSData.utils.copy(userProps).map(function (props) {
      return store.createRecord('user', props)
    })
  }

  // when props are a Record
  let users = await store.createMany('user', getProps(), { pass: [] })
  t.ok(store.is('user', users[0]), 'user 1 should be a user record')
  t.ok(store.is('user', users[1]), 'user 2 should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
  t.notOk(users[0].profile, 'users[0].profile should be undefined')
  t.notOk(users[1].profile, 'users[1].profile should be undefined')
  t.same(store.getAll('profile'), [], 'profiles should not be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  users = await store.createMany('user', getProps(), { pass: ['profile'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organizations should not be in the store')
  clear()

  users = await store.createMany('user', getProps(), { pass: ['profile', 'organization'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.ok(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
  t.ok(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
  t.is(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
  t.is(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
  t.same(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
  clear()

  // when props are NOT a record
  users = await store.createMany('user', JSData.utils.copy(userProps), { pass: [] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.notOk(users[0].profile, 'users[0].profile should be undefined')
  t.notOk(users[1].profile, 'users[1].profile should be undefined')
  t.same(store.getAll('profile'), [], 'profiles should not be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organizations should not be in the store')
  clear()

  users = await store.createMany('user', JSData.utils.copy(userProps), { pass: ['profile'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organizations should not be in the store')
  clear()

  users = await store.createMany('user', JSData.utils.copy(userProps), { pass: ['profile', 'organization'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.ok(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
  t.ok(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
  t.is(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
  t.is(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
  t.same(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
  clear()

  t.is(createCalledCount.user, 6)
  t.notOk(createCalledCount.comment)
  t.notOk(createCalledCount.profile)
  t.notOk(createCalledCount.organization)
})
test('should combine opts.with and opts.pass', async (t) => {
  const store = t.context.store
  let createCalledCount = {}
  let id = 1
  const utils = JSData.utils

  const incCreate = function (name) {
    if (!createCalledCount.hasOwnProperty(name)) {
      createCalledCount[name] = 0
    }
    createCalledCount[name]++
  }
  const clear = function () {
    for (var key in store._mappers) {
      store.removeAll(key)
    }
  }
  store.registerAdapter('mock', {
    createMany (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props.forEach(function (__props) {
        __props[mapper.idAttribute] = id
        id++
      })
      mapper.relationFields.forEach(function (field) {
        _props.forEach(function (__props) {
          if (__props[field]) {
            if (utils.isArray(__props[field])) {
              __props[field].forEach(function (item) {
                item.id = id
                id++
              })
            } else if (utils.isObject(__props[field])) {
              __props[field].id = id
              id++
            }
          }
        })
      })
      return Promise.resolve(_props)
    }
  }, { default: true })

  const userProps = [
    {
      name: 'John',
      organization: {
        name: 'Company Inc'
      },
      profile: {
        email: 'john@email.com'
      }
    },
    {
      name: 'Sally',
      organization: {
        name: 'Company LLC'
      },
      profile: {
        email: 'sally@email.com'
      }
    }
  ]

  const getProps = function () {
    return JSData.utils.copy(userProps).map(function (props) {
      return store.createRecord('user', props)
    })
  }

  // when props are a Record
  let users = await store.createMany('user', getProps(), { pass: [] })
  t.ok(store.is('user', users[0]), 'user 1 should be a user record')
  t.ok(store.is('user', users[1]), 'user 2 should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
  t.notOk(users[0].profile, 'users[0].profile should be undefined')
  t.notOk(users[1].profile, 'users[1].profile should be undefined')
  t.same(store.getAll('profile'), [], 'profiles should not be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  users = await store.createMany('user', getProps(), { with: ['profile'], pass: ['organization'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.ok(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
  t.ok(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
  t.is(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
  t.is(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
  t.same(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
  clear()

  // when props are NOT a record
  users = await store.createMany('user', JSData.utils.copy(userProps), { pass: [] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.notOk(users[0].profile, 'users[0].profile should be undefined')
  t.notOk(users[1].profile, 'users[1].profile should be undefined')
  t.same(store.getAll('profile'), [], 'profiles should not be in the store')
  t.notOk(users[0].organization, 'users[0].organization should be undefined')
  t.notOk(users[1].organization, 'users[1].organization should be undefined')
  t.notOk(users[0].organizationId, 'users[0].organizationId should be undefined')
  t.notOk(users[1].organizationId, 'users[1].organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organizations should not be in the store')
  clear()

  users = await store.createMany('user', JSData.utils.copy(userProps), { with: ['profile'], pass: ['organization'] })
  t.ok(store.is('user', users[0]), 'users[0] should be a user record')
  t.ok(store.is('user', users[1]), 'users[1] should be a user record')
  t.ok(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
  t.ok(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
  t.ok(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
  t.ok(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
  t.context.objectsEqual(t, store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
  t.ok(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
  t.ok(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
  t.is(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
  t.is(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
  t.same(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
  clear()

  t.is(createCalledCount.user, 4)
  t.notOk(createCalledCount.comment)
  t.is(createCalledCount.profile, 2)
  t.notOk(createCalledCount.organization)
})
