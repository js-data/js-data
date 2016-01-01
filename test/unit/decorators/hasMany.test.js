/* global Model:true, JSData:true */
import {assert} from 'chai'

export function init () {
  describe('hasMany', function () {
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
      const bars = Bar.inject([{ foo_id: 1, id: 1 }])
      const bars2 = Bar.inject([{ foo_id: 2, id: 2 }])
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
      const bars = Bar.inject([{ foo_id: 1, id: 1 }])
      const bars2 = Bar.inject([{ foo_id: 2, id: 2 }])
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
  })
}
