/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static updateAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.updateAll)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.updateAll)
      assert.isFunction(User2.updateAll)
      assert.isTrue(Model.updateAll === User.updateAll)
      assert.isTrue(Model.updateAll === User2.updateAll)
      assert.isTrue(User.updateAll === User2.updateAll)
      assert.isTrue(User2.updateAll === User3.updateAll)
    })
    it('should update', async function () {
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock',
      })
      User.registerAdapter('mock', {
        updateAll (modelConfig, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.pojo, false, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve([_props])
          })
        }
      })
      const users = await User.updateAll(query, props)
      assert.isTrue(updateAllCalled, 'Adapter#updateAll should have been called')
      assert.equal(users[0].foo, 'bar', 'user has a new field')
      assert.isTrue(users[0] instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateAll (modelConfig, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
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
      })
      let data = await User.updateAll(query, props)
      assert.isTrue(updateAllCalled, 'Adapter#update should have been called')
      assert.equal(data.data[0].foo, 'bar', 'user has a new field')
      assert.isTrue(data.data[0] instanceof User, 'user is a User')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
