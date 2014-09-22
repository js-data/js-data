describe('DS.updateAll(resourceName, attrs, params[, options])', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    datastore.updateAll('does not exist').then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, 'does not exist is not a registered resource!');
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        datastore.updateAll('post', {}, {}, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
          assert.equal(err.message, '"options" must be an object!');
        });
      }
    });
  });
  it('should update a collection of items', function (done) {
    var _this = this;

    var post4 = datastore.inject('post', p4);
    var post5 = datastore.inject('post', p5);
    var posts = datastore.filter('post', { where: { age: { '==': 33 } } });

    var initialModified = datastore.lastModified('post', 8);
    var initialSaved = datastore.lastSaved('post', 8);

    datastore.updateAll('post', { age: 27 }, { where: { age: { '==': 33 } } }).then(function (ps) {
      assert.deepEqual(ps, posts, '2 posts should have been updated');
      assert.equal(posts[0].age, 27);
      assert.equal(posts[1].age, 27);
      assert.equal(post4.age, 27);
      assert.equal(post5.age, 27);
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(datastore.filter('post', { where: { age: { '==': 27 } } }), posts);
      assert.notEqual(datastore.lastModified('post', 8), initialModified);
      assert.notEqual(datastore.lastSaved('post', 8), initialSaved);

      datastore.updateAll('post', { age: 5 }, { where: { age: { '==': 31 } } }).then(function (ps) {
        assert.deepEqual(ps, datastore.filter('post', { where: { age: { '==': 5 } } }));
        assert.deepEqual(ps[0], { author: 'Jane', age: 5, id: 6 });
        assert.equal(lifecycle.beforeInject.callCount, 4, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 4, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts?where=%7B%22age%22:%7B%22%3D%3D%22:31%7D%7D');
        assert.equal(_this.requests[1].method, 'put');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ age: 5 }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
          { author: 'Jane', age: 5, id: 6 }
        ]));
      }, 30);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22age%22:%7B%22%3D%3D%22:33%7D%7D');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ age: 27 }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([
        { author: 'Adam', age: 27, id: 8 },
        { author: 'Adam', age: 27, id: 9 }
      ]));
    }, 30);
  });
  it('should handle nested resources', function (done) {
    var _this = this;
    var testComment = {
      id: 5,
      content: 'stuff',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'stuff',
      approvedBy: 4
    };

    datastore.inject('comment', testComment);

    datastore.updateAll('comment', {
      content: 'stuff'
    }, {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comments) {
      assert.deepEqual(comments, [testComment, testComment2]);
      assert.deepEqual(comments, datastore.filter('comment', {
        content: 'stuff'
      }));
      datastore.ejectAll('comment');

      datastore.inject('comment', testComment2);

      datastore.updateAll('comment', {
        content: 'stuff'
      }, {
        content: 'test'
      }).then(function (comments) {
        assert.deepEqual(comments, [testComment, testComment2]);
        assert.deepEqual(comments, datastore.filter('comment', {
          content: 'stuff',
          sort: 'id'
        }));
        datastore.ejectAll('comment');

        datastore.inject('comment', testComment2);

        datastore.updateAll('comment', {
          content: 'stuff'
        }, {
          content: 'test'
        }, {
          params: {
            approvedBy: false
          }
        }).then(function (comments) {
          assert.deepEqual(comments, [testComment, testComment2]);
          assert.deepEqual(comments, datastore.filter('comment', {
            content: 'stuff',
            sort: 'id'
          }));
          done();
        }).catch(function () {
          done('Should not have failed!');
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment?content=test');
          assert.equal(_this.requests[2].method, 'put');
          assert.equal(_this.requests[2].requestBody, DSUtils.toJson({ content: 'stuff' }));
          _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
        }, 30);
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[1].method, 'put');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ content: 'stuff' }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment?content=test');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ content: 'stuff' }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([testComment, testComment2]));
    }, 30);
  });
});
