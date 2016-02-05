export function init () {
  describe('#add', function () {
    it('should inject new items into the collection', function () {
      const Test = this
      const collection = new Test.JSData.Collection()
      const user = collection.add({ id: 1 })
      const users = collection.add([{ id: 2 }, { id: 3 }])
      Test.assert.isTrue(collection.get(1) === user)
      Test.assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), users)
    })
    it('should inject multiple items into the collection', function () {
      const Test = this
      Test.assert.objectsEqual(Test.PostCollection.add([
        Test.data.p1,
        Test.data.p2,
        Test.data.p3,
        Test.data.p4
      ]), [Test.data.p1, Test.data.p2, Test.data.p3, Test.data.p4])

      Test.assert.objectsEqual(Test.PostCollection.get(5), Test.data.p1)
      Test.assert.objectsEqual(Test.PostCollection.get(6), Test.data.p2)
      Test.assert.objectsEqual(Test.PostCollection.get(7), Test.data.p3)
      Test.assert.objectsEqual(Test.PostCollection.get(8), Test.data.p4)
    })
    it('should inject existing items into the store', function () {
      const Test = this
      const collection = new Test.JSData.Collection({ mapper: new Test.JSData.Mapper({ name: 'user' }) })

      const user = collection.add({ id: 1 })
      const users = collection.add([{ id: 2 }, { id: 3 }])
      const userAgain = collection.add({ id: 1 })
      const usersAgain = collection.add([{ id: 2 }, { id: 3 }])
      Test.assert.isTrue(collection.get(1) === user, 'original reference should still be valid')
      Test.assert.isTrue(collection.get(1) === userAgain, 'new reference should be valid')
      Test.assert.isTrue(user === userAgain, 'both references should point to the same object')
      Test.assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), users, 'injection of array should work')
      Test.assert.deepEqual(collection.between([2], [3], {
        rightInclusive: true
      }), usersAgain, 're-inject of array should work')
      Test.assert.deepEqual(users, usersAgain, 'inject arrays should be equal')
    })
    it('should replace existing items', function () {
      const Test = this
      const collection = new Test.JSData.Collection({ mapper: new Test.JSData.Mapper({ name: 'user' }) })
      const user = collection.add({ id: 1, foo: 'bar', beep: 'boop' })
      Test.assert.equal(user.id, 1)
      Test.assert.equal(user.foo, 'bar')
      Test.assert.equal(user.beep, 'boop')
      Test.assert.isUndefined(user.biz)
      const existing = collection.add({ id: 1, biz: 'baz', foo: 'BAR' }, { onConflict: 'replace' })
      Test.assert.isTrue(user === existing)
      Test.assert.equal(user.id, 1)
      Test.assert.equal(user.biz, 'baz')
      Test.assert.equal(user.foo, 'BAR')
      Test.assert.isUndefined(user.beep)
    })
    it('should replace existing items', function () {
      const Test = this
      let post = Test.PostCollection.add(Test.data.p1)
      post.foo = 'bar'
      post.beep = 'boop'
      Test.assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5,
        foo: 'bar',
        beep: 'boop'
      })
      post = Test.PostCollection.add(Test.data.p1, { onConflict: 'replace' })
      Test.assert.objectsEqual(post, {
        author: 'John',
        age: 30,
        id: 5
      })
    })
    it('should inject 1,000 items', function () {
      const Test = this
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
      Test.UserCollection.add(users)
      // console.log('\tinject 1,000 users time taken: ', new Date().getTime() - start, 'ms')
    })
    // it('should inject 10,000 items', function () {
    //   const Test = this
    //   let users = []
    //   for (var i = 0; i < 10000; i++) {
    //     users.push({
    //       id: i,
    //       name: 'john smith #' + i,
    //       age: Math.floor(Math.random() * 100),
    //       created: new Date().getTime(),
    //       updated: new Date().getTime()
    //     })
    //   }
    //   const start = new Date().getTime()
    //   Test.UserCollection.add(users)
    //   console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    // })
    it('should inject 1,000 items where there is an index on "age"', function () {
      const Test = this
      const collection = new Test.JSData.Collection({ mapper: new Test.JSData.Mapper({ name: 'user' }) })
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
    // it.skip('should inject 10,000 items where there is an index on "age"', function () {
    //   class UserMapper extends Test.JSData.Mapper {}
    //   User.createIndex('age')
    //   User.createIndex('created')
    //   User.createIndex('updated')
    //   let users = []
    //   for (var i = 0; i < 10000; i++) {
    //     users.push({
    //       id: i,
    //       name: 'john smith #' + i,
    //       age: Math.floor(Math.random() * 100),
    //       created: new Date().getTime(),
    //       updated: new Date().getTime()
    //     })
    //   }
    //   const start = new Date().getTime()
    //   User.inject(users)
    //   // console.log('\tinject 10,000 users time taken: ', new Date().getTime() - start, 'ms')
    //   // console.log('\tusers age 40-44', User.between(40, 45, { index: 'age' }).length)
    // })
  })
}
