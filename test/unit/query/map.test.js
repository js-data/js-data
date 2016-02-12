export function init () {
  describe('map', function () {
    it('should work', function () {
      const Test = this
      const collection = Test.PostCollection
      const p1 = Test.data.p1
      const p2 = Test.data.p2
      const p3 = Test.data.p3
      const p4 = Test.data.p4
      const p5 = Test.data.p5

      Test.store.add('post', [p1, p2, p3, p4, p5])
      const ids = collection.query().map(function (post) {
        return post.id
      }).run()
      Test.assert.deepEqual(ids, [5, 6, 7, 8, 9])
    })
  })
}