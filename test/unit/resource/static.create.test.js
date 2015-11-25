/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static create', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.create)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.create)
      assert.isFunction(User2.create)
      assert.isTrue(Resource.create === User.create)
      assert.isTrue(Resource.create === User2.create)
      assert.isTrue(User.create === User2.create)
      assert.isTrue(User2.create === User3.create)
    })
    it('should create', async function () {
      const props = { name: 'John' }
      let createCalled = false
      class User extends Resource {}
      User.schema({ id: {} })
      User.configure({
        defaultAdapter: 'mock',
        autoInject: false
      })
      User.adapters.mock = {
        create (resourceConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            _props[resourceConfig.idAttribute] = new Date().getTime()
            assert.isTrue(resourceConfig === User, 'should pass in the Resource')
            assert.isTrue(_props === props, 'should pass in the props')
            assert.equal(Opts.autoInject, false, 'Opts are provided')
            resolve(_props)
          })
        }
      }
      const user = await User.create(props)
      assert.isTrue(createCalled, 'Adapter#create should have been called')
      assert.isTrue(user === props, 'should pass in the props')
      assert.isDefined(user[User.idAttribute], 'new user has an id')
      assert.isFalse(user instanceof User, 'user is not a User')
      assert.isUndefined(User.get(user.id), 'user was not injected')
    })
    it('should create and auto-inject', async function () {
      const props = { name: 'John' }
      let createCalled = false
      class User extends Resource {}
      User.schema({ id: {} })
      User.configure({
        autoInject: true,
        defaultAdapter: 'mock'
      })
      User.adapters.mock = {
        create (resourceConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            _props[resourceConfig.idAttribute] = new Date().getTime()
            assert.isTrue(resourceConfig === User, 'should pass in the Resource')
            assert.isTrue(_props === props, 'should pass in the props')
            assert.equal(Opts.autoInject, true, 'Opts are provided')
            resolve(_props)
          })
        }
      }
      let user = await User.create(props)
      assert.isTrue(createCalled, 'Adapter#create should have been called')
      assert.isDefined(user[User.idAttribute], 'new user has an id')
      assert.isTrue(user instanceof User, 'user is a User')
      assert.isTrue(User.get(user.id) === user, 'user was not injected')
    })
    it('should upsert')
  })
}
