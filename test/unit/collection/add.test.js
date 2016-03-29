import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should inject new items into the collection', (t) => {
  const collection = new JSData.Collection()
  const user = collection.add({ id: 1 })
  const users = collection.add([{ id: 2 }, { id: 3 }])
  t.ok(collection.get(1) === user)
  t.same(collection.between([2], [3], {
    rightInclusive: true
  }), users)
})
test('should inject multiple items into the collection', (t) => {
  t.context.objectsEqual(t.context.PostCollection.add([
    t.context.data.p1,
    t.context.data.p2,
    t.context.data.p3,
    t.context.data.p4
  ]), [t.context.data.p1, t.context.data.p2, t.context.data.p3, t.context.data.p4])

  t.context.objectsEqual(t.context.PostCollection.get(5), t.context.data.p1)
  t.context.objectsEqual(t.context.PostCollection.get(6), t.context.data.p2)
  t.context.objectsEqual(t.context.PostCollection.get(7), t.context.data.p3)
  t.context.objectsEqual(t.context.PostCollection.get(8), t.context.data.p4)
})
test('should inject existing items into the collection', (t) => {
  const collection = new JSData.Collection({ mapper: new JSData.Mapper({ name: 'user' }) })

  const user = collection.add({ id: 1 })
  const users = collection.add([{ id: 2 }, { id: 3 }])
  const userAgain = collection.add({ id: 1 })
  const usersAgain = collection.add([{ id: 2 }, { id: 3 }])
  t.ok(collection.get(1) === user, 'original reference should still be valid')
  t.ok(collection.get(1) === userAgain, 'new reference should be valid')
  t.ok(user === userAgain, 'both references should point to the same object')
  t.same(collection.between([2], [3], {
    rightInclusive: true
  }), users, 'injection of array should work')
  t.same(collection.between([2], [3], {
    rightInclusive: true
  }), usersAgain, 're-inject of array should work')
  t.same(users, usersAgain, 'inject arrays should be equal')
})
test('should insert a record into all indexes', (t) => {
  const data = [
    { id: 2, age: 19 },
    { id: 1, age: 27 }
  ]
  const collection = new JSData.Collection(data)
  collection.createIndex('age')
  collection.add({ id: 3, age: 20 })
  t.ok(collection.get(1) === data[1])
  t.is(collection.getAll(20, { index: 'age' }).length, 1)
})
test('should replace existing items', (t) => {
  const collection = new JSData.Collection({ mapper: new JSData.Mapper({ name: 'user' }) })
  const user = collection.add({ id: 1, foo: 'bar', beep: 'boop' })
  t.is(user.id, 1)
  t.is(user.foo, 'bar')
  t.is(user.beep, 'boop')
  t.notOk(user.biz)
  const existing = collection.add({ id: 1, biz: 'baz', foo: 'BAR' }, { onConflict: 'replace' })
  t.ok(user === existing)
  t.is(user.id, 1)
  t.is(user.biz, 'baz')
  t.is(user.foo, 'BAR')
  t.notOk(user.beep)
})
test('should replace existing items', (t) => {
  let post = t.context.PostCollection.add(t.context.data.p1)
  post.foo = 'bar'
  post.beep = 'boop'
  t.context.objectsEqual(post, {
    author: 'John',
    age: 30,
    id: 5,
    foo: 'bar',
    beep: 'boop'
  })
  post = t.context.PostCollection.add(t.context.data.p1, { onConflict: 'replace' })
  t.context.objectsEqual(post, {
    author: 'John',
    age: 30,
    id: 5
  })
})
test('should inject 1,000 items', (t) => {
  let users = []
  for (var i = 0; i < 1000; i++) {
    users.push({
      id: i,
      name: 'john smith #' + i,
      age: Math.floor(Math.random() * 100),
      created: new Date().getTime(),
      updated: new Date().getTime()
    })
  }
  // const start = new Date().getTime()
  t.context.UserCollection.add(users)
  // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
})
test.skip('should inject 10,000 items', (t) => {
  let users = []
  for (var i = 0; i < 10000; i++) {
    users.push({
      id: i,
      name: 'john smith #' + i,
      age: Math.floor(Math.random() * 100),
      created: new Date().getTime(),
      updated: new Date().getTime()
    })
  }
  const start = new Date().getTime()
  t.context.UserCollection.add(users)
  console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
})
test('should inject 1,000 items where there is an index on "age"', (t) => {
  const collection = new JSData.Collection({ mapper: new JSData.Mapper({ name: 'user' }) })
  collection.createIndex('age')
  collection.createIndex('created')
  collection.createIndex('updated')
  let users = []
  for (var i = 0; i < 1000; i++) {
    users.push({
      id: i,
      name: 'john smith #' + i,
      age: Math.floor(Math.random() * 100),
      created: new Date().getTime(),
      updated: new Date().getTime()
    })
  }
  // const start = new Date().getTime()
  collection.add(users)
  // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
})
test.skip('should inject 10,000 items where there is an index on "age"', (t) => {
  const store = new JSData.DataStore()
  store.defineMapper('user')
  store.createIndex('user', 'age')
  store.createIndex('user', 'created')
  store.createIndex('user', 'updated')
  let users = []
  for (var i = 0; i < 10000; i++) {
    users.push({
      id: i,
      name: 'john smith #' + i,
      age: Math.floor(Math.random() * 100),
      created: new Date().getTime(),
      updated: new Date().getTime()
    })
  }
  // const start = new Date().getTime()
  store.add('user', users)
  // console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
  // console.log('\tusers age 40-44', User.between(40, 45, { index: 'age' }).length)
})
