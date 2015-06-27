describe('DS#refreshAll', function () {
  it('should refresh items from the server', function () {
    var _this = this;

    Post.inject([p4, p5, p6]);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?age=33');
      assert.equal(_this.requests[0].method, 'GET');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p4, p6]));
    }, 100);

    return Post.refreshAll({
      age: 33
    }).then(function (posts) {
      console.log(posts);
      assert.equal(posts.length, 2);
      assert.equal(Post.getAll().length, 2);
      assert.isDefined(Post.get(8));
      assert.isUndefined(Post.get(9));
      assert.isDefined(Post.get(10));
    });
  });
});
