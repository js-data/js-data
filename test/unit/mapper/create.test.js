export function init () {
  describe('create', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.create)
      Test.assert.isTrue(mapper.create === Mapper.prototype.create)
    })
    it('should create', async function () {
      const Test = this
      const props = { name: 'John' }
      let createCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        create (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Test.JSData.Mapper')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            _props[mapper.idAttribute] = new Date().getTime()
            resolve(_props)
          })
        }
      })
      const user = await User.create(props)
      Test.assert.isTrue(createCalled, 'Adapter#create should have been called')
      Test.assert.isDefined(user[User.idAttribute], 'new user has an id')
      Test.assert.isTrue(user instanceof User.RecordClass, 'user is a record')
    })
    it('should return raw', async function () {
      const Test = this
      const props = { name: 'John' }
      let createCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        create (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Test.JSData.Mapper')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props[mapper.idAttribute] = new Date().getTime()
            resolve({
              data: _props,
              created: 1
            })
          })
        }
      })
      let data = await User.create(props)
      Test.assert.isTrue(createCalled, 'Adapter#create should have been called')
      Test.assert.isDefined(data.data[User.idAttribute], 'new user has an id')
      Test.assert.isTrue(data.data instanceof User.RecordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.created, 1, 'should have other metadata in response')
    })
    it('should nested create everything in opts.with', async function () {
      const Test = this
      const store = Test.store
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
      let user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { with: [] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
      Test.assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { with: ['comment'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { with: ['comment', 'profile'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { with: ['comment', 'profile', 'organization'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isTrue(store.is('organization', user.organization), 'user.organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
      clear()

      // when props are NOT a record
      user = await store.create('user', Test.JSData.utils.copy(userProps), { with: [] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
      Test.assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { with: ['comment'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { with: ['comment', 'profile'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { with: ['comment', 'profile', 'organization'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isTrue(store.is('organization', user.organization), 'user.organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
      clear()

      Test.assert.equal(createCalledCount.user, 8)
      Test.assert.equal(createCalledCount.comment, 6)
      Test.assert.equal(createCalledCount.profile, 4)
      Test.assert.equal(createCalledCount.organization, 2)
    })
    it('should pass everything opts.pass', async function () {
      const Test = this
      const store = Test.store
      let createCalledCount = {}
      const utils = Test.JSData.utils

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
      let user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { pass: [] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
      Test.assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { pass: ['comment'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { pass: ['comment', 'profile'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { pass: ['comment', 'profile', 'organization'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isTrue(store.is('organization', user.organization), 'user.organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
      clear()

      // when props are NOT a record
      user = await store.create('user', Test.JSData.utils.copy(userProps), { pass: [] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
      Test.assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { pass: ['comment'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { pass: ['comment', 'profile'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { pass: ['comment', 'profile', 'organization'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isTrue(store.is('organization', user.organization), 'user.organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
      clear()

      Test.assert.equal(createCalledCount.user, 8)
      Test.assert.isUndefined(createCalledCount.comment)
      Test.assert.isUndefined(createCalledCount.profile)
      Test.assert.isUndefined(createCalledCount.organization)
    })
    it('should combine opts.with and opts.pass', async function () {
      const Test = this
      const store = Test.store
      let createCalledCount = {}
      const utils = Test.JSData.utils

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
      let user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { pass: [] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
      Test.assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { pass: ['comment'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { with: ['comment'], pass: ['profile'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', store.createRecord('user', Test.JSData.utils.copy(userProps)), { with: ['comment', 'profile'], pass: ['organization'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isTrue(store.is('organization', user.organization), 'user.organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
      clear()

      // when props are NOT a record
      user = await store.create('user', Test.JSData.utils.copy(userProps), { pass: [] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.deepEqual(user.comments, [], 'user.comments should be an empty array')
      Test.assert.deepEqual(store.getAll('comment'), [], 'comments should not be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { pass: ['comment'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isUndefined(user.profile, 'user.profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profile should not be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { with: ['comment'], pass: ['profile'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isUndefined(user.organization, 'user.organization should be undefined')
      Test.assert.isUndefined(user.organizationId, 'user.organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      user = await store.create('user', Test.JSData.utils.copy(userProps), { with: ['comment', 'profile'], pass: ['organization'] })
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.get('user', user.id) === user, 'user should be in the store')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.objectsEqual(store.getAll('comment'), user.comments, 'comments should be in the store')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [user.profile], 'profile should be in the store')
      Test.assert.isTrue(store.is('organization', user.organization), 'user.organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, user.organizationId, 'user.organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [user.organization], 'organization should be in the store')
      clear()

      Test.assert.equal(createCalledCount.user, 8)
      Test.assert.equal(createCalledCount.comment, 4)
      Test.assert.equal(createCalledCount.profile, 2)
      Test.assert.isUndefined(createCalledCount.organization)
    })
  })
}
