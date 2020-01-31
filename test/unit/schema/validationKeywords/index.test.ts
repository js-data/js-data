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
import { additionalProperties, propertiesTests } from './_properties'
import { patternPropertiesTests } from './_patternProperties'
import { enumTests } from './_enum'
import { typeTests } from './_type'
import { allOfTests } from './_allOf'
import { anyOfTests } from './_anyOf'
import { oneOfTests } from './_oneOf'
import { notTests } from './_not'
// import { dependenciesTests } from './_dependencies'
// import { definitionsTests } from './_definitions'

describe('Schema.validationKeywords', () => {
  it('has the right default keywords', () => {
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
    assert.deepEqual(Object.keys(validationKeywords), EXPECTED_KEYS, 'has the expected keys')
  })
})

const validationTestRunner = (suites, group?) => {
  suites.forEach(suite => {
    const schema = new JSData.Schema(suite.schema)
    describe(suite.description, () => {
      suite.tests.forEach(test => {
        it(test.description, () => {
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
describe('Schema.validationKeywords.maximum', () => {
  validationTestRunner(maximumTests, 'numeric')
})

describe('Schema.validationKeywords.minimum', () => {
  validationTestRunner(minimumTests, 'numeric')
})

describe('Schema.validationKeywords.multipleOf', () => {
  validationTestRunner(multipleOfTests, 'numeric')
})

// String Tests
describe('Schema.validationKeywords.pattern', () => {
  validationTestRunner(patternTests, 'string')
})

describe('Schema.validationKeywords.minLength', () => {
  validationTestRunner(minLengthTests, 'string')
})

describe('Schema.validationKeywords.maxLength', () => {
  validationTestRunner(maxLengthTests, 'string')
})

// Array Tests
describe('Schema.validationKeywords.items', () => {
  validationTestRunner(itemsTests, 'array')
})

describe('Schema.validationKeywords.maxItems', () => {
  validationTestRunner(maxItemsTests, 'array')
})

describe('Schema.validationKeywords.minItems', () => {
  validationTestRunner(minItemsTests, 'array')
})

describe('Schema.validationKeywords.uniqueItems', () => {
  validationTestRunner(uniqueItemsTests, 'array')
})

// Object Tests
describe('Schema.validationKeywords.maxProperties', () => {
  validationTestRunner(maxPropertiesTests, 'object')
})

describe('Schema.validationKeywords.minProperties', () => {
  validationTestRunner(minPropertiesTests, 'object')
})

describe('Schema.validationKeywords.required', () => {
  validationTestRunner(requiredTests, 'object')
})

describe('Schema.validationKeywords.properties', () => {
  validationTestRunner(propertiesTests, 'object')
  validationTestRunner(patternPropertiesTests, 'object')
  validationTestRunner(additionalProperties, 'object')
})

describe('Schema.validationKeywords.dependencies', () => {
  // validationTestRunner(dependenciesTests, 'object')
})

// Any Instance Tests
describe('Schema.validationKeywords.enum', () => {
  validationTestRunner(enumTests)
})

describe('Schema.validationKeywords.type', () => {
  validationTestRunner(typeTests)
})

describe('Schema.validationKeywords.allOf', () => {
  validationTestRunner(allOfTests)
})

describe('Schema.validationKeywords.anyOf', () => {
  anyOfTests.forEach(suite => {
    const Schema = new JSData.Schema(suite.schema)
    describe(suite.description, () => {
      suite.tests.forEach(test => {
        it(test.description, () => {
          // let errors = JSData.Schema.validationKeywords.anyOf(test.data, Schema, {})
          const errors = Schema.validate(test.data)
          assert.equal(test.valid, !errors, errors?.[0])
        })
      })
    })
  })
})

describe('Schema.validationKeywords.oneOf', () => {
  validationTestRunner(oneOfTests)
})

describe('Schema.validationKeywords.not', () => {
  validationTestRunner(notTests)
})

// describe('Schema.validationKeywords.definitions', function () {
//   validationTestRunner(definitionsTests)
// })
