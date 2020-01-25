import { assert, JSData, sinon } from '../../_setup'
const utils = JSData.utils

describe('utils.resolve', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.resolve, 'function', 'has the resolve method')
  })

  it('returns a resolved promise with the specified value', function () {
    const spy = sinon.spy(utils.Promise, 'resolve')
    utils.resolve('test')
    assert(spy.withArgs('test').calledOnce)
    utils.Promise.resolve.restore()
  })
})

describe('utils.reject', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.reject, 'function', 'has the reject method')
  })

  it('returns a rejected promise with the specified err', function () {
    const spy = sinon.stub(utils.Promise, 'reject')
    utils.reject('rejecting for test')
    assert(spy.withArgs('rejecting for test').calledOnce)
    utils.Promise.reject.restore()
  })
})
