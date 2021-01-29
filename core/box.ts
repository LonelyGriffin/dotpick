import {add, multiply} from 'ramda'
import subtract from 'ramda/es/subtract'
import {Polygon} from './polygon'
import {newVector, setVectorX, setVectorY, Vector, vectorsApply, vectorScalar, vectorX, vectorY} from './vector'

export type Box = [Vector, Vector]

export const newBox = (min: Vector, max: Vector): Box => [min, max]
export const newBoxFromSize = (width: number, height: number): Box => [newVector(0, 0), newVector(width, height)]

// export const newBoxFromPolygons = (polygons: Polygon[]) => {
//   const [initX, initY] = polygons[0].vertexes[0]
//   const min = newVector(initX, initY)
//   const max = newVector(initX, initY)

//   polygons.forEach((polygon) => {
//     polygon.vertexes.forEach((vertex) => {
//       const x = vectorX(vertex)
//       const y = vectorY(vertex)
//       if (x < vectorX(min)) {
//         setVectorX(min, x)
//       }

//       if (x > vectorX(max)) {
//         setVectorX(max, x)
//       }

//       if (y < vectorY(min)) {
//         setVectorY(min, y)
//       }

//       if (y > vectorY(max)) {
//         setVectorY(max, y)
//       }
//     })
//   })

//   return newBox(min, max)
// }

export const boxMin = (box: Box) => box[0]
export const boxMax = (box: Box) => box[1]
export const boxCenter = (box: Box) => vectorScalar(multiply(0.5), vectorsApply(add, boxMax(box), boxMin(box)))
export const boxSize = (box: Box) => vectorScalar(Math.abs, vectorsApply(subtract, boxMin(box), boxMax(box)))
