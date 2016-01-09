/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static update', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.update)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.update)
      assert.isFunction(User2.update)
      assert.isTrue(Model.update === User.update)
      assert.isTrue(Model.update === User2.update)
      assert.isTrue(User.update === User2.update)
      assert.isTrue(User2.update === User3.update)
    })
    it('should update', async function () {
      const id = 1
      const props = { name: 'John' }
      let updateCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        update (modelConfig, _id, _props, Opts) {
          updateCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_id, id, 'should pass in the id')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.pojo, false, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve(_props)
          })
        }
      })
      const user = await User.update(id, props)
      assert.isTrue(updateCalled, 'Adapter#update should have been called')
      assert.equal(user.foo, 'bar', 'user has a new field')
      assert.isTrue(user instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const id = 1
      const props = { name: 'John' }
      let updateCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        update (modelConfig, _id, _props, Opts) {
          updateCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_id, id, 'should pass in the id')
            assert.deepEqual(_props, props, 'should pass in the props')
            assert.equal(Opts.raw, true, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve({
              data: _props,
              updated: 1
            })
          })
        }
      })
      let data = await User.update(id, props)
      assert.isTrue(updateCalled, 'Adapter#update should have been called')
      assert.equal(data.data.foo, 'bar', 'user has a new field')
      assert.isTrue(data.data instanceof User, 'user is a User')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
