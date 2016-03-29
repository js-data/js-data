import {
  JSData
} from '../../../_setup'
import test from 'ava'
import sinon from 'sinon'

test('executes correct validation keywords', (t) => {
  const forOwn = JSData.utils.forOwn
  const validationKeywords = JSData.Schema.validationKeywords
  const TARGET_KEYWORDS = ['maxLength', 'minLength', 'pattern']

  forOwn(validationKeywords, function (func, key) {
    sinon.spy(validationKeywords, key)
  })

  const string = JSData.Schema.typeGroupValidators.string

  forOwn(validationKeywords, function (func, key) {
    t.is(func.callCount, 0, `${key} should not have been called yet`)
  })

  // execute all 3
  string('foo', {
    pattern: /.*/,
    maxLength: 4,
    minLength: 1
  })

  t.is(validationKeywords.pattern.callCount, 1)
  t.is(validationKeywords.maxLength.callCount, 1)
  t.is(validationKeywords.minLength.callCount, 1)

  // execute pattern only
  string('foo', {
    pattern: /.*/
  })

  t.is(validationKeywords.pattern.callCount, 2)
  t.is(validationKeywords.maxLength.callCount, 1)
  t.is(validationKeywords.minLength.callCount, 1)

  // execute maxLength only
  string('foo', {
    maxLength: 4
  })

  t.is(validationKeywords.pattern.callCount, 2)
  t.is(validationKeywords.maxLength.callCount, 2)
  t.is(validationKeywords.minLength.callCount, 1)

  // execute minLength only
  string('foo', {
    minLength: 1
  })

  t.is(validationKeywords.pattern.callCount, 2)
  t.is(validationKeywords.maxLength.callCount, 2)
  t.is(validationKeywords.minLength.callCount, 2)

  // execute maxLength and minLength
  string('foo', {
    maxLength: 4,
    minLength: 1
  })

  t.is(validationKeywords.pattern.callCount, 2)
  t.is(validationKeywords.maxLength.callCount, 3)
  t.is(validationKeywords.minLength.callCount, 3)

  forOwn(validationKeywords, function (func, key) {
    if (TARGET_KEYWORDS.indexOf(key) === -1) {
      t.is(func.callCount, 0, `${key} should not have been called`)
    }
    validationKeywords[key].restore()
  })
})
