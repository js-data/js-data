describe('DS.changeHistory(resourceName, id)', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.changeHistory('does not exist', {});
    }, datastore.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      if (key) {
        assert.throws(function () {
          datastore.changeHistory('post', key);
        }, datastore.errors.IllegalArgumentError, '"id" must be a string or a number!');
      }
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isUndefined(datastore.changeHistory('post', 5));
  });
  it('should return the changeHistory in an object', function (done) {
    datastore.inject('post', p1);

    var initialModified = datastore.store['post'].modified[5];
    assert.deepEqual(datastore.changeHistory('post', 5), [
      {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: initialModified, target: datastore.get('post', 5)}
    ]);

    var post = datastore.get('post', 5);
    post.author = 'Jake';

    datastore.digest();

    setTimeout(function () {
      try {
        datastore.digest();
        assert.deepEqual(datastore.changeHistory('post', 5), [
          {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: initialModified, target: datastore.get('post', 5)},
          {resourceName: 'post', added: {}, changed: { author: 'Jake' }, removed: {}, timestamp: datastore.store['post'].modified[5], target: datastore.get('post', 5)}
        ]);

        datastore.inject('post', p1);

        initialModified = datastore.store['post'].modified[5];
        assert.deepEqual(datastore.changeHistory('post', 5), [
          {resourceName: 'post', added: {}, changed: { author: 'John' }, removed: {}, timestamp: initialModified, target: datastore.get('post', 5)}
        ]);
        var post = datastore.get('post', 5);
        post.author = 'Johnny';

        datastore.digest();

        setTimeout(function () {
          try {
            datastore.digest();
            assert.deepEqual(datastore.changeHistory('post', 5), [
              {resourceName: 'post', added: {}, changed: { author: 'John' }, removed: {}, timestamp: initialModified, target: datastore.get('post', 5)},
              {resourceName: 'post', added: {}, changed: { author: 'Johnny' }, removed: {}, timestamp: datastore.store['post'].modified[5], target: datastore.get('post', 5)}
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
