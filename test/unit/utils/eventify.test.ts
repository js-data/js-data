import { assert, JSData, sinon } from '../../_setup'

const utils = JSData.utils

describe('utils.eventify', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.eventify, 'function', 'has the eventify method')
  })

  it('adds on, off, emit events to the specified target', () => {
    const user: any = { name: 'John' }
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
