describe('DS#destroy', function () {
  it('should delete an item from the data store', function () {
    var _this = this;

    Post.inject(p1);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'DELETE');
      _this.requests[0].respond(200, { 'Content-Type': 'text/plain' }, '5');
    }, 30);

    return Post.destroy(5).then(function (id) {
      assert.equal(id, '5', 'post 5 should have been deleted');
      assert.equal(lifecycle.beforeDestroy.callCount, 1, 'beforeDestroy should have been called');
      assert.equal(lifecycle.afterDestroy.callCount, 1, 'afterDestroy should have been called');
      assert.isUndefined(Post.get(5));
      assert.equal(Post.lastModified(5), 0);
      assert.equal(Post.lastSaved(5), 0);
    });
  });
  it('should handle nested resources', function () {
    var _this = this;
    var testComment = {
      id: 5,
      content: 'test'
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };

    Comment.inject(testComment);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment/5');
      assert.equal(_this.requests[0].method, 'DELETE');
      _this.requests[0].respond(204);
    }, 30);

    return Comment.destroy(5, {
      params: {
        approvedBy: 4
      }
    }).then(function () {
      Comment.inject(testComment2);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment/6');
        assert.equal(_this.requests[1].method, 'DELETE');
        _this.requests[1].respond(204);
      }, 30);

      return Comment.destroy(6, {
        bypassCache: true
      });
    }).then(function () {
      Comment.inject(testComment2);

      setTimeout(function () {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment/6');
        assert.equal(_this.requests[2].method, 'DELETE');
        _this.requests[2].respond(204);
      }, 30);

      return Comment.destroy(6, {
        params: {
          approvedBy: false
        }
      });
    });
  });
  it('should eager eject', function () {
    var _this = this;

    Post.inject(p1);

    setTimeout(function () {
      assert.isUndefined(Post.get(5));
      setTimeout(function () {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'DELETE');
        _this.requests[0].respond(200, { 'Content-Type': 'text/plain' }, '5');
      }, 30);
    }, 30);

    return Post.destroy(5, { eagerEject: true }).then(function (id) {
      assert.equal(id, '5', 'post 5 should have been deleted');
      assert.equal(lifecycle.beforeDestroy.callCount, 1, 'beforeDestroy should have been called');
      assert.equal(lifecycle.afterDestroy.callCount, 1, 'afterDestroy should have been called');
      assert.isUndefined(Post.get(5));
      assert.equal(Post.lastModified(5), 0);
      assert.equal(Post.lastSaved(5), 0);
    });
  });
});
