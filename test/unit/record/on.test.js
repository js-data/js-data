import { assert, JSData, sinon } from '../../_setup'

describe("Record#on('changes')", function() {
  it('Tracking changes to a single property', function(done) {
    const Store = new JSData.DataStore()
    const Foo = Store.defineMapper('foo', {
      schema: {
        properties: {
          id: { type: 'number' },
          name: { type: 'string', track: true }
        }
      },
    })
    const foo = Foo.createRecord()
    const listener = sinon.stub()
    foo.on('change', listener)
    foo.name = 'new foo'
    const secondSpec = function() {
      foo.name = 'updated foo'
      setTimeout(function () {
        const [record, changes] = listener.args[1]
        assert.equal(foo, record, "on 'change' listener called with record which was modified")
        assert.isTrue(listener.calledTwice, "on 'change' listener was called when modifying a property")
        assert.equal(Object.keys(changes.added).length, 0)
        assert.equal(Object.keys(changes.removed).length, 0)
        assert.equal(changes.changed.name, 'updated foo', "Only the property changed was emitted in the changeSet")
        done()
      }, 5)
    }
    setTimeout(function () {
      const [record, changes] = listener.args[0]
      assert.equal(foo, record, "on 'change' listener called with record which was modified")
      assert.isTrue(listener.calledOnce, "on 'change' listener was called when modifying a property")
      assert.equal(Object.keys(changes.changed).length, 0)
      assert.equal(Object.keys(changes.removed).length, 0)
      assert.equal(changes.added.name, 'new foo', "Only the property changed was emitted in the changeSet")
      secondSpec()
    }, 5)
  })
})
