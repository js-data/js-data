export function init () {
  describe('find', function () {
    it('should be an instance method', function () {
      const Test = this
      const Mapper = Test.JSData.Mapper
      const mapper = new Mapper({ name: 'foo' })
      Test.assert.isFunction(mapper.find)
      Test.assert.isTrue(mapper.find === Mapper.prototype.find)
    })
    it('should find', async function () {
      const Test = this
      const id = 1
      const props = { id, name: 'John' }
      let findCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        find (mapper, _id, Opts) {
          findCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.equal(Opts.raw, false, 'Opts are provided')
            resolve(props)
          })
        }
      })
      const user = await User.find(id)
      Test.assert.isTrue(findCalled, 'Adapter#find should have been called')
      Test.assert.deepEqual(user, props, 'user should have been found')
      Test.assert.isTrue(user instanceof User.recordClass, 'user is a record')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const props = { id, name: 'John' }
      let findCalled = false
      const User = new Test.JSData.Mapper({
        name: 'user',
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        find (mapper, _id, Opts) {
          findCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(mapper === User, 'should pass in the Model')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.equal(Opts.raw, true, 'Opts are provided')
            resolve({
              data: props,
              found: 1
            })
          })
        }
      })
      let data = await User.find(id)
      Test.assert.isTrue(findCalled, 'Adapter#find should have been called')
      Test.assert.deepEqual(data.data, props, 'user should have been found')
      Test.assert.isTrue(data.data instanceof User.recordClass, 'user is a record')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.found, 1, 'should have other metadata in response')
    })
  })
}
