describe('DS#defineResource', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_OBJECT, function (key) {
      if (!DSUtils.isArray(key)) {
        assert.throws(function () {
          store.defineResource(key);
        }, store.errors.IllegalArgumentError, '"definition" must be an object!');
      }
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING, function (key) {
      assert.throws(function () {
        store.defineResource({ name: key });
      }, store.errors.IllegalArgumentError, '"name" must be a string!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING, function (key) {
      if (key) {
        assert.throws(function () {
          store.defineResource({ name: 'name', idAttribute: key });
        }, store.errors.IllegalArgumentError, '"idAttribute" must be a string!');
      }
    });

    store.defineResource('fake');

    assert.throws(function () {
      store.defineResource('fake');
    }, store.errors.RuntimeError, 'fake is already registered!');

    assert.doesNotThrow(function () {
      store.defineResource('new resource');
      assert.equal(store.definitions.newresource.class, 'Newresource');
    }, 'Should not throw');
  });

  it('should allow definition of computed properties that have no dependencies', function () {
    store.defineResource({
      name: 'person',
      computed: {
        thing: function () {
          return 'thing';
        }
      }
    });

    store.defineResource({
      name: 'dog',
      computed: {
        thing: [function () {
          return 'thing';
        }]
      }
    });

    store.inject('person', {
      id: 1
    });

    store.inject('dog', {
      id: 1
    });

    var person = store.get('person', 1);
    var dog = store.get('dog', 1);

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      id: 1,
      thing: 'thing'
    }));
    assert.equal(person.thing, 'thing');
    assert.equal(dog.thing, 'thing');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
  });

  it('should put getters and setters on instances', function () {
    var Thing = store.defineResource({
      name: 'thing',
      computed: {
        name: ['first', 'last', function (first, last) {
          return first + ' ' + last;
        }]
      }
    });

    var thing = Thing.inject({
      id: 1,
      first: 'John',
      last: 'Anderson'
    });

    assert.isTrue(store.is('thing', thing));
    assert.isTrue(Thing.is(thing));

    assert.equal(thing.get('first'), 'John');
    assert.equal(thing.get('last'), 'Anderson');
    assert.isUndefined(thing.get('foo'));
    assert.equal(thing.get('name'), 'John Anderson');

    thing.set('first', 'Sally');
    assert.equal(thing.get('first'), 'Sally');
    assert.equal(thing.get('last'), 'Anderson');
    assert.equal(thing.get('name'), 'Sally Anderson');

    thing.set('last', 'Jones');

    assert.equal(thing.get('first'), 'Sally');
    assert.equal(thing.get('last'), 'Jones');
    assert.isUndefined(thing.get('foo'));
    assert.equal(thing.get('name'), 'Sally Jones');
  });

  it('should allow custom model class definitions', function () {

    function MyBaseBaseClass() {
      this.biz = 'baz';
    }

    function MyBaseClass() {
      this.foo = 'bar';

      this.instanceMethod = function (value) {
        return 'instanceMethod' + value;
      };
      this.firstNameBackwards = function () {
        return this.first.split("").reverse().join("");
      };
    }

    MyBaseClass.prototype = new MyBaseBaseClass();

    MyBaseClass.prototype.protoMethod = function (value) {
      return 'protoMethod' + value;
    };

    var Thing1 = store.defineResource({
      name: 'thing1',
      useClass: MyBaseClass
    });

    var thing1 = Thing1.inject({
      id: 1,
      first: 'John',
      last: 'Anderson'
    });

    assert.isFalse(Thing1.hasChanges(1));

    var Thing2 = store.defineResource({
      name: 'thing2',
      useClass: MyBaseClass
    });

    var thing2 = Thing2.inject({
      id: 2,
      first: 'Ferris',
      last: 'Bueller'
    });

    assert.equal(store.definitions.thing1.class, 'Thing1');
    assert.equal(store.definitions.thing2.class, 'Thing2');

    assert.isTrue(store.is('thing1', thing1));
    assert.isTrue(Thing1.is(thing1));

    assert.isTrue(store.is('thing2', thing2));
    assert.isTrue(Thing2.is(thing2));

    assert.isFalse(store.is('thing1', thing2));
    assert.isFalse(Thing1.is(thing2));

    assert.isFalse(store.is('thing2', thing1));
    assert.isFalse(Thing2.is(thing1));

    assert.equal(thing1.instanceMethod('Value'), 'instanceMethodValue');
    assert.equal(thing1.protoMethod('Value'), 'protoMethodValue');
    assert.equal(thing2.instanceMethod('Other'), 'instanceMethodOther');
    assert.equal(thing2.protoMethod('Other'), 'protoMethodOther');

    assert.equal(thing1.firstNameBackwards(), 'nhoJ');
    assert.equal(thing2.firstNameBackwards(), 'sirreF');

    /* Is this really necessary to test?
     thing2.firstNameBackwards = function(){
     return this.first.split("").reverse().join(".");
     }
     assert.equal(thing1.firstNameBackwards(), 'nhoJ');
     assert.equal(thing2.firstNameBackwards(), 's.i.r.r.e.F');
     */

  });
  it('should allow resources to extend other resources', function () {
    store.defineResource('baz');
    var Foo = store.defineResource({
      name: 'foo',
      relations: {
        belongsTo: {
          baz: {
            localField: 'baz',
            localKey: 'bazId',
            parent: true
          }
        }
      },
      methods: {
        say: function () {
          return this.constructor.name;
        }
      }
    });
    var Bar = store.defineResource({
      name: 'bar',
      'extends': 'foo'
    });
    assert.equal(Foo.name, 'foo');
    assert.equal(Bar.name, 'bar');

    var foo = Foo.createInstance({ id: 1, type: 'foo', bazId: 10 });
    var bar = Bar.createInstance({ id: 1, type: 'bar', bazId: 10 });

    assert.equal(foo.say(), 'Foo');
    assert.equal(bar.say(), 'Bar');

    assert.equal(Foo.getEndpoint(foo, {}), 'baz/10/foo');
    assert.equal(Bar.getEndpoint(bar, {}), 'baz/10/bar');
  });
});
