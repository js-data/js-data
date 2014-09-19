describe('DS.get(resourceName, id[, options])', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.get(' + resourceName + ', ' + id + '): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.get('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        datastore.get('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          datastore.get('post', 5, key);
        }, datastore.errors.IllegalArgumentError, errorPrefix('post', 5) + 'options: Must be an object!');
      }
    });
  });
  it('should return undefined if the query has never been made before', function () {
    assert.isUndefined(datastore.get('post', 5), 'should be undefined');
  });
  it('should return undefined and send the query to the server if the query has never been made before and loadFromServer is set to true', function (done) {
    var _this = this;

    assert.isUndefined(datastore.get('post', 5, { loadFromServer: true }), 'should be undefined');

    // There should only be one GET request, so this should have no effect.
    assert.isUndefined(datastore.get('post', 5, { loadFromServer: true }), 'should be undefined');

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));

      setTimeout(function () {
        assert.deepEqual(datastore.get('post', 5), p1, 'p1 should now be in the store');
        assert.isNumber(datastore.lastModified('post', 5));
        assert.isNumber(datastore.lastSaved('post', 5));
        done();
      }, 30);
    }, 30);
  });
});
