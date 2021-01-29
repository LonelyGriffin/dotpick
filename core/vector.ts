import curry from 'ramda/es/curry'
import zipWith from 'ramda/es/zipWith'
import map from 'ramda/es/map'

export type Vector = [number, number]

export const newVector = curry((x: number, y: number): Vector => [x, y])

export const vectorX = (v: Vector) => v[0]
export const vectorY = (v: Vector) => v[1]
export const vectorWidth = vectorX
export const vectorHeight = vectorY

export const setVectorX = (v: Vector, x: number) => {
  v[0] = x
}
export const setVectorY = (v: Vector, y: number) => {
  v[1] = y
}

export const vectorsApply = (zipWith as any) as {
  (operator: (x1: number, x2: number) => number, v1: Vector, v2: Vector): Vector
  (operator: (x1: number, x2: number) => number, v1: Vector): (v2: Vector) => Vector
  (operator: (x1: number, x2: number) => number): {
    (v1: Vector, v2: Vector): Vector
    (v1: Vector): (v2: Vector) => Vector
  }
}

export const vectorScalar = map as {
  (operator: (x1: number) => number, v: Vector): Vector
  (operator: (x1: number) => number): (v: Vector) => Vector
}

export const fitVectorInProportional = (vec: Vector) => (containerVec: Vector) => {
  const containerWidth = vectorWidth(containerVec)
  const containerHeight = vectorHeight(containerVec)
  const width = vectorWidth(vec)
  const height = vectorHeight(vec)

  const toWWidth = containerWidth
  const toWHeight = (containerWidth / width) * height
  const toHWidth = (containerHeight / height) * width
  const toHHeight = containerHeight

  if (toWHeight <= containerHeight) {
    return newVector(toWWidth, toWHeight)
  } else {
    return newVector(toHWidth, toHHeight)
  }
}
