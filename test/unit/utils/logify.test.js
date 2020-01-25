import { assert, JSData, sinon } from '../../_setup'
const utils = JSData.utils

describe('utils.logify', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.logify, 'function', 'has the logify method')
  })

  it('adds hidden dbg and log methods to target', function () {
    const user = { name: 'John' }
    assert.isUndefined(user.dbg)
    assert.isUndefined(user.log)
    utils.logify(user)
    assert.isDefined(user.dbg)
    assert.isDefined(user.log)
  })

  it('logs message to the console with the specified log level', function () {
    const user = { name: 'John' }
    const infoStub = sinon.stub(console, 'info')
    const logStub = sinon.stub(console, 'log')
    utils.logify(user)
    user.log('info', 'test log info')
    assert(infoStub.calledOnce, 'logged using console.info')
    user.log('notvalid', 'test log info')
    assert(logStub.calledOnce, 'invalid log level uses `console.log`')
    infoStub.restore()
    logStub.restore()
  })

  it('logs debug messages only when `this.debug` is true', function () {
    const user = { name: 'John' }
    const prev = console.debug
    console.debug = sinon.stub()
    utils.logify(user)
    user.dbg('test dbg')
    user.log('debug')
    user.log('debug', 'test log debug')
    assert(console.debug.notCalled, 'debug was not called')
    user.debug = true
    user.dbg('test dbg')
    user.log('debug', 'test log debug')
    assert(console.debug.calledTwice, 'expected one call to console.debug')
    console.debug = prev
  })
})
