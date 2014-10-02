describe('DS#lastSaved', function () {
  it('should lastSaved an item into the store', function (done) {
    var _this = this;
    var lastSaved = store.lastSaved('post', 5);
    assert.equal(store.lastSaved('post', 5), 0);

    assert.doesNotThrow(function () {
      store.inject('post', p1);
    });

    assert.notEqual(lastSaved, store.lastSaved('post', 5));

    lastSaved = store.lastSaved('post', 5);

    var post = store.get('post', 5);

    post.author = 'Jake';

    store.save('post', 5).then(function () {
      assert.notEqual(lastSaved, store.lastSaved('post', 5));
      done();
    }).catch(done);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
    }, 30);
  });
});
