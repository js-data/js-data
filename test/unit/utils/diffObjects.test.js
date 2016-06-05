import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.diffObjects', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.diffObjects, 'function', 'has the diffObjects method')
  })

  it('returns diff betwen two different objects', function () {
    const newObject = { name: 'John', age: 30, friends: 7 }
    const oldObject = { name: 'John', age: 90, id: 20 }
    const expected = {
      added: { friends: 7 },
      changed: { age: 30 },
      removed: { id: undefined }
    }
    const result = utils.diffObjects(newObject, oldObject)
    assert.deepEqual(result, expected)
  })

  it('returns diff betwen two equal objects', function () {
    const oldObject = { name: 'John', age: 90, friends: 7 }
    const newObject = { name: 'John', age: 90, friends: 7 }
    const expected = {
      added: {},
      changed: {},
      removed: {}
    }
    const result = utils.diffObjects(newObject, oldObject)
    assert.deepEqual(result, expected)
  })
})
