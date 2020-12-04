import {newBoxFromPolygons, boxCenter, boxSize} from './box'
import {Polygon, vertexInPolygon} from './polygon'
import {newVector, Vector, vectorHeight, vectorWidth, vectorX, vectorY} from './vector'
import {Viewport} from './viewport'

export type PaintingTexture = {
  size: Vector
  physicalSize: Vector
  bytes: Uint8Array
  pixelSize: number
}

export type PaintingTextureState = {
  totalInPolygonsPixels: number
  filledInPolygonsPixels: number
  totalOutPolygonsPixels: number
  filledOutPolygonsPixels: number
}

export const newPaintingTexture = (size: Vector, pixelSize: number): PaintingTexture => {
  const width = vectorWidth(size)
  const height = vectorHeight(size)
  const physicalSize = newVector(width + (4 - (width % 4)), height)
  return {
    bytes: new Uint8Array(vectorWidth(physicalSize) * vectorHeight(physicalSize)),
    size,
    pixelSize,
    physicalSize
  }
}

export const setPaintingTexturePixel = (texture: PaintingTexture, x: number, y: number, value: 0 | 1) => {
  texture.bytes[y * vectorWidth(texture.physicalSize) + x] = value
}

export const setPaintingTextureRow = (
  texture: PaintingTexture,
  y: number,
  fromX: number,
  toX: number,
  value: 0 | 1
) => {
  texture.bytes.fill(value, y * vectorWidth(texture.physicalSize) + fromX, y * vectorWidth(texture.physicalSize) + toX)
}

export const getPaintingTexturePixel = (texture: PaintingTexture, x: number, y: number): 0 | 1 => {
  return texture.bytes[y * vectorWidth(texture.physicalSize) + x] as 0 | 1
}

export const setPolygonsToTexture = async (
  viewport: Viewport,
  polygons: Polygon[],
  texture: PaintingTexture,
  padding: number,
  asyncTimeout = 0
) => {
  const box = newBoxFromPolygons(polygons)
  const size = boxSize(box)
  const center = boxCenter(box)
  const centerX = vectorX(center)
  const centerY = vectorY(center)
  const viewWidth = vectorWidth(viewport.size)
  const viewHeight = vectorHeight(viewport.size)
  const textureWidth = vectorWidth(texture.size)
  const textureHeight = vectorHeight(texture.size)
  const k = Math.max(
    (vectorWidth(size) + padding) / (textureWidth * texture.pixelSize),
    (vectorHeight(size) + padding) / (textureHeight * texture.pixelSize)
  )
  const scaledContours = polygons.map((polygon) => {
    return polygon.contour.map((contourVector) => {
      const x = vectorX(contourVector)
      const y = vectorY(contourVector)
      return newVector((x - centerX) / k + viewWidth / 2, (centerY - y) / k + viewHeight / 2)
    })
  })

  for (let y = 0; y < textureHeight; y++) {
    for (let x = 0; x < textureWidth; x++) {
      let pixelValue: 0 | 1 = 0
      for (let scaledContour of scaledContours) {
        if (vertexInPolygon([x * texture.pixelSize, y * texture.pixelSize], scaledContour)) {
          pixelValue = 1
          break
        }
      }
      setPaintingTexturePixel(texture, x, y, pixelValue)
    }
    if (asyncTimeout) {
      await sleep(asyncTimeout)
    }
  }
}

export const copyTextureToTexture = (from: PaintingTexture, to: PaintingTexture) => {
  to.bytes.set(from.bytes)
}

export const isFullPaintedTexture = (texture: PaintingTexture) => {
  for (let i = 0; i < texture.bytes.length; i++) {
    if (texture.bytes[i] !== 0) {
      return false
    }
  }

  return true
}

export const logPaintingTexture = (texture: PaintingTexture) => {
  const textureWidth = vectorWidth(texture.size)
  const textureHeight = vectorHeight(texture.size)
  let result = ''
  for (let y = 0; y < textureHeight; y++) {
    for (let x = 0; x < textureWidth; x++) {
      result += getPaintingTexturePixel(texture, x, y)
    }
    result += '\n'
  }

  console.log(result)
}

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))
