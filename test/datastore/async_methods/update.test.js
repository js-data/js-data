describe('DS.update(resourceName, id, attrs[, options])', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.update(' + resourceName + ', ' + id + ', attrs[, options]): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    datastore.update('does not exist', 5).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist', 5) + 'does not exist is not a registered resource!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      datastore.update('post', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix('post', key) + 'id: Must be a string or a number!');
      });
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        datastore.update('post', 5, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post', 5) + 'attrs: Must be an object!');
        });
      }
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        datastore.update('post', 5, {}, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post', 5) + 'options: Must be an object!');
        });
      }
    });
  });
  it('should update an item', function (done) {
    var _this = this;
    var post = datastore.inject('post', p1);
    var initialModified = datastore.lastModified('post', 5);
    var initialSaved = datastore.lastSaved('post', 5);

    datastore.update('post', 5, { author: 'Jake' }).then(function (p) {
      assert.deepEqual(p, post, 'post 5 should have been updated');
      assert.equal(p.author, 'Jake');
      assert.equal(post.author, 'Jake');

      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(datastore.get('post', 5), post);
      assert.notEqual(datastore.lastModified('post', 5), initialModified);
      assert.notEqual(datastore.lastSaved('post', 5), initialSaved);

      datastore.update('post', 6, { author: 'Jane' }).then(function (p) {
        assert.deepEqual(p, datastore.get('post', 6));
        assert.deepEqual(p, { author: 'Jane', age: 31, id: 6 });
        assert.equal(lifecycle.beforeInject.callCount, 3, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 3, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts/6');
        assert.equal(_this.requests[1].method, 'put');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ author: 'Jane' }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ author: 'Jane', age: 31, id: 6 }));
      }, 30);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'Jake' }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ author: 'Jake', age: 30, id: 5 }));
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

    datastore.update('comment', 5, {
      content: 'stuff'
    }).then(function (comment) {
      assert.deepEqual(comment, testComment);
      assert.deepEqual(comment, datastore.get('comment', 5));

      var c = Comment.inject(testComment2);

      function onBeforeUpdate (resourceName, attrs) {
        attrs.other = 'stuff';
        assert.equal(resourceName, 'comment');
        assert.deepEqual(attrs, { content: 'stuff', other: 'stuff' });
      }

      function onAfterUpdate(resourceName, attrs) {
        assert.equal(resourceName, 'comment');
        assert.deepEqual(attrs, testComment2);
        assert.isFalse(testComment2 === attrs);
      }

      Comment.on('DS.beforeUpdate', onBeforeUpdate);
      Comment.on('DS.afterUpdate', onAfterUpdate);

      Comment.update(c, {
        content: 'stuff'
      }, {
        params: {
          approvedBy: 4
        }
      }).then(function (comment) {
        assert.deepEqual(comment, testComment2);
        assert.deepEqual(comment, datastore.get('comment', 6));

        datastore.inject('comment', testComment2);

        datastore.update('comment', 6, {
          content: 'stuff'
        }, {
          params: {
            approvedBy: false
          }
        }).then(function (comment) {
          assert.deepEqual(comment, testComment2);
          assert.deepEqual(comment, datastore.get('comment', 6));
          done();
        }).catch(function () {
          done('Should not have failed!');
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment/6');
          assert.equal(_this.requests[2].method, 'put');
          assert.equal(_this.requests[2].requestBody, DSUtils.toJson({ content: 'stuff' }));
          _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment2));
        }, 30);
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment/6');
        assert.equal(_this.requests[1].method, 'put');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ content: 'stuff' }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment2));
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment/5');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ content: 'stuff' }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment));
    }, 30);
  });
});
