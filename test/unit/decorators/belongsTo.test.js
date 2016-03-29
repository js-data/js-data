import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test.skip('should add property accessors to prototype of target and allow relation re-assignment using defaults', (t) => {
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
  t.true(bar.foo === foo)
  t.true(bar2.foo === foo)
  t.notOk(bar3.foo)
  bar.foo = foo2
  bar3.foo = foo
  t.true(bar.foo === foo2)
  t.true(bar2.foo === foo)
  t.true(bar3.foo === foo)
})
test.skip('should add property accessors to prototype of target and allow relation re-assignment using customizations', (t) => {
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
  t.true(bar._foo === foo)
  t.true(bar2._foo === foo)
  t.notOk(bar3._foo)
  bar._foo = foo2
  bar3._foo = foo
  t.true(bar._foo === foo2)
  t.true(bar2._foo === foo)
  t.true(bar3._foo === foo)
})
test.skip('should allow custom getter and setter', (t) => {
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
  t.true(bar._foo === foo)
  t.true(bar2._foo === foo)
  t.notOk(bar3._foo)
  bar._foo = foo2
  bar3._foo = foo
  t.true(bar._foo === foo2)
  t.true(bar2._foo === foo)
  t.true(bar3._foo === foo)
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
  Bar.get(1).foo = foo2
  Bar.get(2).foo = foo
  t.true(Bar.get(1).foo === foo2)
  t.true(Bar.get(2).foo === foo)
})
