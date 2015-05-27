describe('DS#findAll', function () {
  it('should query the server for a collection', function () {
    var _this = this;
    Post.findAll();

    assert.deepEqual(JSON.stringify(Post.getAll()), JSON.stringify([]), 'The posts should not be in the store yet');

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
    }, 30);

    // Should have no effect because there is already a pending query
    return Post.findAll().then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));

      assert.deepEqual(JSON.stringify(Post.getAll()), JSON.stringify([p1, p2, p3, p4]), 'The posts are now in the store');
      assert.isNumber(Post.lastModified(5));
      assert.isNumber(Post.lastSaved(5));
      Post.find(p1.id); // should not trigger another XHR

      // Should not make a request because the request was already completed
      return Post.findAll();
    }).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts');
        assert.equal(_this.requests[1].method, 'GET');
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
      }, 30);

      // Should make a request because bypassCache is set to true
      return Post.findAll(null, {bypassCache: true});
    }).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
    });
  });
  it('should fail when no "idAttribute" is present on an item in the response', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
        {author: 'John', age: 30},
        {author: 'Sally', age: 31}
      ]));
    }, 30);

    return Post.findAll().then(function () {
      throw new Error('Should not have succeeded!');
    }, function (err) {
      assert(err.message, 'post.inject: "attrs" must contain the property specified by "idAttribute"!');
      assert.deepEqual(JSON.stringify(Post.getAll()), JSON.stringify([]), 'The posts should not be in the store');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called once');
      assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should not have been called');
    });
  });
  it('should query the server for a collection but not store the data if cacheResponse is false', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
    }, 30);

    return Post.findAll(null, {cacheResponse: false}).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));

      assert.deepEqual(JSON.stringify(Post.getAll()), JSON.stringify([]), 'The posts should not have been injected into the store');

      assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    });
  });
  it('should correctly propagate errors', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(404, {'Content-Type': 'text/plain'}, 'Not Found');
    }, 30);

    return Post.findAll().then(function () {
      throw new Error('Should not have succeeded!');
    }).catch(function (err) {
      assert.equal(err.data, 'Not Found');
    });
  });
  it('"params" argument is optional', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
    }, 30);

    return Post.findAll().then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));
      assert.deepEqual(JSON.stringify(Post.getAll()), JSON.stringify([p1, p2, p3, p4]), 'The posts are now in the store');

      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    });
  });
  it('"params"', function () {
    var _this = this;

    var params = {
      where: {
        author: 'Adam'
      }
    };

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22author%22:%22Adam%22%7D');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p4, p5]));
    }, 30);

    return Post.findAll(params).then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p4, p5]));
      assert.deepEqual(JSON.stringify(Post.filter(params)), JSON.stringify([p4, p5]), 'The posts are now in the store');
      assert.deepEqual(JSON.stringify(Post.filter({
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
    });
  });
  it('should return already injected items', function () {
    var _this = this;
    var u1 = {
      id: 1,
      name: 'John'
    };
    var u2 = {
      id: 2,
      name: 'Sally'
    };

    var Person = store.defineResource({
      name: 'person',
      endpoint: 'users',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/users');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([u1, u2]));
    }, 30);

    return Person.findAll().then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([
        Person.createInstance(u1),
        Person.createInstance(u2)
      ]));
      DSUtils.forEach(data, function (person) {
        assert.isTrue(Person.is(person), 'should be an instance of User');
      });
      assert.deepEqual(JSON.stringify(Person.getAll()), JSON.stringify([
        Person.createInstance(u1),
        Person.createInstance(u2)
      ]), 'The users are now in the store');

      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    });
  });
  it('should handle nested resources', function () {
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

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment?content=test');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
    }, 30);

    return Comment.findAll({
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comments) {
      assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
      assert.deepEqual(JSON.stringify(comments), JSON.stringify(Comment.filter({
        content: 'test'
      })));
      Comment.ejectAll();

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[1].method, 'GET');
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
      }, 30);

      return Comment.findAll({
        content: 'test'
      }, {
        bypassCache: true
      });
    }).then(function (comments) {
      assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
      assert.deepEqual(JSON.stringify(comments), JSON.stringify(Comment.filter({
        content: 'test'
      })));
      Comment.ejectAll();

      setTimeout(function () {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[2].method, 'GET');
        _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
      }, 30);

      return Comment.findAll({
        content: 'test'
      }, {
        bypassCache: true,
        params: {
          approvedBy: false
        }
      });
    }).then(function (comments) {
      assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
      assert.deepEqual(JSON.stringify(comments), JSON.stringify(Comment.filter({
        content: 'test'
      })));
    });
  });
  it('should use the fallback strategy', function () {
    var _this = this;

    var Thing = store.defineResource({
      name: 'thing',
      strategy: 'fallback',
      fallbackAdapters: ['http', 'localstorage']
    });

    return store.adapters.localstorage.update(Thing, 1, {
      thing: 'stuff',
      id: 1
    }).then(function (thing) {
      setTimeout(function () {
        try {
          assert.equal(1, _this.requests.length);
          assert.equal(_this.requests[0].url, 'http://test.js-data.io/thing?thing=stuff');
          assert.equal(_this.requests[0].method, 'GET');
          _this.requests[0].respond(500, {'Content-Type': 'text/plain'}, '500 - Internal Server Error');
        } catch (err) {
          console.error(err.stack);
        }
      }, 30);

      return Thing.findAll({thing: 'stuff'});
    }).then(function (things) {
      assert.deepEqual(DSUtils.toJson([{
        thing: 'stuff',
        id: 1
      }]), DSUtils.toJson(things));
    });
  });
  it('should "useFilter" and not "useFilter"', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1, p2, p3, p4]));
    }, 30);

    return Post.findAll().then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p1, p2, p3, p4]));

      Post.eject(p1.id);

      assert.deepEqual(JSON.stringify(store.store.post.queryData['{}']), JSON.stringify([p2, p3, p4]));

      return Post.findAll();
    }).then(function (data) {
      assert.isTrue(data === store.store.post.queryData['{}']);
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p2, p3, p4]));

      return Post.findAll(null, {useFilter: true});
    }).then(function (data) {
      assert.isFalse(data === store.store.post.queryData);
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p2, p3, p4]));
    });
  });

  it('"collections"', function () {
    var _this = this;

    var params = {
      where: {
        author: 'Adam'
      }
    };

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22author%22:%22Adam%22%7D');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p4, p5]));
    }, 30);

    var posts = Post.createCollection([], params);

    assert.equal(posts.resourceName, 'post');

    return posts.fetch().then(function (data) {
      assert.deepEqual(JSON.stringify(data), JSON.stringify([p4, p5]));
      assert.deepEqual(JSON.stringify(posts), JSON.stringify([p4, p5]));
      assert.deepEqual(JSON.stringify(Post.filter(params)), JSON.stringify([p4, p5]), 'The posts are now in the store');
      assert.deepEqual(JSON.stringify(Post.filter({
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

      return posts.fetch();
    }).then(function (p) {
      assert.isTrue(posts === p);
      assert.deepEqual(JSON.stringify(p), JSON.stringify([p4, p5]));
      return posts.fetch(null, { useFilter: true });
    }).then(function (p) {
      assert.isTrue(posts === p);
      assert.deepEqual(JSON.stringify(p), JSON.stringify([p4, p5]));
    });
  });

  it('"collections2"', function () {
    var _this = this;

    var params = {
      where: {
        author: 'Adam'
      }
    };

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22author%22:%22Adam%22%7D');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p4, p5, p6]));
    }, 30);

    var posts = Post.createCollection([p4, p5], params);
    assert.deepEqual(JSON.stringify(posts), JSON.stringify([p4, p5]));
    assert.equal(posts.resourceName, 'post');

    return posts.fetch().then(function (p) {
      assert.isTrue(posts === p);
      assert.equal(p.length, 3);
    });
  });
});
