describe('DS.create(resourceName, attrs[, options])', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    datastore.create('fruit loops', 5).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, 'fruit loops is not a registered resource!');
    });
  });
  it('should create an item and save it to the server', function (done) {
    var _this = this;

    datastore.create('post', { author: 'John', age: 30 }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p1), 'post 5 should have been created');
      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(JSON.stringify(datastore.get('post', 5)), JSON.stringify(p1));
      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'post');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'John', age: 30 }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
    }, 30);
  });
  it('should create an item and save it to the server but not inject the result', function (done) {
    var _this = this;
    datastore.create('post', { author: 'John', age: 30 }, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p1), 'post 5 should have been created');
      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should not have been called');
      assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should not have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.isUndefined(datastore.get('post', 5));
      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts');
      assert.equal(_this.requests[0].method, 'post');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'John', age: 30 }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
    }, 30);
  });
  it('should work with the upsert option', function (done) {
    var _this = this;

    datastore.create('post', { author: 'John', age: 30, id: 5 }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p1), 'post 5 should have been created');

      datastore.create('post', { author: 'Sue', age: 70, id: 6 }, { upsert: false }).then(function (post) {
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p2), 'post 6 should have been created');
        assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
        assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
        assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
        assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
        assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
        assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
        assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called twice');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called twice');
        assert.isDefined(datastore.get('post', 5));
        assert.isDefined(datastore.get('post', 6));
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts');
        assert.equal(_this.requests[1].method, 'post');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ author: 'Sue', age: 70, id: 6 }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p2));
      }, 30);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'John', age: 30, id: 5 }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
    }, 30);
  });
  it('should create an item that includes relations, save them to the server and inject the results', function (done) {
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

    datastore.create('user', {
      name: 'Sally',
      profile: {
        email: 'sally@test.com'
      }
    }, {
      findBelongsTo: true
    }).then(function (user) {
      assert.equal(user.id, payload.id, 'user should have been created');

      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called twice');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called twice');
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.equal(datastore.get('user', 99).id, payload.id);
      assert.isObject(datastore.get('user', 99).profile);
      assert.equal(datastore.get('profile', 999).id, 999);
      assert.isObject(datastore.get('profile', 999).user);

      datastore.find('user', 99); // should not trigger another http request

      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user');
      assert.equal(_this.requests[0].method, 'post');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
        name: 'Sally',
        profile: {
          email: 'sally@test.com'
        }
      }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(payload));
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

    datastore.create('comment', {
      content: 'test',
      approvedBy: 4
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(datastore.get('comment', 5)));

      datastore.create('comment', {
        content: 'test'
      }, {
        params: {
          approvedBy: 4
        }
      }).then(function (comment) {
        assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
        assert.deepEqual(JSON.stringify(comment), JSON.stringify(datastore.get('comment', 6)));

        datastore.create('comment', {
          content: 'test',
          approvedBy: 4
        }, {
          params: {
            approvedBy: false
          }
        }).then(function (comment) {
          assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
          assert.deepEqual(JSON.stringify(comment), JSON.stringify(datastore.get('comment', 6)));
          done();
        }).catch(function () {
          done('Should not have failed!');
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment');
          assert.equal(_this.requests[2].method, 'post');
          assert.equal(_this.requests[2].requestBody, DSUtils.toJson({ content: 'test', approvedBy: 4 }));
          _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment2));
        }, 30);
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment');
        assert.equal(_this.requests[1].method, 'post');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ content: 'test' }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment2));
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment');
      assert.equal(_this.requests[0].method, 'post');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ content: 'test', approvedBy: 4 }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment));
    }, 30);
  });
  it('should find inverse links', function (done) {
    var _this = this;
    datastore.inject('organization', {
      id: 77
    });

    datastore.create('user', {
      organizationId: 77,
      id: 88
    }, { upsert: false, findBelongsTo: true }).then(function (user) {
      var organization = datastore.link('organization', 77, ['user']);
      assert.isArray(organization.users);
      assert.equal(1, organization.users.length);
      assert.isObject(user.organization);
      assert.isTrue(user.organization === organization);
      assert.isTrue(user === organization.users[0]);
      done();
    }).catch(function () {
      done('Should not have succeeded!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/organization/77/user');
      assert.equal(_this.requests[0].method, 'post');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
        organizationId: 77,
        id: 88
      }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
        organizationId: 77,
        id: 88
      }));
    }, 30);
  });
});
