export function init () {
  describe('static updateMany', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.updateMany)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.updateMany)
      Test.assert.isFunction(User2.updateMany)
      Test.assert.isTrue(Test.JSData.Model.updateMany === User.updateMany)
      Test.assert.isTrue(Test.JSData.Model.updateMany === User2.updateMany)
      Test.assert.isTrue(User.updateMany === User2.updateMany)
      Test.assert.isTrue(User2.updateMany === User3.updateMany)
    })
    it('should update', async function () {
      const Test = this
      const id = 1
      const props = [{ id, name: 'John' }]
      let updateManyCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateMany (modelConfig, _props, Opts) {
          updateManyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            _props[0].foo = 'bar'
            resolve(_props)
          })
        }
      })
      const users = await User.updateMany(props)
      Test.assert.isTrue(updateManyCalled, 'Adapter#updateMany should have been called')
      Test.assert.equal(users[0].foo, 'bar', 'user has a new field')
      Test.assert.isTrue(users[0] instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const props = [{ id, name: 'John' }]
      let updateManyCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateMany (modelConfig, _props, Opts) {
          updateManyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props[0].foo = 'bar'
            resolve({
              data: _props,
              updated: 1
            })
          })
        }
      })
      let data = await User.updateMany(props)
      Test.assert.isTrue(updateManyCalled, 'Adapter#update should have been called')
      Test.assert.equal(data.data[0].foo, 'bar', 'user has a new field')
      Test.assert.isTrue(data.data[0] instanceof User, 'user is a User')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
