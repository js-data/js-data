import { assert, JSData } from '../../../_setup'

import { multipleOfTests } from './_multipleOf'
import { maximumTests } from './_maximum'
import { minimumTests } from './_minimum'

import { maxLengthTests } from './_maxLength'
import { minLengthTests } from './_minLength'
import { patternTests } from './_pattern'

import { itemsTests } from './_items'
import { maxItemsTests } from './_maxItems'
import { minItemsTests } from './_minItems'
import { uniqueItemsTests } from './_uniqueItems'

import { maxPropertiesTests } from './_maxProperties'
import { minPropertiesTests } from './_minProperties'
import { requiredTests } from './_required'
import { propertiesTests, additionalProperties } from './_properties'
import { patternPropertiesTests } from './_patternProperties'
// import { dependenciesTests } from './_dependencies'

import { enumTests } from './_enum'
import { typeTests } from './_type'
import { allOfTests } from './_allOf'
import { anyOfTests } from './_anyOf'
import { oneOfTests } from './_oneOf'
import { notTests } from './_not'
// import { definitionsTests } from './_definitions'

describe('Schema.validationKeywords', function () {
  it('has the right default keywords', function () {
    const validationKeywords = JSData.Schema.validationKeywords
    const EXPECTED_KEYS = [
      'allOf',
      'anyOf',
      'dependencies',
      'enum',
      'items',
      'maximum',
      'maxItems',
      'maxLength',
      'maxProperties',
      'minimum',
      'minItems',
      'minLength',
      'minProperties',
      'multipleOf',
      'not',
      'oneOf',
      'pattern',
      'properties',
      'required',
      'type',
      'uniqueItems'
    ]
    assert.deepEqual(
      Object.keys(validationKeywords),
      EXPECTED_KEYS,
      'has the expected keys'
    )
  })
})

const validationTestRunner = function (suites, group) {
  suites.forEach((suite) => {
    const schema = new JSData.Schema(suite.schema)
    describe(suite.description, function () {
      suite.tests.forEach((test) => {
        it(test.description, function () {
          const errors = group
            ? JSData.Schema.typeGroupValidators[group](test.data, schema)
            : JSData.Schema.validate(test.data, schema)

          assert.equal(test.valid, !errors, errors)
        })
      })
    })
  })
}

// Numeric Tests
describe('Schema.validationKeywords.maximum', function () {
  validationTestRunner(maximumTests, 'numeric')
})

describe('Schema.validationKeywords.minimum', function () {
  validationTestRunner(minimumTests, 'numeric')
})

describe('Schema.validationKeywords.multipleOf', function () {
  validationTestRunner(multipleOfTests, 'numeric')
})

// String Tests
describe('Schema.validationKeywords.pattern', function () {
  validationTestRunner(patternTests, 'string')
})

describe('Schema.validationKeywords.minLength', function () {
  validationTestRunner(minLengthTests, 'string')
})

describe('Schema.validationKeywords.maxLength', function () {
  validationTestRunner(maxLengthTests, 'string')
})

// Array Tests
describe('Schema.validationKeywords.items', function () {
  validationTestRunner(itemsTests, 'array')
})

describe('Schema.validationKeywords.maxItems', function () {
  validationTestRunner(maxItemsTests, 'array')
})

describe('Schema.validationKeywords.minItems', function () {
  validationTestRunner(minItemsTests, 'array')
})

describe('Schema.validationKeywords.uniqueItems', function () {
  validationTestRunner(uniqueItemsTests, 'array')
})

// Object Tests
describe('Schema.validationKeywords.maxProperties', function () {
  validationTestRunner(maxPropertiesTests, 'object')
})

describe('Schema.validationKeywords.minProperties', function () {
  validationTestRunner(minPropertiesTests, 'object')
})

describe('Schema.validationKeywords.required', function () {
  validationTestRunner(requiredTests, 'object')
})

describe('Schema.validationKeywords.properties', function () {
  validationTestRunner(propertiesTests, 'object')
  validationTestRunner(patternPropertiesTests, 'object')
  validationTestRunner(additionalProperties, 'object')
})

describe('Schema.validationKeywords.dependencies', function () {
  // validationTestRunner(dependenciesTests, 'object')
})

// Any Instance Tests
describe('Schema.validationKeywords.enum', function () {
  validationTestRunner(enumTests)
})

describe('Schema.validationKeywords.type', function () {
  validationTestRunner(typeTests)
})

describe('Schema.validationKeywords.allOf', function () {
  validationTestRunner(allOfTests)
})

describe('Schema.validationKeywords.anyOf', function () {
  anyOfTests.forEach((suite) => {
    const Schema = new JSData.Schema(suite.schema)
    describe(suite.description, function () {
      suite.tests.forEach((test) => {
        it(test.description, function () {
          // let errors = JSData.Schema.validationKeywords.anyOf(test.data, Schema, {})
          const errors = Schema.validate(test.data)
          assert.equal(test.valid, !errors, errors)
        })
      })
    })
  })
})

describe('Schema.validationKeywords.oneOf', function () {
  validationTestRunner(oneOfTests)
})

describe('Schema.validationKeywords.not', function () {
  validationTestRunner(notTests)
})

// describe('Schema.validationKeywords.definitions', function () {
//   validationTestRunner(definitionsTests)
// })
