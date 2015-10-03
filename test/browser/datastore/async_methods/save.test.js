describe('DS#save', function () {
  it('should save an item to the server and inject the result', function () {
    var _this = this;
    Post.inject(p1);

    var initialModified = Post.lastModified(5);
    var initialSaved = Post.lastSaved(5);

    Post.get(5).author = 'Jake';

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
        author: 'Jake',
        age: 30,
        id: 5
      }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        author: 'Jake',
        id: 5,
        age: 30
      }));
    }, 100);

    return Post.save(5).then(function (post) {
      assert.deepEqual(DSUtils.toJson(post), DSUtils.toJson(Post.get(5)), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify({
        author: 'Jake',
        age: 30,
        id: 5
      }));
      Post.digest();
      assert.notEqual(Post.lastModified(5), initialModified);
      assert.notEqual(Post.lastSaved(5), initialSaved);

      return Post.save(6);
    }).then(function () {
      throw new Error('should not have succeeded');
    }).catch(function (err) {
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.isTrue(err instanceof store.errors.RuntimeError);
      assert.equal(err.message, 'id "6" not found in cache!');
    });
  });
  it('should save an item to the server and inject the result via the instance method', function () {
    var _this = this;
    var post = Post.inject(p1);

    var initialModified = Post.lastModified(5);
    var initialSaved = Post.lastSaved(5);

    Post.get(5).author = 'Jake';

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
        author: 'Jake',
        age: 30,
        id: 5
      }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        author: 'Jake',
        id: 5,
        age: 30
      }));
    }, 100);

    return post.DSSave().then(function (post) {
      assert.deepEqual(DSUtils.toJson(post), DSUtils.toJson(Post.get(5)), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify({
        author: 'Jake',
        age: 30,
        id: 5
      }));
      Post.digest();
      assert.notEqual(Post.lastModified(5), initialModified);
      assert.notEqual(Post.lastSaved(5), initialSaved);
    });
  });
  it('should save an item to the server but not inject the result', function () {
    var _this = this;
    var initialModified;
    var initialSaved;

    Post.inject(p1);
    Post.get(5).author = 'Jake';

    setTimeout(function () {
      initialModified = Post.lastModified(5);
      initialSaved = Post.lastSaved(5);
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson(Post.get(5)));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        random: 'stuff'
      }));
    }, 100);

    return Post.save(5, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify({
        random: 'stuff'
      }), 'should have the right response');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called only once');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called only once');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify({
        author: 'Jake',
        age: 30,
        id: 5
      }));
      // item wasn't injected
      assert.equal(Post.lastModified(5), initialModified);
      assert.equal(Post.lastSaved(5), initialSaved);
    });
  });
  it('should save changes of an item to the server', function () {
    var _this = this;
    Post.inject(p1);

    var initialModified = Post.lastModified(5);
    var initialSaved = Post.lastSaved(5);
    var post1 = Post.get(5);

    post1.author = 'Jake';

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
    }, 100);

    return Post.save(5, { changesOnly: true }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(post1), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify(post1));
      assert.notEqual(Post.lastModified(5), initialModified);
      assert.notEqual(Post.lastSaved(5), initialSaved);

      return Post.save(6);
    }).then(function () {
      throw new Error('should not have succeeded');
    }).catch(function (err) {
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.isTrue(err instanceof store.errors.RuntimeError);
      assert.equal(err.message, 'id "6" not found in cache!');
    });
  });
  it('should save an item to the server using a different endpoint', function () {
    var _this = this;
    var post = Post.inject(p1);
    
    post.author = 'Jake';
    
    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/foobar/5');
      assert.equal(_this.requests[0].method, 'PUT');
      assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
        author: 'Jake',
        age: 30,
        id: 5
      }));
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        author: 'Jake',
        id: 5,
        age: 30
      }));
    }, 100);

    return Post.save(5, { endpoint: '/foobar' }).then(function (post) {
      assert.deepEqual(DSUtils.toJson(post), DSUtils.toJson(Post.get(5)), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(JSON.stringify(Post.get(5)), JSON.stringify({
        author: 'Jake',
        age: 30,
        id: 5
      }));
    }).catch(function (err) {
      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.isTrue(err instanceof store.errors.RuntimeError);
      assert.equal(err.message, 'id "6" not found in cache!');
    });
  });
});
