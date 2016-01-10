/* global p1:true, p2:true, p3:true, p4:true, p5:true, Model:true */
import {assert} from 'chai'

export function init () {
  describe('#removeAll', function () {
    it('should eject items that meet the criteria from the store', function () {
      this.User.debug = true
      this.UserCollection.add([p1, p2, p3, p4, p5])
      assert.isDefined(this.UserCollection.get(5))
      assert.isDefined(this.UserCollection.get(6))
      assert.isDefined(this.UserCollection.get(7))
      assert.isDefined(this.UserCollection.get(8))
      assert.isDefined(this.UserCollection.get(9))
      assert.doesNotThrow(() => {
        this.UserCollection.removeAll({ where: { author: 'Adam' } })
      })
      assert.isDefined(this.UserCollection.get(5))
      assert.isDefined(this.UserCollection.get(6))
      assert.isDefined(this.UserCollection.get(7))
      assert.isUndefined(this.UserCollection.get(8))
      assert.isUndefined(this.UserCollection.get(9))
    })
    it('should eject all items from the store', function () {
      this.PostCollection.add([p1, p2, p3, p4])

      assert.objectsEqual(this.PostCollection.get(5), p1)
      assert.objectsEqual(this.PostCollection.get(6), p2)
      assert.objectsEqual(this.PostCollection.get(7), p3)
      assert.objectsEqual(this.PostCollection.get(8), p4)

      assert.doesNotThrow(() => {
        this.PostCollection.removeAll()
      })

      assert.isUndefined(this.PostCollection.get(5))
      assert.isUndefined(this.PostCollection.get(6))
      assert.isUndefined(this.PostCollection.get(7))
      assert.isUndefined(this.PostCollection.get(8))
    })
  })
}
