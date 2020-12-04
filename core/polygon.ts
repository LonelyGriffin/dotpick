import {Vector} from './vector'

export type PolygonIndex = [number, number, number] // indexes of triangle vertexes
export type Polygon = {
  id: string
  vertexes: Vector[]
  indexes: PolygonIndex[]
  color: string
  contour: Vector[]
}

export const vertexInPolygon = (vector: Vector, contour: Vector[]) => {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  // using right-horizontal ray from a vector point

  const x = vector[0]
  const y = vector[1]

  let isInside = false

  for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
    // edge (pi - current corner, pj - prev corder)
    const pi = contour[i]
    const pj = contour[j]

    // (pi[1] > y) !== (pj[1] > y)) - look what edge on either side of a ray
    // (pj[0] - pi[0]) * (y - pi[1]) / (pj[1] - pi[1]) + pi[0] - find x intersection coordinate of vertical line passing through a point
    // x intersection coordinate must be to right of a point
    const hasRayEdgeIntersect = pi[1] > y !== pj[1] > y && x < ((pj[0] - pi[0]) * (y - pi[1])) / (pj[1] - pi[1]) + pi[0]

    if (hasRayEdgeIntersect) isInside = !isInside
  }

  return isInside
}
