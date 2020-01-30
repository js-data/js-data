import { JSData, objectsEqual } from '../../_setup'

describe('Collection#getAll', () => {
  it('should support complex queries', () => {
    const data = [
      { id: 2, age: 18, role: 'admin' },
      { id: 3, age: 19, role: 'admin' },
      { id: 5, age: 19, role: 'admin' },
      { id: 6, age: 19, role: 'owner' },
      { id: 4, age: 22, role: 'owner' },
      { id: 1, age: 23, role: 'owner' }
    ]
    const collection = new JSData.Collection(data)
    collection.createIndex('ageRole', ['age', 'role'])
    objectsEqual(
      collection.getAll(19, { index: 'ageRole' }),
      [
        { id: 3, age: 19, role: 'admin' },
        { id: 5, age: 19, role: 'admin' },
        { id: 6, age: 19, role: 'owner' }
      ],
      'should have found all of age:19 using 1 keyList'
    )
    objectsEqual(
      collection.getAll([19, 'admin'], { index: 'ageRole' }),
      [
        { id: 3, age: 19, role: 'admin' },
        { id: 5, age: 19, role: 'admin' }
      ],
      'should have found age:19, role:admin'
    )
    objectsEqual(
      collection.getAll([19, 'admin'], [19, 'owner'], { index: 'ageRole' }),
      [
        { id: 3, age: 19, role: 'admin' },
        { id: 5, age: 19, role: 'admin' },
        { id: 6, age: 19, role: 'owner' }
      ],
      'should have found all of age:19 using 2 keyLists'
    )
    objectsEqual(
      collection.getAll([19, 'admin'], 23, { index: 'ageRole' }),
      [
        { id: 3, age: 19, role: 'admin' },
        { id: 5, age: 19, role: 'admin' },
        { id: 1, age: 23, role: 'owner' }
      ],
      'should have found age:19, role:admin and age:23'
    )
  })
})
