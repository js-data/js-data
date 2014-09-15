describe('DS.save(resourceName, id[, options])', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.save(' + resourceName + ', ' + id + '[, options]): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    datastore.save('does not exist', 5).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist', 5) + 'does not exist is not a registered resource!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      datastore.save('post', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix('post', key) + 'id: Must be a string or a number!');
      });
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        datastore.save('post', 5, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post', 5) + 'options: Must be an object!');
        });
      }
    });
  });
  it('should save an item to the server and inject the result', function (done) {
    var _this = this;
    datastore.inject('post', p1);

    var initialModified = datastore.lastModified('post', 5);
    var initialSaved = datastore.lastSaved('post', 5);

    datastore.get('post', 5).author = 'Jake';

    datastore.save('post', 5).then(function (post) {
      assert.deepEqual(DSUtils.toJson(post), DSUtils.toJson(datastore.get('post', 5)), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(datastore.get('post', 5), {
        author: 'Jake',
        id: 5,
        age: 30
      });
      datastore.digest();
      assert.notEqual(datastore.lastModified('post', 5), initialModified);
      assert.notEqual(datastore.lastSaved('post', 5), initialSaved);

      datastore.save('post', 6).then(function () {
        done('should not have succeeded');
      }).catch(function (err) {
        assert.isTrue(err instanceof datastore.errors.RuntimeError);
        assert.equal(err.message, errorPrefix('post', 6) + 'id: "6" not found!');
        done();
      });

      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'put');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
          author: 'Jake',
          age: 30,
          id: 5
        }));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          author: 'Jake',
          id: 5,
          age: 30
        }));
      } catch (err) {
        console.log(err.stack);
        done(err);
      }
    }, 30);
  });
  it('should save an item to the server but not inject the result', function (done) {
    var _this = this;
    var initialModified;
    var initialSaved;

    datastore.inject('post', p1);
    datastore.get('post', 5).author = 'Jake';

    datastore.save('post', 5, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(post, {
        random: 'stuff'
      }, 'should have the right response');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called only once');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called only once');
      assert.deepEqual(datastore.get('post', 5), {
        author: 'Jake',
        id: 5,
        age: 30
      });
      // item wasn't injected
      assert.equal(datastore.lastModified('post', 5), initialModified);
      assert.equal(datastore.lastSaved('post', 5), initialSaved);
      done();
    }).catch(function (err) {
      console.log(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      try {
        initialModified = datastore.lastModified('post', 5);
        initialSaved = datastore.lastSaved('post', 5);
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'put');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson(datastore.get('post', 5)));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          random: 'stuff'
        }));
      } catch (err) {
        console.log(err.stack);
        done(err);
      }
    }, 30);
  });
  it('should save changes of an item to the server', function (done) {
    var _this = this;
    datastore.inject('post', p1);

    var initialModified = datastore.lastModified('post', 5);
    var initialSaved = datastore.lastSaved('post', 5);
    var post1 = datastore.get('post', 5);

    post1.author = 'Jake';

    datastore.save('post', 5, { changesOnly: true }).then(function (post) {
      assert.deepEqual(post, post1, 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(datastore.get('post', 5), post1);
      assert.notEqual(datastore.lastModified('post', 5), initialModified);
      assert.notEqual(datastore.lastSaved('post', 5), initialSaved);

      datastore.save('post', 6).then(function () {
        done('should not have succeeded');
      }).catch(function (err) {
        assert.isTrue(err instanceof datastore.errors.RuntimeError);
        assert.equal(err.message, errorPrefix('post', 6) + 'id: "6" not found!');
        done();
      });

      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'put');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'Jake' }));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          author: 'Jake',
          id: 5,
          age: 30
        }));
      } catch (err) {
        console.log(err.stack);
        done(err);
      }
    }, 30);
  });
});
