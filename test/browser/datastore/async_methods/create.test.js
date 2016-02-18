describe('DS#create', function () {
  it('should create an item and save it to the server', function () {
    var _this = this;

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length, 'should only have 1 request so far');
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts', 'url should be correct');
        assert.equal(_this.requests[0].method, 'POST', 'method should be POST');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'John', age: 30 }), 'request body should be correct');
        _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(p1));        
      } catch (err) {
        console.log(err.stack);
        throw err;
      }
    }, 100);

    return Post.create({ author: 'John', age: 30 }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p1), 'post 5 should have been created');
      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(p1)), 'post should be correct';
    });
  });
  it('should create an item and save it to the server but not inject the result', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'POST');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'John', age: 30 }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(p1));
    }, 100);

    return Post.create({ author: 'John', age: 30 }, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p1), 'post 5 should have been created');
      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should not have been called');
      assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should not have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.isUndefined(Post.get(5));
    });
  });
  it('should work with the upsert option', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'John', age: 30, id: 5 }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(p1));
    }, 100);

    return Post.create({ author: 'John', age: 30, id: 5 }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p1), 'post 5 should have been created');

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts');
        assert.equal(_this.requests[1].method, 'POST');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ author: 'Sue', age: 70, id: 6 }));
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(p2));
      }, 100);

      return Post.create({ author: 'Sue', age: 70, id: 6 }, { upsert: false });
    }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p2), 'post 6 should have been created');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
      assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called twice');
      assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called twice');
      assert.isDefined(Post.get(5));
      assert.isDefined(Post.get(6));
    });
  });
  it('should create an item that includes relations, save them to the server and inject the results', function () {
    var _this = this;
    var payload = {
      id: 99,
      name: 'Sally',
      profile: {
        id: 999,
        userId: 99,
        email: 'sally@test.com'
      }
    };

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user');
      assert.equal(_this.requests[0].method, 'POST');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
        name: 'Sally',
        profile: {
          email: 'sally@test.com'
        }
      }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(payload));
    }, 100);

    return User.create({
      name: 'Sally',
      profile: {
        email: 'sally@test.com'
      }
    }).then(function (user) {
      assert.equal(user.id, payload.id, 'user should have been created');

      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called twice');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called twice');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called twice');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called twice');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.equal(User.get(99).id, payload.id);
      assert.isObject(User.get(99).profile);
      assert.equal(Profile.get(999).id, 999);
      assert.isObject(Profile.get(999).user);

      return User.find(99); // should not trigger another http request
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
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment');
      assert.equal(_this.requests[0].method, 'POST');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ content: 'test', approvedBy: 4 }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment));
    }, 100);

    return Comment.create({
      content: 'test',
      approvedBy: 4
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(5)));

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment');
        assert.equal(_this.requests[1].method, 'POST');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ content: 'test' }));
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment2));
      }, 100);

      return Comment.create({
        content: 'test'
      }, {
        params: {
          approvedBy: 4
        }
      });
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(6)));

      setTimeout(function () {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment');
        assert.equal(_this.requests[2].method, 'POST');
        assert.equal(_this.requests[2].requestBody, DSUtils.toJson({ content: 'test', approvedBy: 4 }));
        _this.requests[2].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment2));
      }, 100);

      return Comment.create({
        content: 'test',
        approvedBy: 4
      }, {
        params: {
          approvedBy: false
        }
      });
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(6)));
    });
  });
  it('should find inverse links', function () {
    var _this = this;
    Organization.inject({
      id: 77
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/77/user');
      assert.equal(_this.requests[0].method, 'POST');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
        organizationId: 77,
        id: 88
      }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        organizationId: 77,
        id: 88
      }));
    }, 100);

    return User.create({
      organizationId: 77,
      id: 88
    }, { upsert: false }).then(function (user) {
      var organization = user.organization;
      assert.isArray(organization.users);
      assert.equal(1, organization.users.length);
      assert.isObject(user.organization);
      assert.isTrue(user.organization === organization);
      assert.isTrue(user === organization.users[0]);
    });
  });
  it('should create an item and save it to the server and omit certain fields', function () {
    var Foo = store.defineResource({
      name: 'foo',
      omit: ['skip_this'],
      computed: {
        fullName: ['first', 'last', function (first, last) {
          return first + ' ' + last;
        }]
      }
    });
    var _this = this;

    var foo = Foo.createInstance({
      first: 'John',
      last: 'Anderson',
      omit_this: 'beep',
      skip_this: 'boop'
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/foo');
      assert.equal(_this.requests[0].method, 'POST');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ first: 'John', last: 'Anderson' }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({ first: 'John', last: 'Anderson', id: 1 }));
    }, 100);

    return Foo.create(foo).then(function (f) {
      assert.deepEqual(JSON.stringify(f), JSON.stringify({ first: 'John', last: 'Anderson', id: 1, fullName: 'John Anderson' }), 'foo 1 should have been created');
      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(JSON.stringify(Foo.get(1)), JSON.stringify({ first: 'John', last: 'Anderson', id: 1, fullName: 'John Anderson' }));
    });
  });
  it('should create an temporary item with guid', function () {
    var Foo = store.defineResource({
      name: 'foo',
      idAttribute: 'foo_id'
    });

    var _this = this;
    var foo = Foo.inject({bar: 'bar'}, {temporary: true});
    var data = JSON.stringify(foo);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/foo');
      assert.equal(_this.requests[0].method, 'POST');
      assert.equal(_this.requests[0].requestBody, data);
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({ name: 'foo', foo_id: 2 }));
    }, 100);

    return Foo.create(foo).then(function (f) {
      assert.deepEqual(JSON.stringify(f), JSON.stringify({ name: 'foo', foo_id: 2 }), 'foo 1 should have been created');
      assert.deepEqual(JSON.stringify(Foo.get(2)), JSON.stringify({ name: 'foo', foo_id: 2}));
      assert.isDefined(Foo.get(foo.foo_id), 'Item with Temporary ID is still in the store');
    });
  });
});
