describe('DS.previous(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.previous(' + resourceName + '[, ' + id + ']): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.previous('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.previous('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {

    assert.isUndefined(datastore.previous('post', 5));
  });
  it('should return the previous in an object', function (done) {
    var _this = this;
    datastore.inject('post', p1);

    var post = datastore.get('post', 5);

    assert.deepEqual(datastore.previous('post', 5), p1);

    post.author = 'Jake';

    datastore.digest();

    assert.deepEqual(datastore.previous('post', 5), p1);
    assert.deepEqual(datastore.get('post', 5), { author: 'Jake', age: 30, id: 5 });

    datastore.save('post', 5).then(function () {
      assert.deepEqual(datastore.previous('post', 5), { author: 'Jake', age: 30, id: 5 }, 'previous attributes should have been updated');
      assert.deepEqual(datastore.get('post', 5), { author: 'Jake', age: 30, id: 5 });
      done();
    }).catch(done);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.deepEqual(JSON.stringify(datastore.get('post', 5)), _this.requests[0].requestBody);
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ author: 'Jake', age: 30, id: 5 }));
    }, 30);
  });
  it('should return the previous in an object and save changed only', function (done) {
    var _this = this;
    datastore.inject('post', p1);

    var post = datastore.get('post', 5);

    assert.deepEqual(datastore.previous('post', 5), p1);

    post.author = 'Jake';

    datastore.digest();

    assert.deepEqual(datastore.previous('post', 5), p1);
    assert.deepEqual(datastore.get('post', 5), { author: 'Jake', age: 30, id: 5 });

    datastore.save('post', 5, { changesOnly: true }).then(function () {
      assert.deepEqual(datastore.previous('post', 5), { author: 'Jake', age: 30, id: 5 }, 'previous attributes should have been updated');
      assert.deepEqual(datastore.get('post', 5), { author: 'Jake', age: 30, id: 5 });
      done();
    }).catch(done);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.deepEqual(JSON.stringify({ author: 'Jake' }), _this.requests[0].requestBody);
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ author: 'Jake', age: 30, id: 5 }));
    }, 30);
  });
});
