import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.forOwn', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.forOwn, 'function', 'has the forOwn method')
  })

  it('executes a given callback for each enumerable property of an object', function () {
    const user = { name: 'John', age: 20, log: () => { } }
    const expectedProps = ['name', 'age', 'log']
    const actualProps = []
    utils.addHiddenPropsToTarget(user, { spy: true })
    utils.forOwn(user, function (value, key) {
      actualProps.push(key)
    })
    assert.deepEqual(expectedProps, actualProps)
  })
})
