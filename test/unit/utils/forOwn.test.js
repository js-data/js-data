import { assert, JSData } from '../../_setup'
const utils = JSData.utils

describe('utils.forOwn', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.forOwn, 'function', 'has the forOwn method')
  })

  it('executes a given callback for each enumerable property of an object', function () {
    const user = { name: 'John', age: 20, log: () => { } }
    const expectedProps = ['name', 'age', 'log']
    const actualProps = []
    utils.addHiddenPropsToTarget(user, { spy: true })
    utils.forOwn(user, function (value, key) {
      actualProps.push(key)
    })
    assert.deepEqual(expectedProps, actualProps)
  })
})

describe('utils.forEachRelation', function () {
  it('should be a static method', function () {
    assert.equal(typeof utils.forEachRelation, 'function', 'has the forEachRelation method')
  })

  it('executes given fn for all relations defined in the specified mapper', function () {
    const userMapper = this.User
    const expectedRelations = userMapper.relationList
    const actualRelations = []
    utils.forEachRelation(userMapper, { withAll: true }, (def, item) => {
      actualRelations.push(def)
    })
    assert.deepEqual(expectedRelations, actualRelations)
  })

  it('executes given fn for specific distinct relations defined in the given mapper', function () {
    const userMapper = this.User
    const expectedRelations = userMapper.relationList.filter((x) => x.relation === 'comment')
    const actualRelations = []

    utils.forEachRelation(userMapper, { with: ['comment', 'comment.user', 'notexist'] }, (def, item) => {
      actualRelations.push(def)
    })

    assert.deepEqual(expectedRelations, actualRelations)
  })
})
