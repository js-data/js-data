export function init () {
  describe('static destroy', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.destroy)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.destroy)
      Test.assert.isFunction(User2.destroy)
      Test.assert.isTrue(Test.JSData.Model.destroy === User.destroy)
      Test.assert.isTrue(Test.JSData.Model.destroy === User2.destroy)
      Test.assert.isTrue(User.destroy === User2.destroy)
      Test.assert.isTrue(User2.destroy === User3.destroy)
    })
    it('should destroy', async function () {
      const Test = this
      const id = 1
      let destroyCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroy (modelConfig, _id, Opts) {
          destroyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve('foo')
          })
        }
      })
      const result = await User.destroy(id)
      Test.assert.isTrue(destroyCalled, 'Adapter#destroy should have been called')
      Test.assert.equal(result, 'foo', 'returned data')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      let destroyCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroy (modelConfig, _id, Opts) {
          destroyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              deleted: 1,
              data: 'foo'
            })
          })
        }
      })
      const data = await User.destroy(id)
      Test.assert.isTrue(destroyCalled, 'Adapter#destroy should have been called')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.deleted, 1, 'should have other metadata in response')
      Test.assert.equal(data.data, 'foo', 'ejected user should have been returned')
    })
  })
}
