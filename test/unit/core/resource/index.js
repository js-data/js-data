/* global Resource:true, configure:true */
import {assert} from 'chai'
import * as inject from './inject.test'

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
      var key
      let Child = Resource.extend()
      for (key in defaults) {
        assert.equal(Child[key], defaults[key], key + ' should be ' + defaults[key])
      }
      class Child2 extends Resource {}
      for (key in defaults) {
        assert.equal(Child2[key], defaults[key], key + ' should be ' + defaults[key])
      }
    })
    it('child should override static defaults', function () {
      /**
       * ES5 ways of creating a new Resource
       */
      let Child = Resource.extend({}, {
        idAttribute: '_id'
      })

      // Not yet implemented in v3
      // let Child2 = store.defineResource({
      //   idAttribute: '_id'
      // })

      /**
       * ES6 ways of creating a new Resource
       */
      class Child3 extends Resource {}
      configure({
        idAttribute: '_id'
      })(Child3)

      class Child4 extends Resource {}
      Child4.configure({
        idAttribute: '_id'
      })

     /**
       * ES7 way of creating a new Resource
       */
      // Doesn't work right now because of https://github.com/babel/babel/issues/2645
      // @configure({
      //   idAttribute: '_id'
      // })
      // class Child5 extends Resource {}

      check(Child)
      // check(Child2)
      check(Child3)
      check(Child4)
      // check(Child5)

      function check (Class) {
        for (var key in defaults) {
          if (key === 'idAttribute') {
            assert.equal(Class.idAttribute, '_id', 'should be "_id"')
          } else {
            assert.equal(Class[key], defaults[key], key + ' should be ' + defaults[key])
          }
        }
      }
    })
    it('should allow schema definition with basic indexes', function () {
      class Child extends Resource {}
      Child.schema({
        id: {},
        age: { indexed: true },
        role: { indexed: true }
      })
      Child.inject([
        { id: 2, age: 18, role: 'admin' },
        { id: 3, age: 19, role: 'dev' },
        { id: 9, age: 19, role: 'admin' },
        { id: 6, age: 19, role: 'owner' },
        { id: 4, age: 22, role: 'dev' },
        { id: 1, age: 23, role: 'owner' }
      ])
      assert.deepEqual(
        Child.getAll(19, { index: 'age' }),
        [
          { id: 3, age: 19, role: 'dev' },
          { id: 6, age: 19, role: 'owner' },
          { id: 9, age: 19, role: 'admin' }
        ],
        'should have found all of age:19 using 1 keyList'
      )
    })

    inject.init()
  })
}
