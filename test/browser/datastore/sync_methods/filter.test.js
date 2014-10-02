describe('DS#filter', function () {
  it('should return an empty array if the query has never been made before', function (done) {
    var _this = this;

    assert.deepEqual(JSON.stringify(store.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    }, { loadFromServer: true })), JSON.stringify([]), 'should be an empty array');

    assert.deepEqual(JSON.stringify(store.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    }, { loadFromServer: true })), JSON.stringify([]), 'should still be an empty array because the request is pending');

    setTimeout(function () {
      assert.equal(1, _this.requests.length);
      assert.equal(_this.requests[0].url, 'http://test.js-data.io/posts?where=%7B%22author%22:%7B%22%3D%3D%22:%22John%22%7D%7D');
      _this.requests[0].respond(200, {'Content-Type': 'application/json'}, DSUtils.toJson([p1]));

      setTimeout(function () {
        assert.deepEqual(JSON.stringify(store.filter('post', {
          where: {
            author: {
              '==': 'John'
            }
          }
        })), JSON.stringify([
          p1
        ]), 'should no longer be empty');
        done();
      }, 30);
    }, 30);
  });
});
