export function init () {
  describe('string', function () {
    it('executes correct validation keywords', function () {
      const Test = this
      const forOwn = Test.JSData.utils.forOwn
      const validationKeywords = Test.JSData.validationKeywords
      const TARGET_KEYWORDS = ['maxLength', 'minLength', 'pattern']

      forOwn(validationKeywords, function (func, key) {
        Test.sinon.spy(validationKeywords, key)
      })

      const string = Test.JSData.typeGroupValidators.string

      forOwn(validationKeywords, function (func, key) {
        Test.assert.equal(func.callCount, 0, `${key} should not have been called yet`)
      })

      // execute all 3
      string('foo', {
        pattern: /.*/,
        maxLength: 4,
        minLength: 1
      })

      Test.assert.equal(validationKeywords.pattern.callCount, 1)
      Test.assert.equal(validationKeywords.maxLength.callCount, 1)
      Test.assert.equal(validationKeywords.minLength.callCount, 1)

      // execute pattern only
      string('foo', {
        pattern: /.*/
      })

      Test.assert.equal(validationKeywords.pattern.callCount, 2)
      Test.assert.equal(validationKeywords.maxLength.callCount, 1)
      Test.assert.equal(validationKeywords.minLength.callCount, 1)

      // execute maxLength only
      string('foo', {
        maxLength: 4
      })

      Test.assert.equal(validationKeywords.pattern.callCount, 2)
      Test.assert.equal(validationKeywords.maxLength.callCount, 2)
      Test.assert.equal(validationKeywords.minLength.callCount, 1)

      // execute minLength only
      string('foo', {
        minLength: 1
      })

      Test.assert.equal(validationKeywords.pattern.callCount, 2)
      Test.assert.equal(validationKeywords.maxLength.callCount, 2)
      Test.assert.equal(validationKeywords.minLength.callCount, 2)

      // execute maxLength and minLength
      string('foo', {
        maxLength: 4,
        minLength: 1
      })

      Test.assert.equal(validationKeywords.pattern.callCount, 2)
      Test.assert.equal(validationKeywords.maxLength.callCount, 3)
      Test.assert.equal(validationKeywords.minLength.callCount, 3)

      forOwn(validationKeywords, function (func, key) {
        if (TARGET_KEYWORDS.indexOf(key) === -1) {
          Test.assert.equal(func.callCount, 0, `${key} should not have been called`)
        }
        validationKeywords[key].restore()
      })
    })
  })
}
