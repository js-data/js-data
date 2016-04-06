import { assert, JSData, sinon } from '../../../_setup'

describe('Schema.typeGroupValidators.string', function () {
  it('executes correct validation keywords', function () {
    const forOwn = JSData.utils.forOwn
    const validationKeywords = JSData.Schema.validationKeywords
    const TARGET_KEYWORDS = ['maxLength', 'minLength', 'pattern']

    forOwn(validationKeywords, function (func, key) {
      sinon.spy(validationKeywords, key)
    })

    const string = JSData.Schema.typeGroupValidators.string

    forOwn(validationKeywords, function (func, key) {
      assert.equal(func.callCount, 0, `${key} should not have been called yet`)
    })

    // execute all 3
    string('foo', {
      pattern: /.*/,
      maxLength: 4,
      minLength: 1
    })

    assert.equal(validationKeywords.pattern.callCount, 1)
    assert.equal(validationKeywords.maxLength.callCount, 1)
    assert.equal(validationKeywords.minLength.callCount, 1)

    // execute pattern only
    string('foo', {
      pattern: /.*/
    })

    assert.equal(validationKeywords.pattern.callCount, 2)
    assert.equal(validationKeywords.maxLength.callCount, 1)
    assert.equal(validationKeywords.minLength.callCount, 1)

    // execute maxLength only
    string('foo', {
      maxLength: 4
    })

    assert.equal(validationKeywords.pattern.callCount, 2)
    assert.equal(validationKeywords.maxLength.callCount, 2)
    assert.equal(validationKeywords.minLength.callCount, 1)

    // execute minLength only
    string('foo', {
      minLength: 1
    })

    assert.equal(validationKeywords.pattern.callCount, 2)
    assert.equal(validationKeywords.maxLength.callCount, 2)
    assert.equal(validationKeywords.minLength.callCount, 2)

    // execute maxLength and minLength
    string('foo', {
      maxLength: 4,
      minLength: 1
    })

    assert.equal(validationKeywords.pattern.callCount, 2)
    assert.equal(validationKeywords.maxLength.callCount, 3)
    assert.equal(validationKeywords.minLength.callCount, 3)

    forOwn(validationKeywords, function (func, key) {
      if (TARGET_KEYWORDS.indexOf(key) === -1) {
        assert.equal(func.callCount, 0, `${key} should not have been called`)
      }
      validationKeywords[key].restore()
    })
  })
})
