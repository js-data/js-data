/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static findAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.findAll)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.findAll)
      assert.isFunction(User2.findAll)
      assert.isTrue(Model.findAll === User.findAll)
      assert.isTrue(Model.findAll === User2.findAll)
      assert.isTrue(User.findAll === User2.findAll)
      assert.isTrue(User2.findAll === User3.findAll)
    })
    it('should findAll', async function () {
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      class User extends Model {}
      User.initialize()
      User.configure({
        defaultAdapter: 'mock',
        autoInject: false
      })
      User.use('mock', {
        findAll (modelConfig, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.autoInject, false, 'Opts are provided')
            resolve(props)
          })
        }
      })
      const users = await User.findAll(query, props)
      assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      assert.deepEqual(users, props, 'user should have been found')
      assert.isFalse(users[0] instanceof User, 'user is not a User')
      assert.isUndefined(User.get(users[0].id), 'user was not injected')
    })
    it('should findAll and auto-inject', async function () {
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      class User extends Model {}
      User.initialize()
      User.configure({
        autoInject: true,
        defaultAdapter: 'mock'
      })
      User.use('mock', {
        findAll (modelConfig, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.autoInject, true, 'Opts are provided')
            resolve(props)
          })
        }
      })
      let users = await User.findAll(query, props)
      assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      assert.objectsEqual(users, props, 'user should have been found')
      assert.isTrue(users[0] instanceof User, 'user is a User')
      assert.isTrue(User.get(users[0].id) === users[0], 'user was injected')
    })
    it('should return raw', async function () {
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      class User extends Model {}
      User.initialize()
      User.configure({
        autoInject: true,
        raw: true,
        defaultAdapter: 'mock'
      })
      User.use('mock', {
        findAll (modelConfig, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: props,
              found: 1
            })
          })
        }
      })
      let data = await User.findAll(query, props)
      assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      assert.objectsEqual(data.data, props, 'user should have been found')
      assert.isTrue(data.data[0] instanceof User, 'user is a User')
      assert.isTrue(User.get(data.data[0].id) === data.data[0], 'user was not injected')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.found, 1, 'should have other metadata in response')
    })
  })
}
