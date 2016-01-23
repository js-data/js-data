import * as changes from './changes.test'
import * as create from './create.test'
import * as destroy from './destroy.test'
import * as get from './get.test'
import * as hasChanges from './hasChanges.test'
import * as revert from './revert.test'
import * as save from './save.test'
import * as set from './set.test'
import * as unset from './unset.test'

export function init () {
  describe('Record', function () {
    it('should be a constructor function', function () {
      const Test = this
      Test.assert.isFunction(Test.JSData.Record, 'should be a function')
      let instance = new Test.JSData.Record()
      Test.assert.isTrue(instance instanceof Test.JSData.Record, 'instance should be an instance')
      instance = new Test.JSData.Record({ foo: 'bar' })
      Test.assert.deepEqual(instance, { foo: 'bar' }, 'instance should get initialization properties')
    })

    changes.init()
    create.init()
    destroy.init()
    get.init()
    hasChanges.init()
    revert.init()
    save.init()
    set.init()
    unset.init()
  })
}
