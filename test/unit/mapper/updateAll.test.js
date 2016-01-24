export function init () {
  describe('static updateAll', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper()
      Test.assert.isFunction(mapper.updateAll)
      Test.assert.isTrue(mapper.updateAll === Mapper.prototype.updateAll)
    })
    it('should update', async function () {
      const Test = this
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      const User = new Test.JSData.Mapper({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateAll (mapper, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Mapper')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve([_props])
          })
        }
      })
      const users = await User.updateAll(query, props)
      Test.assert.isTrue(updateAllCalled, 'Adapter#updateAll should have been called')
      Test.assert.equal(users[0].foo, 'bar', 'user has a new field')
      Test.assert.isTrue(users[0] instanceof User.RecordClass, 'user is a record')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const query = { a: 'b' }
      const props = { name: 'John' }
      let updateAllCalled = false
      const User = new Test.JSData.Mapper({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        updateAll (mapper, _query, _props, Opts) {
          updateAllCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Mapper')
            Test.assert.deepEqual(_query, query, 'should pass in the query')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve({
              data: [_props],
              updated: 1
            })
          })
        }
      })
      let data = await User.updateAll(query, props)
      Test.assert.isTrue(updateAllCalled, 'Adapter#update should have been called')
      Test.assert.equal(data.data[0].foo, 'bar', 'user has a new field')
      Test.assert.isTrue(data.data[0] instanceof User.RecordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
