describe('DS#findAll', function () {
  it('should query the server for a collection', function (done) {
    var _this = this;
    store.findAll('post', {}).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    assert.deepEqual(JSON.stringify(store.filter('post', {})), JSON.stringify([]), 'The posts should not be in the store yet');

    // Should have no effect because there is already a pending query
    store.findAll('post', {}).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));

      assert.deepEqual(JSON.stringify(store.filter('post', {})), JSON.stringify([p1, p2, p3, p4]), 'The posts are now in the store');
      assert.isNumber(store.lastModified('post', 5));
      assert.isNumber(store.lastSaved('post', 5));
      store.find('post', p1.id); // should not trigger another XHR

      // Should not make a request because the request was already completed
      store.findAll('post', {}).then(function (data) {
        assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));
      }).catch(function (err) {
        console.error(err.stack);
        done('Should not have rejected!');
      });

      // Should make a request because bypassCache is set to true
      store.findAll('post', {}, { bypassCache: true }).then(function (data) {
        assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));
        assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('Should not have rejected!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts');
        assert.equal(_this.requests[1].method, 'get');
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
      }, 30);
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
    }, 30);
  });
  it('should fail when no "idAttribute" is present on an item in the response', function (done) {
    var _this = this;

    store.findAll('post', {}).then(function () {
      done('Should not have succeeded!');
    }, function (err) {
      try {
        assert(err.message, 'post.inject: "attrs" must contain the property specified by `idAttribute`!');
        assert.deepEqual(JSON.stringify(store.filter('post', {})), JSON.stringify([]), 'The posts should not be in the store');
        assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called once');
        assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should not have been called');
        done();
      } catch (e) {
        done(e.message);
      }
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
        { author: 'John', age: 30 },
        { author: 'Sally', age: 31 }
      ]));
    }, 30);
  });
  it('should query the server for a collection but not store the data if cacheResponse is false', function (done) {
    var _this = this;

    store.findAll('post', {}, { cacheResponse: false }).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));

      assert.deepEqual(JSON.stringify(store.filter('post', {})), JSON.stringify([]), 'The posts should not have been injected into the store');

      assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
    }, 30);
  });
  it('should correctly propagate errors', function (done) {
    var _this = this;

    store.findAll('post', {}).then(function () {
      done('Should not have succeeded!');
    }, function (err) {
      assert.equal(err.data, 'Not Found');
      done();
    }).catch(function (err) {
      assert.equal(err, 'Not Found');
      done();
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(404, {'Content-Type': 'text/plain'}, 'Not Found');
    }, 30);
  });
  it('"params" argument is optional', function (done) {
    var _this = this;

    store.findAll('post').then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));
      assert.deepEqual(JSON.stringify(store.filter('post', {})), JSON.stringify([p1, p2, p3, p4]), 'The posts are now in the store');

      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      done();
    }).catch(function (err) {
      console.error(err.message);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
    }, 30);
  });
  it('"params"', function (done) {
    var _this = this;

    var params = {
      where: {
        author: 'Adam'
      }
    };
    store.findAll('post', params).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p4, p5]));
      assert.deepEqual(JSON.stringify(store.filter('post', params)), JSON.stringify([p4, p5]), 'The posts are now in the store');
      assert.deepEqual(JSON.stringify(store.filter('post', {
        where: {
          id: {
            '>': 8
          }
        }
      })), JSON.stringify([p5]), 'The posts are now in the store');

      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      done();
    }).catch(function (err) {
      console.error(err.message);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22author%22:%22Adam%22%7D');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p4, p5]));
    }, 30);
  });
  it('should return already injected items', function (done) {
    var _this = this;
    var u1 = {
        id: 1,
        name: 'John'
      },
      u2 = {
        id: 2,
        name: 'Sally'
      };

    store.defineResource({
      name: 'person',
      endpoint: 'users',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    store.findAll('person').then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([
        DSUtils.deepMixIn(new store.definitions.person[store.definitions.person.class](), u1),
        DSUtils.deepMixIn(new store.definitions.person[store.definitions.person.class](), u2)
      ]));
      DSUtils.forEach(data, function (person) {
        assert.isTrue(person instanceof store.definitions.person[store.definitions.person.class], 'should be an instance of User');
      });
      assert.deepEqual(JSON.stringify(store.filter('person')), JSON.stringify([
        DSUtils.deepMixIn(new store.definitions.person[store.definitions.person.class](), u1),
        DSUtils.deepMixIn(new store.definitions.person[store.definitions.person.class](), u2)
      ]), 'The users are now in the store');

      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      done();
    }).catch(function (err) {
      console.error(err.message);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/users');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([u1, u2]));
    }, 30);
  });
  it('should handle nested resources', function (done) {
    var _this = this;
    var testComment = {
      id: 5,
      content: 'test',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };

    store.findAll('comment', {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comments) {
      assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
      assert.deepEqual(JSON.stringify(comments), JSON.stringify(store.filter('comment', {
        content: 'test'
      })));
      store.ejectAll('comment');

      store.findAll('comment', {
        content: 'test'
      }, {
        bypassCache: true
      }).then(function (comments) {
        assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
        assert.deepEqual(JSON.stringify(comments), JSON.stringify(store.filter('comment', {
          content: 'test'
        })));
        store.ejectAll('comment');

        store.findAll('comment', {
          content: 'test'
        }, {
          bypassCache: true,
          params: {
            approvedBy: false
          }
        }).then(function (comments) {
          assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
          assert.deepEqual(JSON.stringify(comments), JSON.stringify(store.filter('comment', {
            content: 'test'
          })));
          done();
        }).catch(function () {
          done('Should not have failed!');
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment?content=test');
          assert.equal(_this.requests[2].method, 'get');
          _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
        }, 30);
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[1].method, 'get');
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment?content=test');
      assert.equal(_this.requests[0].method, 'get');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
    }, 30);
  });
});
