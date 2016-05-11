import { assert } from '../../_setup'

describe('Query#forEach', function () {
  it('should work', function () {
    const collection = this.PostCollection
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    const p5 = this.data.p5

    this.store.add('post', [p1, p2, p3, p4, p5])
    let count = 0
    collection.query().forEach(function () {
      count++
    }).run()
    assert.equal(count, 5)
  })
})
