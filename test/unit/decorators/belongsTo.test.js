/* global Model:true, JSData:true */
import {assert} from 'chai'

export function init () {
  describe.skip('belongsTo', function () {
    it('should add property accessors to prototype of target and allow relation re-assignment using defaults', function () {
      class Foo extends Model {}
      Foo.linkRelations = true
      class Bar extends Model {}
      Bar.linkRelations = true
      Bar.belongsTo(Foo)
      const foo = Foo.inject({ id: 1 })
      const foo2 = Foo.inject({ id: 2 })
      const bar = Bar.inject({ id: 1, fooId: 1 })
      const bar2 = Bar.inject({ id: 2, fooId: 1 })
      const bar3 = Bar.inject({ id: 3 })
      assert.isTrue(bar.foo === foo)
      assert.isTrue(bar2.foo === foo)
      assert.isUndefined(bar3.foo)
      bar.foo = foo2
      bar3.foo = foo
      assert.isTrue(bar.foo === foo2)
      assert.isTrue(bar2.foo === foo)
      assert.isTrue(bar3.foo === foo)
    })
    it('should add property accessors to prototype of target and allow relation re-assignment using customizations', function () {
      class Foo extends Model {}
      Foo.linkRelations = true
      class Bar extends Model {}
      Bar.linkRelations = true
      Bar.belongsTo(Foo, {
        localField: '_foo',
        foreignKey: 'fooId'
      })
      const foo = Foo.inject({ id: 1 })
      const foo2 = Foo.inject({ id: 2 })
      const bar = Bar.inject({ id: 1, fooId: 1 })
      const bar2 = Bar.inject({ id: 2, fooId: 1 })
      const bar3 = Bar.inject({ id: 3 })
      assert.isTrue(bar._foo === foo)
      assert.isTrue(bar2._foo === foo)
      assert.isUndefined(bar3._foo)
      bar._foo = foo2
      bar3._foo = foo
      assert.isTrue(bar._foo === foo2)
      assert.isTrue(bar2._foo === foo)
      assert.isTrue(bar3._foo === foo)
    })
    it('should allow custom getter and setter', function () {
      class Foo extends Model {}
      Foo.linkRelations = true
      class Bar extends Model {}
      Bar.linkRelations = true
      let getCalled = 0
      let setCalled = 0
      Bar.belongsTo(Foo, {
        localField: '_foo',
        foreignKey: 'fooId',
        get: function (Model, Relation, bar, originalGet) {
          getCalled++
          return originalGet()
        },
        set: function (Model, Relation, bar, foo, originalSet) {
          setCalled++
          originalSet()
        }
      })
      const foo = Foo.inject({ id: 1 })
      const foo2 = Foo.inject({ id: 2 })
      const bar = Bar.inject({ id: 1, fooId: 1 })
      const bar2 = Bar.inject({ id: 2, fooId: 1 })
      const bar3 = Bar.inject({ id: 3 })
      assert.isTrue(bar._foo === foo)
      assert.isTrue(bar2._foo === foo)
      assert.isUndefined(bar3._foo)
      bar._foo = foo2
      bar3._foo = foo
      assert.isTrue(bar._foo === foo2)
      assert.isTrue(bar2._foo === foo)
      assert.isTrue(bar3._foo === foo)
      assert.equal(getCalled, 8)
      assert.equal(setCalled, 2)
    })
    it('should still allow re-assignment when linking is disabled', function () {
      class Foo extends Model {}
      class Bar extends Model {}
      Foo.hasMany(Bar, {
        localField: 'bars'
      })
      Bar.belongsTo(Foo)
      const foo = Foo.inject({ id: 1, bars: [{ id: 1 }] })
      const foo2 = Foo.inject({ id: 2, bars: [{ id: 2 }] })
      assert.equal(foo.bars.length, 1)
      assert.equal(foo2.bars.length, 1)
      Bar.get(1).foo = foo2
      Bar.get(2).foo = foo
      assert.isTrue(Bar.get(1).foo === foo2)
      assert.isTrue(Bar.get(2).foo === foo)
    })
  })
}
