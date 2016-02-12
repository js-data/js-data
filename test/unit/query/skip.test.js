export function init () {
  describe('skip', function () {
    it('should correctly apply "skip" predicates', function () {
      const Test = this
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      Test.store.add('post', [p1, p2, p3, p4])
      let params = {
        skip: 1
      }

      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p2, p3, p4], 'should skip 1')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).run(), [p2, p3, p4], 'should skip 1')

      params.skip = 2
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p3, p4], 'should skip 2')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).run(), [p3, p4], 'should skip 2')

      params.skip = 3
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [p4], 'should skip 3')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).run(), [p4], 'should skip 3')

      params.skip = 4
      Test.assert.objectsEqual(Test.store.query('post').filter(params).run(), [], 'should skip 4')
      Test.assert.objectsEqual(Test.store.query('post').skip(params.skip).run(), [], 'should skip 4')
    })
  })
}
