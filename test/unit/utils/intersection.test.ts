import { assert, JSData } from '../../_setup'

const utils = JSData.utils

describe('utils.intersection', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.isArray, 'function', 'has the intersection method')
  })

  it('intersects two arrays', () => {
    const arrA = ['green', 'red', 'blue', 'red']
    const arrB = ['green', 'yellow', 'red']
    const result = utils.intersection(arrA, arrB)
    assert.lengthOf(result, 2, 'should contain 2 items')
    assert.includeMembers(result, ['green', 'red'])
  })

  it('intersect returns empty array when argument is undefined', () => {
    const arrA = ['green', 'red', 'blue']
    const arrB = undefined
    const result = utils.intersection(arrA, arrB)
    const result2 = utils.intersection(arrB, arrA)
    assert.isArray(result)
    assert.lengthOf(result, 0, 'should be empty')
    assert.isArray(result2)
    assert.lengthOf(result2, 0, 'should be empty')
  })
})
