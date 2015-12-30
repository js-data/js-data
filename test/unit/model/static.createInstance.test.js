/* global store:true, JSData:true, Model:true */
import {assert} from 'chai'

export function init () {
  describe('static createInstance', function () {
    it('should create an instance', function () {
      const store = new JSData.DS()
      class Person extends Model {
        say () {
          return 'hi'
        }
        get fullName () {
          return `${this.first} ${this.last}`
        }
      }

      const Dog = Model.extend({
        say: function () {
          return 'woof'
        }
      }, {
        name: 'Dog'
      })

      const Cat = store.defineModel({
        name: 'Cat',
        methods: {
          say: function () {
            return 'meow'
          }
        }
      })

      const personAttrs = {
        first: 'John',
        last: 'Anderson'
      }

      const dogAttrs = {
        name: 'Spot'
      }

      const person = Person.createInstance(personAttrs)
      const person2 = new Person(personAttrs)
      const dog = Dog.createInstance(dogAttrs)
      const dog2 = new Dog(dogAttrs)
      const cat = Cat.createInstance()
      const cat2 = new Cat()

      assert.equal(person.say(), 'hi')
      assert.equal(person2.say(), 'hi')
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

      assert.isTrue(person instanceof Person)
      assert.isTrue(person2 instanceof Person)
      assert.isTrue(dog instanceof Dog)
      assert.isTrue(dog2 instanceof Dog)
      assert.isTrue(cat instanceof Cat)
      assert.isTrue(cat2 instanceof Cat)
    })
  })
}
