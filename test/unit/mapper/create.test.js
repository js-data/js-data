import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.create, 'function')
  t.ok(mapper.create === Mapper.prototype.create)
})
test('should create', async (t) => {
  const props = { name: 'John' }
  let createCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    create (mapper, _props, Opts) {
      createCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the JSData.Mapper')
        t.same(_props, props, 'should pass in the props')
        t.is(Opts.raw, false, 'Opts are provided')
        _props[mapper.idAttribute] = new Date().getTime()
        resolve(_props)
      })
    }
  })
  const user = await User.create(props)
  t.ok(createCalled, 'Adapter#create should have been called')
  t.ok(user[User.idAttribute], 'new user has an id')
  t.ok(user instanceof User.recordClass, 'user is a record')
})
test('should return raw', async (t) => {
  const props = { name: 'John' }
  let createCalled = false
  const User = new JSData.Mapper({
    name: 'user',
    raw: true,
    defaultAdapter: 'mock'
  })
  User.registerAdapter('mock', {
    create (mapper, _props, Opts) {
      createCalled = true
      return new Promise(function (resolve, reject) {
        t.ok(mapper === User, 'should pass in the JSData.Mapper')
        t.same(_props, props, 'should pass in the props')
        t.is(Opts.raw, true, 'Opts are provided')
        _props[mapper.idAttribute] = new Date().getTime()
        resolve({
          data: _props,
          created: 1
        })
      })
    }
  })
  let data = await User.create(props)
  t.ok(createCalled, 'Adapter#create should have been called')
  t.ok(data.data[User.idAttribute], 'new user has an id')
  t.ok(data.data instanceof User.recordClass, 'user is a record')
  t.is(data.adapter, 'mock', 'should have adapter name in response')
  t.is(data.created, 1, 'should have other metadata in response')
})
test('should nested create everything in opts.with', async (t) => {
  const store = t.context.store
  let createCalledCount = {}

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
    create (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props[mapper.idAttribute] = new Date().getTime()
      return Promise.resolve(_props)
    },
    createMany (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props.forEach(function (__props) {
        __props[mapper.idAttribute] = new Date().getTime()
      })
      return Promise.resolve(_props)
    }
  }, { default: true })

  const userProps = {
    name: 'John',
    organization: {
      name: 'Company Inc'
    },
    comments: [
      {
        content: 'foo'
      }
    ],
    profile: {
      email: 'john@email.com'
    }
  }

  // when props are a Record
  let user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: [] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.same(user.comments, [], 'user.comments should be an empty array')
  t.same(store.getAll('comment'), [], 'comments should not be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment', 'profile'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment', 'profile', 'organization'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.ok(store.is('organization', user.organization), 'user.organization should be a organization record')
  t.is(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
  t.same(store.getAll('organization'), [user.organization], 'organization should be in the store')
  clear()

  // when props are NOT a record
  user = await store.create('user', JSData.utils.copy(userProps), { with: [] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.same(user.comments, [], 'user.comments should be an empty array')
  t.same(store.getAll('comment'), [], 'comments should not be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment', 'profile'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment', 'profile', 'organization'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.ok(store.is('organization', user.organization), 'user.organization should be a organization record')
  t.is(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
  t.same(store.getAll('organization'), [user.organization], 'organization should be in the store')
  clear()

  t.is(createCalledCount.user, 8)
  t.is(createCalledCount.comment, 6)
  t.is(createCalledCount.profile, 4)
  t.is(createCalledCount.organization, 2)
})
test('should pass everything opts.pass', async (t) => {
  const store = t.context.store
  let createCalledCount = {}
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
    create (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props[mapper.idAttribute] = new Date().getTime()
      mapper.relationFields.forEach(function (field) {
        if (_props[field]) {
          if (utils.isArray(_props[field])) {
            _props[field].forEach(function (item) {
              item.id = new Date().getTime()
            })
          } else if (utils.isObject(_props[field])) {
            _props[field].id = new Date().getTime()
          }
        }
      })
      return Promise.resolve(_props)
    },
    createMany (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props.forEach(function (__props) {
        __props[mapper.idAttribute] = new Date().getTime()
      })
      return Promise.resolve(_props)
    }
  }, { default: true })

  const userProps = {
    name: 'John',
    organization: {
      name: 'Company Inc'
    },
    comments: [
      {
        content: 'foo'
      }
    ],
    profile: {
      email: 'john@email.com'
    }
  }

  // when props are a Record
  let user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: [] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.same(user.comments, [], 'user.comments should be an empty array')
  t.same(store.getAll('comment'), [], 'comments should not be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment', 'profile'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment', 'profile', 'organization'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.ok(store.is('organization', user.organization), 'user.organization should be a organization record')
  t.is(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
  t.same(store.getAll('organization'), [user.organization], 'organization should be in the store')
  clear()

  // when props are NOT a record
  user = await store.create('user', JSData.utils.copy(userProps), { pass: [] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.same(user.comments, [], 'user.comments should be an empty array')
  t.same(store.getAll('comment'), [], 'comments should not be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment', 'profile'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment', 'profile', 'organization'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.ok(store.is('organization', user.organization), 'user.organization should be a organization record')
  t.is(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
  t.same(store.getAll('organization'), [user.organization], 'organization should be in the store')
  clear()

  t.is(createCalledCount.user, 8)
  t.notOk(createCalledCount.comment)
  t.notOk(createCalledCount.profile)
  t.notOk(createCalledCount.organization)
})
test('should combine opts.with and opts.pass', async (t) => {
  const store = t.context.store
  let createCalledCount = {}
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
    create (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props[mapper.idAttribute] = new Date().getTime()
      mapper.relationFields.forEach(function (field) {
        if (_props[field]) {
          if (utils.isArray(_props[field])) {
            _props[field].forEach(function (item) {
              item.id = new Date().getTime()
            })
          } else if (utils.isObject(_props[field])) {
            _props[field].id = new Date().getTime()
          }
        }
      })
      return Promise.resolve(_props)
    },
    createMany (mapper, _props, Opts) {
      incCreate(mapper.name)
      _props.forEach(function (__props) {
        __props[mapper.idAttribute] = new Date().getTime()
      })
      return Promise.resolve(_props)
    }
  }, { default: true })

  const userProps = {
    name: 'John',
    organization: {
      name: 'Company Inc'
    },
    comments: [
      {
        content: 'foo'
      }
    ],
    profile: {
      email: 'john@email.com'
    }
  }

  // when props are a Record
  let user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: [] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.same(user.comments, [], 'user.comments should be an empty array')
  t.same(store.getAll('comment'), [], 'comments should not be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment'], pass: ['profile'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment', 'profile'], pass: ['organization'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.ok(store.is('organization', user.organization), 'user.organization should be a organization record')
  t.is(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
  t.same(store.getAll('organization'), [user.organization], 'organization should be in the store')
  clear()

  // when props are NOT a record
  user = await store.create('user', JSData.utils.copy(userProps), { pass: [] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.same(user.comments, [], 'user.comments should be an empty array')
  t.same(store.getAll('comment'), [], 'comments should not be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.notOk(user.profile, 'user.profile should be undefined')
  t.same(store.getAll('profile'), [], 'profile should not be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment'], pass: ['profile'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.notOk(user.organization, 'user.organization should be undefined')
  t.notOk(user.organizationId, 'user.organizationId should be undefined')
  t.same(store.getAll('organization'), [], 'organization should not be in the store')
  clear()

  user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment', 'profile'], pass: ['organization'] })
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.get('user', user.id) === user, 'user should be in the store')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.context.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.context.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
  t.ok(store.is('organization', user.organization), 'user.organization should be a organization record')
  t.is(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
  t.same(store.getAll('organization'), [user.organization], 'organization should be in the store')
  clear()

  t.is(createCalledCount.user, 8)
  t.is(createCalledCount.comment, 4)
  t.is(createCalledCount.profile, 2)
  t.notOk(createCalledCount.organization)
})
