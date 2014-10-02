describe('DS#defineResource', function () {
  it('should correctly register a resource', function (done) {
    var _this = this;

    var callCount = 0,
      test = {
        validate: function (resourceName, attrs, cb) {
          callCount += 1;
          cb(null, attrs);
        }
      };

    store.defineResource({
      name: 'Comment',
      basePath: 'hello/',
      validate: test.validate
    });

    var weirdThing = store.defineResource({
      name: 'weird-thing'
    });

    assert.equal(weirdThing.class, 'WeirdThing');

    assert.doesNotThrow(function () {
      assert.isUndefined(store.get('Comment', 5), 'should be undefined');
    });

    assert.isUndefined(store.get('Comment', 1, { loadFromServer: true }), 'should be undefined');

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'hello/Comment/1');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ name: 'Sally', id: 1 }));

      setTimeout(function () {
        assert.deepEqual(JSON.stringify(store.get('Comment', 1)), JSON.stringify({ name: 'Sally', id: 1 }));

        store.create('Comment', { name: 'John' }).then(function (comment) {
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
  it('should allow definition of computed properties', function (done) {
    var callCount = 0;

    store.defineResource({
      name: 'person',
      computed: {
        fullName: function (first, last) {
          callCount++;
          return first + ' ' + last;
        }
      }
    });

    store.defineResource({
      name: 'dog',
      computed: {
        fullName: ['first', 'last', function (f, l) {
          callCount++;
          return f + ' ' + l;
        }]
      }
    });

    store.inject('person', {
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com',
      id: 1
    });

    store.inject('dog', {
      first: 'doggy',
      last: 'dog',
      id: 1
    });

    var person = store.get('person', 1);
    var dog = store.get('dog', 1);

    assert.equal(person.fullName, 'John Anderson');
    assert.equal(dog.fullName, 'doggy dog');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');

    person.first = 'Johnny';

    // digest loop hasn't happened yet
    assert.equal(store.get('person', 1).first, 'Johnny');
    assert.equal(store.get('person', 1).fullName, 'John Anderson');
    assert.equal(store.get('dog', 1).fullName, 'doggy dog');

    store.digest();

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

      store.digest();

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

        store.digest();

        assert.equal(callCount, 5, 'fullName() should have been called 3 times');

        done();
      }, 50);
    }, 50);
  });
  it('should work if idAttribute is a computed property computed property', function (done) {
    store.defineResource({
      name: 'person',
      computed: {
        id: function (first, last) {
          return first + '_' + last;
        }
      }
    });

    store.inject('person', {
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com'
    });

    var person = store.get('person', 'John_Anderson');

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
    assert.equal(store.get('person', 'John_Anderson').first, 'Johnny');
    assert.equal(store.get('person', 'John_Anderson').id, 'John_Anderson');

    store.digest();

    setTimeout(function () {
      store.digest();

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
    var org66 = store.inject('organization', {
      id: 66
    });
    var org77 = store.inject('organization', {
      id: 77
    });
    var user88 = store.inject('user', {
      id: 88,
      organizationId: 66
    });

    store.link('user', 88, ['organization']);

    assert.isTrue(user88.organization === org66);

    user88.organizationId = 77;

    setTimeout(function () {
      store.digest();
      assert.isTrue(user88.organization === org77);
      done();
    }, 150);
  });
});
