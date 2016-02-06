export function init () {
  describe('#limit', function () {
    it('should correctly apply "limit" predicates', function () {
      const Test = this
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      Test.store.add('post', [p1, p2, p3, p4])
      let params = {
        limit: 1
      }

      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p1], 'should limit to 1')
      Test.assert.objectsEqual(Test.store.query('post').limit(params.limit).run(), [p1], 'should limit to 1')

      params.limit = 2
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p1, p2], 'should limit to 2')
      Test.assert.objectsEqual(Test.store.query('post').limit(params.limit).run(), [p1, p2], 'should limit to 2')

      params.limit = 3
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p1, p2, p3], 'should limit to 3')
      Test.assert.objectsEqual(Test.store.query('post').limit(params.limit).run(), [p1, p2, p3], 'should limit to 3')

      params.limit = 4
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should limit to 4')
      Test.assert.objectsEqual(Test.store.query('post').limit(params.limit).run(), [p1, p2, p3, p4], 'should limit to 4')
    })
    it('should correctly apply "limit" and "skip" predicates together', function () {
      const Test = this
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      Test.store.add('post', [p1, p2, p3, p4])
      let params = {
        limit: 1,
        skip: 1
      }

      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p2], 'should limit to 1 and skip 2')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).limit(params.limit).run(), [p2], 'should limit to 1 and skip 2')

      params.limit = 2
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p2, p3], 'should limit to 2 and skip 1')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).limit(params.limit).run(), [p2, p3], 'should limit to 2 and skip 1')

      params.skip = 2
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p3, p4], 'should limit to 2 and skip 2')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).limit(params.limit).run(), [p3, p4], 'should limit to 2 and skip 2')

      params.limit = 1
      params.skip = 3
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p4], 'should limit to 1 and skip 3')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).limit(params.limit).run(), [p4], 'should limit to 1 and skip 3')

      params.limit = 8
      params.skip = 0
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should return all items')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).limit(params.limit).run(), [p1, p2, p3, p4], 'should return all items')

      params.limit = 1
      params.skip = 5
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).limit(params.limit).run(), [], 'should return nothing if skip if greater than the number of items')

      params.limit = 8
      delete params.skip
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should return all items')
      Test.assert.throws(function () {
        Test.store.query('post').skip(params.skip).limit(params.limit).run()
      }, TypeError, 'skip: Expected number but found undefined!', 'skip() should throw error if "num" is not a number')

      delete params.limit
      params.skip = 5
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
      Test.assert.throws(function () {
        Test.store.query('post').skip(params.skip).limit(params.limit).run()
      }, TypeError, 'limit: Expected number but found undefined!', 'limit() should throw error if "num" is not a number')
    })
  })
}
