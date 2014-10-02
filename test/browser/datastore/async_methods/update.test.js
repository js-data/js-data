describe('DS#update', function () {
  it('should update an item', function (done) {
    var _this = this;
    var post = store.inject('post', p1);
    var initialModified = store.lastModified('post', 5);
    var initialSaved = store.lastSaved('post', 5);

    store.update('post', 5, { author: 'Jake' }).then(function (p) {
      assert.deepEqual(JSON.stringify(p), JSON.stringify(post), 'post 5 should have been updated');
      assert.equal(p.author, 'Jake');
      assert.equal(post.author, 'Jake');

      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify(post));
      assert.notEqual(store.lastModified('post', 5), initialModified);
      assert.notEqual(store.lastSaved('post', 5), initialSaved);

      store.update('post', 6, { author: 'Jane' }).then(function (p) {
        assert.deepEqual(JSON.stringify(p), JSON.stringify(store.get('post', 6)));
        assert.deepEqual(JSON.stringify(p), JSON.stringify({ author: 'Jane', age: 31, id: 6 }));
        assert.equal(lifecycle.beforeInject.callCount, 3, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 3, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
        done();
      }).catch(function (err) {
        console.error(err.stack);
        done('should not have rejected');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/posts/6');
        assert.equal(_this.requests[1].method, 'put');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ author: 'Jane' }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ author: 'Jane', age: 31, id: 6 }));
      }, 30);
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'Jake' }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ author: 'Jake', age: 30, id: 5 }));
    }, 30);
  });
  it('should update an item via the instance method', function (done) {
    var _this = this;
    var post = store.inject('post', p1);
    var initialModified = store.lastModified('post', 5);
    var initialSaved = store.lastSaved('post', 5);

    post.DSUpdate({ author: 'Jake' }).then(function (p) {
      assert.deepEqual(JSON.stringify(p), JSON.stringify(post), 'post 5 should have been updated');
      assert.equal(p.author, 'Jake');
      assert.equal(post.author, 'Jake');

      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify(post));
      assert.notEqual(store.lastModified('post', 5), initialModified);
      assert.notEqual(store.lastSaved('post', 5), initialSaved);

      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'Jake' }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({ author: 'Jake', age: 30, id: 5 }));
    }, 30);
  });
  it('should handle nested resources', function (done) {
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

    store.inject('comment', testComment);

    store.update('comment', 5, {
      content: 'stuff'
    }).then(function (comment) {
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment));
      assert.deepEqual(JSON.stringify(comment), JSON.stringify(store.get('comment', 5)));

      var c = Comment.inject(testComment2);

      function onBeforeUpdate(resourceName, attrs) {
        attrs.other = 'stuff';
        assert.equal(resourceName, 'comment');
        assert.deepEqual(attrs, { content: 'stuff', other: 'stuff' });
      }

      function onAfterUpdate(resourceName, attrs) {
        assert.equal(resourceName, 'comment');
        assert.deepEqual(attrs, testComment2);
        assert.isFalse(testComment2 === attrs);
      }

      Comment.on('DS.beforeUpdate', onBeforeUpdate);
      Comment.on('DS.afterUpdate', onAfterUpdate);

      Comment.update(c, {
        content: 'stuff'
      }, {
        params: {
          approvedBy: 4
        }
      }).then(function (comment) {
        assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
        assert.deepEqual(JSON.stringify(comment), JSON.stringify(store.get('comment', 6)));

        store.inject('comment', testComment2);

        store.update('comment', 6, {
          content: 'stuff'
        }, {
          params: {
            approvedBy: false
          }
        }).then(function (comment) {
          assert.deepEqual(JSON.stringify(comment), JSON.stringify(testComment2));
          assert.deepEqual(JSON.stringify(comment), JSON.stringify(store.get('comment', 6)));
          done();
        }).catch(function () {
          done('Should not have failed!');
        });

        setTimeout(function () {
          assert.equal(3, _this.requests.length);
          assert.equal(_this.requests[2].url, 'http://test.js-data.io/comment/6');
          assert.equal(_this.requests[2].method, 'put');
          assert.equal(_this.requests[2].requestBody, DSUtils.toJson({ content: 'stuff' }));
          _this.requests[2].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment2));
        }, 30);
      }).catch(function () {
        done('Should not have failed!');
      });

      setTimeout(function () {
        assert.equal(2, _this.requests.length);
        assert.equal(_this.requests[1].url, 'http://test.js-data.io/user/4/comment/6');
        assert.equal(_this.requests[1].method, 'put');
        assert.equal(_this.requests[1].requestBody, DSUtils.toJson({ content: 'stuff' }));
        _this.requests[1].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment2));
      }, 30);
    }).catch(function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/user/4/comment/5');
      assert.equal(_this.requests[0].method, 'put');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ content: 'stuff' }));
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson(testComment));
    }, 30);
  });
});
