import {ExpoWebGLRenderingContext} from 'expo-gl'
import {Renderer, THREE} from 'expo-three'
import parseColor from 'parse-color'
import {PixelRatio} from 'react-native'
import {Picture, pictureLayerPolygons, picturePolygonsBeforeLayer} from '../../core/picture'
import {
  copyTextureToTexture,
  getPaintingTexturePixel,
  isFullPaintedTexture,
  logPaintingTexture,
  newPaintingTexture,
  PaintingTexture,
  PaintingTextureState,
  setPaintingTexturePixel,
  setPaintingTextureRow,
  setPolygonsToTexture
} from '../../core/painting_texture'
import {newVector, Vector, vectorHeight, vectorScalar, vectorWidth, vectorX, vectorY} from '../../core/vector'
import {curry, divide, multiply, __} from 'ramda'
import {Polygon} from '../../core/polygon'
import {Box, boxCenter, boxSize, newBoxFromPolygons} from '../../core/box'
import {Viewport} from '../../core/viewport'
import debounce from 'lodash-es/debounce'

const TEXTURE_PIXEL_SIZE = 3
const BRUSH_RADIUS = 25
const PADDING = 30
const ASYNC_TASK_SLEEP = 16

export class PictureGLViewController {
  state?: {
    gl: ExpoWebGLRenderingContext
    viewport: Viewport
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    renderer: Renderer
    isStarted: boolean
    picture: Picture
    pictureLayerIndex: number
    paintedMeshes: Array<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>
    paintingMeshes: Array<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>
    paintingLines: Array<THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>>
    paintingTexture: PaintingTexture
    prepareTexture: PaintingTexture
    preparingTexturePromise: Promise<void>
    circleBrushXShifts: number[]
    onNextPictureGroup: () => void
    getPaintingTextureState: (
      texture: PaintingTexture,
      polygons: Polygon[],
      viewport: Viewport,
      padding: number
    ) => Promise<PaintingTextureState>
    paintingTextureChecking: boolean
  }

  start = async (
    gl: ExpoWebGLRenderingContext,
    picture: Picture,
    pictureLayerIndex: number,
    onNextPictureGroup: () => void,
    getPaintingTextureState: (
      texture: PaintingTexture,
      polygons: Polygon[],
      viewport: Viewport,
      padding: number
    ) => Promise<PaintingTextureState>
  ) => {
    const viewport: Viewport = {
      size: newVector(gl.drawingBufferWidth, gl.drawingBufferHeight),
      position: newVector(0, 0),
      zoom: 1
    }

    const scene = new THREE.Scene()
    const renderer = new Renderer({gl, alpha: true})
    const camera = newOrthographicCamera(viewport)

    const newOrderedPaintedMesh = newPaintedMesh((_, i) => i)
    const paintedMeshes = picturePolygonsBeforeLayer(picture, pictureLayerIndex).map(newOrderedPaintedMesh)

    const paintingTexture = newPaintingTexture(
      vectorScalar(Math.floor, vectorScalar(divide(__, TEXTURE_PIXEL_SIZE), viewport.size)),
      TEXTURE_PIXEL_SIZE
    )
    const prepareTexture = newPaintingTexture(
      vectorScalar(Math.floor, vectorScalar(divide(__, TEXTURE_PIXEL_SIZE), viewport.size)),
      TEXTURE_PIXEL_SIZE
    )
    const newOrderedPaintingMesh = newPaintingMesh(paintingTexture, (_, i) => i + paintedMeshes.length)
    const paintingMeshes = pictureLayerPolygons(picture, pictureLayerIndex).map(newOrderedPaintingMesh)

    const newOrderedPaintingLine = newPaintingLine((_, i) => i + paintedMeshes.length + paintingMeshes.length)
    const paintingLines = pictureLayerPolygons(picture, pictureLayerIndex).map(newOrderedPaintingLine)

    scene.add(...paintedMeshes, ...paintingMeshes, ...paintingLines)

    const circleBrushXShifts = newCircleBrushXShifts(BRUSH_RADIUS)

    this.state = {
      gl,
      onNextPictureGroup,
      getPaintingTextureState,
      viewport,
      scene,
      camera,
      renderer,
      isStarted: false,
      picture,
      pictureLayerIndex,
      paintedMeshes,
      paintingLines,
      paintingMeshes,
      paintingTexture,
      prepareTexture,
      preparingTexturePromise: Promise.resolve(),
      circleBrushXShifts,
      paintingTextureChecking: false
    }

    // console.log(paintingTexture)
    paintingTexture.bytes.fill(1)
    this.focusCameraOn(newBoxFromPolygons(pictureLayerPolygons(picture, pictureLayerIndex)))
    // await setPolygonsToTexture(
    //   this.state.viewport,
    //   pictureLayerPolygons(picture, pictureLayerIndex),
    //   paintingTexture,
    //   PADDING
    // )
    // this.state.preparingTexturePromise = setPolygonsToTexture(
    //   this.state.viewport,
    //   pictureLayerPolygons(picture, pictureLayerIndex + 1),
    //   prepareTexture,
    //   PADDING,
    //   ASYNC_TASK_SLEEP
    // )
    // logPaintingTexture(paintingTexture)
    this.animate()
  }

