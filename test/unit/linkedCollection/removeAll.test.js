export function init () {
  describe('#removeAll', function () {
    it('should eject items that meet the criteria from the store', function () {
      const Test = this
      Test.User.debug = true
      Test.UserCollection.add([Test.data.p1, Test.data.p2, Test.data.p3, Test.data.p4, Test.data.p5])
      Test.assert.isDefined(Test.UserCollection.get(5))
      Test.assert.isDefined(Test.UserCollection.get(6))
      Test.assert.isDefined(Test.UserCollection.get(7))
      Test.assert.isDefined(Test.UserCollection.get(8))
      Test.assert.isDefined(Test.UserCollection.get(9))
      Test.assert.doesNotThrow(function () {
        Test.UserCollection.removeAll({ where: { author: 'Adam' } })
      })
      Test.assert.isDefined(Test.UserCollection.get(5))
      Test.assert.isDefined(Test.UserCollection.get(6))
      Test.assert.isDefined(Test.UserCollection.get(7))
      Test.assert.isUndefined(Test.UserCollection.get(8))
      Test.assert.isUndefined(Test.UserCollection.get(9))
    })
    it('should eject all items from the store', function () {
      const Test = this
      Test.PostCollection.add([Test.data.p1, Test.data.p2, Test.data.p3, Test.data.p4])

      Test.assert.objectsEqual(Test.PostCollection.get(5), Test.data.p1)
      Test.assert.objectsEqual(Test.PostCollection.get(6), Test.data.p2)
      Test.assert.objectsEqual(Test.PostCollection.get(7), Test.data.p3)
      Test.assert.objectsEqual(Test.PostCollection.get(8), Test.data.p4)

      Test.assert.doesNotThrow(function () {
        Test.PostCollection.removeAll()
      })

      Test.assert.isUndefined(Test.PostCollection.get(5))
      Test.assert.isUndefined(Test.PostCollection.get(6))
      Test.assert.isUndefined(Test.PostCollection.get(7))
      Test.assert.isUndefined(Test.PostCollection.get(8))
    })
  })
}
