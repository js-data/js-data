export function init () {
  describe('static createMany', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.createMany)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.createMany)
      Test.assert.isFunction(User2.createMany)
      Test.assert.isTrue(Test.JSData.Model.createMany === User.createMany)
      Test.assert.isTrue(Test.JSData.Model.createMany === User2.createMany)
      Test.assert.isTrue(User.createMany === User2.createMany)
      Test.assert.isTrue(User2.createMany === User3.createMany)
    })
    it('should createMany', async function () {
      const Test = this
      const props = [{ name: 'John' }]
      let createCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (modelConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            _props[0][modelConfig.idAttribute] = new Date().getTime()
            resolve(_props)
          })
        }
      })
      const users = await User.createMany(props)
      Test.assert.isTrue(createCalled, 'Adapter#createMany should have been called')
      Test.assert.isDefined(users[0][User.idAttribute], 'new user has an id')
      Test.assert.isTrue(users[0] instanceof User, 'user is not a User')
    })
    it('should upsert', async function () {
      const Test = this
      const props = [{ name: 'John', id: 1 }]
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock',
        upsert: true,
        updateMany: Test.sinon.stub().returns(Promise.resolve(props))
      })

      await User.createMany(props)
      Test.assert.isTrue(User.updateMany.calledOnce, 'User.updateMany should have been called')
    })
    it('should return raw', async function () {
      const Test = this
      const props = [{ name: 'John' }]
      let createCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (modelConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props[0][modelConfig.idAttribute] = new Date().getTime()
            resolve({
              data: _props,
              created: 1
            })
          })
        }
      })
      let data = await User.createMany(props)
      Test.assert.isTrue(createCalled, 'Adapter#createMany should have been called')
      Test.assert.isDefined(data.data[0][User.idAttribute], 'new user has an id')
      Test.assert.isTrue(data.data[0] instanceof User, 'user is a User')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.created, 1, 'should have other metadata in response')
    })
  })
}
