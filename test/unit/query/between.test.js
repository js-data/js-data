import { assert, JSData } from '../../_setup'

describe('Query#between', function () {
  it('should work', function () {
    let result
    const collection = new JSData.Collection()

    assert.throws(function () {
      collection.query().filter().between().run()
    }, Error)

    collection.createIndex('age')
    collection.createIndex('role')
    collection.createIndex('ageRole', ['age', 'role'])

    const data = [
      { id: 1, age: 30, role: 'dev' },
      { id: 2, age: 30, role: 'dev' },
      { id: 3, age: 30, role: 'admin' },
      { id: 4, age: 30, role: 'admin' },
      { id: 5, age: 30, role: 'dev' },
      { id: 6, age: 30, role: 'sup' },
      { id: 7, age: 32, role: 'sup' },
      { id: 8, age: 32, role: 'dev' },
      { id: 9, age: 32, role: 'admin' },
      { id: 10, age: 32, role: 'sup' },
      { id: 11, age: 32, role: 'sup' },
      { id: 12, age: 32, role: 'admin' },
      { id: 13, age: 33, role: 'dev' },
      { id: 14, age: 33, role: 'dev' },
      { id: 15, age: 33, role: 'admin' },
      { id: 16, age: 33, role: 'sup' },
      { id: 17, age: 33, role: 'dev' },
      { id: 18, age: 33, role: 'admin' }
    ]
    collection.add(data)
    result = collection.query().between([32], [33], { index: 'age', leftInclusive: false }).run()
    assert.deepEqual(result, [])
    result = collection.query().between(['dev'], ['sup'], { index: 'role', leftInclusive: false }).run()
    assert.deepEqual(result, [])
    result = collection.query().between([32, 'admin'], [33, 'dev'], { index: 'ageRole', leftInclusive: false }).run()
    assert.deepEqual(result, [data[7], data[6], data[9], data[10], data[14], data[17]])

    result = collection.query().between([32], [33], { index: 'age' }).run()
    assert.deepEqual(result, [data[6], data[7], data[8], data[9], data[10], data[11]])
    result = collection.query().between(['dev'], ['sup'], { index: 'role' }).run()
    assert.deepEqual(result, [data[0], data[1], data[4], data[7], data[12], data[13], data[16]])
    result = collection.query().between([32, 'admin'], [33, 'dev'], { index: 'ageRole' }).run()
    assert.deepEqual(result, [data[8], data[11], data[7], data[6], data[9], data[10], data[14], data[17]])

    result = collection.query().between([32], [33], { index: 'age', rightInclusive: true }).run()
    assert.deepEqual(result, [data[6], data[7], data[8], data[9], data[10], data[11], data[12], data[13], data[14], data[15], data[16], data[17]])
    result = collection.query().between(['dev'], ['sup'], { index: 'role', rightInclusive: true }).run()
    assert.deepEqual(result, [data[0], data[1], data[4], data[7], data[12], data[13], data[16], data[5], data[6], data[9], data[10], data[15]])
    result = collection.query().between([32, 'admin'], [33, 'dev'], { index: 'ageRole', rightInclusive: true }).run()
    assert.deepEqual(result, [data[8], data[11], data[7], data[6], data[9], data[10], data[14], data[17], data[12], data[13], data[16]])

    result = collection.query().between([32], [33], { index: 'age', leftInclusive: false, rightInclusive: true }).run()
    assert.deepEqual(result, [data[12], data[13], data[14], data[15], data[16], data[17]])
    result = collection.query().between(['dev'], ['sup'], { index: 'role', leftInclusive: false, rightInclusive: true }).run()
    assert.deepEqual(result, [data[5], data[6], data[9], data[10], data[15]])
    result = collection.query().between([32, 'admin'], [33, 'dev'], { index: 'ageRole', leftInclusive: false, rightInclusive: true }).run()
    assert.deepEqual(result, [data[7], data[6], data[9], data[10], data[14], data[17], data[12], data[13], data[16]])
  })
})
