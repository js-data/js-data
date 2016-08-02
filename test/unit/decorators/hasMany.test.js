import { assert, JSData } from '../../_setup'

describe('JSData.hasMany', function () {
  it('should check relation configuration', function () {
    let mapper = new JSData.Mapper({ name: 'foo' })
    let mapper2 = new JSData.Mapper({ name: 'bar' })

    assert.throws(() => {
      JSData.hasMany(mapper2, {
        foreignKey: 'm_id'
      })(mapper)
    }, Error, '[new Relation:opts.localField] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    assert.throws(() => {
      JSData.hasMany(mapper2, {
        localField: 'm'
      })(mapper)
    }, Error, '[new Relation:opts.<foreignKey|localKeys|foreignKeys>] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    assert.throws(() => {
      JSData.hasMany('mapper2', {
        localField: 'm',
        foreignKey: 'm_id'
      })(mapper)
    }, Error, '[new Relation:opts.getRelation] expected: function, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    assert.doesNotThrow(() => {
      JSData.hasMany('mapper2', {
        localField: 'm',
        foreignKey: 'm_id',
        getRelation () {
          return mapper2
        }
      })(mapper)
    })
  })
  it('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', function () {
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
    assert.objectsEqual(foo.bars, [])
    assert.objectsEqual(foo2.bars, [])
    const bars = store.add('bar', [{ fooId: 1, id: 1 }])
    const bars2 = store.add('bar', [{ fooId: 2, id: 2 }])
    assert.objectsEqual(foo.bars, bars)
    assert.objectsEqual(foo2.bars, bars2)
    foo.bars = bars2
    foo2.bars = bars
    assert.objectsEqual(foo2.bars, bars)
    assert.objectsEqual(foo.bars, bars2)
  })
  it('should add property accessors to prototype of target and allow relation re-assignment (localKeys)', function () {
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
    const foo1 = store.add('foo', { id: 1, bar_ids: [1] })
    const foo2 = store.add('foo', { id: 2, bar_ids: [2] })
    assert.deepEqual(foo1.bars, [])
    assert.deepEqual(foo2.bars, [])
    const bar1 = store.add('bar', { id: 1 })
    const bar2 = store.add('bar', { id: 2 })
    assert.objectsEqual(foo1.bars, [bar1])
    assert.objectsEqual(foo2.bars, [bar2])
    assert.strictEqual(foo1.bars[0], bar1)
    assert.strictEqual(foo2.bars[0], bar2)
    foo1.bars = [bar2]
    foo2.bars = [bar1]
    assert.strictEqual(foo2.bars[0], bar1)
    assert.equal(foo2.bars.length, 1)
    assert.strictEqual(foo1.bars[0], bar2)
    assert.equal(foo1.bars.length, 1)
    assert.objectsEqual(foo1.bar_ids, [2])
    assert.objectsEqual(foo2.bar_ids, [1])
  })
  it('should add property accessors to prototype of target and allow relation re-assignment (foreignKeys)', function () {
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
    assert.objectsEqual(foo.bars, [])
    assert.objectsEqual(foo2.bars, [])
    const bars = store.add('bar', [{ foo_ids: [1], id: 1 }])
    const bars2 = store.add('bar', [{ foo_ids: [2], id: 2 }])
    const bars3 = store.add('bar', [{ id: 3 }])
    assert.objectsEqual(foo.bars, bars)
    assert.objectsEqual(foo2.bars, bars2)
    assert.objectsEqual(foo3.bars, [])
    foo.bars = bars2
    foo2.bars = bars.concat(bars2)
    foo3.bars = bars3
    assert.objectsEqual(foo2.bars, bars.concat(bars2))
    assert.objectsEqual(foo.bars, bars2)
    assert.objectsEqual(foo3.bars, bars3)
    assert.objectsEqual(bars[0].foo_ids, [2])
    assert.objectsEqual(bars2[0].foo_ids, [1, 2])
    assert.objectsEqual(bars3[0].foo_ids, [3])
  })
  it('should allow custom getter and setter', function () {
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
    assert.objectsEqual(foo._bars, [])
    assert.objectsEqual(foo2._bars, [])
    const bars = store.add('bar', [{ fooId: 1, id: 1 }])
    const bars2 = store.add('bar', [{ fooId: 2, id: 2 }])
    assert.objectsEqual(foo._bars, bars)
    assert.objectsEqual(foo2._bars, bars2)
    foo._bars = bars2
    foo2._bars = bars
    assert.equal(bars2[0].fooId, foo.id)
    assert.equal(bars[0].fooId, foo2.id)
    assert.objectsEqual(foo2._bars, bars)
    assert.objectsEqual(foo._bars, bars2)
    assert.equal(getCalled, 11)
    assert.equal(setCalled, 2)
  })
  it('unlinks correctly in related structures when a record is removed', function() {
    const store = new JSData.DataStore();
    const mapperA = store.defineMapper('A', {
      properties: {
        parent: { type: 'boolean' }
      },
      relations:  {
        hasMany: {
          B: {
            localField: 'b',
            foreignKey: 'a_id'
          }
        }
      }
    });
    const mapperB = store.defineMapper('B', {
      relations:  {
        belongsTo: {
          A: {
            localField: 'a',
            foreignKey: 'a_id'
          }
        }
      }
    });

    // We add two records, which are not linked
    const aRecord = store.add('A', {id: 1, parent: true});

    store.add('B', [{id: 1, a_id: 1}, {id: 2, a_id: 1}]);
    assert.equal(aRecord.b.length, 2, '2 items linked as expected');
    console.log(aRecord.b)
    store.remove('B', 2);
    console.log(aRecord.b)
    assert.equal(aRecord.b.length, 1, 'expected 1 item to still be linked but got empty array');
  })
})
