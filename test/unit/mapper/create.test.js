import { assert, JSData } from '../../_setup'

describe('Mapper#create', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.create, 'function')
    assert.strictEqual(mapper.create, Mapper.prototype.create)
  })
  it('should create', async function () {
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
          assert.strictEqual(mapper, User, 'should pass in the JSData.Mapper')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert(!Opts.raw, 'Opts are provided')
          _props[mapper.idAttribute] = new Date().getTime()
          resolve(_props)
        })
      }
    })
    const user = await User.create(props)
    assert(createCalled, 'Adapter#create should have been called')
    assert(user[User.idAttribute], 'new user has an id')
    assert(user instanceof User.recordClass, 'user is a record')
  })
  it('should create without wrapping', async function () {
    const props = { name: 'John' }
    let createCalled = false
    const User = new JSData.Mapper({
      name: 'user',
      defaultAdapter: 'mock',
      wrap: false
    })
    User.registerAdapter('mock', {
      create (mapper, _props, Opts) {
        createCalled = true
        return new Promise(function (resolve, reject) {
          assert.strictEqual(mapper, User, 'should pass in the JSData.Mapper')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert(!Opts.raw, 'Opts are provided')
          _props[mapper.idAttribute] = new Date().getTime()
          resolve(_props)
        })
      }
    })
    const user = await User.create(props)
    assert(createCalled, 'Adapter#create should have been called')
    assert(user[User.idAttribute], 'new user has an id')
    assert(!(user instanceof User.recordClass), 'user is NOT a record')
  })
  it('should return raw', async function () {
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
          assert.strictEqual(mapper, User, 'should pass in the JSData.Mapper')
          assert.deepEqual(_props, props, 'should pass in the props')
          assert(Opts.raw, 'Opts are provided')
          _props[mapper.idAttribute] = new Date().getTime()
          resolve({
            data: _props,
            created: 1
          })
        })
      }
    })
    let data = await User.create(props)
    assert(createCalled, 'Adapter#create should have been called')
    assert(data.data[User.idAttribute], 'new user has an id')
    assert(data.data instanceof User.recordClass, 'user is a record')
    assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    assert.equal(data.created, 1, 'should have other metadata in response')
  })
  it('should nested create everything in opts.with', async function () {
    const store = this.store
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

    let group = await store.create('group', store.createRecord('group', {
      users: [{ name: 'John' }]
    }), { with: ['users'] })
    assert(group.users[0].id)
    assert.equal(group.users[0].name, 'John')

    // when props are a Record
    let user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: [] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
    assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment', 'profile'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment', 'profile', 'organization'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(store.is('organization', user.organization), 'user.organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
    assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
    clear()

    // when props are NOT a record
    user = await store.create('user', JSData.utils.copy(userProps), { with: [] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
    assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment', 'profile'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment', 'profile', 'organization'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(store.is('organization', user.organization), 'user.organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
    assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
    clear()

    assert.equal(createCalledCount.user, 9)
    assert.equal(createCalledCount.comment, 9)
    assert.equal(createCalledCount.profile, 4)
    assert.equal(createCalledCount.organization, 2)
  })
  it('should pass everything opts.pass', async function () {
    const store = this.store
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
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
    assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment', 'profile'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment', 'profile', 'organization'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(store.is('organization', user.organization), 'user.organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
    assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
    clear()

    // when props are NOT a record
    user = await store.create('user', JSData.utils.copy(userProps), { pass: [] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
    assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment', 'profile'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment', 'profile', 'organization'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(store.is('organization', user.organization), 'user.organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
    assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
    clear()

    assert.equal(createCalledCount.user, 8)
    assert(!createCalledCount.comment)
    assert(!createCalledCount.profile)
    assert(!createCalledCount.organization)
  })
  it('should combine opts.with and opts.pass', async function () {
    const store = this.store
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
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
    assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { pass: ['comment'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment'], pass: ['profile'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', store.createRecord('user', JSData.utils.copy(userProps)), { with: ['comment', 'profile'], pass: ['organization'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(store.is('organization', user.organization), 'user.organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
    assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
    clear()

    // when props are NOT a record
    user = await store.create('user', JSData.utils.copy(userProps), { pass: [] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
    assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { pass: ['comment'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(!user.profile, 'user.profile should be undefined')
    assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment'], pass: ['profile'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(!user.organization, 'user.organization should be undefined')
    assert(!user.organizationId, 'user.organizationId should be undefined')
    assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
    clear()

    user = await store.create('user', JSData.utils.copy(userProps), { with: ['comment', 'profile'], pass: ['organization'] })
    assert(store.is('user', user), 'user should be a user record')
    assert.strictEqual(store.get('user', user.id), user, 'user should be in the store')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
    assert(store.is('organization', user.organization), 'user.organization should be a organization record')
    assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
    assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
    clear()

    assert.equal(createCalledCount.user, 8)
    assert.equal(createCalledCount.comment, 6)
    assert.equal(createCalledCount.profile, 2)
    assert(!createCalledCount.organization)
  })
  it('should validate', async function () {
    const props = { name: 1234, age: false }
    let createCalled = false
    let user
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
      create () {
        createCalled = true
      }
    })
    try {
      user = await User.create(props)
      throw new Error('validation error should have been thrown!')
    } catch (err) {
      assert.deepEqual(err, [
        {
          actual: 'number',
          expected: 'one of (string)',
          path: 'name'
        },
        {
          actual: 'boolean',
          expected: 'one of (number)',
          path: 'age'
        }
      ])
    }
    assert.equal(createCalled, false, 'Adapter#create should NOT have been called')
    assert.equal(user, undefined, 'user was not created')
    assert.equal(props[User.idAttribute], undefined, 'props does NOT have an id')
  })
  it('should validate required', async function () {
    const props = {}
    let createCalled = false
    let user
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
      create () {
        createCalled = true
      }
    })
    try {
      user = await User.create(props)
      throw new Error('validation error should have been thrown!')
    } catch (err) {
      assert.deepEqual(err, [
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
      ])
    }
    assert.equal(createCalled, false, 'Adapter#create should NOT have been called')
    assert.equal(user, undefined, 'user was not created')
    assert.equal(props[User.idAttribute], undefined, 'props does NOT have an id')
  })
})
