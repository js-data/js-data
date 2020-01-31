import { assert, JSData } from '../../_setup'
import { productSchema } from './_productSchema'

describe('Schema.apply', () => {
  it('has the right exports', () => {
    assert.isFunction(JSData.Schema.prototype.apply)
  })

  it('applies a property descriptor to the specified property', () => {
    class Thing extends JSData.Settable {}

    const schema = new JSData.Schema(productSchema)
    schema.apply(Thing.prototype)

    JSData.utils.forOwn(productSchema.properties, (_schema, prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(Thing.prototype, prop)
      assert.equal(!!descriptor.writable, false)
      assert.equal(descriptor.enumerable, true)
      assert.equal(descriptor.configurable, true)
      assert.equal(typeof descriptor.get, 'function')
      assert.equal(typeof descriptor.set, 'function')
    })
  })
})
