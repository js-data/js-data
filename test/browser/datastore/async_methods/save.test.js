describe('DS#save', function () {
  it('should save an item to the server and inject the result', function (done) {
    var _this = this;
    store.inject('post', p1);

    var initialModified = store.lastModified('post', 5);
    var initialSaved = store.lastSaved('post', 5);

    store.get('post', 5).author = 'Jake';

    store.save('post', 5).then(function (post) {
      try {
        assert.deepEqual(DSUtils.toJson(post), DSUtils.toJson(store.get('post', 5)), 'post 5 should have been saved');
        assert.equal(post.author, 'Jake');
        assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
        assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
        assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({
          author: 'Jake',
          age: 30,
          id: 5
        }));
        store.digest();
        assert.notEqual(store.lastModified('post', 5), initialModified);
        assert.notEqual(store.lastSaved('post', 5), initialSaved);

        store.save('post', 6).then(function () {
          done('should not have succeeded');
        }, function (err) {
          assert.isTrue(err instanceof store.errors.RuntimeError);
          assert.equal(err.message, 'id "6" not found in cache!');
          done();
        }).catch(function (err) {
          assert.isTrue(err instanceof store.errors.RuntimeError);
          assert.equal(err.message, 'id "6" not found in cache!');
          done();
        });

        assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
        assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
        assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
        assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      } catch (err) {
        done(err);
      }
    }, function (err) {
      console.error(err);
      done(err);
    }).catch(function (err) {
      console.error(stack);
      done(err);
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'put');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
          author: 'Jake',
          age: 30,
          id: 5
        }));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          author: 'Jake',
          id: 5,
          age: 30
        }));
      } catch (err) {
        console.error(err.stack);
        done(err);
      }
    }, 30);
  });
  it('should save an item to the server and inject the result via the instance method', function (done) {
    var _this = this;
    var post = store.inject('post', p1);

    var initialModified = store.lastModified('post', 5);
    var initialSaved = store.lastSaved('post', 5);

    store.get('post', 5).author = 'Jake';

    post.DSSave().then(function (post) {
      try {
        assert.deepEqual(DSUtils.toJson(post), DSUtils.toJson(store.get('post', 5)), 'post 5 should have been saved');
        assert.equal(post.author, 'Jake');
        assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
        assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
        assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({
          author: 'Jake',
          age: 30,
          id: 5
        }));
        store.digest();
        assert.notEqual(store.lastModified('post', 5), initialModified);
        assert.notEqual(store.lastSaved('post', 5), initialSaved);
        done();
      } catch (err) {
        done(err);
      }
    }, function (err) {
      console.error(err);
      done(err);
    }).catch(function (err) {
      console.error(stack);
      done(err);
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'put');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson({
          author: 'Jake',
          age: 30,
          id: 5
        }));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          author: 'Jake',
          id: 5,
          age: 30
        }));
      } catch (err) {
        console.error(err.stack);
        done(err);
      }
    }, 30);
  });
  it('should save an item to the server but not inject the result', function (done) {
    var _this = this;
    var initialModified;
    var initialSaved;

    store.inject('post', p1);
    store.get('post', 5).author = 'Jake';

    store.save('post', 5, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify({
        random: 'stuff'
      }), 'should have the right response');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called only once');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called only once');
      assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({
        author: 'Jake',
        age: 30,
        id: 5
      }));
      // item wasn't injected
      assert.equal(store.lastModified('post', 5), initialModified);
      assert.equal(store.lastSaved('post', 5), initialSaved);
      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      try {
        initialModified = store.lastModified('post', 5);
        initialSaved = store.lastSaved('post', 5);
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'put');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson(store.get('post', 5)));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          random: 'stuff'
        }));
      } catch (err) {
        console.error(err.stack);
        done(err);
      }
    }, 30);
  });
  it('should save changes of an item to the server', function (done) {
    var _this = this;
    store.inject('post', p1);

    var initialModified = store.lastModified('post', 5);
    var initialSaved = store.lastSaved('post', 5);
    var post1 = store.get('post', 5);

    post1.author = 'Jake';

    store.save('post', 5, { changesOnly: true }).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify(post1), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
      assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
      assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify(post1));
      assert.notEqual(store.lastModified('post', 5), initialModified);
      assert.notEqual(store.lastSaved('post', 5), initialSaved);

      store.save('post', 6).then(function () {
        done('should not have succeeded');
      }).catch(function (err) {
        assert.isTrue(err instanceof store.errors.RuntimeError);
        assert.equal(err.message, 'id "6" not found in cache!');
        done();
      });

      assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    }).catch(function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'put');
        assert.equal(_this.requests[0].requestBody, DSUtils.toJson({ author: 'Jake' }));
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          author: 'Jake',
          age: 30,
          id: 5
        }));
      } catch (err) {
        console.error(err.stack);
        done(err);
      }
    }, 30);
  });
});
