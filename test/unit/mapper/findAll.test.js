export function init () {
  describe('findAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper()
      Test.assert.isFunction(mapper.findAll)
      Test.assert.isTrue(mapper.findAll === Mapper.prototype.findAll)
    })
    it('should findAll', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      const User = new Test.JSData.Mapper({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        findAll (mapper, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            resolve(props)
          })
        }
      })
      const users = await User.findAll(query)
      Test.assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      Test.assert.deepEqual(users, props, 'user should have been found')
      Test.assert.isTrue(users[0] instanceof User.RecordClass, 'user is a record')
    })
    it('should return raw', async function () {
      const Test = this
      const query = { id: 1 }
      const id = 1
      const props = [{ id, name: 'John' }]
      let findAllCalled = false
      const User = new Test.JSData.Mapper({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        findAll (mapper, _query, Opts) {
          findAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: props,
              found: 1
            })
          })
        }
      })
      let data = await User.findAll(query)
      Test.assert.isTrue(findAllCalled, 'Adapter#findAll should have been called')
      Test.assert.objectsEqual(data.data, props, 'user should have been found')
      Test.assert.isTrue(data.data[0] instanceof User.RecordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.found, 1, 'should have other metadata in response')
    })
  })
}
