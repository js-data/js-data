describe('DS#defineResource', function () {
  it('should throw an error when method pre-conditions are not met', function () {
    DSUtils.forEach(TYPES_EXCEPT_STRING_OR_OBJECT, function (key) {
      if (!DSUtils.isArray(key)) {
        assert.throws(function () {
          store.defineResource(key);
        }, store.errors.IllegalArgumentError, '"definition" must be an object!');
      }
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING, function (key) {
      assert.throws(function () {
        store.defineResource({ name: key });
      }, store.errors.IllegalArgumentError, '"name" must be a string!');
    });

    DSUtils.forEach(TYPES_EXCEPT_STRING, function (key) {
      if (key) {
        assert.throws(function () {
          store.defineResource({ name: 'name', idAttribute: key });
        }, store.errors.IllegalArgumentError, '"idAttribute" must be a string!');
      }
    });

    store.defineResource('fake');

    assert.throws(function () {
      store.defineResource('fake');
    }, store.errors.RuntimeError, 'fake is already registered!');

    assert.doesNotThrow(function () {
      store.defineResource('new resource');
      assert.equal(store.definitions.newresource.class, 'Newresource');
    }, 'Should not throw');
  });

  it('should allow definition of computed properties that have no dependencies', function () {
    store.defineResource({
      name: 'person',
      computed: {
        thing: function () {
          return 'thing';
        }
      }
    });

    store.defineResource({
      name: 'dog',
      computed: {
        thing: [function () {
          return 'thing';
        }]
      }
    });

    store.inject('person', {
      id: 1
    });

    store.inject('dog', {
      id: 1
    });

    var person = store.get('person', 1);
    var dog = store.get('dog', 1);

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      id: 1,
      thing: 'thing'
    }));
    assert.equal(person.thing, 'thing');
    assert.equal(dog.thing, 'thing');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
  });

  it('should integrate with js-data-schema', function (done) {
    var Person = store.defineResource({
      name: 'person',
      schema: {
        id: {
          type: 'string',
          nullable: true
        },
        name: 'string'
      }
    });

    Person.create({
      name: 10
    }).then(function () {
      done('Should not have succeeded');
    }).catch(function (err) {
      try {
        assert.deepEqual(err, {
          name: {
            errors: [
              {
                rule: 'type',
                expected: 'string',
                actual: 'number'
              }
            ]
          }
        });
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('should integrate with js-data-schema 2', function (done) {
    var Guy = store.defineResource({
      name: 'guy',
      schema: {
        id: {
          type: 'integer'
        },
        email: {
          type: 'string',
          nullable: false
        },
        username: {
          type: 'string',
          minLength: 1,
          nullable: false
        }
      },
      validate: function (resourceName, attrs, cb) {
        Guy.schema.validate(attrs, {}, function (err) {
          if (err) {
            return cb(err);
          } else {
            return cb(null, attrs);
          }
        });
      }
    });

    return Guy.create({
      email: 'test@test.com'
    }).then(function () {
      done('Should not have succeeded');
    }).catch(function (err) {
      try {
        assert.deepEqual(err, {
          id: {
            errors: [
              {
                rule: 'type',
                actual: 'undefined',
                expected: 'integer'
              }
            ]
          },
          username: {
            errors: [
              {
                rule: 'type',
                actual: 'undefined',
                expected: 'string'
              },
              {
                rule: 'nullable',
                actual: 'x === undefined',
                expected: 'x !== null && x !== undefined'
              }
            ]
          }
        });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
