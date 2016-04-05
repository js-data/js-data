import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should check relation configuration', (t) => {
  let mapper = new JSData.Mapper({ name: 'foo' })
  let mapper2 = new JSData.Mapper({ name: 'bar' })

  t.throws(() => {
    JSData.belongsTo(mapper2, {
      foreignKey: 'm_id'
    })(mapper)
  }, Error, 'localField is required!')

  t.throws(() => {
    JSData.belongsTo(mapper2, {
      localField: 'm'
    })(mapper)
  }, Error, 'foreignKey is required!')

  t.throws(() => {
    JSData.belongsTo('mapper2', {
      localField: 'm',
      foreignKey: 'm_id'
    })(mapper)
  }, Error, 'you must provide a reference to the related mapper!')

  t.notThrows(() => {
    JSData.belongsTo('mapper2', {
      localField: 'm',
      foreignKey: 'm_id',
      getRelation () {
        return mapper2
      }
    })(mapper)
  })

  t.throws(() => {
    JSData.belongsTo(undefined, {
      localField: 'm',
      foreignKey: 'm_id'
    })(mapper)
  }, Error, 'no relation provided!')
})
test('should add property accessors to prototype of target and allow relation re-assignment using defaults', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKey: 'fooId'
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      belongsTo: {
        foo: {
          localField: 'foo',
          foreignKey: 'fooId'
        }
      }
    }
  })
  const foo = store.add('foo', { id: 1 })
  const foo2 = store.add('foo', { id: 2 })
  const bar = store.add('bar', { id: 1, fooId: 1 })
  const bar2 = store.add('bar', { id: 2, fooId: 1 })
  const bar3 = store.add('bar', { id: 3 })
  t.true(bar.foo === foo)
  t.true(bar2.foo === foo)
  t.notOk(bar3.foo)
  bar.foo = foo2
  bar3.foo = foo
  t.true(bar.foo === foo2)
  t.true(bar2.foo === foo)
  t.true(bar3.foo === foo)
})
test('should add property accessors to prototype of target and allow relation re-assignment using customizations', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKey: 'fooId'
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      belongsTo: {
        foo: {
          localField: '_foo',
          foreignKey: 'fooId'
        }
      }
    }
  })
  const foo = store.add('foo', { id: 1 })
  const foo2 = store.add('foo', { id: 2 })
  const bar = store.add('bar', { id: 1, fooId: 1 })
  const bar2 = store.add('bar', { id: 2, fooId: 1 })
  const bar3 = store.add('bar', { id: 3 })
  t.true(bar._foo === foo)
  t.true(bar2._foo === foo)
  t.notOk(bar3._foo)
  bar._foo = foo2
  bar3._foo = foo
  t.true(bar._foo === foo2)
  t.true(bar2._foo === foo)
  t.true(bar3._foo === foo)
})
test('should allow custom getter and setter', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKey: 'fooId'
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      belongsTo: {
        foo: {
          localField: '_foo',
          foreignKey: 'fooId',
          get: function (Relation, bar, originalGet) {
            getCalled++
            return originalGet()
          },
          set: function (Relation, bar, foo, originalSet) {
            setCalled++
            originalSet()
          }
        }
      }
    }
  })
  let getCalled = 0
  let setCalled = 0
  const foo = store.add('foo', { id: 1 })
  const foo2 = store.add('foo', { id: 2 })
  const bar = store.add('bar', { id: 1, fooId: 1 })
  const bar2 = store.add('bar', { id: 2, fooId: 1 })
  const bar3 = store.add('bar', { id: 3 })
  t.true(bar._foo === foo)
  t.true(bar2._foo === foo)
  t.notOk(bar3._foo)
  bar._foo = foo2
  bar3._foo = foo
  t.true(bar._foo === foo2)
  t.true(bar2._foo === foo)
  t.true(bar3._foo === foo)
  t.is(getCalled, 9)
  t.is(setCalled, 6)
})
