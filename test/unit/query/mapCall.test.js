export function init () {
  describe('mapCall', function () {
    it('should work', function () {
      const Test = this
      const collection = Test.PostCollection
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      const p5 = Test.data.p5

      Test.store.add('post', [p1, p2, p3, p4, p5])
      const values = collection.query().map(function (post) {
        return post.age === 33
      }).run()
      Test.assert.deepEqual(values, [false, false, false, true, true])
    })
  })
}
