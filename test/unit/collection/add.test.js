import { assert, JSData, TYPES_EXCEPT_OBJECT_OR_ARRAY } from '../../_setup'

describe('Collection#add', function () {
  it('should inject new items into the collection', function () {
    const collection = new JSData.Collection()
    const user = collection.add({ id: 1 })
    const users = collection.add([{ id: 2 }, { id: 3 }])
    assert(collection.get(1) === user)
    assert.deepEqual(collection.between([2], [3], {
      rightInclusive: true
    }), users)
  })
  it('should inject multiple items into the collection', function () {
    assert.objectsEqual(this.PostCollection.add([
      this.data.p1,
      this.data.p2,
      this.data.p3,
      this.data.p4
    ]), [this.data.p1, this.data.p2, this.data.p3, this.data.p4])

    assert.objectsEqual(this.PostCollection.get(5), this.data.p1)
    assert.objectsEqual(this.PostCollection.get(6), this.data.p2)
    assert.objectsEqual(this.PostCollection.get(7), this.data.p3)
    assert.objectsEqual(this.PostCollection.get(8), this.data.p4)
  })
  it('should allow unsaved records into the collection', function () {
    assert.objectsEqual(this.PostCollection.add([
      this.data.p1,
      this.data.p2,
      { author: 'Alice' },
      this.data.p3,
      { author: 'Bob' },
      this.data.p4
    ]), [this.data.p1, this.data.p2, { author: 'Alice' }, this.data.p3, { author: 'Bob' }, this.data.p4])

    assert.objectsEqual(this.PostCollection.get(5), this.data.p1)
    assert.objectsEqual(this.PostCollection.get(6), this.data.p2)
    assert.objectsEqual(this.PostCollection.get(7), this.data.p3)
    assert.objectsEqual(this.PostCollection.get(8), this.data.p4)
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    }).length, 2)
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    })[0], { author: 'Bob' })
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    })[1], { author: 'Alice' })
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    })[0], { author: 'Bob' })
    assert.objectsEqual(this.PostCollection.filter().length, 6)

    this.PostCollection.add({ author: 'Bob' })
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    }).length, 3)
    assert.objectsEqual(this.PostCollection.filter({
      author: 'Bob'
    }).length, 2)
    assert.objectsEqual(this.PostCollection.filter().length, 7)

    this.PostCollection.add({ author: 'Bob' })
    assert.objectsEqual(this.PostCollection.filter({
      id: undefined
    }).length, 4)
    assert.objectsEqual(this.PostCollection.filter({
      author: 'Bob'
    }).length, 3)
    assert.objectsEqual(this.PostCollection.filter().length, 8)
  })
  it('should inject existing items into the collection and call Record#commit', function () {
    const collection = new JSData.Collection({ mapper: new JSData.Mapper({ name: 'user' }) })

    const user = collection.add({ id: 1 })
    assert.equal(user.hasChanges(), false, 'user does not have changes yet')
    user.foo = 'bar'
    assert.equal(user.hasChanges(), true, 'user has changes now')
    const users = collection.add([{ id: 2 }, { id: 3 }])
    const userAgain = collection.add({ id: 1 })
    assert.equal(user.hasChanges(), false, 'user no longer has changes')
    const usersAgain = collection.add([{ id: 2 }, { id: 3 }])
    assert(collection.get(1) === user, 'original reference should still be valid')
    assert(collection.get(1) === userAgain, 'new reference should be valid')
    assert(user === userAgain, 'both references should point to the same object')
    assert.deepEqual(collection.between([2], [3], {
      rightInclusive: true
    }), users, 'injection of array should work')
    assert.deepEqual(collection.between([2], [3], {
      rightInclusive: true
    }), usersAgain, 're-inject of array should work')
    assert.deepEqual(users, usersAgain, 'inject arrays should be equal')
  })
  it('should insert a record into all indexes', function () {
    const data = [
      { id: 2, age: 19 },
      { id: 1, age: 27 }
    ]
    const collection = new JSData.Collection(data)
    collection.createIndex('age')
    collection.add({ id: 3, age: 20 })
    assert(collection.get(1) === data[1])
    assert.equal(collection.getAll(20, { index: 'age' }).length, 1)
  })
  it('should not require an id', function () {
    const collection = new JSData.Collection()
    assert.doesNotThrow(() => {
      collection.add({})
    })
  })
  it('should test opts.onConflict', function () {
    const collection = new JSData.Collection()
    collection.add({ id: 1 })
    assert.throws(() => {
      collection.add({ id: 1 }, { onConflict: 'invalid_choice' })
    }, Error, `[Collection#add:opts.onConflict] expected: one of (merge, replace), found: invalid_choice\nhttp://www.js-data.io/v3.0/docs/errors#400`)
  })
  it('should required an argument', function () {
    const collection = new JSData.Collection()
    TYPES_EXCEPT_OBJECT_OR_ARRAY.forEach((value) => {
      assert.throws(() => {
        collection.add(value)
      }, Error, `[Collection#add:records] expected: object or array, found: ${typeof value}\nhttp://www.js-data.io/v3.0/docs/errors#400`)
    })
  })
  it('should replace existing items', function () {
    const collection = new JSData.Collection({ mapper: new JSData.Mapper({ name: 'user' }) })
    const user = collection.add({ id: 1, foo: 'bar', beep: 'boop' })
    assert.equal(user.id, 1)
    assert.equal(user.foo, 'bar')
    assert.equal(user.beep, 'boop')
    assert(!user.biz)
    let existing = collection.add({ id: 1, biz: 'baz', foo: 'BAR' }, { onConflict: 'replace' })
    assert(user === existing)
    assert.equal(user.id, 1)
    assert.equal(user.biz, 'baz')
    assert.equal(user.foo, 'BAR')
    assert(!user.beep)
    existing = collection.add(existing)
    assert(user === existing)
    assert.equal(existing.id, 1)
    assert.equal(existing.biz, 'baz')
    assert.equal(existing.foo, 'BAR')
    assert(!existing.beep)

    const store = new JSData.DataStore()
    store.defineMapper('test', {
      schema: {
        properties: {
          id: { type: 'string' },
          count: { type: 'number' }
        }
      }
    })

    const test = store.createRecord('test', { id: 'abcd', count: 1 })
    store.add('test', test)
    const test2 = store.createRecord('test', { id: 'abcd', count: 2 })
    store.add('test', test2)
    assert.equal(store.get('test', 'abcd').count, 2)
  })
  it('should replace existing items (2)', function () {
    let post = this.PostCollection.add(this.data.p1)
    post.foo = 'bar'
    post.beep = 'boop'
    assert.objectsEqual(post, {
      author: 'John',
      age: 30,
      id: 5,
      foo: 'bar',
      beep: 'boop'
    })
    post = this.PostCollection.add(this.data.p1, { onConflict: 'replace' })
    assert.objectsEqual(post, {
      author: 'John',
      age: 30,
      id: 5
    })
  })
  it('should inject 1,000 items', function () {
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
    this.UserCollection.add(users)
    // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
  })
  it.skip('should inject 10,000 items', function () {
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
    this.UserCollection.add(users)
    console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
  })
  it('should inject 1,000 items where there is an index on "age"', function () {
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
  it.skip('should inject 10,000 items where there is an index on "age"', function () {
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
})
