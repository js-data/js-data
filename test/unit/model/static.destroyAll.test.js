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
      const query = { id }
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
            assert.equal(Opts.autoEject, true, 'Opts are provided')
            resolve()
          })
        }
      })
      const users = User.inject(props)
      assert.isDefined(User.get(id), 'user should have been injected')
      const ejected = await User.destroyAll(query)
      assert.isUndefined(User.get(id), 'user should have been ejected')
      assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      assert.isTrue(ejected[0] === users[0], 'ejected user should have been returned')
    })
    it('should destroyAll and not auto eject', async function () {
      const id = 1
      const query = {}
      const props = [{ id, name: 'John' }]
      let destroyAllCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock',
        autoEject: false
      })
      User.registerAdapter('mock', {
        destroyAll (modelConfig, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.autoEject, false, 'Opts are provided')
            resolve('foo')
          })
        }
      })
      const users = User.inject(props)
      assert.isDefined(User.get(id), 'user should have been injected')
      const ejected = await User.destroyAll()
      assert.isDefined(User.get(id), 'user should NOT have been ejected')
      assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      assert.equal(ejected, 'foo', 'returned data')
    })
    it('should return raw', async function () {
      const id = 1
      const query = { id }
      const props = [{ id, name: 'John' }]
      let destroyAllCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock',
        autoEject: true
      })
      User.registerAdapter('mock', {
        destroyAll (modelConfig, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              deleted: 1
            })
          })
        }
      })
      const users = User.inject(props)
      assert.isDefined(User.get(id), 'user should have been injected')
      const data = await User.destroyAll(query)
      assert.isUndefined(User.get(id), 'user should have been ejected')
      assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.deleted, 1, 'should have other metadata in response')
      assert.isTrue(data.data[0] === users[0], 'ejected user should have been returned')
    })
    it('should return raw and not auto eject', async function () {
      const id = 1
      const query = {}
      const props = [{ id, name: 'John' }]
      let destroyAllCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock',
        autoEject: false
      })
      User.registerAdapter('mock', {
        destroyAll (modelConfig, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_query, query, 'should pass in the query')
            assert.equal(Opts.raw, true, 'Opts are provided')
            assert.equal(Opts.autoEject, false, 'Opts are provided')
            resolve({
              data: 'foo',
              deleted: 1
            })
          })
        }
      })
      const users = User.inject(props)
      assert.isDefined(User.get(id), 'user should have been injected')
      const data = await User.destroyAll()
      assert.isDefined(User.get(id), 'user should NOT have been ejected')
      assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.deleted, 1, 'should have other metadata in response')
      assert.equal(data.data, 'foo', 'returned data')
    })
  })
}
