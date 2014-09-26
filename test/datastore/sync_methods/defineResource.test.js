describe('DS.defineResource(definition)', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_OBJECT, function (key) {
      if (!DSUtils.isArray(key)) {
        assert.throws(function () {
          datastore.defineResource(key);
        }, datastore.errors.IllegalArgumentError, '"definition" must be an object!');
      }
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING, function (key) {
      assert.throws(function () {
        datastore.defineResource({ name: key });
      }, datastore.errors.IllegalArgumentError, '"name" must be a string!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING, function (key) {
      if (key) {
        assert.throws(function () {
          datastore.defineResource({ name: 'name', idAttribute: key });
        }, datastore.errors.IllegalArgumentError, '"idAttribute" must be a string!');
      }
    });

    datastore.defineResource('fake');

    assert.throws(function () {
      datastore.defineResource('fake');
    }, datastore.errors.RuntimeError, 'fake is already registered!');

    assert.doesNotThrow(function () {
      datastore.defineResource('new resource');
      assert.equal(datastore.definitions.newresource.class, 'Newresource');
    }, 'Should not throw');
  });

  it('should correctly register a resource', function (done) {
    var _this = this;

    var callCount = 0,
      test = {
        validate: function (resourceName, attrs, cb) {
          callCount += 1;
          cb(null, attrs);
        }
      };

    datastore.defineResource({
      name: 'Comment',
      basePath: 'hello/',
      validate: test.validate
    });

    var weirdThing = datastore.defineResource({
      name: 'weird-thing'
    });

    assert.equal(weirdThing.class, 'WeirdThing');

    assert.doesNotThrow(function () {
      assert.isUndefined(datastore.get('Comment', 5), 'should be undefined');
    });

    assert.isUndefined(datastore.get('Comment', 1, { loadFromServer: true }), 'should be undefined');

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'hello/Comment/1');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ name: 'Sally', id: 1 }));

      setTimeout(function () {
        assert.deepEqual(JSON.stringify(datastore.get('Comment', 1)), JSON.stringify({ name: 'Sally', id: 1 }));

        datastore.create('Comment', { name: 'John' }).then(function (comment) {
          assert.deepEqual(JSON.stringify(comment), JSON.stringify({ name: 'John', id: 2 }));
          assert.equal(callCount, 1, 'overridden validate should have been called once');
          assert.equal(lifecycle.validate.callCount, 0, 'global validate should not have been called');
          done();
        }).catch(done);

        setTimeout(function () {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'hello/Comment');
          assert.equal(_this.requests[1].method, 'post');
          assert.equal(_this.requests[1].requestBody, JSON.stringify({ name: 'John' }));
          _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ name: 'John', id: 2 }));
        }, 30);
      }, 30);
    }, 30);
  });
  it('should allow custom behavior to be applied to resources', function () {
    var Person = datastore.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    var Dog = datastore.defineResource({
      name: 'dog',
      useClass: true
    });

    var Cat = datastore.defineResource({
      name: 'cat'
    });

    datastore.inject('person', {
      first: 'John',
      last: 'Anderson',
      id: 1
    });

    datastore.inject('dog', {
      name: 'Spot',
      id: 1
    });

    datastore.inject('cat', {
      name: 'Sam',
      id: 1
    });

    var person = datastore.get('person', 1);
    var person2 = Person.get(1);

    var dog = datastore.get('dog', 1);
    var dog2 = Dog.get(1);

    var cat = datastore.get('cat', 1);
    var cat2 = Cat.get(1);

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      id: 1
    }));
    assert.deepEqual(person, person2, 'persons should be equal');
    assert.deepEqual(dog, dog2, 'dogs should be equal');
    assert.deepEqual(cat, cat2, 'cats should be equal');
    assert.equal(person.fullName(), 'John Anderson');
    assert.isTrue(person instanceof datastore.definitions.person[datastore.definitions.person.class]);
    assert.isTrue(dog instanceof datastore.definitions.dog[datastore.definitions.dog.class]);
    assert.isTrue(cat instanceof Object);
    assert.equal(datastore.definitions.person.class, 'Person');
    assert.equal(datastore.definitions.person[datastore.definitions.person.class].name, 'Person');
    assert.equal(lifecycle.beforeInject.callCount, 3, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 3, 'afterInject should have been called');
  });
  it('should allow definition of computed properties', function (done) {
    var callCount = 0;

    datastore.defineResource({
      name: 'person',
      computed: {
        fullName: function (first, last) {
          callCount++;
          return first + ' ' + last;
        }
      }
    });

    datastore.defineResource({
      name: 'dog',
      computed: {
        fullName: ['first', 'last', function (f, l) {
          callCount++;
          return f + ' ' + l;
        }]
      }
    });

    datastore.inject('person', {
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com',
      id: 1
    });

    datastore.inject('dog', {
      first: 'doggy',
      last: 'dog',
      id: 1
    });

    var person = datastore.get('person', 1);
    var dog = datastore.get('dog', 1);

    assert.equal(person.fullName, 'John Anderson');
    assert.equal(dog.fullName, 'doggy dog');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');

    person.first = 'Johnny';

    // digest loop hasn't happened yet
    assert.equal(datastore.get('person', 1).first, 'Johnny');
    assert.equal(datastore.get('person', 1).fullName, 'John Anderson');
    assert.equal(datastore.get('dog', 1).fullName, 'doggy dog');

    datastore.digest();

    setTimeout(function () {
      assert.deepEqual(JSON.stringify(person), JSON.stringify({
        first: 'Johnny',
        last: 'Anderson',
        email: 'john.anderson@test.com',
        id: 1,
        fullName: 'Johnny Anderson'
      }));
      assert.equal(person.fullName, 'Johnny Anderson');

      person.first = 'Jack';
      dog.first = 'spot';

      datastore.digest();

      setTimeout(function () {
        assert.deepEqual(JSON.stringify(person), JSON.stringify({
          first: 'Jack',
          last: 'Anderson',
          email: 'john.anderson@test.com',
          id: 1,
          fullName: 'Jack Anderson'
        }));
        assert.equal(person.fullName, 'Jack Anderson');
        assert.equal(dog.fullName, 'spot dog');

        // computed property function should not be called
        // when a property changes that isn't a dependency
        // of the computed property
        person.email = 'ja@test.com';

        datastore.digest();

        assert.equal(callCount, 5, 'fullName() should have been called 3 times');

        done();
      }, 50);
    }, 50);
  });
  it('should allow definition of computed properties that have no dependencies', function () {
    datastore.defineResource({
      name: 'person',
      computed: {
        thing: function () {
          return 'thing';
        }
      }
    });

    datastore.defineResource({
      name: 'dog',
      computed: {
        thing: [function () {
          return 'thing';
        }]
      }
    });

    datastore.inject('person', {
      id: 1
    });

    datastore.inject('dog', {
      id: 1
    });

    var person = datastore.get('person', 1);
    var dog = datastore.get('dog', 1);

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      id: 1,
      thing: 'thing'
    }));
    assert.equal(person.thing, 'thing');
    assert.equal(dog.thing, 'thing');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
  });
  it('should work if idAttribute is a computed property computed property', function (done) {
    datastore.defineResource({
      name: 'person',
      computed: {
        id: function (first, last) {
          return first + '_' + last;
        }
      }
    });

    datastore.inject('person', {
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com'
    });

    var person = datastore.get('person', 'John_Anderson');

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com',
      id: 'John_Anderson'
    }));
    assert.equal(person.id, 'John_Anderson');
    assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');

    person.first = 'Johnny';

    // digest loop hasn't happened yet
    assert.equal(datastore.get('person', 'John_Anderson').first, 'Johnny');
    assert.equal(datastore.get('person', 'John_Anderson').id, 'John_Anderson');

    datastore.digest();

    setTimeout(function () {
      datastore.digest();

      assert.deepEqual(JSON.stringify(person), JSON.stringify({
        first: 'Johnny',
        last: 'Anderson',
        email: 'john.anderson@test.com',
        id: 'Johnny_Anderson'
      }));
      assert.equal(person.id, 'Johnny_Anderson');

      done();
    }, 50);
  });
  it('should update links', function (done) {
    var org66 = datastore.inject('organization', {
      id: 66
    });
    var org77 = datastore.inject('organization', {
      id: 77
    });
    var user88 = datastore.inject('user', {
      id: 88,
      organizationId: 66
    });

    datastore.link('user', 88, ['organization']);

    assert.isTrue(user88.organization === org66);

    user88.organizationId = 77;

    setTimeout(function () {
      datastore.digest();
      assert.isTrue(user88.organization === org77);
      done();
    }, 150);
  });
});
