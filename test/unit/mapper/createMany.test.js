export function init () {
  describe('createMany', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper()
      Test.assert.isFunction(mapper.createMany)
      Test.assert.isTrue(mapper.createMany === Mapper.prototype.createMany)
    })
    it('should createMany', async function () {
      const Test = this
      const props = [{ name: 'John' }]
      let createCalled = false
      const User = new Test.JSData.Mapper({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            _props[0][mapper.idAttribute] = new Date().getTime()
            resolve(_props)
          })
        }
      })
      const users = await User.createMany(props)
      Test.assert.isTrue(createCalled, 'Adapter#createMany should have been called')
      Test.assert.isDefined(users[0][User.idAttribute], 'new user has an id')
      Test.assert.isTrue(users[0] instanceof User.RecordClass, 'user is a record')
    })
    it('should upsert', async function () {
      const Test = this
      const props = [{ name: 'John', id: 1 }]
      const User = new Test.JSData.Mapper({
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
      const User = new Test.JSData.Mapper({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        createMany (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props[0][mapper.idAttribute] = new Date().getTime()
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
      Test.assert.isTrue(data.data[0] instanceof User.RecordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.created, 1, 'should have other metadata in response')
    })
  })
}
