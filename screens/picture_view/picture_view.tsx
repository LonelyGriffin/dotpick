import React, {useCallback, useEffect, useRef, useState} from 'react'
import {StyleSheet} from 'react-native'
import {ExpoWebGLRenderingContext, GLView} from 'expo-gl'
import {PanGestureHandler, PanGestureHandlerGestureEvent, State as GestureState} from 'react-native-gesture-handler'
import {PictureGLViewController} from './picture_gl_view_controller'
import {Picture} from '../../core/picture'
import {newVector} from '../../core/vector'
import {WebView} from 'react-native-webview'
import {PaintingTexture, PaintingTextureState} from '../../core/painting_texture'
import {Polygon} from '../../core/polygon'
import {Viewport} from '../../core/viewport'

type Props = {
  picture: Picture
  onNextPictureLayer: () => void
}

export const PictureView = (props: Props) => {
  const webViewRef = useRef<WebView>(null)
  const controller = useRef<PictureGLViewController>(new PictureGLViewController()).current
  const getPaintingTextureStatePromiseResolverRref = useRef<(paintingTextureState: PaintingTextureState) => void>(
    () => {}
  )

  const [state, setState] = useState({
    pictureLayerIndex: 0
  })

  const nextPictureLayerHandler = useCallback(() => {
    setState((state) => ({
      ...state,
      pictureLayerIndex:
        state.pictureLayerIndex < props.picture.layers.length - 1
          ? state.pictureLayerIndex + 1
          : state.pictureLayerIndex
    }))
  }, [])

  const getPaintingTextureState = useCallback(
    (texture: PaintingTexture, polygons: Polygon[], viewport: Viewport, padding: number) => {
      return new Promise<PaintingTextureState>((resolve) => {
        getPaintingTextureStatePromiseResolverRref.current = resolve
        if (!webViewRef.current) {
          return
        }
        const data = JSON.stringify({
          texture,
          polygons,
          viewport,
          padding
        })
        const js = `getPaintingTextureState('${data}')`
        webViewRef.current.injectJavaScript(js)
      })
    },
    []
  )

  const contextCreateHandler = useCallback((gl: ExpoWebGLRenderingContext) => {
    controller.start(gl, props.picture, state.pictureLayerIndex, nextPictureLayerHandler, getPaintingTextureState)
  }, [])

  const panGestureEventHandler = useCallback((e: PanGestureHandlerGestureEvent) => {
    controller.moveGestureHandler(newVector(e.nativeEvent.x, e.nativeEvent.y))
  }, [])

  const webViewMessageHandler = useCallback((e) => {
    // console.log(e)
    const data = JSON.parse(e.nativeEvent.data)
    if (data.type === 'textureStatus') {
      getPaintingTextureStatePromiseResolverRref.current(data.payload)
    }
  }, [])

  useEffect(() => controller.stop, [])
  useEffect(() => {
    controller.setPictureLayerIndex(state.pictureLayerIndex)
  }, [state.pictureLayerIndex])
  useEffect(() => {
    if (!webViewRef.current) {
      return
    }

    webViewRef.current.injectJavaScript(`
      window.vertexInPolygon = (vector, contour) => {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
      
        // using right-horizontal ray from a vector point
      
        var x = vector[0]
        var y = vector[1]
      
        var isInside = false
      
        for (let i = 0, j = contour.length - 1; i < contour.length; j = i++) {
          // edge (pi - current corner, pj - prev corder)
          var pi = contour[i]
          var pj = contour[j]
      
          // (pi[1] > y) !== (pj[1] > y)) - look what edge on either side of a ray
          // (pj[0] - pi[0]) * (y - pi[1]) / (pj[1] - pi[1]) + pi[0] - find x intersection coordinate of vertical line passing through a point
          // x intersection coordinate must be to right of a point
          var hasRayEdgeIntersect = pi[1] > y !== pj[1] > y && x < ((pj[0] - pi[0]) * (y - pi[1])) / (pj[1] - pi[1]) + pi[0]
      
          if (hasRayEdgeIntersect) isInside = !isInside
        }
      
        return isInside
      }
      window.newBoxFromPolygons = (polygons) => {
        var [initX, initY] = polygons[0].vertexes[0]
        var min = [initX, initY]
        var max = [initX, initY]
      
        polygons.forEach((polygon) => {
          polygon.vertexes.forEach((vertex) => {
            var x = vertex[0]
            var y = vertex[1]
            if (x < min[0]) {
              min[0] = x
            }
      
            if (x > max[0]) {
              max[0] = x
            }
      
            if (y < min[1]) {
              min[1] = y
            }
      
            if (y > max[1]) {
              max[1] = y
            }
          })
        })
      
        return [min, max]
      }
      window.getPaintingTextureState = (data) => {
        var data = JSON.parse(data)
        var texture = data.texture
        var polygons = data.polygons
        var viewport = data.viewport
        var padding = data.padding
        
        var result = {
          totalInPolygonsPixels: 0,
          filledInPolygonsPixels: 0,
          totalOutPolygonsPixels: 0,
          filledOutPolygonsPixels: 0
        }
        
        var box = newBoxFromPolygons(polygons)
        var size = [Math.abs(box[0][0] - box[1][0]), Math.abs(box[0][1] - box[1][1])]
        var center = [0.5 * (box[0][0] + box[1][0]), 0.5 * (box[0][1] + box[1][1])]
        var centerX = center[0]
        var centerY = center[1]
        var viewWidth = viewport.size[0]
        var viewHeight = viewport.size[1]
        var textureWidth = texture.size[0]
        var textureHeight = texture.size[1]
        var k = Math.max(
          (size[0] + padding) / (textureWidth * texture.pixelSize),
          (size[1] + padding) / (textureHeight * texture.pixelSize)
        )
        
        var scaledContours = polygons.map((polygon) => {
          return polygon.contour.map((contourVector) => {
            var x = contourVector[0]
            var y = contourVector[1]
            return [(x - centerX) / k + viewWidth / 2, (centerY - y) / k + viewHeight / 2]
          })
        })

        for (var y = 0; y < textureHeight; y+=3) {
          for (var x = 0; x < textureWidth; x+=3) {
            var pixelValue = texture.bytes[y * texture.physicalSize[0] + x]
            var isInPolygons = false
            for (var scaledContour of scaledContours) {
              if (vertexInPolygon([x * texture.pixelSize, y * texture.pixelSize], scaledContour)) {
                isInPolygons = true
                break
              }
            }
            
            if (isInPolygons) {
              result.totalInPolygonsPixels += 1

              if (pixelValue === 0) {
                result.filledInPolygonsPixels += 1
              }
            } else {
              result.totalOutPolygonsPixels += 1

              if (pixelValue === 0) {
                result.filledOutPolygonsPixels += 1
              }
            }

          }
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'textureStatus', payload: result}))
      }
    `)
  }, [])

  return (
    <>
      <WebView source={{html: ''}} ref={webViewRef} onMessage={webViewMessageHandler} />
      <PanGestureHandler onGestureEvent={panGestureEventHandler}>
        <GLView style={styles.fullSize} onContextCreate={contextCreateHandler}></GLView>
      </PanGestureHandler>
    </>
  )
}

const styles = StyleSheet.create({
  fullSize: {
    backgroundColor: '#999999',
    width: '100%',
    height: '100%'
  }
})
