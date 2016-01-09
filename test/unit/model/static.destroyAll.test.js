/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static destroyAll', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.destroyAll)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.destroyAll)
      assert.isFunction(User2.destroyAll)
      assert.isTrue(Model.destroyAll === User.destroyAll)
      assert.isTrue(Model.destroyAll === User2.destroyAll)
      assert.isTrue(User.destroyAll === User2.destroyAll)
      assert.isTrue(User2.destroyAll === User3.destroyAll)
    })
    it('should destroyAll', async function () {
      const id = 1
      const query = {}
      const props = [{ id, name: 'John' }]
      let destroyAllCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroyAll (modelConfig, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve('foo')
          })
        }
      })
      const result = await User.destroyAll()
      assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      assert.equal(result, 'foo', 'returned data')
    })
    it('should return raw and not auto eject', async function () {
      const id = 1
      const query = {}
      const props = [{ id, name: 'John' }]
      let destroyAllCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroyAll (modelConfig, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: 'foo',
              deleted: 1
            })
          })
        }
      })
      const data = await User.destroyAll()
      assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.deleted, 1, 'should have other metadata in response')
      assert.equal(data.data, 'foo', 'returned data')
    })
  })
}
