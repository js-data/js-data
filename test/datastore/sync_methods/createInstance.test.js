describe('DS.createInstance(resourceName[, attrs][, options])', function () {
  function errorPrefix(resourceName) {
    return 'DS.createInstance(' + resourceName + '[, attrs][, options]): ';
  }

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      datastore.createInstance('fruit loops');
    }, datastore.errors.NonexistentResourceError, errorPrefix('fruit loops') + 'fruit loops is not a registered resource!');

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (!key) {
        return;
      }
      assert.throws(function () {
        datastore.createInstance('post', key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post') + 'attrs: Must be an object!');
    });

    DSUtils.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (!key) {
        return;
      }
      assert.throws(function () {
        datastore.createInstance('post', {}, key);
      }, datastore.errors.IllegalArgumentError, errorPrefix('post') + 'options: Must be an object!');
    });
  });

  it('create an instance', function () {
    datastore.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      },
      computed: {
        fullName: ['first', 'last', function (first, last) {
          return first + ' ' + last;
        }]
      }
    });

    datastore.defineResource({
      name: 'dog',
      useClass: true
    });

    datastore.defineResource({
      name: 'cat'
    });

    var personAttrs = {
      first: 'John',
      last: 'Anderson'
    };

    var dogAttrs = {
      name: 'Spot'
    };

    var person = datastore.createInstance('person', personAttrs);
    var dog = datastore.createInstance('dog', dogAttrs, { useClass: false });
    var cat = datastore.createInstance('cat');

    assert.deepEqual(JSON.stringify(person), JSON.stringify(personAttrs));
    assert.deepEqual(dog, dogAttrs);
    assert.deepEqual(JSON.stringify(cat), JSON.stringify({}));

    assert.isTrue(person instanceof datastore.definitions.person[datastore.definitions.person.class]);
    assert.isTrue(dog instanceof Object);
    assert.isTrue(cat instanceof datastore.definitions.cat[datastore.definitions.cat.class]);

    person = datastore.createInstance('person', { first: 'John', last: 'Doe' });

    person.DSCompute();

    assert.equal(person.fullName, 'John Doe');

    var person2 = datastore.inject('person', { id: 2, first: 'John', last: 'Doe' });

    datastore.compute('person', 2);

    assert.equal(person2.fullName, 'John Doe');

    var person3 = datastore.inject('person', { id: 3, first: 'John', last: 'Doe' });

    datastore.compute('person', person3);

    assert.equal(person3.fullName, 'John Doe');
  });
});
