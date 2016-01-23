export function init () {
  describe('#save', function () {
    it('should be an instance function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Model.prototype.save)
      let User = Test.JSData.Model.extend({}, {
        idAttribute: '_id',
        name: 'user'
      })
      class User2 extends Test.JSData.Model {}
      class User3 extends User2 {}
      Test.assert.isFunction(User.prototype.save)
      Test.assert.isFunction(User2.prototype.save)
      Test.assert.isTrue(Test.JSData.Model.prototype.save === User.prototype.save)
      Test.assert.isTrue(Test.JSData.Model.prototype.save === User2.prototype.save)
      Test.assert.isTrue(User.prototype.save === User2.prototype.save)
      Test.assert.isTrue(User2.prototype.save === User3.prototype.save)
    })
    it('should be tested')
  })
}