  private animate = () => {
    if (!this.state || this.state.isStarted) {
      return
    }

    this.state.isStarted = true

    const loop = () => {
      if (!this.state || !this.state.isStarted) {
        return
      }

      this.render()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }
  stop = () => {
    if (!this.state) {
      return
    }

    this.state.isStarted = false
  }

  moveGestureHandler = (screenPosition: Vector) => {
    if (!this.state) {
      return
    }
    const {viewport, paintingTexture, paintingMeshes, circleBrushXShifts} = this.state
    const screenX = PixelRatio.getPixelSizeForLayoutSize(vectorX(screenPosition))
    const screenY = PixelRatio.getPixelSizeForLayoutSize(vectorY(screenPosition))
    const viewWidth = vectorWidth(viewport.size)
    const viewHeight = vectorHeight(viewport.size)
    const textureWidth = vectorWidth(paintingTexture.size)
    const textureHeight = vectorHeight(paintingTexture.size)

    // const x =
    //   ((screenX / viewWidth) * 2 - 1) * ((viewZoom * viewWidth) / 2) + viewX;
    // const y =
    //   (-(screenY / viewHeight) * 2 + 1) * ((viewZoom * viewHeight) / 2) + viewY;

    const X = Math.round((screenX / viewWidth) * textureWidth)
    const Y = Math.round((screenY / viewHeight) * textureHeight)
    const shiftY = Y - BRUSH_RADIUS
    const shiftX = X - BRUSH_RADIUS
    const brushSize = BRUSH_RADIUS * 2

    for (let y = 0; y < brushSize; y++) {
      setPaintingTextureRow(
        paintingTexture,
        y + shiftY,
        shiftX + circleBrushXShifts[y],
        shiftX + brushSize - circleBrushXShifts[y],
        0
      )
    }

    paintingMeshes.forEach((paintingMesh) => {
      paintingMesh.material.uniforms['u_Points'].value.needsUpdate = true
      paintingMesh.material.uniformsNeedUpdate = true
      paintingMesh.material.needsUpdate = true
    })

    this.checkTextureFill()
  }

  setPictureLayerIndex = async (pictureLayerIndex: number) => {
    if (!this.state) {
      return
    }

    if (this.state.pictureLayerIndex === pictureLayerIndex) {
      return
    }

    console.log('pictureLayerIndex', pictureLayerIndex)
    console.log(Date.now())

    const {
      picture,
      scene,
      paintingLines,
      paintingMeshes,
      paintedMeshes,
      paintingTexture,
      preparingTexturePromise,
      prepareTexture
    } = this.state

    await preparingTexturePromise

    const paintedPolygons = picturePolygonsBeforeLayer(picture, pictureLayerIndex)

    if (paintedPolygons.length > paintedMeshes.length) {
      const newOrderedPaintedMesh = newPaintedMesh((_, i) => i)
      const newMeshes = []
      for (let i = paintedMeshes.length; i < paintedPolygons.length; i++) {
        newMeshes.push(newOrderedPaintedMesh(paintedPolygons[i], i))
      }

      paintedMeshes.push(...newMeshes)
      scene.add(...newMeshes)
    } else {
      for (let i = paintedPolygons.length; i < paintedMeshes.length; i++) {
        const mesh = paintedMeshes[i]
        scene.remove(mesh)
        mesh.material.dispose()
        mesh.geometry.dispose()
      }

      paintedMeshes.splice(paintedPolygons.length)
    }

    paintingLines.forEach((line) => {
      scene.remove(line)
      line.material.dispose()
      line.geometry.dispose()
    })

    paintingMeshes.forEach((mesh) => {
      scene.remove(mesh)
      mesh.material.dispose()
      mesh.geometry.dispose()
    })

    const newOrderedPaintingMeshBaseIndex = this.state.paintedMeshes.length
    const newOrderedPaintingMesh = newPaintingMesh(paintingTexture, (_, i) => i + newOrderedPaintingMeshBaseIndex)
    this.state.paintingMeshes = pictureLayerPolygons(picture, pictureLayerIndex).map(newOrderedPaintingMesh)

    const newOrderedPaintingLineBaseIndex = this.state.paintedMeshes.length + this.state.paintingMeshes.length
    const newOrderedPaintingLine = newPaintingLine((_, i) => i + newOrderedPaintingLineBaseIndex)
    this.state.paintingLines = pictureLayerPolygons(picture, pictureLayerIndex).map(newOrderedPaintingLine)

    scene.add(...this.state.paintingLines, ...this.state.paintingMeshes)
    console.log('1', Date.now())
    // logPaintingTexture(prepareTexture)
    // copyTextureToTexture(prepareTexture, paintingTexture)

    // this.state.preparingTexturePromise = setPolygonsToTexture(
    //   this.state.viewport,
    //   pictureLayerPolygons(picture, pictureLayerIndex + 1),
    //   prepareTexture,
    //   PADDING,
    //   ASYNC_TASK_SLEEP
    // )
    paintingTexture.bytes.fill(1)
    console.log('2', Date.now())
    this.focusCameraOn(newBoxFromPolygons(pictureLayerPolygons(picture, pictureLayerIndex)))
    this.state.pictureLayerIndex = pictureLayerIndex
  }

  private checkTextureFill = debounce(() => {
    if (!this.state) {
      return
    }

    if (this.state.paintingTextureChecking) {
      return
    }
    console.log('start', Date.now())
    this.state.paintingTextureChecking = true
    // logPaintingTexture(this.state.paintingTexture)
    this.state
      .getPaintingTextureState(
        this.state.paintingTexture,
        pictureLayerPolygons(this.state.picture, this.state.pictureLayerIndex),
        this.state.viewport,
        PADDING
      )
      .then((status) => {
        console.log('end', Date.now())
        console.log(status)
        this.state!.paintingTextureChecking = false
        if (status.filledInPolygonsPixels > status.totalInPolygonsPixels * 0.95) {
          this.state!.onNextPictureGroup()
        }
      })

    // if (isFullPaintedTexture(this.state.paintingTexture)) {
    // if (isFullPaintedTexture(this.state.paintingTexture)) {
    //   console.log('end', Date.now())
    //   this.state.onNextPictureGroup()
    // }
    // console.log('end', Date.now())
  }, 500)

  private updateCameraFromState() {
    if (!this.state) {
      return
    }

    const {viewport, camera} = this.state
    const halfZoomedWidth = 0.5 * vectorWidth(viewport.size) * viewport.zoom
    const halfZoomedHeight = 0.5 * vectorHeight(viewport.size) * viewport.zoom

    camera.position.x = vectorX(viewport.position)
    camera.position.y = vectorY(viewport.position)
    camera.left = -halfZoomedWidth
    camera.right = halfZoomedWidth
    camera.top = halfZoomedHeight
    camera.bottom = -halfZoomedHeight

    camera.updateProjectionMatrix()
  }
  private render() {
    if (!this.state) {
      return
    }

    const {renderer, scene, camera, gl} = this.state
    // const u_Amplitude = Math.sin(time / 500);
    // meshes.forEach((mesh) => {
    //   if (!mesh.material.uniforms["u_Amplitude"]) {
    //     return;
    //   }
    //   mesh.material.uniforms["u_Amplitude"].value = u_Amplitude;
    //   mesh.material.uniformsNeedUpdate = true;
    //   mesh.material.needsUpdate = true;
    // });

    renderer.render(scene, camera)
    gl.endFrameEXP()
  }

  private focusCameraOn(targetBox: Box) {
    if (!this.state) {
      return
    }

    const {viewport} = this.state

    const targetBoxSize = boxSize(targetBox)
    const targetWidth = vectorWidth(targetBoxSize)
    const targetHeight = vectorHeight(targetBoxSize)
    const viewportWidth = vectorWidth(viewport.size)
    const viewportHeight = vectorHeight(viewport.size)

    this.state.viewport.zoom = Math.max(
      (targetWidth + PADDING) / viewportWidth,
      (targetHeight + PADDING) / viewportHeight
    )
    this.state.viewport.position = boxCenter(targetBox)
    this.updateCameraFromState()
  }
}

const newOrthographicCamera = ({size, zoom}: Viewport) => {
  const zoomedHalfSize = vectorScalar(multiply(0.5 * zoom), size)
  const camera = new THREE.OrthographicCamera(
    -vectorWidth(zoomedHalfSize),
    vectorWidth(zoomedHalfSize),
    vectorHeight(zoomedHalfSize),
    -vectorHeight(zoomedHalfSize),
    1,
    1000
  )
  camera.position.z = 1

  return camera
}

type RenderOrderExtractor = (polygon: Polygon, index: number) => number

const newPaintingLine = curry((extractRenderOrder: RenderOrderExtractor, polygon: Polygon, index: number) => {
  const {contour} = polygon

  const geometry = new THREE.BufferGeometry()

  const flatPositions = contour.map((v) => [vectorX(v), vectorY(v), 0]).flat()

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatPositions, 3))

