import { assert, JSData, sinon } from '../../../_setup'

describe('Schema.typeGroupValidators.array', function () {
  it('executes correct validation keywords', function () {
    const forOwn = JSData.utils.forOwn
    const validationKeywords = JSData.Schema.validationKeywords
    const TARGET_KEYWORDS = ['items', 'maxItems', 'minItems', 'uniqueItems']

    forOwn(validationKeywords, function (func, key) {
      sinon.spy(validationKeywords, key)
    })

    const array = JSData.Schema.typeGroupValidators.array

    forOwn(validationKeywords, function (func, key) {
      assert.equal(func.callCount, 0, `${key} should not have been called yet`)
    })

    // execute all 4
    array(['foo'], {
      items: {},
      maxItems: 4,
      minItems: 1,
      uniqueItems: true
    })

    assert.equal(validationKeywords.items.callCount, 1)
    assert.equal(validationKeywords.maxItems.callCount, 1)
    assert.equal(validationKeywords.minItems.callCount, 1)
    assert.equal(validationKeywords.uniqueItems.callCount, 1)

    // execute items only
    array(['foo'], {
      items: {}
    })

    assert.equal(validationKeywords.items.callCount, 2)
    assert.equal(validationKeywords.maxItems.callCount, 1)
    assert.equal(validationKeywords.minItems.callCount, 1)
    assert.equal(validationKeywords.uniqueItems.callCount, 1)

    // execute maxItems only
    array(['foo'], {
      maxItems: 4
    })

    assert.equal(validationKeywords.items.callCount, 2)
    assert.equal(validationKeywords.maxItems.callCount, 2)
    assert.equal(validationKeywords.minItems.callCount, 1)
    assert.equal(validationKeywords.uniqueItems.callCount, 1)

    // execute minItems only
    array(['foo'], {
      minItems: 1
    })

    assert.equal(validationKeywords.items.callCount, 2)
    assert.equal(validationKeywords.maxItems.callCount, 2)
    assert.equal(validationKeywords.minItems.callCount, 2)
    assert.equal(validationKeywords.uniqueItems.callCount, 1)

    // execute maxItems and minItems
    array(['foo'], {
      maxItems: 4,
      minItems: 1
    })

    // execute uniqueItems
    array(['foo'], {
      uniqueItems: false
    })

    // execute uniqueItems
    array(['foo'], {
      uniqueItems: true
    })

    assert.equal(validationKeywords.items.callCount, 2)
    assert.equal(validationKeywords.maxItems.callCount, 3)
    assert.equal(validationKeywords.minItems.callCount, 3)
    assert.equal(validationKeywords.uniqueItems.callCount, 3)

    forOwn(validationKeywords, function (func, key) {
      if (TARGET_KEYWORDS.indexOf(key) === -1) {
        assert.equal(func.callCount, 0, `${key} should not have been called`)
      }
      validationKeywords[key].restore()
    })
  })
})
