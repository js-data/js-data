import {
  JSData
} from '../../../_setup'
import test from 'ava'
import sinon from 'sinon'

test('executes correct validation keywords', (t) => {

  const forOwn = JSData.utils.forOwn
  const validationKeywords = JSData.Schema.validationKeywords
  const TARGET_KEYWORDS = ['items', 'maxItems', 'minItems', 'uniqueItems']

  forOwn(validationKeywords, function (func, key) {
    sinon.spy(validationKeywords, key)
  })

  const array = JSData.Schema.typeGroupValidators.array

  forOwn(validationKeywords, function (func, key) {
    t.is(func.callCount, 0, `${key} should not have been called yet`)
  })

  // execute all 4
  array(['foo'], {
    items: {},
    maxItems: 4,
    minItems: 1,
    uniqueItems: true
  })

  t.is(validationKeywords.items.callCount, 1)
  t.is(validationKeywords.maxItems.callCount, 1)
  t.is(validationKeywords.minItems.callCount, 1)
  t.is(validationKeywords.uniqueItems.callCount, 1)

  // execute items only
  array(['foo'], {
    items: {}
  })

  t.is(validationKeywords.items.callCount, 2)
  t.is(validationKeywords.maxItems.callCount, 1)
  t.is(validationKeywords.minItems.callCount, 1)
  t.is(validationKeywords.uniqueItems.callCount, 1)

  // execute maxItems only
  array(['foo'], {
    maxItems: 4
  })

  t.is(validationKeywords.items.callCount, 2)
  t.is(validationKeywords.maxItems.callCount, 2)
  t.is(validationKeywords.minItems.callCount, 1)
  t.is(validationKeywords.uniqueItems.callCount, 1)

  // execute minItems only
  array(['foo'], {
    minItems: 1
  })

  t.is(validationKeywords.items.callCount, 2)
  t.is(validationKeywords.maxItems.callCount, 2)
  t.is(validationKeywords.minItems.callCount, 2)
  t.is(validationKeywords.uniqueItems.callCount, 1)

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

  t.is(validationKeywords.items.callCount, 2)
  t.is(validationKeywords.maxItems.callCount, 3)
  t.is(validationKeywords.minItems.callCount, 3)
  t.is(validationKeywords.uniqueItems.callCount, 3)

  forOwn(validationKeywords, function (func, key) {
    if (TARGET_KEYWORDS.indexOf(key) === -1) {
      t.is(func.callCount, 0, `${key} should not have been called`)
    }
    validationKeywords[key].restore()
  })
})
