describe('DS#destroyAll', function () {
  it('should destroy all items', function () {
    var _this = this;
    Post.inject(p1);
    Post.inject(p2);
    Post.inject(p3);
    Post.inject(p4);
    Post.inject(p5);

    setTimeout(function () {
      assert.equal(_this.requests.length, 1);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22age%22:33%7D');
      assert.equal(_this.requests[0].method, 'DELETE');
      _this.requests[0].respond(200);
    }, 100);

    return Post.destroyAll({ where: { age: 33 } }).then(function () {
      assert.isDefined(Post.get(5));
      assert.isDefined(Post.get(6));
      assert.isDefined(Post.get(7));
      assert.isUndefined(Post.get(8));
      assert.isUndefined(Post.get(9));

      Post.inject(p1);
      Post.inject(p2);
      Post.inject(p3);
      Post.inject(p4);
      Post.inject(p5);

      setTimeout(function () {
        assert.equal(_this.requests.length, 2);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts');
        assert.equal(_this.requests[1].method, 'DELETE');
        _this.requests[1].respond(200);
      }, 100);

      return Post.destroyAll();
    }).then(function () {
      assert.deepEqual(JSON.stringify(Post.getAll()), JSON.stringify([]), 'The posts should not be in the store yet');
    });
  });
  it('should handle nested resources', function () {
    var _this = this;

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment?content=test');
      assert.equal(_this.requests[0].method, 'DELETE');
      _this.requests[0].respond(204);
    }, 100);

    return Comment.destroyAll({
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function () {
      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[1].method, 'DELETE');
        _this.requests[1].respond(204);
      }, 100);

      return Comment.destroyAll({
        content: 'test'
      });
    }).then(function () {
      setTimeout(function () {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[2].method, 'DELETE');
        _this.requests[2].respond(204);
      }, 100);

      return Comment.destroyAll({
        content: 'test'
      }, {
        params: {
          approvedBy: false
        }
      });
    });
  });
});
