import { assert, JSData, TYPES_EXCEPT_OBJECT_OR_ARRAY } from '../../_setup'

describe('Mapper#createRecord', function () {
  it('should be an instance method', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.equal(typeof mapper.createRecord, 'function')
    assert.strictEqual(mapper.createRecord, Mapper.prototype.createRecord)
  })
  it('should require an object or array', function () {
    const Mapper = JSData.Mapper
    const mapper = new Mapper({ name: 'foo' })
    assert.doesNotThrow(() => {
      mapper.createRecord()
      mapper.createRecord({})
      mapper.createRecord([{}])
    })
    TYPES_EXCEPT_OBJECT_OR_ARRAY.forEach((value) => {
      if (!value) {
        return
      }
      assert.throws(() => {
        mapper.createRecord(value)
      }, `[Mapper#createRecord:props] expected: array or object, found: ${typeof value}\nhttp://www.js-data.io/v3.0/docs/errors#400`)
    })
  })
  it('should create an instance', function () {
    const store = new JSData.DataStore()
    class Person extends JSData.Record {
      constructor (props, opts) {
        super(props, opts)
        if (!this._get) {
          JSData.Record.call(this, props, opts)
        }
      }

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
      constructor (props, opts) {
        super(props, opts)
        if (!this._get) {
          JSData.Record.call(this, props, opts)
        }
      }

      say () {
        return 'woof'
      }
    }
    const DogMapper = store.defineMapper('dog', {
      recordClass: Dog,
      name: 'Dog'
    })

    class Cat extends JSData.Record {
      constructor (props, opts) {
        super(props, opts)
        if (!this._get) {
          JSData.Record.call(this, props, opts)
        }
      }

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
    const person3 = PersonMapper.createInstance(personAttrs)
    const dog = DogMapper.createRecord(dogAttrs)
    const dog2 = new Dog(dogAttrs)
    const cat = CatMapper.createRecord()
    const cat2 = new Cat()

    assert.equal(person.say(), 'hi')
    assert.equal(person2.say(), 'hi')
    assert.equal(person3.say(), 'hi')
    assert.equal(dog.say(), 'woof')
    assert.equal(dog2.say(), 'woof')
    assert.equal(cat.say(), 'meow')
    assert.equal(cat2.say(), 'meow')

    assert.objectsEqual(person, {
      first: 'John',
      last: 'Anderson'
    })
    assert.objectsEqual(dog, dogAttrs)
    assert.objectsEqual(cat, {})

    assert(person instanceof Person)
    assert(person2 instanceof Person)
    assert(person3 instanceof Person)
    assert(dog instanceof Dog)
    assert(dog2 instanceof Dog)
    assert(cat instanceof Cat)
    assert(cat2 instanceof Cat)
  })
  it('should create records on nested data', function () {
    const store = this.store
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
    assert(store.is('user', user), 'user should be a user record')
    assert(store.is('comment', user.comments[0]), 'user.comments[0] should be a comment record')
    assert(store.is('profile', user.profile), 'user.profile should be a profile record')
    assert(store.is('organization', user.organization), 'user.organization should be a organization record')
  })
})
