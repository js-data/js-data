describe('DS#changeHistory', function () {
  it('should return the changeHistory in an object', function (done) {
    store.inject('post', p1);

    var initialModified = store.store['post'].modified[5];
    assert.deepEqual(store.changeHistory('post', 5), [
      {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: initialModified, target: store.get('post', 5)}
    ]);

    var post = store.get('post', 5);
    post.author = 'Jake';

    store.digest();

    setTimeout(function () {
      try {
        store.digest();
        assert.deepEqual(store.changeHistory('post', 5), [
          {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: initialModified, target: store.get('post', 5)},
          {resourceName: 'post', added: {}, changed: { author: 'Jake' }, removed: {}, timestamp: store.store['post'].modified[5], target: store.get('post', 5)}
        ]);

        store.inject('post', p1);

        initialModified = store.store['post'].modified[5];
        assert.deepEqual(store.changeHistory('post', 5), [
          {resourceName: 'post', added: {}, changed: { author: 'John' }, removed: {}, timestamp: initialModified, target: store.get('post', 5)}
        ]);
        var post = store.get('post', 5);
        post.author = 'Johnny';

        store.digest();

        setTimeout(function () {
          try {
            store.digest();
            assert.deepEqual(store.changeHistory('post', 5), [
              {resourceName: 'post', added: {}, changed: { author: 'John' }, removed: {}, timestamp: initialModified, target: store.get('post', 5)},
              {resourceName: 'post', added: {}, changed: { author: 'Johnny' }, removed: {}, timestamp: store.store['post'].modified[5], target: store.get('post', 5)}
            ]);
            done();
          } catch (err) {
            done(err);
          }
        }, 30);
      } catch (err) {
        done(err);
      }
    }, 30);
  });
});
