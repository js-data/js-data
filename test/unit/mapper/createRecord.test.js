import {
  beforeEach,
  JSData
} from '../../_setup'
import test from 'ava'

test.beforeEach(beforeEach)

test('should be an instance method', (t) => {
  const Mapper = JSData.Mapper
  const mapper = new Mapper({ name: 'foo' })
  t.is(typeof mapper.createRecord, 'function')
  t.ok(mapper.createRecord === Mapper.prototype.createRecord)
})
test('should create an instance', (t) => {
  const store = new JSData.DataStore()
  class Person extends JSData.Record {
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

  class Dog extends JSData.Record {
    say () {
      return 'woof'
    }
  }
  const DogMapper = store.defineMapper('dog', {
    recordClass: Dog,
    name: 'Dog'
  })

  class Cat extends JSData.Record {
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

  t.is(person.say(), 'hi')
  t.is(person2.say(), 'hi')
  t.is(dog.say(), 'woof')
  t.is(dog2.say(), 'woof')
  t.is(cat.say(), 'meow')
  t.is(cat2.say(), 'meow')

  t.context.objectsEqual(t, person, {
    first: 'John',
    last: 'Anderson'
  })
  t.context.objectsEqual(t, dog, dogAttrs)
  t.context.objectsEqual(t, cat, {})

  t.ok(person instanceof Person)
  t.ok(person2 instanceof Person)
  t.ok(dog instanceof Dog)
  t.ok(dog2 instanceof Dog)
  t.ok(cat instanceof Cat)
  t.ok(cat2 instanceof Cat)
})
test('should create records on nested data', (t) => {
  const store = t.context.store
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
  t.ok(store.is('user', user), 'user should be a user record')
  t.ok(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
  t.ok(store.is('profile', user.profile), 'user.profile should be a profile record')
  t.ok(store.is('organization', user.organization), 'user.organization should be a organization record')
})
