describe('DS#hasChanges', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.hasChanges('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');
  });
  it('should return false if the item is not in the store', function () {
    assert.isFalse(store.hasChanges('post', 5));
  });
  it('should return whether an item has changes', function () {

    store.inject('post', p1);

    assert.isFalse(store.hasChanges('post', 5));

    var post = store.get('post', 5);
    post.author = 'Jake';

    store.digest();

    assert.isTrue(store.hasChanges('post', 5));
  });
  it('should return false for resources with defined methods', function () {
    store.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    store.inject('person', {
      first: 'John',
      last: 'Anderson',
      id: 1
    });

    assert.isFalse(store.hasChanges('person', 1));
  });
});
