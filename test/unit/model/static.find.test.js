/* global Model:true */
import {assert} from 'chai'

export function init () {
  describe('static find', function () {
    it('should be a static function', function () {
      assert.isFunction(Model.find)
      let User = Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Model {}
      class User3 extends User2 {}
      assert.isFunction(User.find)
      assert.isFunction(User2.find)
      assert.isTrue(Model.find === User.find)
      assert.isTrue(Model.find === User2.find)
      assert.isTrue(User.find === User2.find)
      assert.isTrue(User2.find === User3.find)
    })
    it('should find', async function () {
      const id = 1
      const props = { id, name: 'John' }
      let findCalled = false
      class User extends Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        find (modelConfig, _id, Opts) {
          findCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_id, id, 'should pass in the id')
            assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve(props)
          })
        }
      })
      const user = await User.find(id)
      assert.isTrue(findCalled, 'Adapter#find should have been called')
      assert.deepEqual(user, props, 'user should have been found')
      assert.isTrue(user instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const id = 1
      const props = { id, name: 'John' }
      let findCalled = false
      class User extends Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        find (modelConfig, _id, Opts) {
          findCalled = true
          return new Promise(function (resolve, reject) {
            assert.isTrue(modelConfig === User, 'should pass in the Model')
            assert.deepEqual(_id, id, 'should pass in the id')
            assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: props,
              found: 1
            })
          })
        }
      })
      let data = await User.find(id)
      assert.isTrue(findCalled, 'Adapter#find should have been called')
      assert.deepEqual(data.data, props, 'user should have been found')
      assert.isTrue(data.data instanceof User, 'user is a User')
      assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      assert.equal(data.found, 1, 'should have other metadata in response')
    })
  })
}
