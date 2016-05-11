import { assert, JSData, sinon } from '../../_setup'
const utils = JSData.utils

describe('utils.eventify', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.eventify, 'function', 'has the eventify method')
  })

  it('adds on, off, emit events to the specified target', function () {
    const user = { name: 'John' }
    assert.isUndefined(user.on)
    assert.isUndefined(user.emit)
    assert.isUndefined(user.off)
    utils.eventify(user)
    assert.isDefined(user.on)
    assert.isDefined(user.emit)
    assert.isDefined(user.off)

    const stub = sinon.stub()
    user.on('foo', stub)
    user.emit('foo', 1, 2)
    user.off('foo', 1, 2)
    assert(stub.calledOnce)
    assert.deepEqual(stub.firstCall.args, [1, 2])
  })
})
