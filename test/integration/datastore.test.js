import {
  beforeEach,
  JSData
} from '../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('relation links should stay up-to-date', (t) => {
  const store = new JSData.DataStore({
    linkRelations: true
  })
  store.defineMapper('foo', {
    relations: {
      hasMany: {
        bar: {
          localField: 'bars',
          foreignKey: 'foo_id'
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      belongsTo: {
        foo: {
          localField: 'foo',
          foreignKey: 'foo_id'
        }
      }
    }
  })
  const foo66 = store.add('foo', {
    id: 66
  })
  const foo77 = store.add('foo', {
    id: 77
  })
  const bar88 = store.add('bar', {
    id: 88,
    foo_id: 66
  })
  t.ok(bar88.foo === foo66)
  t.is(66, bar88.foo_id)
  bar88.foo_id = 77
  t.ok(bar88.foo === foo77)
  t.is(77, bar88.foo_id)
  bar88.foo = foo66
  t.ok(bar88.foo === foo66)
  t.is(66, bar88.foo_id)
  t.context.objectsEqual(foo77.bars, [])
  foo77.bars = [bar88]
  t.ok(foo77.bars[0] === store.getAll('bar')[0])
  t.is(bar88.foo_id, 77)
  t.context.objectsEqual(foo66.bars, [])
  foo66.bars = [bar88]
  t.ok(foo66.bars[0] === store.getAll('bar')[0])
  t.is(bar88.foo_id, 66)
  t.context.objectsEqual(foo77.bars, [])
})
test('should allow enhanced relation getters', (t) => {
  let wasItActivated = false
  const store = new JSData.DataStore({
    linkRelations: true
  })
  store.defineMapper('foo', {
    relations: {
      belongsTo: {
        bar: {
          localField: 'bar',
          foreignKey: 'barId',
          get (def, foo, orig) {
            // "relation.name" has relationship "relation.type" to "relation.relation"
            wasItActivated = true
            return orig()
          }
        }
      }
    }
  })
  store.defineMapper('bar', {
    relations: {
      hasMany: {
        foo: {
          localField: 'foos',
          foreignKey: 'barId'
        }
      }
    }
  })
  const foo = store.add('foo', {
    id: 1,
    barId: 1,
    bar: {
      id: 1
    }
  })
  t.is(foo.bar.id, 1)
  t.ok(wasItActivated)
})
test('should configure enumerability and linking of relations', (t) => {
  const store = new JSData.DataStore({
    linkRelations: true
  })
  store.defineMapper('parent', {
    relations: {
      hasMany: {
        child: {
          localField: 'children',
          foreignKey: 'parentId'
        }
      }
    }
  })
  store.defineMapper('child', {
    relations: {
      belongsTo: {
        parent: {
          link: false,
          localField: 'parent',
          foreignKey: 'parentId'
        }
      }
    }
  })
  store.defineMapper('otherChild', {
    relations: {
      belongsTo: {
        parent: {
          enumerable: false,
          localField: 'parent',
          foreignKey: 'parentId'
        }
      }
    }
  })

  const child = store.add('child', {
    id: 1,
    parent: {
      id: 2
    }
  })

  const otherChild = store.add('otherChild', {
    id: 3,
    parent: {
      id: 4
    }
  })

  t.ok(store.get('child', child.id))
  t.is(child.parentId, 2)
  t.ok(child.parent === store.get('parent', child.parentId))

  t.ok(store.get('otherChild', otherChild.id))
  t.is(otherChild.parentId, 4)
  t.ok(otherChild.parent === store.get('parent', otherChild.parentId), 'parent was injected and linked')
  t.ok(store.get('parent', otherChild.parentId), 'parent was injected and linked')

  let foundParent = false
  let k
  for (k in child) {
    if (k === 'parent' && child[k] === child.parent && child[k] === store.get('parent', child.parentId)) {
      foundParent = true
    }
  }
  t.ok(foundParent, 'parent is enumerable')
  foundParent = false
  for (k in otherChild) {
    if (k === 'parent' && otherChild[k] === otherChild.parent && otherChild[k] === store.get('parent', otherChild.parentId)) {
      foundParent = true
    }
  }
  t.false(foundParent, 'parent is NOT enumerable')
})
test('should unlink upon ejection', (t) => {
  t.context.UserCollection.add(t.context.data.user10)
  t.context.OrganizationCollection.add(t.context.data.organization15)
  t.context.CommentCollection.add(t.context.data.comment19)
  t.context.ProfileCollection.add(t.context.data.profile21)

  // user10 relations
  t.ok(Array.isArray(t.context.UserCollection.get(10).comments))
  t.context.CommentCollection.remove(11)
  t.notOk(t.context.CommentCollection.get(11))
  t.is(t.context.UserCollection.get(10).comments.length, 2)
  t.context.CommentCollection.remove(12)
  t.notOk(t.context.CommentCollection.get(12))
  t.is(t.context.UserCollection.get(10).comments.length, 1)
  t.context.CommentCollection.remove(13)
  t.notOk(t.context.CommentCollection.get(13))
  t.is(t.context.UserCollection.get(10).comments.length, 0)
  t.context.OrganizationCollection.remove(14)
  t.notOk(t.context.OrganizationCollection.get(14))
  t.notOk(t.context.UserCollection.get(10).organization)

  // organization15 relations
  t.ok(Array.isArray(t.context.OrganizationCollection.get(15).users))
  t.context.UserCollection.remove(16)
  t.notOk(t.context.UserCollection.get(16))
  t.is(t.context.OrganizationCollection.get(15).users.length, 2)
  t.context.UserCollection.remove(17)
  t.notOk(t.context.UserCollection.get(17))
  t.is(t.context.OrganizationCollection.get(15).users.length, 1)
  t.context.UserCollection.remove(18)
  t.notOk(t.context.UserCollection.get(18))
  t.is(t.context.OrganizationCollection.get(15).users.length, 0)

  // comment19 relations
  t.same(t.context.UserCollection.get(20), t.context.CommentCollection.get(19).user)
  t.same(t.context.UserCollection.get(19), t.context.CommentCollection.get(19).approvedByUser)
  t.context.UserCollection.remove(20)
  t.notOk(t.context.CommentCollection.get(19).user)
  t.context.UserCollection.remove(19)
  t.notOk(t.context.CommentCollection.get(19).approvedByUser)

  // profile21 relations
  t.same(t.context.UserCollection.get(22), t.context.ProfileCollection.get(21).user)
  t.context.UserCollection.remove(22)
  t.notOk(t.context.ProfileCollection.get(21).user)
})
