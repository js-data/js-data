export function init () {
  describe('create', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.create)
      Test.assert.isTrue(mapper.create === Mapper.prototype.create)
    })
    it('should create', async function () {
      const Test = this
      const props = { name: 'John' }
      let createCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        create (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Test.JSData.Mapper')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            _props[mapper.idAttribute] = new Date().getTime()
            resolve(_props)
          })
        }
      })
      const user = await User.create(props)
      Test.assert.isTrue(createCalled, 'Adapter#create should have been called')
      Test.assert.isDefined(user[User.idAttribute], 'new user has an id')
      Test.assert.isTrue(user instanceof User.RecordClass, 'user is a record')
    })
    it('should upsert', async function () {
      const Test = this
      const props = { name: 'John', id: 1 }
      const User = new Test.JSData.Mapper({
        name: 'user',
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
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        create (mapper, _props, Opts) {
          createCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Test.JSData.Mapper')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props[mapper.idAttribute] = new Date().getTime()
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
      Test.assert.isTrue(data.data instanceof User.RecordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.created, 1, 'should have other metadata in response')
    })
  })
}
