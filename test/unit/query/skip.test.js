import { assert } from '../../_setup'

describe('Query#skip', function () {
  it('should correctly apply "skip" predicates', function () {
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    this.store.add('post', [p1, p2, p3, p4])
    const params = {
      skip: 1
    }

    assert.objectsEqual(this.store.query('post').filter(params).run(), [p2, p3, p4], 'should skip 1')
    assert.objectsEqual(this.store.query('post').skip(params.skip).run(), [p2, p3, p4], 'should skip 1')

    params.skip = 2
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p3, p4], 'should skip 2')
    assert.objectsEqual(this.store.query('post').skip(params.skip).run(), [p3, p4], 'should skip 2')

    params.skip = 3
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p4], 'should skip 3')
    assert.objectsEqual(this.store.query('post').skip(params.skip).run(), [p4], 'should skip 3')

    params.skip = 4
    assert.objectsEqual(this.store.query('post').filter(params).run(), [], 'should skip 4')
    assert.objectsEqual(this.store.query('post').skip(params.skip).run(), [], 'should skip 4')
  })
})