  const material = new THREE.LineBasicMaterial({
    side: THREE.DoubleSide,
    color: '#000000',
    linewidth: 4
  })
  const mesh = new THREE.Line(geometry, material)

  mesh.renderOrder = extractRenderOrder(polygon, index)

  return mesh
})

const newPaintedMesh = curry((extractRenderOrder: RenderOrderExtractor, polygon: Polygon, index: number) => {
  const {color} = polygon

  const geometry = newPolygonMeshGeometry(polygon)

  const material = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    color: color
  })

  const mesh = new THREE.Mesh(geometry, material)

  mesh.renderOrder = extractRenderOrder(polygon, index)

  return mesh
})

const newPaintingMesh = curry(
  (paintingTexture: PaintingTexture, extractRenderOrder: RenderOrderExtractor, polygon: Polygon, index: number) => {
    const geometry = newPolygonMeshGeometry(polygon)
    const material = newPaintingMeshMaterial(paintingTexture, polygon)

    const mesh = new THREE.Mesh(geometry, material)

    mesh.renderOrder = extractRenderOrder(polygon, index)

    return mesh
  }
)

const newPaintingMeshMaterial = curry((paintingTexture: PaintingTexture, polygon: Polygon) => {
  const color = parseColor(polygon.color).rgb.map((x) => x / 255)
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 v_Position;
      varying vec2 v_NormalizedPosition;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        v_NormalizedPosition = vec2(0.5 * (gl_Position.x + 1.0), 1.0 - 0.5 * (gl_Position.y + 1.0));
      }
        `,
    fragmentShader: `
      uniform vec4 u_Color;
      uniform vec2 u_size;
      uniform sampler2D u_Points;
      varying vec2 v_NormalizedPosition;

      float getPixelData(float x, float y) {
        float physicalWidth = ceil(u_size.x / 4.0);
        float physicalHeight = u_size.y;
        float textureX = floor(x / 4.0) / physicalWidth;
        float textureY = y / physicalHeight;
        vec4 pixel = texture2D(u_Points, vec2(textureX, textureY));
        return pixel[int(mod(x, 4.0))];
      }

      float getCountFilledNeighbor(float x, float y) {
        float count = 0.0;

        if (getPixelData(x + 1.0, y) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        if (getPixelData(x + 1.0, y + 1.0) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        if (getPixelData(x + 1.0, y - 1.0) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        if (getPixelData(x, y + 1.0) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        if (getPixelData(x, y - 1.0) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        if (getPixelData(x - 1.0, y) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        if (getPixelData(x - 1.0, y + 1.0) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        if (getPixelData(x - 1.0, y - 1.0) == 0.0) {
          count = count + (8.0 - count) / 2.0 - (count - 8.0) / 20.0;
        }

        return count;
      }

      void main() {
        float x = floor(v_NormalizedPosition.x * u_size.x);
        float y = floor(v_NormalizedPosition.y * u_size.y);
        float pixelData = getPixelData(x, y);
        if (pixelData == 0.0) {
          gl_FragColor = u_Color;
        } else {
          float countFilledNeighbor = getCountFilledNeighbor(x, y);
          float mixValue = countFilledNeighbor / 8.0;
          gl_FragColor = mix(vec4(vec3(0.0), 0.0), u_Color, mixValue);
        }
      }
      `,
    uniforms: {
      u_Color: {
        value: new THREE.Vector4(color[0], color[1], color[2], 1)
      },
      u_Points: {
        value: new THREE.DataTexture(
          paintingTexture.bytes,
          vectorWidth(paintingTexture.physicalSize) / 4,
          vectorHeight(paintingTexture.physicalSize),
          THREE.RGBAFormat,
          THREE.UnsignedByteType
        )
      },
      u_size: {
        value: new THREE.Vector2(vectorX(paintingTexture.size), vectorY(paintingTexture.size))
      }
    }
  })
})

const newPolygonMeshGeometry = (polygon: Polygon) => {
  const {indexes, vertexes} = polygon

  const geometry = new THREE.BufferGeometry()

  const flatPositions = vertexes.map((x) => [x[0], x[1], 0]).flat()
  const flatIndexes = indexes.flat()

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatPositions, 3))

  geometry.setIndex(flatIndexes)
  return geometry
}

const newCircleBrushXShifts = (radius: number) => {
  const result: number[] = []
  const size = radius * 2
  const squaredRadius = radius * radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const squaredDistance = Math.pow(radius - x, 2) + Math.pow(radius - y, 2)
      if (squaredDistance < squaredRadius) {
        result.push(x)
        break
      }
    }
  }

  return result
}
