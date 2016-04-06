import { assert } from '../../_setup'

describe('Query#map', function () {
  it('should work', function () {
    const collection = this.PostCollection
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    const p5 = this.data.p5

    this.store.add('post', [p1, p2, p3, p4, p5])
    const ids = collection.query().map(function (post) {
      return post.id
    }).run()
    assert.deepEqual(ids, [5, 6, 7, 8, 9])
  })
})
