describe('DS#changeHistory', function () {
  it('should return the changeHistory in an object', function (done) {
    Post.inject(p1);

    var initialModified = store.store['post'].modified[5];
    assert.deepEqual(store.changeHistory('post', 5), [
      {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: initialModified, target: Post.get(5)}
    ]);

    var post = Post.get(5);
    post.author = 'Jake';

    store.digest();

    setTimeout(function () {
      try {
        store.digest();

        assert.deepEqual(store.changeHistory('post', 5), [
          {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: initialModified, target: Post.get(5)},
          {
            resourceName: 'post',
            added: {},
            changed: {author: 'Jake'},
            removed: {},
            timestamp: store.store['post'].modified[5],
            target: Post.get(5)
          }
        ]);

        Post.inject(p1);

        initialModified = store.store['post'].modified[5];
        assert.deepEqual(store.changeHistory('post', 5), []);
        var post = Post.get(5);
        post.author = 'Johnny';

        store.digest();

        setTimeout(function () {
          try {
            store.digest();
            assert.deepEqual(store.changeHistory('post', 5), [
              {
                resourceName: 'post',
                added: {},
                changed: {author: 'Johnny'},
                removed: {},
                timestamp: store.store['post'].modified[5],
                target: Post.get(5)
              }
            ]);
            done();
          } catch (err) {
            done(err);
          }
        }, 100);
      } catch (err) {
        done(err);
      }
    }, 100);
  });
});
