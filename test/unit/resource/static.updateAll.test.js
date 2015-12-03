/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('static updateAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Resource.updateAll)
      let User = Resource.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Resource {}
      class User3 extends User2 {}
      assert.isFunction(User.updateAll)
      assert.isFunction(User2.updateAll)
      assert.isTrue(Resource.updateAll === User.updateAll)
      assert.isTrue(Resource.updateAll === User2.updateAll)
      assert.isTrue(User.updateAll === User2.updateAll)
      assert.isTrue(User2.updateAll === User3.updateAll)
    })
    it('should update', async function () {
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      class User extends Resource {}
      User.schema({ id: {} })
      User.configure({
        defaultAdapter: 'mock',
        autoInject: false
      })
      User.adapters.mock = {
        updateAll (resourceConfig, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(resourceConfig === User, 'should pass in the Resource')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.autoInject, false, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve([_props])
          })
        }
      }
      const users = await User.updateAll(query, props)
      assert.isTrue(updateAllCalled, 'Adapter#updateAll should have been called')
      assert.equal(users[0].foo, 'bar', 'user has a new field')
      assert.isFalse(users[0] instanceof User, 'user is not a User')
      assert.isUndefined(User.get(users[0].id), 'user was not injected')
    })
    it('should update and auto-inject', async function () {
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      class User extends Resource {}
      User.schema({ id: {} })
      User.configure({
        autoInject: true,
        defaultAdapter: 'mock'
      })
      User.adapters.mock = {
        updateAll (resourceConfig, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(resourceConfig === User, 'should pass in the Resource')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.autoInject, true, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve([_props])
          })
        }
      }
      let users = await User.updateAll(query, props)
      assert.isTrue(updateAllCalled, 'Adapter#update should have been called')
      assert.equal(users[0].foo, 'bar', 'user has a new field')
      assert.isTrue(users[0] instanceof User, 'user is a User')
      assert.isTrue(User.get(users[0].id) === users[0], 'user was injected')
    })
    it('should return raw', async function () {
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      class User extends Resource {}
      User.schema({ id: {} })
      User.configure({
        autoInject: true,
        raw: true,
        defaultAdapter: 'mock'
      })
      User.adapters.mock = {
        updateAll (resourceConfig, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(resourceConfig === User, 'should pass in the Resource')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.raw, true, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve({
              data: [_props],
              updated: 1
            })
          })
        }
      }
      let data = await User.updateAll(query, props)
      assert.isTrue(updateAllCalled, 'Adapter#update should have been called')
      assert.equal(data.data[0].foo, 'bar', 'user has a new field')
      assert.isTrue(data.data[0] instanceof User, 'user is a User')
      assert.isTrue(User.get(data.data[0].id) === data.data[0], 'user was not injected')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
