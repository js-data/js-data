describe('DS#refresh', function () {
  it('should get an item from the server', function (done) {
    var _this = this;

    // Should do nothing because the data isn't in the store
    store.refresh('post', 5).then(function (post) {
      assert.isUndefined(post);
    });

    assert.isUndefined(store.get('post', 5), 'The post should not be in the store yet');

    store.inject('post', p1);
    assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify(p1), 'The post is now in the store');

    var initialLastModified = store.lastModified('post', 5);

    // Should refresh the item that's in the store
    store.refresh('post', 5).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify({ author: 'Jake', age: 31, id: 5 }));
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    // Should have no effect because the request is already pending
    store.refresh('post', 5).then(function (post) {
      assert.deepEqual(JSON.stringify(post), JSON.stringify({ author: 'Jake', age: 31, id: 5 }));
      assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({ author: 'Jake', age: 31, id: 5 }), 'The post has been refreshed');
      assert.notEqual(store.lastModified('post', 5), initialLastModified);
      done();
    }).catch(function (err) {
      console.error(err.stack);
      done('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        assert.equal(1, _this.requests.length);
        assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
        assert.equal(_this.requests[0].method, 'get');
        _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson({
          author: 'Jake',
          id: 5,
          age: 31
        }));
      } catch (err) {
        console.error(err.stack);
        done(err);
      }
    }, 30);
  });
});
