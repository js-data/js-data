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
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        findAll (modelConfig, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve(props)
          })
        }
      })
      const users = await User.findAll(query)
      assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      assert.deepEqual(users, props, 'user should have been found')
      assert.isTrue(users[0] instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
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
      let data = await User.findAll(query)
      assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      assert.objectsEqual(data.data, props, 'user should have been found')
      assert.isTrue(data.data[0] instanceof User, 'user is a User')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.found, 1, 'should have other metadata in response')
    })
  })
}
