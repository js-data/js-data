describe('DS#previous', function () {
  it('should return the previous in an object', function (done) {
    var _this = this;
    store.inject('post', p1);

    var post = store.get('post', 5);

    assert.deepEqual(JSON.stringify(store.previous('post', 5)), JSON.stringify(p1));

    post.author = 'Jake';

    store.digest();

    assert.deepEqual(JSON.stringify(store.previous('post', 5)), JSON.stringify(p1));
    assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({ author: 'Jake', age: 30, id: 5 }));

    store.save('post', 5).then(function () {
      assert.deepEqual(JSON.stringify(store.previous('post', 5)), JSON.stringify({
        author: 'Jake',
        age: 30,
        id: 5
      }), 'previous attributes should have been updated');
      assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({ author: 'Jake', age: 30, id: 5 }));
      done();
    }).catch(done);

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
      assert.deepEqual(JSON.stringify(store.get('post', 5)), _this.requests[0].requestBody);
      _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
        author: 'Jake',
        age: 30,
        id: 5
      }));
    }, 30);
  });
  it('should return the previous in an object and save changed only', function (done) {
    try {
      var _this = this;
      store.inject('post', p1);

      var post = store.get('post', 5);

      assert.deepEqual(JSON.stringify(store.previous('post', 5)), JSON.stringify(p1));

      post.author = 'Jake';

      store.digest();

      assert.deepEqual(JSON.stringify(store.previous('post', 5)), JSON.stringify(p1));
      assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({ author: 'Jake', age: 30, id: 5 }));

      store.save('post', 5, { changesOnly: true }).then(function () {
        assert.deepEqual(JSON.stringify(store.previous('post', 5)), JSON.stringify({
          author: 'Jake',
          age: 30,
          id: 5
        }), 'previous attributes should have been updated');
        assert.deepEqual(JSON.stringify(store.get('post', 5)), JSON.stringify({ author: 'Jake', age: 30, id: 5 }));
        done();
      }).catch(done);

      setTimeout(function () {
        try {
          assert.equal(1, _this.requests.length);
          assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts/5');
          assert.deepEqual(JSON.stringify({ author: 'Jake' }), _this.requests[0].requestBody);
          _this.requests[0].respond(200, { 'Content-Type': 'application/json' }, DSUtils.toJson({
            author: 'Jake',
            age: 30,
            id: 5
          }));
        } catch (err) {
          console.log(err.stack);
          done(err);
        }
      }, 30);
    } catch (err) {
      done(err);
    }
  });
});
