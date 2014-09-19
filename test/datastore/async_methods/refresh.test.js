describe('DS.refresh(resourceName, id[, options]): ', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.refresh(' + resourceName + ', ' + id + '[, options]): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    datastore.refresh('does not exist', 5).then(function () {
      fail('should not have succeeded');
    }).catch(function (err) {
      assert.isTrue(err instanceof datastore.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist', 5) + 'does not exist is not a registered resource!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      datastore.refresh('post', key).then(function () {
        fail('should not have succeeded');
      }).catch(function (err) {
        assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix('post', key) + 'id: Must be a string or a number!');
      });
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        datastore.refresh('post', 5, key).then(function () {
          fail('should not have succeeded');
        }).catch(function (err) {
          assert.isTrue(err instanceof datastore.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post', 5) + 'options: Must be an object!');
        });
      }
    });
  });
  it('should get an item from the server', function (done) {
    var _this = this;

    // Should do nothing because the data isn't in the store
    datastore.refresh('post', 5).then(function (post) {
      assert.isUndefined(post);
    });

    assert.isUndefined(datastore.get('post', 5), 'The post should not be in the store yet');

    datastore.inject('post', p1);
    assert.deepEqual(datastore.get('post', 5), p1, 'The post is now in the store');

    var initialLastModified = datastore.lastModified('post', 5);

    // Should refresh the item that's in the store
    datastore.refresh('post', 5).then(function (post) {
      assert.deepEqual(post, { author: 'Jake', age: 31, id: 5 });
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    // Should have no effect because the request is already pending
    datastore.refresh('post', 5).then(function (post) {
      assert.deepEqual(post, { author: 'Jake', age: 31, id: 5 });
      assert.deepEqual(datastore.get('post', 5), { author: 'Jake', age: 31, id: 5 }, 'The post has been refreshed');
      assert.notEqual(datastore.lastModified('post', 5), initialLastModified);
      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'get');
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          author: 'Jake',
          id: 5,
          age: 31
        }));
      } catch (err) {
        console.log(err.stack);
        done(err);
      }
    }, 30);
  });
});
