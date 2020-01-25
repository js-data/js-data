import { assert } from '../../_setup'

describe('Query#limit', function () {
  it('should correctly apply "limit" predicates', function () {
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    this.store.add('post', [p1, p2, p3, p4])
    const params = {
      limit: 1
    }

    assert.objectsEqual(this.store.query('post').filter(params).run(), [p1], 'should limit to 1')
    assert.objectsEqual(this.store.query('post').limit(params.limit).run(), [p1], 'should limit to 1')

    params.limit = 2
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p1, p2], 'should limit to 2')
    assert.objectsEqual(this.store.query('post').limit(params.limit).run(), [p1, p2], 'should limit to 2')

    params.limit = 3
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p1, p2, p3], 'should limit to 3')
    assert.objectsEqual(this.store.query('post').limit(params.limit).run(), [p1, p2, p3], 'should limit to 3')

    params.limit = 4
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should limit to 4')
    assert.objectsEqual(this.store.query('post').limit(params.limit).run(), [p1, p2, p3, p4], 'should limit to 4')
  })
  it('should correctly apply "limit" and "skip" predicates together', function () {
    const p1 = this.data.p1
    const p2 = this.data.p2
    const p3 = this.data.p3
    const p4 = this.data.p4
    this.store.add('post', [p1, p2, p3, p4])
    const params = {
      limit: 1,
      skip: 1
    }

    assert.objectsEqual(this.store.query('post').filter(params).run(), [p2], 'should limit to 1 and skip 2')
    assert.objectsEqual(this.store.query('post').skip(params.skip).limit(params.limit).run(), [p2], 'should limit to 1 and skip 2')

    params.limit = 2
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p2, p3], 'should limit to 2 and skip 1')
    assert.objectsEqual(this.store.query('post').skip(params.skip).limit(params.limit).run(), [p2, p3], 'should limit to 2 and skip 1')

    params.skip = 2
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p3, p4], 'should limit to 2 and skip 2')
    assert.objectsEqual(this.store.query('post').skip(params.skip).limit(params.limit).run(), [p3, p4], 'should limit to 2 and skip 2')

    params.limit = 1
    params.skip = 3
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p4], 'should limit to 1 and skip 3')
    assert.objectsEqual(this.store.query('post').skip(params.skip).limit(params.limit).run(), [p4], 'should limit to 1 and skip 3')

    params.limit = 8
    params.skip = 0
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should return all items')
    assert.objectsEqual(this.store.query('post').skip(params.skip).limit(params.limit).run(), [p1, p2, p3, p4], 'should return all items')

    params.limit = 1
    params.skip = 5
    assert.objectsEqual(this.store.query('post').filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
    assert.objectsEqual(this.store.query('post').skip(params.skip).limit(params.limit).run(), [], 'should return nothing if skip if greater than the number of items')

    params.limit = 8
    delete params.skip
    assert.objectsEqual(this.store.query('post').filter(params).run(), [p1, p2, p3, p4], 'should return all items')
    assert.throws(() => {
      this.store.query('post').skip(params.skip).limit(params.limit).run()
    }, Error, `[Query#skip:num] expected: number, found: ${typeof value}\nhttp://www.js-data.io/v3.0/docs/errors#400`)

    delete params.limit
    params.skip = 5
    assert.objectsEqual(this.store.query('post').filter(params).run(), [], 'should return nothing if skip if greater than the number of items')
    assert.throws(() => {
      this.store.query('post').skip(params.skip).limit(params.limit).run()
    }, Error, `[Query#limit:num] expected: number, found: ${typeof value}\nhttp://www.js-data.io/v3.0/docs/errors#400`)
  })
})
