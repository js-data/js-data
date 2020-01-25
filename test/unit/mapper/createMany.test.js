import { assert, JSData } from '../../_setup'

describe('Mapper#createMany', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.createMany, 'function')
    assert.strictEqual(mapper.createMany, Mapper.prototype.createMany)
  })
  it('should createMany', async function () {
    const props = [{ name: 'John' }]
    let createCalled = false
    const UserMapper = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock'
    })
    UserMapper.registerAdapter('mock', {
      createMany (mapper, _props, Opts) {
        createCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, UserMapper, 'should pass in the Model')
          assert.objectsEqual(_props, props, 'should pass in the props')
          _props[0][mapper.idAttribute] = new Date().getTime()
          resolve(_props)
        })
      }
    })
    const users = await UserMapper.createMany(props)
    assert(createCalled, 'Adapter#createMany should have been called')
    assert(users[0][UserMapper.idAttribute], 'new user has an id')
    assert(users[0] instanceof UserMapper.recordClass, 'user is a record')
  })
  it('should return raw', async function () {
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
          assert.strictEqual(mapper, User, 'should pass in the Model')
          assert.objectsEqual(_props, props, 'should pass in the props')
          assert.equal(Opts.raw, true, 'Opts are provided')
          _props[0][mapper.idAttribute] = new Date().getTime()
          resolve({
            data: _props,
            created: 1
          })
        })
      }
    })
    const data = await User.createMany(props)
    assert(createCalled, 'Adapter#createMany should have been called')
    assert(data.data[0][User.idAttribute], 'new user has an id')
    assert(data.data[0] instanceof User.recordClass, 'user is a record')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.created, 1, 'should have other metadata in response')
  })
  it('should nested create everything in opts.with', async function () {
    const store = this.store
    const createCalledCount = {}
    let id = 1

    const incCreate = function (name) {
      if (!Object.hasOwnProperty.call(createCalledCount, name)) {
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
      return JSData.utils.plainCopy(userProps).map(function (props) {
        return store.createRecord('user', props)
      })
    }

    // when props are a Record
    let users = await store.createMany('user', getProps(), { with: [] })
    assert(store.is('user', users[0]), 'user 1 should be a user record')
    assert(store.is('user', users[1]), 'user 2 should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
    assert.objectsEqual(users[0].profile, userProps[0].profile, 'users[0].profile should be a profile')
    assert.objectsEqual(users[1].profile, userProps[1].profile, 'users[1].profile should be a profile')
    assert.objectsEqual(store.getAll('profile'), [userProps[1].profile, userProps[0].profile], 'profiles should not be in the store')
    assert.objectsEqual(users[0].organization, userProps[0].organization, 'users[0].organization should exist')
    assert.objectsEqual(users[1].organization, userProps[1].organization, 'users[1].organization should exist')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organization should not be in the store')
    clear()

    users = await store.createMany('user', getProps(), { with: ['profile'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert.objectsEqual(users[0].organization, userProps[0].organization, 'users[0].organization should exist')
    assert.objectsEqual(users[1].organization, userProps[1].organization, 'users[1].organization should exist')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organizations should be in the store')
    clear()

    users = await store.createMany('user', getProps(), { with: ['profile', 'organization'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
    assert(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
    assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
    assert.objectsEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
    clear()

    // when props are NOT a record
    users = await store.createMany('user', JSData.utils.copy(userProps), { with: [] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert.objectsEqual(users[0].profile, {
      email: userProps[0].profile.email,
      userId: users[0].id
    }, 'users[0].profile should be a profile')
    assert.objectsEqual(users[1].profile, {
      email: userProps[1].profile.email,
      userId: users[1].id
    }, 'users[1].profile should be a profile')
    assert.objectsEqual(store.getAll('profile'), [{
      email: userProps[1].profile.email,
      userId: users[1].id
    }, {
      email: userProps[0].profile.email,
      userId: users[0].id
    }], 'profiles should be in the store')
    assert.objectsEqual(users[0].organization, {
      name: 'Company Inc'
    }, 'users[0].organization should an organization')
    assert.objectsEqual(users[1].organization, {
      name: 'Company LLC'
    }, 'users[1].organization should an organization')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organizations should be in the store')
    clear()

    users = await store.createMany('user', JSData.utils.copy(userProps), { with: ['profile'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert.objectsEqual(users[0].organization, {
      name: 'Company Inc'
    }, 'users[0].organization should an organization')
    assert.objectsEqual(users[1].organization, {
      name: 'Company LLC'
    }, 'users[1].organization should an organization')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organizations should be in the store')
    clear()

    users = await store.createMany('user', JSData.utils.copy(userProps), { with: ['profile', 'organization'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
    assert(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
    assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
    assert.objectsEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
    clear()

    assert.equal(createCalledCount.user, 6)
    assert(!createCalledCount.comment)
    assert.equal(createCalledCount.profile, 4)
    assert.equal(createCalledCount.organization, 2)
  })
  it('should pass everything opts.pass', async function () {
    const store = this.store
    const createCalledCount = {}
    let id = 1
    const utils = JSData.utils

    const incCreate = function (name) {
      if (!Object.hasOwnProperty.call(createCalledCount, name)) {
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
    assert(store.is('user', users[0]), 'user 1 should be a user record')
    assert(store.is('user', users[1]), 'user 2 should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
    assert.objectsEqual(users[0].profile, userProps[0].profile, 'users[0].profile should be a profile')
    assert.objectsEqual(users[1].profile, userProps[1].profile, 'users[1].profile should be a profile')
    assert.objectsEqual(store.getAll('profile'), [userProps[1].profile, userProps[0].profile], 'profiles should not be in the store')
    assert.objectsEqual(users[0].organization, userProps[0].organization, 'users[0].organization should exist')
    assert.objectsEqual(users[1].organization, userProps[1].organization, 'users[1].organization should exist')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organization should not be in the store')
    clear()

    users = await store.createMany('user', getProps(), { pass: ['profile'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert.objectsEqual(users[0].organization, userProps[0].organization, 'users[0].organization should exist')
    assert.objectsEqual(users[1].organization, userProps[1].organization, 'users[1].organization should exist')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organizations should be in the store')
    clear()

    users = await store.createMany('user', getProps(), { pass: ['profile', 'organization'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
    assert(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
    assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
    assert.objectsEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
    clear()

    // when props are NOT a record
    users = await store.createMany('user', JSData.utils.copy(userProps), { pass: [] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert.objectsEqual(users[0].profile, {
      email: userProps[0].profile.email,
      userId: users[0].id
    }, 'users[0].profile should be a profile')
    assert.objectsEqual(users[1].profile, {
      email: userProps[1].profile.email,
      userId: users[1].id
    }, 'users[1].profile should be a profile')
    assert.objectsEqual(store.getAll('profile'), [{
      email: userProps[1].profile.email,
      userId: users[1].id
    }, {
      email: userProps[0].profile.email,
      userId: users[0].id
    }], 'profiles should be in the store')
    assert.objectsEqual(users[0].organization, {
      name: 'Company Inc'
    }, 'users[0].organization should an organization')
    assert.objectsEqual(users[1].organization, {
      name: 'Company LLC'
    }, 'users[1].organization should an organization')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organizations should be in the store')
    clear()

    users = await store.createMany('user', JSData.utils.copy(userProps), { pass: ['profile'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert.objectsEqual(users[0].organization, {
      name: 'Company Inc'
    }, 'users[0].organization should an organization')
    assert.objectsEqual(users[1].organization, {
      name: 'Company LLC'
    }, 'users[1].organization should an organization')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organizations should be in the store')
    clear()

    users = await store.createMany('user', JSData.utils.copy(userProps), { pass: ['profile', 'organization'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
    assert(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
    assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
    assert.objectsEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
    clear()

    assert.equal(createCalledCount.user, 6)
    assert(!createCalledCount.comment)
    assert(!createCalledCount.profile)
    assert(!createCalledCount.organization)
  })
  it('should combine opts.with and opts.pass', async function () {
    const store = this.store
    const createCalledCount = {}
    let id = 1
    const utils = JSData.utils

    const incCreate = function (name) {
      if (!Object.hasOwnProperty.call(createCalledCount, name)) {
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
    assert(store.is('user', users[0]), 'user 1 should be a user record')
    assert(store.is('user', users[1]), 'user 2 should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
    assert.objectsEqual(users[0].profile, userProps[0].profile, 'users[0].profile should be a profile')
    assert.objectsEqual(users[1].profile, userProps[1].profile, 'users[1].profile should be a profile')
    assert.objectsEqual(store.getAll('profile'), [userProps[1].profile, userProps[0].profile], 'profiles should not be in the store')
    assert.objectsEqual(users[0].organization, userProps[0].organization, 'users[0].organization should exist')
    assert.objectsEqual(users[1].organization, userProps[1].organization, 'users[1].organization should exist')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organization should not be in the store')
    clear()

    users = await store.createMany('user', getProps(), { with: ['profile'], pass: ['organization'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
    assert(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
    assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
    assert.objectsEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
    clear()

    // when props are NOT a record
    users = await store.createMany('user', JSData.utils.copy(userProps), { pass: [] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert.objectsEqual(users[0].profile, {
      email: userProps[0].profile.email,
      userId: users[0].id
    }, 'users[0].profile should be a profile')
    assert.objectsEqual(users[1].profile, {
      email: userProps[1].profile.email,
      userId: users[1].id
    }, 'users[1].profile should be a profile')
    assert.objectsEqual(store.getAll('profile'), [{
      email: userProps[1].profile.email,
      userId: users[1].id
    }, {
      email: userProps[0].profile.email,
      userId: users[0].id
    }], 'profiles should be in the store')
    assert.objectsEqual(users[0].organization, {
      name: 'Company Inc'
    }, 'users[0].organization should an organization')
    assert.objectsEqual(users[1].organization, {
      name: 'Company LLC'
    }, 'users[1].organization should an organization')
    assert(!users[0].organizationId, 'users[0].organizationId should be undefined')
    assert(!users[1].organizationId, 'users[1].organizationId should be undefined')
    assert.objectsEqual(store.getAll('organization'), [userProps[1].organization, userProps[0].organization], 'organizations should be in the store')
    clear()

    users = await store.createMany('user', JSData.utils.copy(userProps), { with: ['profile'], pass: ['organization'] })
    assert(store.is('user', users[0]), 'users[0] should be a user record')
    assert(store.is('user', users[1]), 'users[1] should be a user record')
    assert(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
    assert(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
    assert(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
    assert(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
    assert(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
    assert(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
    assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
    assert.objectsEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
    clear()

    assert.equal(createCalledCount.user, 4)
    assert(!createCalledCount.comment)
    assert.equal(createCalledCount.profile, 2)
    assert(!createCalledCount.organization)
  })
  it('should validate', async function () {
    const props = [{ name: true }, {}, { name: 1234, age: 25 }]
    let createCalled = false
    let users
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      }
    })
    User.registerAdapter('mock', {
      createMany () {
        createCalled = true
      }
    })
    try {
      users = await User.createMany(props)
      throw new Error('validation error should have been thrown!')
    } catch (err) {
      assert.equal(err.message, 'validation failed')
      assert.objectsEqual(err.errors, [
        [
          {
            actual: 'boolean',
            expected: 'one of (string)',
            path: 'name'
          }
        ],
        undefined,
        [
          {
            actual: 'number',
            expected: 'one of (string)',
            path: 'name'
          }
        ]
      ])
    }
    assert.equal(createCalled, false, 'Adapter#create should NOT have been called')
    assert.equal(users, undefined, 'users were not created')
    assert.equal(props[0][User.idAttribute], undefined, 'props[0] does NOT have an id')
  })
  it('should validate required', async function () {
    const props = [{ name: 'John' }, {}, { name: 'Sally', age: 25 }]
    let createCalled = false
    let users
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      schema: {
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', required: true }
        }
      }
    })
    User.registerAdapter('mock', {
      createMany () {
        createCalled = true
      }
    })
    try {
      users = await User.createMany(props)
      throw new Error('validation error should have been thrown!')
    } catch (err) {
      assert.equal(err.message, 'validation failed')
      assert.objectsEqual(err.errors, [
        [
          {
            actual: 'undefined',
            expected: 'a value',
            path: 'age'
          }
        ],
        [
          {
            actual: 'undefined',
            expected: 'a value',
            path: 'name'
          },
          {
            actual: 'undefined',
            expected: 'a value',
            path: 'age'
          }
        ],
        undefined
      ])
    }
    assert.equal(createCalled, false, 'Adapter#create should NOT have been called')
    assert.equal(users, undefined, 'users were not created')
    assert.equal(props[0][User.idAttribute], undefined, 'props[0] does NOT have an id')
  })
})
