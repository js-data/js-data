/* global Resource:true */
import {assert} from 'chai'

export function init () {
  describe('inject', function () {
    it('should a static function', function () {
      assert.isFunction(Resource.inject)
      let Child = Resource.extend({}, {
        idAttribute: '_id'
      })
      class Child2 extends Resource {}
      class Child3 extends Child2 {}
      assert.isFunction(Child.inject)
      assert.isFunction(Child2.inject)
      assert.isTrue(Resource.inject === Child.inject)
      assert.isTrue(Resource.inject === Child2.inject)
      assert.isTrue(Child.inject === Child2.inject)
      assert.isTrue(Child2.inject === Child3.inject)
    })
    it('should inject new items into the store', function () {
      class Child extends Resource {}
      Child.schema({ id: {} })

      const child = Child.inject({ id: 1 })
      const children = Child.inject([{ id: 2 }, { id: 3 }])
      assert.isTrue(Child.get(1) === child)
      assert.deepEqual(Child.between([2], [3], {
        rightInclusive: true
      }), children)
    })
    it('should inject existing items into the store', function () {
      class Child extends Resource {}
      Child.schema({ id: {} })

      const child = Child.inject({ id: 1 })
      const children = Child.inject([{ id: 2 }, { id: 3 }])
      const childAgain = Child.inject({ id: 1 })
      const childrenAgain = Child.inject([{ id: 2 }, { id: 3 }])
      assert.isTrue(Child.get(1) === child, 'original reference should still be valid')
      assert.isTrue(Child.get(1) === childAgain, 'new reference should be valid')
      assert.isTrue(child === childAgain, 'both references should point to the same object')
      assert.deepEqual(Child.between([2], [3], {
        rightInclusive: true
      }), children, 'injection of array should work')
      assert.deepEqual(Child.between([2], [3], {
        rightInclusive: true
      }), childrenAgain, 're-inject of array should work')
      assert.deepEqual(children, childrenAgain, 'inject arrays should be equal')
    })
  })
}
