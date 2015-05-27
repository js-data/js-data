describe('DS#update', function () {
  it('should update an item', function () {
    var _this = this;
    var post = Post.inject(p1);
    var initialModified = Post.lastModified(5);
    var initialSaved = Post.lastSaved(5);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'Jake' }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        author: 'Jake',
        age: 30,
        id: 5
      }));
    }, 60);

    return Post.update(5, { author: 'Jake' }).then(function (p) {
      assert.deepEqual(JSON.stringify(p), JSON.stringify(post), 'post 5 should have been updated');
      assert.equal(p.author, 'Jake');
      assert.equal(post.author, 'Jake');

      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(post));
      assert.notEqual(Post.lastModified(5), initialModified);
      assert.notEqual(Post.lastSaved(5), initialSaved);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts/6');
        assert.equal(_this.requests[1].method, 'PUT');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ author: 'Jane' }));
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
          author: 'Jane',
          age: 31,
          id: 6
        }));
      }, 60);

      return Post.update(6, { author: 'Jane' });
    }).then(function (p) {
      assert.deepEqual(JSON.stringify(p), JSON.stringify(Post.get(6)));
      assert.deepEqual(JSON.stringify(p), JSON.stringify({ author: 'Jane', age: 31, id: 6 }));
      assert.equal(lifecycle.beforeInject.callCount, 3, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 3, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
    });
  });
  it('should update an item via the instance method', function () {
    var _this = this;
    var post = Post.inject(p1);
    var initialModified = Post.lastModified(5);
    var initialSaved = Post.lastSaved(5);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'Jake' }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        author: 'Jake',
        age: 30,
        id: 5
      }));
    }, 60);

    return post.DSUpdate({ author: 'Jake' }).then(function (p) {
      assert.deepEqual(JSON.stringify(p), JSON.stringify(post), 'post 5 should have been updated');
      assert.equal(p.author, 'Jake');
      assert.equal(post.author, 'Jake');

      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(post));
      assert.notEqual(Post.lastModified(5), initialModified);
      assert.notEqual(Post.lastSaved(5), initialSaved);
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
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ content: 'stuff' }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment));
    }, 60);

    return Comment.update(5, {
      content: 'stuff'
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(5)));

      var c = Comment.inject(testComment2);

      function onBeforeUpdate(resource, attrs) {
        attrs.other = 'stuff';
        assert.equal(resource.name, 'comment');
        assert.deepEqual(attrs, { content: 'stuff', other: 'stuff' });
      }

      function onAfterUpdate(resource, attrs) {
        assert.equal(resource.name, 'comment');
        assert.deepEqual(JSON.stringify(attrs), JSON.stringify({ id: 6, content: 'stuff', approvedBy: 4 }));
        assert.isFalse(testComment2 === attrs);
      }

      Comment.on('DS.beforeUpdate', onBeforeUpdate);
      Comment.on('DS.afterUpdate', onAfterUpdate);

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment/6');
        assert.equal(_this.requests[1].method, 'PUT');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ content: 'stuff', other: 'stuff' }));
        _this.requests[1].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment2));
      }, 60);

      return Comment.update(c, {
        content: 'stuff'
      }, {
        params: {
          approvedBy: 4
        }
      });
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(6)));

      Comment.inject(testComment2);

      setTimeout(function () {
        assert.equal(3, _this.requests.length);
        assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment/6');
        assert.equal(_this.requests[2].method, 'PUT');
        assert.equal(_this.requests[2].requestBody, DSUtils.toJson({ content: 'stuff', other: 'stuff' }));
        _this.requests[2].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson(testComment2));
      }, 60);

      return Comment.update(6, {
        content: 'stuff'
      }, {
        params: {
          approvedBy: false
        }
      });
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(Comment.get(6)));
    });
  });
  it('should handle cyclic resources', function () {
    var _this = this;
    var Thing = store.defineResource({
      name: 'thing',
      relations: {
        belongsTo: {
          parent: {
            localKey: 'parentId',
            localField: 'parent'
          }
        }
      }
    });
    var Parent = store.defineResource({
      name: 'parent',
      relations: {
        hasMany: {
          thing: {
            localField: 'things',
            foreignKey: 'parentId'
          }
        }
      }
    });
    var things = Thing.inject([
      {
        id: 1,
        parentId: 1,
        thing: '1'
      },
      {
        id: 2,
        parentId: 1,
        thing: '2'
      }
    ]);
    var parent = Parent.inject({
      id: 1,
      parent: '1'
    });
    parent.things = things;
    things[0].parent = parent;
    things[1].parent = parent;

    parent.content = 'stuff';

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/parent/1');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson(DSUtils.removeCircular(parent)));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({
        id: 1,
        parent: '1',
        content: 'stuff',
        things: [
          {
            id: 1,
            parentId: 1,
            thing: '1',
            content: 'foo'
          },
          {
            id: 2,
            parentId: 1,
            thing: '2',
            content: 'bar'
          }
        ]
      }));
    }, 60);

    return Parent.save(1).then(function (parent) {
      assert.equal(parent.content, 'stuff');
    });
  });
});
