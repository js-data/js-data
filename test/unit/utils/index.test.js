import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils', function () {
  it('has the right exports', function () {
    assert(utils)
    assert.equal(typeof utils.addHiddenPropsToTarget, 'function', 'has the addHiddenPropsToTarget method')
    assert.equal(typeof utils.classCallCheck, 'function', 'has the classCallCheck method')

    assert.equal(typeof utils.deepFillIn, 'function', 'has the deepFillIn method')
    assert.equal(typeof utils.deepMixIn, 'function', 'has the deepMixIn decorator')
    assert.equal(typeof utils.fillIn, 'function', 'has the fillIn method')
    
    assert.equal(typeof utils.eventify, 'function', 'has the eventify method')
    assert.equal(typeof utils.extend, 'function', 'has the extend method')
    assert.equal(typeof utils.findIndex, 'function', 'has the findIndex method')
    assert.equal(typeof utils.forEachRelation, 'function', 'has the forEachRelation method')
    assert.equal(typeof utils.forOwn, 'function', 'has the forOwn method')
    assert.equal(typeof utils.fromJson, 'function', 'has the fromJson method')
    assert.equal(typeof utils['get'], 'function', 'has the [\get\'] method')
    assert.equal(typeof utils.isBlacklisted, 'function', 'has the isBlacklisted method')

    assert.equal(typeof utils.logify, 'function', 'has the logify method')
    assert.equal(typeof utils.noDupeAdd, 'function', 'has the noDupeAdd method')
    assert.equal(typeof utils.omit, 'function', 'has the omit method')

    assert.equal(typeof utils.reject, 'function', 'has the reject method')
    assert.equal(typeof utils.remove, 'function', 'has the remove method')
    assert.equal(typeof utils.reject, 'function', 'has the reject method')
    assert.equal(typeof utils.resolve, 'function', 'has the resolve method')
    assert.equal(typeof utils.set, 'function', 'has the set method')
    assert.equal(typeof utils.toJson, 'function', 'has the toJson method')
    assert.equal(typeof utils.unset, 'function', 'has the unset method')
  })
})
