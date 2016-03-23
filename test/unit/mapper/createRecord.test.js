export function init () {
  describe('createRecord', function () {
    it('should create an instance', function () {
      const Test = this
      const store = new Test.JSData.DataStore()
      class Person extends Test.JSData.Record {
        say () {
          return 'hi'
        }
        get fullName () {
          return `${this.first} ${this.last}`
        }
      }
      const PersonMapper = store.defineMapper('person', {
        recordClass: Person
      })

      class Dog extends Test.JSData.Record {
        say () {
          return 'woof'
        }
      }
      const DogMapper = store.defineMapper('dog', {
        recordClass: Dog,
        name: 'Dog'
      })

      class Cat extends Test.JSData.Record {
        say () {
          return 'meow'
        }
      }
      const CatMapper = store.defineMapper('cat', {
        name: 'Cat',
        recordClass: Cat
      })

      const personAttrs = {
        first: 'John',
        last: 'Anderson'
      }

      const dogAttrs = {
        name: 'Spot'
      }

      const person = PersonMapper.createRecord(personAttrs)
      const person2 = new Person(personAttrs)
      const dog = DogMapper.createRecord(dogAttrs)
      const dog2 = new Dog(dogAttrs)
      const cat = CatMapper.createRecord()
      const cat2 = new Cat()

      Test.assert.equal(person.say(), 'hi')
      Test.assert.equal(person2.say(), 'hi')
      Test.assert.equal(dog.say(), 'woof')
      Test.assert.equal(dog2.say(), 'woof')
      Test.assert.equal(cat.say(), 'meow')
      Test.assert.equal(cat2.say(), 'meow')

      Test.assert.objectsEqual(person, {
        first: 'John',
        last: 'Anderson'
      })
      Test.assert.objectsEqual(dog, dogAttrs)
      Test.assert.objectsEqual(cat, {})

      Test.assert.isTrue(person instanceof Person)
      Test.assert.isTrue(person2 instanceof Person)
      Test.assert.isTrue(dog instanceof Dog)
      Test.assert.isTrue(dog2 instanceof Dog)
      Test.assert.isTrue(cat instanceof Cat)
      Test.assert.isTrue(cat2 instanceof Cat)
    })
    it('should create records on nested data', function () {
      const Test = this
      const store = Test.store
      const userProps = {
        name: 'John',
        organization: {
          name: 'Company Inc'
        },
        comments: [
          {
            content: 'foo'
          }
        ],
        profile: {
          email: 'john@email.com'
        }
      }
      const user = store.createRecord('user', userProps)
      Test.assert.isTrue(store.is('user', user), 'user should be a user record')
      Test.assert.isTrue(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
      Test.assert.isTrue(store.is('profile', user.profile), 'user.profile should be a profile record')
      Test.assert.isTrue(store.is('organization', user.organization), 'user.organization should be a organization record')
    })
  })
}
