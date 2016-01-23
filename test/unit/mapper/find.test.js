export function init () {
  describe('static find', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.find)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.find)
      Test.assert.isFunction(User2.find)
      Test.assert.isTrue(Test.JSData.Model.find === User.find)
      Test.assert.isTrue(Test.JSData.Model.find === User2.find)
      Test.assert.isTrue(User.find === User2.find)
      Test.assert.isTrue(User2.find === User3.find)
    })
    it('should find', async function () {
      const Test = this
      const id = 1
      const props = { id, name: 'John' }
      let findCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        find (modelConfig, _id, Opts) {
          findCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            resolve(props)
          })
        }
      })
      const user = await User.find(id)
      Test.assert.isTrue(findCalled, 'Adapter#find should have been called')
      Test.assert.deepEqual(user, props, 'user should have been found')
      Test.assert.isTrue(user instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const props = { id, name: 'John' }
      let findCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        find (modelConfig, _id, Opts) {
          findCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
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
      Test.assert.isTrue(data.data instanceof User, 'user is a User')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.found, 1, 'should have other metadata in response')
    })
  })
}
