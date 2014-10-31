describe('DS#lastModified', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      store.lastModified('does not exist', {});
    }, store.errors.NonexistentResourceError, 'does not exist is not a registered resource!');
  });
  it('should update lastModified when an item is injected into the store', function () {

    var collectionLastModified;

    assert.equal(store.lastModified('post', 5), 0);
    assert.equal(store.lastModified('post'), 0);

    collectionLastModified = store.lastModified('post');

    assert.doesNotThrow(function () {
      store.inject('post', p1);
    });

    assert.notEqual(store.lastModified('post'), collectionLastModified);
    collectionLastModified = store.lastModified('post');
    assert.notEqual(store.lastModified('post', 5), 0);
    var lastModified = store.lastModified('post', 5);
    assert.isNumber(lastModified);

    assert.doesNotThrow(function () {
      store.inject('post', p2);
    });

    assert.notEqual(store.lastModified('post'), collectionLastModified);

    collectionLastModified = store.lastModified('post');
    assert.equal(store.lastModified('post', 5), lastModified);

    assert.doesNotThrow(function () {
      store.inject('post', p3);
    });

    assert.notEqual(store.lastModified('post'), collectionLastModified);

    assert.equal(store.lastModified('post', 5), lastModified);
  });
//	it('should lastModified an item into the store', function (done) {
//
//		assert.equal(DS.lastModified('post', 5), 0);
//		assert.doesNotThrow(function () {
//			assert.deepEqual(DS.lastModified('post', p1), p1);
//		});
//		assert.notEqual(DS.lastModified('post', 5), 0);
//		assert.isNumber(DS.lastModified('post', 5));
//
//		var post = store.get('post', 5);
//
//		post.id = 10;
//
//		DS.digest();
//
//		assert.deepEqual('Doh! You just changed the primary key of an object! ' +
//			'I don\'t know how to handle this yet, so your data for the "post' +
//			'" resource is now in an undefined (probably broken) state.', $log.error.logs[0][0]);
//
//		done();
//	});
});
