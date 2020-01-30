export function sort (a, b, hashCode) {
  // Short-circuit comparison if a and b are strictly equal
  // This is absolutely necessary for indexed objects that
  // don't have the idAttribute field
  if (a === b) {
    return 0
  } else if (hashCode) {
    a = hashCode(a)
    b = hashCode(b)
  }
  return (a === null && b === null) || (a === undefined && b === undefined)
    ? -1
    : a === null || a === undefined
      ? -1
      : b === null || b === undefined
        ? 1
        : a < b
          ? -1
          : a > b
            ? 1
            : 0
}

export function insertAt (array, index, value) {
  array.splice(index, 0, value)
  return array
}

export function removeAt (array, index) {
  array.splice(index, 1)
  return array
}

export function binarySearch (array, value, field?) {
  let lo = 0
  let hi = array.length
  let compared
  let mid

  while (lo < hi) {
    // tslint:disable-next-line:no-bitwise
    mid = ((lo + hi) / 2) | 0
    compared = sort(value, array[mid], field)
    if (compared === 0) {
      return {
        found: true,
        index: mid
      }
    } else if (compared < 0) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }

  return {
    found: false,
    index: hi
  }
}
