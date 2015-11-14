/* global Resource:true */
import {assert} from 'chai'

let isBrowser = false

try {
  isBrowser = !!window
} catch (e) {
}

const defaults = {
  autoInject: isBrowser,
  bypassCache: false,
  csp: false,
  defaultAdapter: 'http',
  eagerEject: false,
  idAttribute: 'id',
  linkRelations: isBrowser,
  relationsEnumerable: false,
  returnMeta: false,
  strategy: 'single',
  useFilter: true
}

export function init () {
  describe('Resource', function () {
    it('should be a constructor function', function () {
      assert.isFunction(Resource, 'should be a function')
      let instance = new Resource()
      assert.isTrue(instance instanceof Resource, 'instance should be an instance')
      instance = new Resource({ foo: 'bar' })
      assert.deepEqual(instance, { foo: 'bar' }, 'instance should get initialization properties')
    })
    it('should have the correct static defaults', function () {
      for (var key in defaults) {
        assert.equal(Resource[key], defaults[key], key + ' should be ' + defaults[key])
      }
    })
    it('child should inherit static defaults', function () {
      let Child = Resource.extend()
      for (var key in defaults) {
        assert.equal(Child[key], defaults[key], key + ' should be ' + defaults[key])
      }
    })
    it('child should override static defaults', function () {
      let Child = Resource.extend({}, {
        idAttribute: '_id'
      })
      for (var key in defaults) {
        if (key === 'idAttribute') {
          assert.equal(Child.idAttribute, '_id', 'should be "_id"')
        } else {
          assert.equal(Child[key], defaults[key], key + ' should be ' + defaults[key])
        }
      }
    })
  })
}
