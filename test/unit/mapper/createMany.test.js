export function init () {
  describe('createMany', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.createMany)
      Test.assert.isTrue(mapper.createMany === Mapper.prototype.createMany)
    })
    it('should createMany', async function () {
      const Test = this
      const props = [{ name: 'John' }]
      let createCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            _props[0][mapper.idAttribute] = new Date().getTime()
            resolve(_props)
          })
        }
      })
      const users = await User.createMany(props)
      Test.assert.isTrue(createCalled, 'Adapter#createMany should have been called')
      Test.assert.isDefined(users[0][User.idAttribute], 'new user has an id')
      Test.assert.isTrue(users[0] instanceof User.RecordClass, 'user is a record')
    })
    it('should upsert', async function () {
      const Test = this
      const props = [{ name: 'John', id: 1 }]
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock',
        upsert: true,
        updateMany: Test.sinon.stub().returns(Promise.resolve(props))
      })

      await User.createMany(props)
      Test.assert.isTrue(User.updateMany.calledOnce, 'User.updateMany should have been called')
    })
    it('should return raw', async function () {
      const Test = this
      const props = [{ name: 'John' }]
      let createCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props[0][mapper.idAttribute] = new Date().getTime()
            resolve({
              data: _props,
              created: 1
            })
          })
        }
      })
      let data = await User.createMany(props)
      Test.assert.isTrue(createCalled, 'Adapter#createMany should have been called')
      Test.assert.isDefined(data.data[0][User.idAttribute], 'new user has an id')
      Test.assert.isTrue(data.data[0] instanceof User.RecordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.created, 1, 'should have other metadata in response')
    })
    it('should nested create everything in opts.with', async function () {
      const Test = this
      const store = Test.store
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
        return Test.JSData.utils.copy(userProps).map(function (props) {
          return store.createRecord('user', props)
        })
      }

      // when props are a Record
      let users = await store.createMany('user', getProps(), { with: [] })
      Test.assert.isTrue(store.is('user', users[0]), 'user 1 should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'user 2 should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
      Test.assert.isUndefined(users[0].profile, 'users[0].profile should be undefined')
      Test.assert.isUndefined(users[1].profile, 'users[1].profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profiles should not be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      users = await store.createMany('user', getProps(), { with: ['profile'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organizations should not be in the store')
      clear()

      users = await store.createMany('user', getProps(), { with: ['profile', 'organization'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isTrue(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
      Test.assert.isTrue(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
      Test.assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
      clear()

      // when props are NOT a record
      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { with: [] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isUndefined(users[0].profile, 'users[0].profile should be undefined')
      Test.assert.isUndefined(users[1].profile, 'users[1].profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profiles should not be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organizations should not be in the store')
      clear()

      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { with: ['profile'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organizations should not be in the store')
      clear()

      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { with: ['profile', 'organization'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isTrue(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
      Test.assert.isTrue(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
      Test.assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
      clear()

      Test.assert.equal(createCalledCount.user, 6)
      Test.assert.isUndefined(createCalledCount.comment)
      Test.assert.equal(createCalledCount.profile, 4)
      Test.assert.equal(createCalledCount.organization, 2)
    })
    it('should pass everything opts.pass', async function () {
      const Test = this
      const store = Test.store
      let createCalledCount = {}
      let id = 1
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
        return Test.JSData.utils.copy(userProps).map(function (props) {
          return store.createRecord('user', props)
        })
      }

      // when props are a Record
      let users = await store.createMany('user', getProps(), { pass: [] })
      Test.assert.isTrue(store.is('user', users[0]), 'user 1 should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'user 2 should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
      Test.assert.isUndefined(users[0].profile, 'users[0].profile should be undefined')
      Test.assert.isUndefined(users[1].profile, 'users[1].profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profiles should not be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      users = await store.createMany('user', getProps(), { pass: ['profile'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organizations should not be in the store')
      clear()

      users = await store.createMany('user', getProps(), { pass: ['profile', 'organization'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isTrue(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
      Test.assert.isTrue(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
      Test.assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
      clear()

      // when props are NOT a record
      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { pass: [] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isUndefined(users[0].profile, 'users[0].profile should be undefined')
      Test.assert.isUndefined(users[1].profile, 'users[1].profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profiles should not be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organizations should not be in the store')
      clear()

      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { pass: ['profile'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organizations should not be in the store')
      clear()

      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { pass: ['profile', 'organization'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isTrue(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
      Test.assert.isTrue(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
      Test.assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
      clear()

      Test.assert.equal(createCalledCount.user, 6)
      Test.assert.isUndefined(createCalledCount.comment)
      Test.assert.isUndefined(createCalledCount.profile)
      Test.assert.isUndefined(createCalledCount.organization)
    })
    it('should combine opts.with and opts.pass', async function () {
      const Test = this
      const store = Test.store
      let createCalledCount = {}
      let id = 1
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
        return Test.JSData.utils.copy(userProps).map(function (props) {
          return store.createRecord('user', props)
        })
      }

      // when props are a Record
      let users = await store.createMany('user', getProps(), { pass: [] })
      Test.assert.isTrue(store.is('user', users[0]), 'user 1 should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'user 2 should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'user 1 should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'user 2 should be in the store')
      Test.assert.isUndefined(users[0].profile, 'users[0].profile should be undefined')
      Test.assert.isUndefined(users[1].profile, 'users[1].profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profiles should not be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organization should not be in the store')
      clear()

      users = await store.createMany('user', getProps(), { with: ['profile'], pass: ['organization'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isTrue(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
      Test.assert.isTrue(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
      Test.assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
      clear()

      // when props are NOT a record
      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { pass: [] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isUndefined(users[0].profile, 'users[0].profile should be undefined')
      Test.assert.isUndefined(users[1].profile, 'users[1].profile should be undefined')
      Test.assert.deepEqual(store.getAll('profile'), [], 'profiles should not be in the store')
      Test.assert.isUndefined(users[0].organization, 'users[0].organization should be undefined')
      Test.assert.isUndefined(users[1].organization, 'users[1].organization should be undefined')
      Test.assert.isUndefined(users[0].organizationId, 'users[0].organizationId should be undefined')
      Test.assert.isUndefined(users[1].organizationId, 'users[1].organizationId should be undefined')
      Test.assert.deepEqual(store.getAll('organization'), [], 'organizations should not be in the store')
      clear()

      users = await store.createMany('user', Test.JSData.utils.copy(userProps), { with: ['profile'], pass: ['organization'] })
      Test.assert.isTrue(store.is('user', users[0]), 'users[0] should be a user record')
      Test.assert.isTrue(store.is('user', users[1]), 'users[1] should be a user record')
      Test.assert.isTrue(store.get('user', users[0].id) === users[0], 'users[0] should be in the store')
      Test.assert.isTrue(store.get('user', users[1].id) === users[1], 'users[1] should be in the store')
      Test.assert.isTrue(store.is('profile', users[0].profile), 'users[0].profile should be a profile record')
      Test.assert.isTrue(store.is('profile', users[1].profile), 'users[1].profile should be a profile record')
      Test.assert.objectsEqual(store.getAll('profile'), [users[0].profile, users[1].profile], 'profiles should be in the store')
      Test.assert.isTrue(store.is('organization', users[0].organization), 'users[0].organization should be a organization record')
      Test.assert.isTrue(store.is('organization', users[1].organization), 'users[1].organization should be a organization record')
      Test.assert.equal(store.getAll('organization')[0].id, users[0].organizationId, 'users[0].organizationId should be correct')
      Test.assert.equal(store.getAll('organization')[1].id, users[1].organizationId, 'users[1].organizationId should be correct')
      Test.assert.deepEqual(store.getAll('organization'), [users[0].organization, users[1].organization], 'organizations should be in the store')
      clear()

      Test.assert.equal(createCalledCount.user, 4)
      Test.assert.isUndefined(createCalledCount.comment)
      Test.assert.equal(createCalledCount.profile, 2)
      Test.assert.isUndefined(createCalledCount.organization)
    })
  })
}
