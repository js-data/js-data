import { assert, JSData } from '../../_setup'

const utils = JSData.utils

describe('utils.copy', () => {
  it('should be a static method', () => {
    assert.equal(typeof utils.copy, 'function')
    assert.equal(typeof utils.plainCopy, 'function', 'has the plainCopy method')
  })

  it('can do a plain copy', () => {
    const plain = { name: 'John' }
    const result = utils.plainCopy(plain)
    assert.notStrictEqual(result, plain)
  })

  it('can do a plain copy excluding blacklisted properties', () => {
    const from = { name: 'John', spy: true, parent: { name: 'Mom', $hashKey: 13561 } }
    const to = {}
    const result = utils.copy(from, to, undefined, undefined, ['spy', /^\$/], true)
    assert.notStrictEqual(result, from)
    assert.isUndefined(result.spy)
    assert.equal('Mom', result.parent.name)
    assert.isUndefined(result.parent.$hashKey)
  })

  it('throws error if from and to are equal', () => {
    const from = { name: 'John' }
    const to = from
    assert.throws(() => utils.copy(from, to), Error)
  })

  it('copy array like object to array', () => {
    const from = { 0: 'John', 1: 'Sara' }
    const to = ['Sam']
    const result = utils.copy(from, to)
    assert.isArray(result)
    assert.lengthOf(result, 2)
    assert.equal('John', result[0])
    assert.equal('Sara', result[1])
  })

  it('copy object to non empty object, the to object properties should be removed', () => {
    const from = { name: 'John' }
    const to = { id: 10 }
    const result = utils.copy(from, to)
    assert.isUndefined(result.to)
    assert.equal('John', result.name)
  })

  const circ: any = { name: 'John' }
  circ.circular = circ

  const srcObj = {
    primitives: {
      number: 1,
      string: '2',
      bool: true
    },
    objects: {
      Number: Number(), // eslint-disable-line
      String: String(), // eslint-disable-line
      Boolean: Boolean(), // eslint-disable-line
      Date: new Date(),
      Regex: new RegExp('$.*', 'ig')
    },
    structs: {
      arrayOfPrimitives: [7, 8, 9, 10],
      arrayOfObjects: [{ name: 'John' }, { name: 'Sam' }, { name: 'Sara' }],
      instance: new Error("i'm an error")
    },
    circular: circ
  }

  let objCopy
  it('copies an object', () => {
    objCopy = utils.copy(srcObj)
    assert.deepEqual(objCopy, srcObj)
    return assert.notStrictEqual(objCopy, srcObj)
  })

  it('copies nested objects recursively', () => {
    return utils.forOwn(objCopy, (nested, key) => {
      assert.deepEqual(nested, srcObj[key])
      return assert.notStrictEqual(nested, srcObj[key])
    })
  })

  it('copies circular references', () => {
    assert.deepEqual(objCopy.circular, srcObj.circular)
    assert.notStrictEqual(objCopy.circular, srcObj.circular)
  })

  it("doesn't copy primitives, since you can't", () => {
    return utils.forOwn(objCopy.primitives, (value, key) => {
      return assert.strictEqual(value, srcObj.primitives[key])
    })
  })

  it('copies arrays recursively', () => {
    assert.deepEqual(objCopy.structs.arrayOfPrimitives, srcObj.structs.arrayOfPrimitives)
    assert.notStrictEqual(objCopy.structs.arrayOfPrimitives, srcObj.structs.arrayOfPrimitives)

    assert.deepEqual(objCopy.structs.arrayOfObjects, srcObj.structs.arrayOfObjects)
    assert.notStrictEqual(objCopy.structs.arrayOfObjects, srcObj.structs.arrayOfObjects)
  })

  it("doesn't copy class intances", () => {
    return assert.strictEqual(objCopy.structs.instance, srcObj.structs.instance)
  })
})
