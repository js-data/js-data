export function init () {
  describe('destroy', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.destroy)
      Test.assert.isTrue(mapper.destroy === Mapper.prototype.destroy)
    })
    it('should destroy', async function () {
      const Test = this
      const id = 1
      let destroyCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroy (mapper, _id, Opts) {
          destroyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
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
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroy (mapper, _id, Opts) {
          destroyCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
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
