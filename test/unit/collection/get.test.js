export function init () {
  describe('get', function () {
    it('should get an item from the collection', function () {
      const Test = this
      const user = Test.UserCollection.add({ id: 1 })
      Test.assert.isTrue(Test.UserCollection.get(1) === user, 'should get the user from the collection')
      Test.assert.isUndefined(Test.UserCollection.get(2), 'should return undefined if the item is not in the collection')
    })
  })
}
