describe('DS#find', function () {
  it('should get an item from the server', function () {
    var _this = this;
    Post.find(5);

    assert.isUndefined(Post.get(5), 'The post should not be in the datastore yet');

    // Respond to the request
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
    }, 100);

    // Should have no effect because there is already a pending query
    return Post.find(5)
      .then(function (post) {
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
        assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(p1), 'The post is now in the datastore');
        assert.isNumber(Post.lastModified(5));
        assert.isNumber(Post.lastSaved(5));
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');

        // Should not make a request because the request was already completed
        return Post.find(5);
      })
      .then(function (post) {
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
        setTimeout(function () {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts/5');
          _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
        }, 100);

        // Should make a request because bypassCache is set to true
        return Post.find(5, { bypassCache: true });
      })
      .then(function (post) {
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));

        assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
      });
  });
  it('should get an item from the server when expired', function () {
    var _this = this;
    Post.find(5);

    assert.isUndefined(Post.get(5), 'The post should not be in the datastore yet');

    // Respond to the request
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
    }, 100);

    // Should have no effect because there is already a pending query
    return Post.find(5, { maxAge: -1 })
        .then(function (post) {
          assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
          assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(p1), 'The post is now in the datastore');
          assert.isNumber(Post.lastModified(5));
          assert.isNumber(Post.lastSaved(5));
          assert.equal(1, _this.requests.length);

          setTimeout(function () {
            assert.equal(2, _this.requests.length);
            assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts/5');
            _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
          }, 100);

          // Should make a request because the request was already completed but is expired
          return Post.find(5, { maxAge: -1 });
        })
        .then(function (post) {
          assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
          assert.equal(2, _this.requests.length);

          // Should not make a request when maxAge is 0
          return Post.find(5, { maxAge: 0 });
        })
        .then(function (post) {
          assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
          assert.equal(2, _this.requests.length);

          // Should not make a request when maxAge is null
          return Post.find(5, { maxAge: null });
        })
        .then(function (post) {
          assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
          assert.equal(2, _this.requests.length);

          assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
          assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
          assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
          assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
        });
  });
  it('should get an item from the server but not store it if cacheResponse is false', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
    }, 100);

    return Post.find(5, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));

      assert.isUndefined(Post.get(5), 'The post should not have been injected into the store');
      assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    });
  });
  it('should get an item from the server but not store it if cacheResponse is false', function () {
    var _this = this;
    store.defaults.cacheResponse = false;
    store.defaults.bypassCache = true;
    store.defaults.linkRelations = false;

    var _User = store.defineResource({
      name: '_user',
      relations: {
        hasMany: {
          _comment: {
            localField: 'comments',
            foreignKey: 'userId'
          }
        }
      }
    });

    var _Post = store.defineResource({
      name: '_post',
      relations: {
        hasMany: {
          _comment: {
            localField: 'comments',
            foreignKey: 'postId'
          }
        },
        belongsTo: {
          _user: {
            localField: 'user',
            localKey: 'userId'
          }
        }
      }
    });

    var _Comment = store.defineResource({
      name: '_comment',
      relations: {
        belongsTo: {
          _post: {
            localField: 'post',
            localKey: 'postId'
          },
          _user: {
            localField: 'user',
            localKey: 'userId'
          }
        }
      }
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/_user/5');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({
        id: 5,
        comments: [
          {
            id: 6,
            userId: 5,
            postId: 3,
            post: {
              id: 3
            }
          },
          {
            id: 7,
            userId: 5,
            postId: 2,
            post: {
              id: 2
            }
          }
        ]
      }));
    }, 100);

    return _User.find(5, { cacheResponse: false, with: ['comment', 'comment.post'] }).then(function (user) {
      assert.isTrue(_User.is(user));
      assert.isTrue(_Comment.is(user.comments[0]));
      assert.isTrue(_Comment.is(user.comments[1]));
      assert.isTrue(_Post.is(user.comments[0].post));
      assert.isTrue(_Post.is(user.comments[1].post));
    });
  });
  it('should correctly propagate errors', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(404, { 'Content-Type': 'text/plain' }, 'Not Found');
    }, 100);

    return Post.find(5).then(function () {
      throw new Error('Should not have succeeded!');
    }).catch(function (err) {
      assert.equal(err.data, 'Not Found');
    });
  });
  it('should handle nested resources', function () {
    var _this = this;
    var testComment = {
      id: 5,
      content: 'test',
      approvedBy: 4
    };

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment/5');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment));
    }, 100);

    return Comment.find(5, {
      params: {
        approvedBy: 4
      }
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(5)));

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment/5');
        assert.equal(_this.requests[1].method, 'GET');
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment));
      }, 100);

      return Comment.find(5, {
        bypassCache: true
      });
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(5)));

      setTimeout(function () {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment/5');
        assert.equal(_this.requests[2].method, 'GET');
        _this.requests[2].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment));
      }, 100);

      return Comment.find(5, {
        bypassCache: true,
        params: {
          approvedBy: false
        }
      });
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(5)));

      setTimeout(function () {
        assert.equal(4, _this.requests.length);
        assert.equal(_this.requests[3].url, 'http://test.js-data.io/organization/14/user/19/comment/19');
        assert.equal(_this.requests[3].method, 'GET');
        _this.requests[3].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(comment19));
      }, 100);

      return Comment.find(19, {
        bypassCache: true,
        params: {
          approvedBy: 19,
          organizationId: 14
        }
      });
    }).then(function (comment) {
      delete comment.approvedByUser.comments;
      delete comment.user.comments;
      assert.deepEqual(JSON.stringify(comment.approvedByUser), JSON.stringify(comment19.approvedByUser));
      assert.deepEqual(JSON.stringify(comment.user), JSON.stringify(comment19.user));
      assert.isTrue(comment === Comment.get(19));
    });
  });
  it('should use the fallback strategy', function () {
    var _this = this;

    var Thing = store.defineResource({
      name: 'thing',
      strategy: 'fallback',
      fallbackAdapters: ['localstorage', 'http']
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/thing/1');
        assert.equal(_this.requests[0].method, 'GET');
        _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({
          thing: 'stuff',
          id: 1
        }));
      } catch (err) {
        console.error(err.stack);
      }
    }, 100);

    return Thing.find(1).then(function (thing) {
      localStorage.setItem(store.adapters.localstorage.getIdPath(Thing, Thing, 2), JSON.stringify({
        stuff: 'thing',
        id: 2
      }));

      setTimeout(function () {
        try {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/thing/2');
          assert.equal(_this.requests[1].method, 'GET');
          _this.requests[1].respond(500, { 'Content-Type': 'application/json' }, '500 - Internal Servier Error');
        } catch (err) {
          console.error(err.stack);
        }
      }, 100);

      return Thing.find(2, {
        fallbackAdapters: ['http', 'localstorage']
      });
    }).then(function (thing) {
      assert.equal(localStorage.getItem(store.adapters.localstorage.getIdPath(Thing, Thing, thing.id)), DSUtils.toJson(thing));
    });
  });
  it('should get an item from the server and return metadata as array', function () {
    var _this = this;

    // Respond to the request
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
    }, 100);

    return Post.find(5, { returnMeta: 'array' })
      .spread(function (post, meta) {
        assert.isTrue(meta.adapter === 'http');
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
        assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(p1), 'The post is now in the datastore');
        assert.isNumber(Post.lastModified(5));
        assert.isNumber(Post.lastSaved(5));
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');

        // Should not make a request because the request was already completed
        return Post.find(5, { returnMeta: 'array' });
      })
      .spread(function (post, meta) {
        assert.isUndefined(meta.adapter);
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
        setTimeout(function () {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts/5');
          _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
        }, 100);

        // Should make a request because bypassCache is set to true
        return Post.find(5, { bypassCache: true });
      })
      .then(function (post) {
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));

        assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
      });
  });
  it('should get an item from the server and return metadata as object', function () {
    var _this = this;

    // Respond to the request
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
    }, 100);

    return Post.find(5, { returnMeta: 'object' })
      .then(function (response) {
        var post = response.response;
        var meta = response.meta;
        assert.isTrue(meta.adapter === 'http');
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
        assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(p1), 'The post is now in the datastore');
        assert.isNumber(Post.lastModified(5));
        assert.isNumber(Post.lastSaved(5));
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');

        // Should not make a request because the request was already completed
        return Post.find(5, { returnMeta: 'object' });
      })
      .then(function (response) {
        var post = response.response;
        var meta = response.meta;
        assert.isUndefined(meta.adapter);
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));
        setTimeout(function () {
          assert.equal(2, _this.requests.length);
          assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts/5');
          _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(p1));
        }, 100);

        // Should make a request because bypassCache is set to true
        return Post.find(5, { bypassCache: true });
      })
      .then(function (post) {
        assert.deepEqual(JSON.stringify(post), JSON.stringify(p1));

        assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
      });
  });
});
