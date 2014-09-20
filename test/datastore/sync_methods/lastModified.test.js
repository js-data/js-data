describe('DS.lastModified(resourceName[, id])', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.lastModified('does not exist', {});
    }, datastore.errors.NonexistentResourceError, 'does not exist is not a registered resource!');
  });
  it('should lastModified an item into the store', function () {

    var collectionLastModified;

    assert.equal(datastore.lastModified('post', 5), 0);
    assert.equal(datastore.lastModified('post'), 0);

    collectionLastModified = datastore.lastModified('post');

    assert.doesNotThrow(function () {
      datastore.inject('post', p1);
    });

    assert.notEqual(datastore.lastModified('post'), collectionLastModified);
    collectionLastModified = datastore.lastModified('post');
    assert.notEqual(datastore.lastModified('post', 5), 0);
    var lastModified = datastore.lastModified('post', 5);
    assert.isNumber(lastModified);

    assert.doesNotThrow(function () {
      datastore.inject('post', p2);
    });

    assert.notEqual(datastore.lastModified('post'), collectionLastModified);

    collectionLastModified = datastore.lastModified('post');
    assert.equal(datastore.lastModified('post', 5), lastModified);

    assert.doesNotThrow(function () {
      datastore.inject('post', p3);
    });

    assert.notEqual(datastore.lastModified('post'), collectionLastModified);

    collectionLastModified = datastore.lastModified('post');
    assert.equal(datastore.lastModified('post', 5), lastModified);
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
//		var post = datastore.get('post', 5);
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
