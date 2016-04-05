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
    JSData.hasMany(mapper2, {
      foreignKey: 'm_id'
    })(mapper)
  }, Error, 'localField is required!')

  t.throws(() => {
    JSData.hasMany(mapper2, {
      localField: 'm'
    })(mapper)
  }, Error, 'one of (foreignKey, localKeys, foreignKeys) is required!')

  t.throws(() => {
    JSData.hasMany('mapper2', {
      localField: 'm',
      foreignKey: 'm_id'
    })(mapper)
  }, Error, 'you must provide a reference to the related mapper!')

  t.notThrows(() => {
    JSData.hasMany('mapper2', {
      localField: 'm',
      foreignKey: 'm_id',
      getRelation () {
        return mapper2
      }
    })(mapper)
  })
})
test('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', (t) => {
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
  t.context.objectsEqual(t, foo.bars, [])
  t.context.objectsEqual(t, foo2.bars, [])
  const bars = store.add('bar', [{ fooId: 1, id: 1 }])
  const bars2 = store.add('bar', [{ fooId: 2, id: 2 }])
  t.context.objectsEqual(t, foo.bars, bars)
  t.context.objectsEqual(t, foo2.bars, bars2)
  foo.bars = bars2
  foo2.bars = bars
  t.context.objectsEqual(t, foo2.bars, bars)
  t.context.objectsEqual(t, foo.bars, bars2)
})
test('should add property accessors to prototype of target and allow relation re-assignment (localKeys)', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          localKeys: 'bar_ids'
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      hasMany: {
        foo: {
          localField: 'foos',
          foreignKeys: 'bar_ids'
        }
      }
    }
  })
  const foo = store.add('foo', { id: 1, bar_ids: [1] })
  const foo2 = store.add('foo', { id: 2, bar_ids: [2] })
  t.context.objectsEqual(t, foo.bars, [])
  t.context.objectsEqual(t, foo2.bars, [])
  const bars = store.add('bar', [{ fooId: 1, id: 1 }])
  const bars2 = store.add('bar', [{ fooId: 2, id: 2 }])
  t.context.objectsEqual(t, foo.bars, bars)
  t.context.objectsEqual(t, foo2.bars, bars2)
  foo.bars = bars2
  foo2.bars = bars
  t.context.objectsEqual(t, foo2.bars, bars)
  t.context.objectsEqual(t, foo.bars, bars2)
  t.context.objectsEqual(t, foo.bar_ids, [2])
  t.context.objectsEqual(t, foo2.bar_ids, [1])
})
test('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('bar', {
    relations: {
      hasMany: {
        foo: {
          localField: 'foos',
          localKeys: 'foo_ids'
        }
      }
    }
  })
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKeys: 'foo_ids'
        }
      }
    }
  })
  const foo = store.add('foo', { id: 1 })
  const foo2 = store.add('foo', { id: 2 })
  const foo3 = store.add('foo', { id: 3 })
  t.context.objectsEqual(t, foo.bars, [])
  t.context.objectsEqual(t, foo2.bars, [])
  const bars = store.add('bar', [{ foo_ids: [1], id: 1 }])
  const bars2 = store.add('bar', [{ foo_ids: [2], id: 2 }])
  const bars3 = store.add('bar', [{ id: 3 }])
  t.context.objectsEqual(t, foo.bars, bars)
  t.context.objectsEqual(t, foo2.bars, bars2)
  t.context.objectsEqual(t, foo3.bars, [])
  foo.bars = bars2
  foo2.bars = bars.concat(bars2)
  foo3.bars = bars3
  t.context.objectsEqual(t, foo2.bars, bars.concat(bars2))
  t.context.objectsEqual(t, foo.bars, bars2)
  t.context.objectsEqual(t, foo3.bars, bars3)
  t.context.objectsEqual(t, bars[0].foo_ids, [2])
  t.context.objectsEqual(t, bars2[0].foo_ids, [1, 2])
  t.context.objectsEqual(t, bars3[0].foo_ids, [3])
})
test('should allow custom getter and setter', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: '_bars',
          foreignKey: 'fooId',
          get (Relation, foo, originalGet) {
            getCalled++
            return originalGet()
          },
          set (Relation, foo, bars, originalSet) {
            setCalled++
            originalSet()
          }
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
  let getCalled = 0
  let setCalled = 0
  const foo = store.add('foo', { id: 1 })
  const foo2 = store.add('foo', { id: 2 })
  t.context.objectsEqual(t, foo._bars, [])
  t.context.objectsEqual(t, foo2._bars, [])
  const bars = store.add('bar', [{ fooId: 1, id: 1 }])
  const bars2 = store.add('bar', [{ fooId: 2, id: 2 }])
  t.context.objectsEqual(t, foo._bars, bars)
  t.context.objectsEqual(t, foo2._bars, bars2)
  foo._bars = bars2
  foo2._bars = bars
  t.is(bars2[0].fooId, foo.id)
  t.is(bars[0].fooId, foo2.id)
  t.context.objectsEqual(t, foo2._bars, bars)
  t.context.objectsEqual(t, foo._bars, bars2)
  t.is(getCalled, 14)
  t.is(setCalled, 2)
})
