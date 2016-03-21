export function init () {
  describe('proxied Collection methods', function () {
    describe('add', function () {
      it('should work', function () {
        const Test = this
        let user = Test.store.add('user', { id: 1, name: 'John' })
        Test.assert.objectsEqual(user, { id: 1, name: 'John' })
      })
    })
    describe('between', function () {
      it('should work')
    })
    describe('createIndex', function () {
      it('should work')
    })
    describe('filter', function () {
      it('should work')
    })
    describe('get', function () {
      it('should work')
    })
    describe('getAll', function () {
      it('should work')
    })
    describe('query', function () {
      it('should work')
    })
    describe('remove', function () {
      it('should work')
    })
    describe('removeAll', function () {
      it('should work')
    })
    describe('toJson', function () {
      it('should work')
    })
  })
}
