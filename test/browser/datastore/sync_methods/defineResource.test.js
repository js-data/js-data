describe('DS#defineResource', function () {
  it('should correctly register a resource', function () {
    var _this = this;

    var callCount = 0,
      test = {
        validate: function (resourceName, attrs, cb) {
          callCount += 1;
          cb(null, attrs);
        }
      };

    var Comment = store.defineResource({
      name: 'Comment',
      basePath: 'hello/',
      validate: test.validate
    });

    assert.isTrue(Comment.getAdapter() === store.getAdapter(), 'should get the same default adapter');
    assert.isTrue(Comment.getAdapter({adapter: 'http'}) === store.getAdapter({adapter: 'http'}), 'should get the same adapter');

    var weirdThing = store.defineResource({
      name: 'weird-thing'
    });

    assert.equal(weirdThing.class, 'WeirdThing');
    assert.isUndefined(Comment.get(5), 'should be undefined');

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'hello/Comment');
        assert.equal(_this.requests[0].method, 'POST');
        assert.equal(_this.requests[0].requestBody, JSON.stringify({name: 'John'}));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          name: 'John',
          id: 2
        }));
      } catch (err) {
        console.log(err.stack);
      }
    }, 100);

    return store.create('Comment', {name: 'John'}).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify({name: 'John', id: 2}));
      assert.equal(callCount, 1, 'overridden validate should have been called once');
      assert.equal(lifecycle.validate.callCount, 0, 'global validate should not have been called');
    });
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
  it('should allow definition of computed properties as property accessors', function () {
    var callCount = 0;

    store.defineResource({
      name: 'person',
      computed: {
        fullName: {
          enumerable: true,
          get: function () {
            callCount++;
            return this.first + ' ' + this.last;
          }
        }
      }
    });

    store.defineResource({
      name: 'dog',
      computed: {
        fullName: {
          enumerable: true,
          get: function () {
            callCount++;
            return this.first + ' ' + this.last;
          }
        }
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
    assert.equal(store.get('dog', 1).fullName, 'doggy dog');

    assert.equal(person.first, 'Johnny');
    assert.equal(person.last, 'Anderson');
    assert.equal(person.fullName, 'Johnny Anderson');

    person.first = 'Jack';
    dog.first = 'spot';

    assert.equal(person.first, 'Jack');
    assert.equal(person.last, 'Anderson');
    assert.equal(person.fullName, 'Jack Anderson');
    assert.equal(dog.fullName, 'spot dog');

    // computed property function should not be called
    // when a property changes that isn't a dependency
    // of the computed property
    person.email = 'ja@test.com';


    assert.isTrue(callCount > 0);
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

    assert.isTrue(user88.organization === org66);

    user88.organizationId = 77;

    setTimeout(function () {
      store.digest();
      assert.isTrue(user88.organization === org77);
      done();
    }, 150);
  });
  it('should allow definition of POST actions', function (done) {
    var _this = this;
    var newStore = new JSData.DS({
      debug: false,
      basePath: 'http://foo.com',
      actions: {
        test: {
          method: 'POST'
        }
      }
    });

    newStore.registerAdapter('http', dsHttpAdapter, {default: true});

    var Thing2 = newStore.defineResource({
      name: 'thing2',
      actions: {
        count: {
          method: 'POST'
        },
        foo: {
          method: 'POST',
          pathname: 'bar'
        }
      }
    });

    Thing2.test({
      data: 'thing2 payload'
    }).then(function (data) {
      assert.equal(data.data, 'stuff');

      Thing2.count().then(function (data) {
        assert.equal(data.data, 'stuff2');

        Thing2.foo().then(function (data) {
          assert.equal(data.data, 'stuff3');

          done();
        });

        setTimeout(function () {
          try {
            assert.equal(3, _this.requests.length);
            assert.equal(_this.requests[2].url, 'http://foo.com/thing2/bar');
            assert.equal(_this.requests[2].method, 'POST');
            _this.requests[2].respond(200, {'Content-Type': 'text/plain'}, 'stuff3');
          } catch (err) {
            done(err);
          }
        }, 100);
      });

      setTimeout(function () {
        try {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://foo.com/thing2/count');
          assert.equal(_this.requests[1].method, 'POST');
          _this.requests[1].respond(200, {'Content-Type': 'text/plain'}, 'stuff2');
        } catch (err) {
          done(err);
        }
      }, 100);
    }).catch(done);

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://foo.com/thing2/test');
        assert.equal(_this.requests[0].method, 'POST');
        assert.equal(_this.requests[0].requestBody, 'thing2 payload');
        _this.requests[0].respond(200, {'Content-Type': 'text/plain'}, 'stuff');
      } catch (err) {
        done(err);
      }
    }, 100);
  });
  it('should allow definition of GET actions', function (done) {
    var _this = this;
    var newStore = new JSData.DS({
      debug: false,
      actions: {
        test: {},
        test2: {
          endpoint: 'blah'
        }
      }
    });

    newStore.registerAdapter('http2', dsHttpAdapter);
    newStore.registerAdapter('http', dsHttpAdapter, {default: true});

    var Thing = newStore.defineResource({
      name: 'thing',
      endpoint: 'foo',
      actions: {
        count: {
          method: 'GET',
          adapter: 'http2'
        }
      }
    });


    Thing.test().then(function (data) {
      assert.equal(data.data, 'stuff');

      Thing.count().then(function (data) {
        assert.equal(data.data, 'stuff2');

        Thing.test2().then(function (data) {
          assert.equal(data.data, 'blah');

          Thing.test2(1).then(function (data) {
            assert.equal(data.data, 'bleh');

            done();
          });

          setTimeout(function () {
            assert.equal(4, _this.requests.length);
            console.log(_this.requests[3]);
            assert.equal(_this.requests[3].url, 'blah/1/test2');
            assert.equal(_this.requests[3].method, 'GET');
            _this.requests[3].respond(200, {'Content-Type': 'text/plain'}, 'bleh');

          }, 100);
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'blah/test2');
          assert.equal(_this.requests[2].method, 'GET');
          _this.requests[2].respond(200, {'Content-Type': 'text/plain'}, 'blah');

        }, 100);
      }).catch(done);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'foo/count');
        assert.equal(_this.requests[1].method, 'GET');
        _this.requests[1].respond(200, {'Content-Type': 'text/plain'}, 'stuff2');

      }, 100);
    }).catch(done);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'foo/test');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'text/plain'}, 'stuff');
    }, 100);
  });
  it('should allow instance events', function (done) {
    var changed = false;
    var Foo = store.defineResource('foo');
    var foo = Foo.inject({id: 1});

    setTimeout(function () {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    foo.on('DS.change', function (Foo, foo) {
      changed = true;
      done();
    });

    foo.bar = 'baz';
  });
  it('should allow Resource change events', function (done) {
    var changed = false;
    var Foo = store.defineResource('foo');
    var foo = Foo.inject({id: 1});

    setTimeout(function () {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    Foo.on('DS.change', function (Foo, foo) {
      changed = true;
      done();
    });

    foo.bar = 'baz';
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

    var foo = Foo.createInstance({id: 1, type: 'foo', bazId: 10});
    var bar = Bar.createInstance({id: 1, type: 'bar', bazId: 10});

    assert.equal(foo.say(), 'Foo');
    assert.equal(bar.say(), 'Bar');

    assert.equal(dsHttpAdapter.getEndpoint(Foo, foo, {}), 'baz/10/foo');
    assert.equal(dsHttpAdapter.getEndpoint(Bar, bar, {}), 'baz/10/bar');
  });
  it('should allow instance events 2', function (done) {
    var changed = false;
    var Foo = store.defineResource('foo');
    var foo = Foo.createInstance({id: 1});

    setTimeout(function () {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    foo.on('DS.change', function (Foo, foo) {
      changed = true;
      done();
    });

    foo.set('bar', 'baz');
  });
  it('should allow Resource change events 2', function (done) {
    var changed = false;
    var Foo = store.defineResource('foo');
    var foo = Foo.createInstance({id: 1});

    setTimeout(function () {
      if (!changed) {
        done('failed to fire change event');
      }
    }, 1000);

    Foo.on('DS.change', function (Foo, foo) {
      changed = true;
      done();
    });

    foo.set('bar', 'baz');
  });
});
