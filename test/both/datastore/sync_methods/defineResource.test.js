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
  it('should allow default instance values', function () {
    store.defineResource('baz');
    var Foo = store.defineResource({
      name: 'foo',
      defaultValues: {
        beep: 'boop',
        foo: true
      }
    });
    var foo = Foo.createInstance({ id: 1, foo: false, type: 'foo', bazId: 10 });

    assert.equal(DSUtils.toJson(foo), DSUtils.toJson({
      beep: 'boop',
      foo: false,
      id: 1,
      type: 'foo',
      bazId: 10
    }));
  });
  it('should allow a bit of aspect oriented programming', function () {
    var Foo = store.defineResource('foo');

    var orig = Foo.createInstance;
    Foo.createInstance.before(function (attrs) {
      assert.isTrue(this === Foo);
      if (attrs && !('name' in attrs)) {
        attrs.name = 'hi';
      } else if (arguments.length === 0) {
        return [{ id: 'anonymous' }];
      }
    });
    assert.isFalse(orig === Foo.createInstance);

    var foo = Foo.createInstance({ id: 1 });
    var foo2 = Foo.createInstance();

    assert.deepEqual(DSUtils.toJson(foo), DSUtils.toJson({ id: 1, name: 'hi' }));
    assert.deepEqual(DSUtils.toJson(foo2), DSUtils.toJson({ id: 'anonymous' }));

    var newStore = new JSData.DS({ log: false });
    orig = newStore.createInstance;
    newStore.createInstance.before(function (resourceName, attrs) {
      if (attrs) {
        attrs.foo = 'bar';
      }
      assert.isTrue(this === newStore);
    });
    assert.isFalse(orig === newStore.createInstance);

    var NewFoo = newStore.defineResource('newFoo');

    foo = newStore.createInstance('newFoo', { id: 1 });

    assert.equal(foo.id, 1);
    assert.equal(foo.foo, 'bar');

    NewFoo.createInstance.before(function (attrs) {
      if (attrs) {
        attrs.beep = 'boop';
      }
      assert.isTrue(this === NewFoo);
    });
    foo = NewFoo.createInstance({ id: 1 });

    assert.equal(foo.id, 1);
    assert.equal(foo.beep, 'boop');
    assert.equal(foo.foo, 'bar');

    // clean up
    newStore.constructor.prototype.createInstance = orig;
  });
  it('should allow enhanced relation getters', function () {
    var wasItActivated = false;
    var Foo = store.defineResource({
      name: 'foo',
      relations: {
        belongsTo: {
          bar: {
            localField: 'bar',
            localKey: 'barId',
            get: function (Foo, relation, foo, orig) {
              // "relation.name" has relationship "relation.type" to "relation.relation"
              wasItActivated = true;
              return orig();
            }
          }
        }
      }
    });
    store.defineResource('bar');
    var foo = Foo.inject({
      id: 1,
      barId: 1,
      bar: {
        id: 1
      }
    });
    assert.equal(foo.bar.id, 1);
    assert.isTrue(wasItActivated);
  });
  it('should work with csp set to true', function () {
    var store = new JSData.DS({
      csp: true
    });
    var User = store.defineResource({
      name: 'user'
    });
    var user = User.createInstance({ name: 'John' });
    assert.isTrue(user instanceof User[User.class]);
    assert.equal(User[User.class].name, '');

    assert.equal(Post[Post.class].name, 'Post');
  });
});
