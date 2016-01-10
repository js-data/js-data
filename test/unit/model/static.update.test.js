export function init () {
  describe('static update', function () {
    it('should be a static function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.update)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.update)
      Test.assert.isFunction(User2.update)
      Test.assert.isTrue(Test.JSData.Model.update === User.update)
      Test.assert.isTrue(Test.JSData.Model.update === User2.update)
      Test.assert.isTrue(User.update === User2.update)
      Test.assert.isTrue(User2.update === User3.update)
    })
    it('should update', async function () {
      const Test = this
      const id = 1
      const props = { name: 'John' }
      let updateCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        update (modelConfig, _id, _props, Opts) {
          updateCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
            Test.assert.deepEqual(_id, id, 'should pass in the id')
            Test.assert.deepEqual(_props, props, 'should pass in the props')
            Test.assert.equal(Opts.pojo, false, 'Opts are provided')
            _props.foo = 'bar'
            _props.id = id
            resolve(_props)
          })
        }
      })
      const user = await User.update(id, props)
      Test.assert.isTrue(updateCalled, 'Adapter#update should have been called')
      Test.assert.equal(user.foo, 'bar', 'user has a new field')
      Test.assert.isTrue(user instanceof User, 'user is a User')
    })
    it('should return raw', async function () {
      const Test = this
      const id = 1
      const props = { name: 'John' }
      let updateCalled = false
      class User extends Test.JSData.Model {}
      User.configure({
        raw: true,
        defaultAdapter: 'mock'
      })
      User.registerAdapter('mock', {
        update (modelConfig, _id, _props, Opts) {
          updateCalled = true
          return new Promise(function (resolve, reject) {
            Test.assert.isTrue(modelConfig === User, 'should pass in the Model')
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
      Test.assert.isTrue(data.data instanceof User, 'user is a User')
      Test.assert.equal(data.adapter, 'mock', 'should have adapter name in response')
      Test.assert.equal(data.updated, 1, 'should have other metadata in response')
    })
  })
}
