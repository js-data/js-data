export function init () {
  describe('static updateMany', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.updateMany)
      Test.assert.isTrue(mapper.updateMany === Mapper.prototype.updateMany)
    })
    it('should update', async function () {
      const Test = this
      const id = 1
      const props = [{ id, name: 'John' }]
      let updateManyCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateMany (mapper, _props, Opts) {
          updateManyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Mapper')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            _props[0].foo = 'bar'
            resolve(_props)
          })
        }
      })
      const users = await User.updateMany(props)
      Test.assert.isTrue(updateManyCalled, 'Adapter#updateMany should have been called')
      Test.assert.equal(users[0].foo, 'bar', 'user has a new field')
      Test.assert.isTrue(users[0] instanceof User.RecordClass, 'user is a record')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const props = [{ id, name: 'John' }]
      let updateManyCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateMany (mapper, _props, Opts) {
          updateManyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Mapper')
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
      Test.assert.isTrue(data.data[0] instanceof User.RecordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
