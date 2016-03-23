export function init () {
  describe('static update', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.update)
      Test.assert.isTrue(mapper.update === Mapper.prototype.update)
    })
    it('should update', async function () {
      const Test = this
      const id = 1
      const props = { name: 'John' }
      let updateCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        update (mapper, _id, _props, Opts) {
          updateCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Mapper')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve(_props)
          })
        }
      })
      const user = await User.update(id, props)
      Test.assert.isTrue(updateCalled, 'Adapter#update should have been called')
      Test.assert.equal(user.foo, 'bar', 'user has a new field')
      Test.assert.isTrue(user instanceof User.recordClass, 'user is a record')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const props = { name: 'John' }
      let updateCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        update (mapper, _id, _props, Opts) {
          updateCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Mapper')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
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
      Test.assert.isTrue(updateCalled, 'Adapter#update should have been called')
      Test.assert.equal(data.data.foo, 'bar', 'user has a new field')
      Test.assert.isTrue(data.data instanceof User.recordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
