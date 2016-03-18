export function init () {
  describe('count', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.count)
      Test.assert.isTrue(mapper.count === Mapper.prototype.count)
    })
    it('should count', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let countCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        count (mapper, _query, Opts) {
          countCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            resolve(1)
          })
        }
      })
      const count = await User.count(query)
      Test.assert.isTrue(countCalled, 'Adapter#count should have been called')
      Test.assert.deepEqual(count, 1, 'count should be 1')
    })
    it('should return raw', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let countCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        count (mapper, _query, Opts) {
          countCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: 1
            })
          })
        }
      })
      let data = await User.count(query)
      Test.assert.isTrue(countCalled, 'Adapter#count should have been called')
      Test.assert.objectsEqual(data.data, 1, 'count should be 1')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    })
  })
}
