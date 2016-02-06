export function init () {
  describe('#skip', function () {
    it('should skip', function () {
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
            collection.skip(type)
          },
          TypeError,
          `skip: Expected number but found ${typeof type}!`,
          'should throw on unacceptable type'
        )
      })
      Test.assert.deepEqual(collection.skip(1), [
        { id: 2 },
        { id: 3 }
      ], 'should have skipped 1')
      Test.assert.deepEqual(collection.skip(2), [
        { id: 3 }
      ], 'should have skipped 2')
      Test.assert.deepEqual(collection.skip(3), [], 'should have skipped all')
      Test.assert.deepEqual(collection.skip(4), [], 'should have skipped all')
    })
    it('should skip and limit', function () {
      const Test = this
      const data = [
        { id: 2 },
        { id: 3 },
        { id: 5 },
        { id: 6 },
        { id: 4 },
        { id: 1 }
      ]
      const collection = new Test.JSData.Collection(data)
      Test.assert.deepEqual(collection.query().skip(1).limit(1).run(), [
        { id: 2 }
      ], 'should have skipped 1 and limited to 1')
      Test.assert.deepEqual(collection.query().skip(4).limit(2).run(), [
        { id: 5 },
        { id: 6 }
      ], 'should have skipped 4 and limited to 2')
      Test.assert.deepEqual(collection.query().skip(5).limit(3).run(), [
        { id: 6 }
      ], 'should have skipped 5 and limited to 3')
      Test.assert.deepEqual(collection.query().skip(1).limit(7).run(), [
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 }
      ], 'should have skipped 1 and limited to 5')
    })
  })
}
