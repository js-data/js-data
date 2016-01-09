/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static createMany', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.createMany)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.createMany)
      assert.isFunction(User2.createMany)
      assert.isTrue(Model.createMany === User.createMany)
      assert.isTrue(Model.createMany === User2.createMany)
      assert.isTrue(User.createMany === User2.createMany)
      assert.isTrue(User2.createMany === User3.createMany)
    })
    it('should createMany', async function () {
      const props = [{ name: 'John' }]
      let createCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (modelConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_props, props, 'should pass in the props')
            _props[0][modelConfig.idAttribute] = new Date().getTime()
            resolve(_props)
          })
        }
      })
      const users = await User.createMany(props)
      assert.isTrue(createCalled, 'Adapter#createMany should have been called')
      assert.isDefined(users[0][User.idAttribute], 'new user has an id')
      assert.isTrue(users[0] instanceof User, 'user is not a User')
    })
    it('should upsert', async function () {
      const props = [{ name: 'John', id: 1 }]
      let createCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock',
        upsert: true,
        updateMany: sinon.stub().returns(Promise.resolve(props))
      })

      let user = await User.createMany(props)
      assert.isTrue(User.updateMany.calledOnce, 'User.updateMany should have been called')
    })
    it('should return raw', async function () {
      const props = [{ name: 'John' }]
      let createCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (modelConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.raw, true, 'Opts are provided')
            _props[0][modelConfig.idAttribute] = new Date().getTime()
            resolve({
              data: _props,
              created: 1
            })
          })
        }
      })
      let data = await User.createMany(props)
      assert.isTrue(createCalled, 'Adapter#createMany should have been called')
      assert.isDefined(data.data[0][User.idAttribute], 'new user has an id')
      assert.isTrue(data.data[0] instanceof User, 'user is a User')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.created, 1, 'should have other metadata in response')
    })
  })
}
