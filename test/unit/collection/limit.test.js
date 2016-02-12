export function init () {
  describe('skip', function () {
    it('should limit', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      Test.TYPES_EXCEPT_NUMBER.forEach(function (type) {
        Test.assert.throws(
          function () {
            collection.limit(type)
          },
          TypeError,
          `limit: Expected number but found ${typeof type}!`,
          'should throw on unacceptable type'
        )
      })
      Test.assert.deepEqual(collection.limit(1), [
        { id: 1 }
      ], 'should have limited to 1')
      Test.assert.deepEqual(collection.limit(2), [
        { id: 1 },
        { id: 2 }
      ], 'should have limited to 2')
      Test.assert.deepEqual(collection.limit(3), [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ], 'should have limited to 3')
      Test.assert.deepEqual(collection.limit(4), [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ], 'should have limited none')
    })
  })
}
