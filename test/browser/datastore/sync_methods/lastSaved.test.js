describe('DS#lastSaved', function () {
  it('should lastSaved an item into the store', function (done) {
    var _this = this;
    var lastSaved = Post.lastSaved( 5);
    assert.equal(Post.lastSaved( 5), 0);

    assert.doesNotThrow(function () {
      Post.inject(p1);
    });

    assert.equal(lastSaved, Post.lastSaved( 5));

    lastSaved = Post.lastSaved( 5);

    var post = Post.get(5);

    post.author = 'Jake';

    store.save('post', 5).then(function () {
      assert.notEqual(lastSaved, Post.lastSaved( 5));
      done();
    }).catch(done);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(p1));
    }, 30);
  });
});
