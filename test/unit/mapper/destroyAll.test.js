export function init () {
  describe('destroyAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper()
      Test.assert.isFunction(mapper.destroyAll)
      Test.assert.isTrue(mapper.destroyAll === Mapper.prototype.destroyAll)
    })
    it('should destroyAll', async function () {
      const Test = this
      const query = {}
      let destroyAllCalled = false
      const User = new Test.JSData.Mapper({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroyAll (mapper, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
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
      const User = new Test.JSData.Mapper({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        destroyAll (mapper, _query, Opts) {
          destroyAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
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
