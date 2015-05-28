describe('DS#updateAll', function () {
  it('should update a collection of items', function () {
    var _this = this;

    var post4 = Post.inject(p4);
    var post5 = Post.inject(p5);
    var posts = Post.filter({ where: { age: { '==': 33 } } });

    var initialModified = Post.lastModified(8);
    var initialSaved = Post.lastSaved(8);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22age%22:%7B%22%3D%3D%22:33%7D%7D');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ age: 27 }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
        { author: 'Adam', age: 27, id: 8 },
        { author: 'Adam', age: 27, id: 9 }
      ]));
    }, 30);

    return Post.updateAll({ age: 27 }, { where: { age: { '==': 33 } } }).then(function (ps) {
      assert.deepEqual(JSON.stringify(ps), JSON.stringify(posts), '2 posts should have been updated');
      assert.equal(posts[0].age, 27);
      assert.equal(posts[1].age, 27);
      assert.equal(post4.age, 27);
      assert.equal(post5.age, 27);
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(JSON.stringify(Post.filter({ where: { age: { '==': 27 } } })), JSON.stringify(posts));
      assert.notEqual(Post.lastModified(8), initialModified);
      assert.notEqual(Post.lastSaved(8), initialSaved);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts?where=%7B%22age%22:%7B%22%3D%3D%22:31%7D%7D');
        assert.equal(_this.requests[1].method, 'PUT');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ age: 5 }));
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([
          { author: 'Jane', age: 5, id: 6 }
        ]));
      }, 30);

      return Post.updateAll({ age: 5 }, { where: { age: { '==': 31 } } });
    }).then(function (ps) {
      assert.deepEqual(JSON.stringify(ps), JSON.stringify(Post.filter({ where: { age: { '==': 5 } } })));
      assert.deepEqual(JSON.stringify(ps[0]), JSON.stringify({ author: 'Jane', age: 5, id: 6 }));
      assert.equal(lifecycle.beforeInject.callCount, 4, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 4, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
    });
  });
  it('should handle nested resources', function () {
    var _this = this;
    var testComment = {
      id: 5,
      content: 'stuff',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'stuff',
      approvedBy: 4
    };

    Comment.inject(testComment);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment?content=test');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ content: 'stuff' }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([testComment, testComment2]));
    }, 30);

    return Comment.updateAll({
      content: 'stuff'
    }, {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comments) {
      assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
      assert.deepEqual(JSON.stringify(comments), JSON.stringify(Comment.filter({
        content: 'stuff'
      })));
      Comment.ejectAll();

      Comment.inject(testComment2);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[1].method, 'PUT');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ content: 'stuff' }));
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([testComment, testComment2]));
      }, 30);

      return Comment.updateAll({
        content: 'stuff'
      }, {
        content: 'test'
      });
    }).then(function (comments) {
      assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
      assert.deepEqual(JSON.stringify(comments), JSON.stringify(Comment.filter({
        content: 'stuff',
        sort: 'id'
      })));
      Comment.ejectAll();

      Comment.inject(testComment2);

      setTimeout(function () {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment?content=test');
        assert.equal(_this.requests[2].method, 'PUT');
        assert.equal(_this.requests[2].requestBody, DSUtils.toJson({ content: 'stuff' }));
        _this.requests[2].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson([testComment, testComment2]));
      }, 30);

      return Comment.updateAll({
        content: 'stuff'
      }, {
        content: 'test'
      }, {
        params: {
          approvedBy: false
        }
      });
    }).then(function (comments) {
      assert.deepEqual(JSON.stringify(comments), JSON.stringify([testComment, testComment2]));
      assert.deepEqual(JSON.stringify(comments), JSON.stringify(Comment.filter({
        content: 'stuff',
        sort: 'id'
      })));
    });
  });
});
