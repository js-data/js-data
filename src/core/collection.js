import {isArray} from './utils'

export class Collection {
  constructor (data = []) {
    if (!isArray(data)) {
      throw new TypeError('new Collection([data]): data: Expected array. Found ' + typeof data)
    }
  }
}
