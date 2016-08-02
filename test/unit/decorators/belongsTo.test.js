import { assert, JSData } from '../../_setup'

describe('JSData.belongsTo', function () {
  it('should check relation configuration', function () {
    let mapper = new JSData.Mapper({ name: 'foo' })
    let mapper2 = new JSData.Mapper({ name: 'bar' })

    assert.throws(() => {
      JSData.belongsTo(mapper2, {
        foreignKey: 'm_id'
      })(mapper)
    }, Error, '[new Relation:opts.localField] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    assert.throws(() => {
      JSData.belongsTo(mapper2, {
        localField: 'm'
      })(mapper)
    }, Error, '[new Relation:opts.foreignKey] expected: string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    assert.throws(() => {
      JSData.belongsTo('mapper2', {
        localField: 'm',
        foreignKey: 'm_id'
      })(mapper)
    }, Error, '[new Relation:opts.getRelation] expected: function, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')

    assert.doesNotThrow(() => {
      JSData.belongsTo('mapper2', {
        localField: 'm',
        foreignKey: 'm_id',
        getRelation () {
          return mapper2
        }
      })(mapper)
    })

    assert.throws(() => {
      JSData.belongsTo(undefined, {
        localField: 'm',
        foreignKey: 'm_id'
      })(mapper)
    }, Error, '[new Relation:related] expected: Mapper or string, found: undefined\nhttp://www.js-data.io/v3.0/docs/errors#400')
  })
  it('should add property accessors to prototype of target and allow relation re-assignment using defaults', function () {
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
    assert.strictEqual(bar.foo, foo)
    assert.strictEqual(bar2.foo, foo)
    assert(!bar3.foo)
    bar.foo = foo2
    bar3.foo = foo
    assert.strictEqual(bar.foo, foo2)
    assert.strictEqual(bar2.foo, foo)
    assert.strictEqual(bar3.foo, foo)
  })

  it ('should not create an inverseLink if no inverseRelationship is defined', function() {
    const store = new JSData.DataStore()
    store.defineMapper('foo', {
    })
    store.defineMapper('bar', {
      relations: {
        belongsTo: {
          foo: {
            localField: '_foo',
            foreignKey: 'foo_id'
          }
        }
      }
    })
    const foo = store.add('foo', { id: 1 })
    const bar = store.add('bar', { id: 1, foo_id: 1 })
    assert.strictEqual(bar._foo, foo)
  })

  it('should add property accessors to prototype of target and allow relation re-assignment using customizations', function () {
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
    assert.strictEqual(bar._foo, foo)
    assert.strictEqual(bar2._foo, foo)
    assert(!bar3._foo)
    bar._foo = foo2
    bar3._foo = foo
    assert.strictEqual(bar._foo, foo2)
    assert.strictEqual(bar2._foo, foo)
    assert.strictEqual(bar3._foo, foo)
  })
  it('should allow custom getter and setter', function () {
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
    assert.strictEqual(bar._foo, foo)
    assert.strictEqual(bar2._foo, foo)
    assert(!bar3._foo)
    bar._foo = foo2
    bar3._foo = foo
    assert.strictEqual(bar._foo, foo2)
    assert.strictEqual(bar2._foo, foo)
    assert.strictEqual(bar3._foo, foo)
    assert.equal(getCalled, 11)
    assert.equal(setCalled, 4)
  })
})
