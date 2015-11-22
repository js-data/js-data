describe('DS#filter', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.filter('does not exist');
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          store.filter('post', key);
        }, store.errors.IllegalArgumentError, '"params" must be an object!');
      }
    });

    store.inject('post', p1);

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          store.filter('post', {}, key);
        }, store.errors.IllegalArgumentError, '"options" must be an object!');
      }
    });

    store.filter('post');
  });
  it('should allow use of scopes', function () {
    var store = new JSData.DS({
      log: false,
      scopes: {
        defaultScope: {
          foo: 'bar'
        }
      }
    });
    var Foo = store.defineResource({
      name: 'foo',
      scopes: {
        second: {
          beep: 'boop'
        },
        limit: {
          limit: 1
        }
      }
    });
    var foos = Foo.inject([
      { id: 1, foo: 'bar' },
      { id: 2, beep: 'boop' },
      { id: 3, foo: 'bar', beep: 'boop' },
      { id: 4, foo: 'bar', beep: 'boop' },
      { id: 5, foo: 'bar', beep: 'boop' },
      { id: 6, foo: 'bar', beep: 'boop' },
      { id: 7, foo: 'bar', beep: 'boop' },
      { id: 8, foo: 'bar', beep: 'boop' }
    ]);
    assert.objectsEqual(Foo.filter(null, {
      scope: ['second', 'limit']
    }), [foos[2]]);
    assert.objectsEqual(Foo.filter(null, {
      scope: ['second']
    }), Foo.filter({
      foo: 'bar',
      beep: 'boop'
    }));
    assert.objectsEqual(Foo.filter(), Foo.filter({
      foo: 'bar'
    }));
  });
});
