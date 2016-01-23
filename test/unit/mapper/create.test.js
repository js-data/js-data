export function init () {
  describe('static create', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.create)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.create)
      Test.assert.isFunction(User2.create)
      Test.assert.isTrue(Test.JSData.Model.create === User.create)
      Test.assert.isTrue(Test.JSData.Model.create === User2.create)
      Test.assert.isTrue(User.create === User2.create)
      Test.assert.isTrue(User2.create === User3.create)
    })
    it('should create', async function () {
      const Test = this
      const props = { name: 'John' }
      let createCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        create (modelConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Test.JSData.Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            _props[modelConfig.idAttribute] = new Date().getTime()
            resolve(_props)
          })
        }
      })
      const user = await User.create(props)
      Test.assert.isTrue(createCalled, 'Adapter#create should have been called')
      Test.assert.isDefined(user[User.idAttribute], 'new user has an id')
      Test.assert.isTrue(user instanceof User, 'user is a User')
    })
    it('should upsert', async function () {
      const Test = this
      const props = { name: 'John', id: 1 }
      class User extends Test.JSData.Model {}
      User.configure({
        autoInject: true,
        defaultAdapter: 'mock',
        upsert: true,
        update: Test.sinon.stub().returns(Promise.resolve(props))
      })

      await User.create(props)
      Test.assert.isTrue(User.update.calledOnce, 'User.update should have been called')
    })
    it('should return raw', async function () {
      const Test = this
      const props = { name: 'John' }
      let createCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        create (modelConfig, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Test.JSData.Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props[modelConfig.idAttribute] = new Date().getTime()
            resolve({
              data: _props,
              created: 1
            })
          })
        }
      })
      let data = await User.create(props)
      Test.assert.isTrue(createCalled, 'Adapter#create should have been called')
      Test.assert.isDefined(data.data[User.idAttribute], 'new user has an id')
      Test.assert.isTrue(data.data instanceof User, 'user is a User')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.created, 1, 'should have other metadata in response')
    })
  })
}
