/* global Model:true, JSData:true */
import {assert} from 'chai'

export function init () {
  describe.skip('hasMany', function () {
    it('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', function () {
      class Foo extends Model {}
      Foo.linkRelations = true
      class Bar extends Model {}
      Bar.linkRelations = true
      Foo.hasMany(Bar)
      Bar.belongsTo(Foo)
      const foo = Foo.inject({ id: 1 })
      const foo2 = Foo.inject({ id: 2 })
      assert.deepEqual(foo.barCollection, [])
      assert.deepEqual(foo2.barCollection, [])
      const bars = Bar.inject([{ fooId: 1, id: 1 }])
      const bars2 = Bar.inject([{ fooId: 2, id: 2 }])
      assert.deepEqual(foo.barCollection, bars)
      assert.deepEqual(foo2.barCollection, bars2)
      foo.barCollection = bars2
      foo2.barCollection = bars
      assert.deepEqual(foo2.barCollection, bars)
      assert.deepEqual(foo.barCollection, bars2)
    })
    it('should add property accessors to prototype of target and allow relation re-assignment (localKeys)', function () {
      class Foo extends Model {}
      Foo.linkRelations = true
      class Bar extends Model {}
      Bar.linkRelations = true
      Foo.hasMany(Bar, {
        localKeys: 'bar_ids'
      })
      Bar.belongsTo(Foo)
      const foo = Foo.inject({ id: 1, bar_ids: [1] })
      const foo2 = Foo.inject({ id: 2, bar_ids: [2] })
      assert.deepEqual(foo.barCollection, [])
      assert.deepEqual(foo2.barCollection, [])
      const bars = Bar.inject([{ fooId: 1, id: 1 }])
      const bars2 = Bar.inject([{ fooId: 2, id: 2 }])
      assert.deepEqual(foo.barCollection, bars)
      assert.deepEqual(foo2.barCollection, bars2)
      foo.barCollection = bars2
      foo2.barCollection = bars
      assert.deepEqual(foo2.barCollection, bars)
      assert.deepEqual(foo.barCollection, bars2)
      assert.deepEqual(foo.bar_ids, [2])
      assert.deepEqual(foo2.bar_ids, [1])
    })
    it('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', function () {
      class Foo extends Model {}
      Foo.linkRelations = true
      class Bar extends Model {}
      Bar.linkRelations = true
      Foo.hasMany(Bar, {
        foreignKeys: 'foo_ids'
      })
      Bar.belongsTo(Foo)
      const foo = Foo.inject({ id: 1 })
      const foo2 = Foo.inject({ id: 2 })
      const foo3 = Foo.inject({ id: 3 })
      assert.deepEqual(foo.barCollection, [])
      assert.deepEqual(foo2.barCollection, [])
      const bars = Bar.inject([{ foo_ids: [1], id: 1 }])
      const bars2 = Bar.inject([{ foo_ids: [2], id: 2 }])
      const bars3 = Bar.inject([{ id: 3 }])
      assert.deepEqual(foo.barCollection, bars)
      assert.deepEqual(foo2.barCollection, bars2)
      assert.deepEqual(foo3.barCollection, [])
      foo.barCollection = bars2
      foo2.barCollection = bars
      foo3.barCollection = bars3
      assert.deepEqual(foo2.barCollection, bars.concat(bars2))
      assert.deepEqual(foo.barCollection, bars.concat(bars2))
      assert.deepEqual(foo3.barCollection, bars3)
      assert.deepEqual(bars[0].foo_ids, [1, 2])
      assert.deepEqual(bars2[0].foo_ids, [2, 1])
      assert.deepEqual(bars3[0].foo_ids, [3])
    })
    it('should allow custom getter and setter', function () {
      class Foo extends Model {}
      Foo.linkRelations = true
      class Bar extends Model {}
      Bar.linkRelations = true
      let getCalled = 0
      let setCalled = 0
      Foo.hasMany(Bar, {
        foreignKey: 'fooId',
        localField: '_bars',
        get: function (Model, Relation, foo, originalGet) {
          getCalled++
          return originalGet()
        },
        set: function (Model, Relation, foo, bars, originalSet) {
          setCalled++
          originalSet()
        }
      })
      Bar.belongsTo(Foo, {
        foreignKey: 'fooId'
      })
      const foo = Foo.inject({ id: 1 })
      const foo2 = Foo.inject({ id: 2 })
      assert.deepEqual(foo._bars, [])
      assert.deepEqual(foo2._bars, [])
      const bars = Bar.inject([{ fooId: 1, id: 1 }])
      const bars2 = Bar.inject([{ fooId: 2, id: 2 }])
      assert.deepEqual(foo._bars, bars)
      assert.deepEqual(foo2._bars, bars2)
      foo._bars = bars2
      foo2._bars = bars
      assert.equal(bars2[0].fooId, foo.id)
      assert.equal(bars[0].fooId, foo2.id)
      assert.deepEqual(foo2._bars, bars)
      assert.deepEqual(foo._bars, bars2)
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
      foo.bars = [Bar.get(2)]
      foo2.bars = [Bar.get(1)]
      assert.isTrue(foo.bars[0] === Bar.get(2))
      assert.isTrue(foo2.bars[0] === Bar.get(1))
    })
  })
}
