import { assert, JSData, sinon } from '../../_setup'

it('should work', function () {
  assert.equal(typeof JSData.Component, 'function', 'should be a function')
  const component = new JSData.Component()
  assert(component instanceof JSData.Component, 'component should be an instance')
  assert.deepEqual(component._listeners, {})
  const stub = sinon.stub()
  component.on('foo', stub)
  component.emit('foo', 1, 2)
  assert(stub.calledOnce)
  assert.deepEqual(stub.firstCall.args, [1, 2])
})
