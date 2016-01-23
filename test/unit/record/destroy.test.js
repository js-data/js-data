export function init () {
  describe('#destroy', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.destroy)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.destroy)
      Test.assert.isFunction(User2.prototype.destroy)
      Test.assert.isTrue(Test.JSData.Model.prototype.destroy === User.prototype.destroy)
      Test.assert.isTrue(Test.JSData.Model.prototype.destroy === User2.prototype.destroy)
      Test.assert.isTrue(User.prototype.destroy === User2.prototype.destroy)
      Test.assert.isTrue(User2.prototype.destroy === User3.prototype.destroy)
    })
    it('should be tested')
  })
}
