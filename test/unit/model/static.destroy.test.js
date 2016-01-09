/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static destroy', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.destroy)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.destroy)
      assert.isFunction(User2.destroy)
      assert.isTrue(Model.destroy === User.destroy)
      assert.isTrue(Model.destroy === User2.destroy)
      assert.isTrue(User.destroy === User2.destroy)
      assert.isTrue(User2.destroy === User3.destroy)
    })
    it('should destroy', async function () {
      const id = 1
      const props = { id, name: 'John' }
      let destroyCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroy (modelConfig, _id, Opts) {
          destroyCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_id, id, 'should pass in the id')
            assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve('foo')
          })
        }
      })
      const result = await User.destroy(id)
      assert.isTrue(destroyCalled, 'Adapter#destroy should have been called')
      assert.equal(result, 'foo', 'returned data')
    })
    it('should return raw', async function () {
      const id = 1
      const props = { id, name: 'John' }
      let destroyCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroy (modelConfig, _id, Opts) {
          destroyCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_id, id, 'should pass in the id')
            assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              deleted: 1,
              data: 'foo'
            })
          })
        }
      })
      const data = await User.destroy(id)
      assert.isTrue(destroyCalled, 'Adapter#destroy should have been called')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.deleted, 1, 'should have other metadata in response')
      assert.equal(data.data, 'foo', 'ejected user should have been returned')
    })
  })
}
