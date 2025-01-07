import hasOwnProperty from './hasOwnProperty'

function deepClone<T>(obj: T, map = new WeakMap()): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (map.has(obj)) {
    return map.get(obj)
  }

  const result: any = Array.isArray(obj) ? [] : {}

  map.set(obj, result)

  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key], map)
    }
  }

  return result
}

export const clone = deepClone
