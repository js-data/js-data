import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test.skip('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', (t) => {
  class Foo extends Model {}
  Foo.linkRelations = true
  class Bar extends Model {}
  Bar.linkRelations = true
  Foo.hasMany(Bar)
  Bar.belongsTo(Foo)
  const foo = Foo.inject({ id: 1 })
  const foo2 = Foo.inject({ id: 2 })
  t.context.objectsEqual(foo.barCollection, [])
  t.context.objectsEqual(foo2.barCollection, [])
  const bars = Bar.inject([{ fooId: 1, id: 1 }])
  const bars2 = Bar.inject([{ fooId: 2, id: 2 }])
  t.context.objectsEqual(foo.barCollection, bars)
  t.context.objectsEqual(foo2.barCollection, bars2)
  foo.barCollection = bars2
  foo2.barCollection = bars
  t.context.objectsEqual(foo2.barCollection, bars)
  t.context.objectsEqual(foo.barCollection, bars2)
})
test.skip('should add property accessors to prototype of target and allow relation re-assignment (localKeys)', (t) => {
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
  t.context.objectsEqual(foo.barCollection, [])
  t.context.objectsEqual(foo2.barCollection, [])
  const bars = Bar.inject([{ fooId: 1, id: 1 }])
  const bars2 = Bar.inject([{ fooId: 2, id: 2 }])
  t.context.objectsEqual(foo.barCollection, bars)
  t.context.objectsEqual(foo2.barCollection, bars2)
  foo.barCollection = bars2
  foo2.barCollection = bars
  t.context.objectsEqual(foo2.barCollection, bars)
  t.context.objectsEqual(foo.barCollection, bars2)
  t.context.objectsEqual(foo.bar_ids, [2])
  t.context.objectsEqual(foo2.bar_ids, [1])
})
test.skip('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', (t) => {
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
  t.context.objectsEqual(foo.barCollection, [])
  t.context.objectsEqual(foo2.barCollection, [])
  const bars = Bar.inject([{ foo_ids: [1], id: 1 }])
  const bars2 = Bar.inject([{ foo_ids: [2], id: 2 }])
  const bars3 = Bar.inject([{ id: 3 }])
  t.context.objectsEqual(foo.barCollection, bars)
  t.context.objectsEqual(foo2.barCollection, bars2)
  t.context.objectsEqual(foo3.barCollection, [])
  foo.barCollection = bars2
  foo2.barCollection = bars
  foo3.barCollection = bars3
  t.context.objectsEqual(foo2.barCollection, bars.concat(bars2))
  t.context.objectsEqual(foo.barCollection, bars.concat(bars2))
  t.context.objectsEqual(foo3.barCollection, bars3)
  t.context.objectsEqual(bars[0].foo_ids, [1, 2])
  t.context.objectsEqual(bars2[0].foo_ids, [2, 1])
  t.context.objectsEqual(bars3[0].foo_ids, [3])
})
test.skip('should allow custom getter and setter', (t) => {
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
  t.context.objectsEqual(foo._bars, [])
  t.context.objectsEqual(foo2._bars, [])
  const bars = Bar.inject([{ fooId: 1, id: 1 }])
  const bars2 = Bar.inject([{ fooId: 2, id: 2 }])
  t.context.objectsEqual(foo._bars, bars)
  t.context.objectsEqual(foo2._bars, bars2)
  foo._bars = bars2
  foo2._bars = bars
  t.is(bars2[0].fooId, foo.id)
  t.is(bars[0].fooId, foo2.id)
  t.context.objectsEqual(foo2._bars, bars)
  t.context.objectsEqual(foo._bars, bars2)
  t.is(getCalled, 8)
  t.is(setCalled, 2)
})
test.skip('should still allow re-assignment when linking is disabled', (t) => {
  class Foo extends Model {}
  class Bar extends Model {}
  Foo.hasMany(Bar, {
    localField: 'bars'
  })
  Bar.belongsTo(Foo)
  const foo = Foo.inject({ id: 1, bars: [{ id: 1 }] })
  const foo2 = Foo.inject({ id: 2, bars: [{ id: 2 }] })
  t.is(foo.bars.length, 1)
  t.is(foo2.bars.length, 1)
  foo.bars = [Bar.get(2)]
  foo2.bars = [Bar.get(1)]
  t.true(foo.bars[0] === Bar.get(2))
  t.true(foo2.bars[0] === Bar.get(1))
})
