/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static updateMany', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.updateMany)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.updateMany)
      assert.isFunction(User2.updateMany)
      assert.isTrue(Model.updateMany === User.updateMany)
      assert.isTrue(Model.updateMany === User2.updateMany)
      assert.isTrue(User.updateMany === User2.updateMany)
      assert.isTrue(User2.updateMany === User3.updateMany)
    })
    it('should update', async function () {
      const id = 1
      const props = [{ id, name: 'John' }]
      let updateManyCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateMany (modelConfig, _props, Opts) {
          updateManyCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.pojo, false, 'Opts are provided')
            _props[0].foo = 'bar'
            resolve(_props)
          })
        }
      })
      const users = await User.updateMany(props)
      assert.isTrue(updateManyCalled, 'Adapter#updateMany should have been called')
      assert.equal(users[0].foo, 'bar', 'user has a new field')
      assert.isTrue(users[0] instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const id = 1
      const props = [{ id, name: 'John' }]
      let updateManyCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateMany (modelConfig, _props, Opts) {
          updateManyCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.raw, true, 'Opts are provided')
            _props[0].foo = 'bar'
            resolve({
              data: _props,
              updated: 1
            })
          })
        }
      })
      let data = await User.updateMany(props)
      assert.isTrue(updateManyCalled, 'Adapter#update should have been called')
      assert.equal(data.data[0].foo, 'bar', 'user has a new field')
      assert.isTrue(data.data[0] instanceof User, 'user is a User')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
