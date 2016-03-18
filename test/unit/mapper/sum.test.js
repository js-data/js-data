export function init () {
  describe('sum', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.sum)
      Test.assert.isTrue(mapper.sum === Mapper.prototype.sum)
    })
    it('should sum', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John', age: 30 }]
      let sumCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        sum (mapper, _field, _query, Opts) {
          sumCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.equal(_field, 'age', 'should pass in the field')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            resolve(30)
          })
        }
      })
      const sum = await User.sum('age', query)
      Test.assert.isTrue(sumCalled, 'Adapter#sum should have been called')
      Test.assert.deepEqual(sum, 30, 'sum should be 30')
    })
    it('should return raw', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John', age: 30 }]
      let sumCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        sum (mapper, _field, _query, Opts) {
          sumCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.equal(_field, 'age', 'should pass in the field')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: 30
            })
          })
        }
      })
      let data = await User.sum('age', query)
      Test.assert.isTrue(sumCalled, 'Adapter#sum should have been called')
      Test.assert.objectsEqual(data.data, 30, 'sum should be 30')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
    })
  })
}
