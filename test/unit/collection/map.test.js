export function init () {
  describe('#map', function () {
    it('should map', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      const ctx = {}
      const mapping = collection.map(function (item) {
        Test.assert.isTrue(this === ctx, 'should have correct context')
        return item.id
      }, ctx)
      Test.assert.isTrue(mapping.indexOf(1) !== -1)
      Test.assert.isTrue(mapping.indexOf(2) !== -1)
      Test.assert.isTrue(mapping.indexOf(3) !== -1)
      Test.assert.equal(mapping.length, 3)
    })
  })
}
