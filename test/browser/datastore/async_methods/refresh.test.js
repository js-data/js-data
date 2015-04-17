describe('DS#refresh', function () {
  it('should get an item from the server', function () {
    var _this = this;
    var initialLastModified;

    // Should do nothing because the data isn't in the store
    return Post.refresh(5).then(function (post) {
      assert.isUndefined(post);

      assert.isUndefined(Post.get(5), 'The post should not be in the store yet');

      Post.inject(p1);
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(p1), 'The post is now in the store');

      initialLastModified = Post.lastModified(5);

      setTimeout(function () {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'GET');
        _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
          author: 'Jake',
          id: 5,
          age: 31
        }));
      }, 30);

      // Should refresh the item that's in the store
      Post.refresh(5);

      // Should have no effect because the request is already pending
      return Post.refresh(5);
    }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify({ author: 'Jake', age: 31, id: 5 }));
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify({
        author: 'Jake',
        age: 31,
        id: 5
      }), 'The post has been refreshed');
      assert.notEqual(Post.lastModified(5), initialLastModified);
    });
  });
});
