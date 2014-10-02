describe('DS#get', function () {
  it('should return undefined and send the query to the server if the query has never been made before and loadFromServer is set to true', function (done) {
    var _this = this;

    if (_this.isNode) return done();

    assert.isUndefined(store.get('post', 5, { loadFromServer: true }), 'should be undefined');

    // There should only be one GET request, so this should have no effect.
    assert.isUndefined(store.get('post', 5, { loadFromServer: true }), 'should be undefined');

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));

      setTimeout(function () {
        assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify(p1), 'p1 should now be in the store');
        assert.isNumber(store.lastModified('post', 5));
        assert.isNumber(store.lastSaved('post', 5));
        done();
      }, 30);
    }, 30);
  });
});
