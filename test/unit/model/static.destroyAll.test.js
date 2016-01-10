export function init () {
  describe('static destroyAll', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.destroyAll)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.destroyAll)
      Test.assert.isFunction(User2.destroyAll)
      Test.assert.isTrue(Test.JSData.Model.destroyAll === User.destroyAll)
      Test.assert.isTrue(Test.JSData.Model.destroyAll === User2.destroyAll)
      Test.assert.isTrue(User.destroyAll === User2.destroyAll)
      Test.assert.isTrue(User2.destroyAll === User3.destroyAll)
    })
    it('should destroyAll', async function () {
      const Test = this
      const query = {}
      let destroyAllCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroyAll (modelConfig, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve('foo')
          })
        }
      })
      const result = await User.destroyAll()
      Test.assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      Test.assert.equal(result, 'foo', 'returned data')
    })
    it('should return raw and not auto eject', async function () {
      const Test = this
      const query = {}
      let destroyAllCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroyAll (modelConfig, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: 'foo',
              deleted: 1
            })
          })
        }
      })
      const data = await User.destroyAll()
      Test.assert.isTrue(destroyAllCalled, 'Adapter#destroyAll should have been called')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.deleted, 1, 'should have other metadata in response')
      Test.assert.equal(data.data, 'foo', 'returned data')
    })
  })
}
