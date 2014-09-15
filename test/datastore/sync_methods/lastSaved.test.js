describe('DS.lastSaved(resourceName[, id])', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.lastSaved(' + resourceName + '[, ' + id + ']): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.lastSaved('does not exist', {});
    }, datastore.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      if (key) {
        assert.throws(function () {
          datastore.lastSaved('post', key);
        }, datastore.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
      }
    });
  });
  it('should lastSaved an item into the store', function (done) {
    var _this = this;
    var lastSaved = datastore.lastSaved('post', 5);
    assert.equal(datastore.lastSaved('post', 5), 0);

    assert.doesNotThrow(function () {
      datastore.inject('post', p1);
    });

    assert.notEqual(lastSaved, datastore.lastSaved('post', 5));

    lastSaved = datastore.lastSaved('post', 5);

    var post = datastore.get('post', 5);

    post.author = 'Jake';

    datastore.save('post', 5).then(function () {
      assert.notEqual(lastSaved, datastore.lastSaved('post', 5));
      done();
    }).catch(done);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
    }, 30);
  });
});
