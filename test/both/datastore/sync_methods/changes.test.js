describe('DS#changes', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.changes('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        Post.changes(key);
      }, store.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isUndefined(Post.changes(5));
  });
  it('should return the changes in an object', function () {

    Post.inject(p1);

    assert.deepEqual(Post.changes(5), {added: {}, changed: {}, removed: {}});

    var post = Post.get(5);
    post.author = 'Jake';

    store.digest();

    assert.deepEqual(Post.changes(5), {added: {}, changed: {
      author: 'Jake'
    }, removed: {}});
  });
  it('should ignore default blacklisted changes in an object', function () {

    store.inject('post', p1);

    assert.deepEqual(store.changes('post', 5), {added: {}, changed: {}, removed: {}});
    var post = store.get('post', 5);

    post.$$hashKey = '$123';
    post.$$id = '321';

    store.digest();

    assert.deepEqual(store.changes('post', 5), {added: {}, changed: {}, removed: {}});
  });
  it('should ignore per resource blacklisted changes in an object', function () {

    var Thing = store.defineResource({
      name: 'thing',
      ignoredChanges: [/\$|\_/]
    });

    var thing = Thing.inject({ id: 1, $$hashKey: '$123', _thing: 'thing' });

    assert.deepEqual(Thing.changes(1), {added: {}, changed: {}, removed: {}});

    thing.$$hashKey = '$567';
    thing._thing = 'gniht';

    Thing.digest();

    assert.deepEqual(Thing.changes(1), {added: {}, changed: {}, removed: {}});
  });
  it('should ignore per method call blacklisted changes in an object', function () {

    var Thing = store.defineResource({
      name: 'thing',
      ignoredChanges: [/\$|\_/]
    });

    var thing = Thing.inject({ id: 1, $$hashKey: '$123', _thing: 'thing' });

    assert.deepEqual(Thing.changes(1, {
      ignoredChanges: [/\$/]
    }), {added: {}, changed: {}, removed: {}});

    thing.$$hashKey = '$567';
    thing._thing = 'gniht';

    Thing.digest();

    assert.deepEqual(Thing.changes(1, {
      ignoredChanges: [/\$/]
    }), {added: {}, changed: {
      '_thing': 'gniht'
    }, removed: {}});
  });
});
