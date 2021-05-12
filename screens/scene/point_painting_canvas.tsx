import React, {useCallback, useEffect, useRef, useState} from 'react'
import {PixelRatio, StyleSheet, View} from 'react-native'
import Canvas, {Image} from 'react-native-canvas'
import {newVector, Vector, vectorX, vectorY} from '../../core/vector'
import {Polygon} from '../../core/polygon'
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State as GestureState,
  PanGestureHandlerStateChangeEvent
} from 'react-native-gesture-handler'
import {debounce, throttle} from 'lodash-es'
import {Asset} from 'expo-asset'
import scenes from '../../tools/generate_static_server/data/stories/abc/scenes'

type Props = {
  viewportSize: Vector
  polygons: Polygon[]
  color: string
  onFinish: () => void
}

export const PointPainting = (props: Props) => {
  const ctxRef = useRef<CanvasRenderingContext2D>()
  const ctx2Ref = useRef<CanvasRenderingContext2D>()
  const prevTouchPos = useRef<Vector | null>(null)

  const checkEndPainting = debounce(() => {
    const ctx = ctxRef.current
    const ctx2 = ctxRef.current

    if (!ctx || !ctx2) {
      return
    }
    const scale = 1 / (PixelRatio.get() * 2)
    ctx2.scale(scale, scale)

    console.log(scale)

    ctx2.drawImage(ctx.canvas, 0, 0)
    ;(ctx2.getImageData(0, 0, props.viewportSize[0] / 2, props.viewportSize[1] / 2) as any).then(
      (imgData: ImageData) => {
        let count = 0
        const length = imgData.height * imgData.width
        console.log('calc', length)
        // for (let i = 0; i < length; i += 4) {
        //   const r = imgData.data[i]
        //   // const g = pixels[i + 1]
        //   // const b = pixels[i + 2]
        //   // const a = pixels[i + 3]
        //   if (r !== 0) {
        //     count++
        //   }
        // }
        console.log(count)
      }
    )
  }, 500)

  const handleCanvas = useCallback(async (canvas: Canvas) => {
    canvas.width = props.viewportSize[0]
    canvas.height = props.viewportSize[1]
    const scale = canvas.width / 1792
    const ctx = canvas.getContext('2d')

    // const img = new Image(canvas, 1280, 640)

    // const asset = await Asset.fromModule(require('./fill_pattern.png'))

    // await asset.downloadAsync()

    // img.src = asset.uri!

    // ctx.beginPath()
    // ctx.fillRect(0, 0, 20, 20)
    // ctx.closePath()

    ctx.beginPath()
    ctx.fillStyle = '#eeeeee'
    // ctx.rect(0, 0, 500, 200)
    for (let polygon of props.polygons) {
      ctx.moveTo(vectorX(polygon[polygon.length - 1]) * scale, vectorY(polygon[polygon.length - 1]) * scale)
      for (let point of polygon) {
        ctx.lineTo(vectorX(point) * scale, vectorY(point) * scale)
      }
    }
    ctx.fill()
    ctx.closePath()
    ctx.clip()

    // img.addEventListener('load', () => {
    //   ctx.drawImage(img, 0, 0, 1280, 640)
    // })
    ctxRef.current = ctx as any
  }, [])

  const paintBrush = throttle((x: number, y: number) => {
    const ctx = ctxRef.current

    if (!ctx) {
      return
    }
    const prev: Vector = prevTouchPos.current || newVector(x, y)
    const prevX = vectorX(prev)
    const prevY = vectorY(prev)

    ctx.lineCap = 'round'
    ctx.fillStyle = props.color
    ctx.strokeStyle = props.color
    ctx.lineWidth = 20

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.closePath()

    prevTouchPos.current = newVector(x, y)

    checkEndPainting()
  }, 20)

  const panGestureEventHandler = useCallback((e: PanGestureHandlerGestureEvent) => {
    if (e.nativeEvent.state === GestureState.ACTIVE) {
      paintBrush(e.nativeEvent.x, e.nativeEvent.y)
    } else {
      prevTouchPos.current = null
    }
  }, [])

  const panGestureStateChangeHandler = (e: PanGestureHandlerStateChangeEvent) => {
    if (e.nativeEvent.state !== GestureState.ACTIVE) {
      prevTouchPos.current = null
    }
  }

  const handleSecondCanvas = (canvas: Canvas) => {
    const ctx = canvas.getContext('2d')
    canvas.width = props.viewportSize[0]
    canvas.height = props.viewportSize[1]

    ctx2Ref.current = ctx as any
  }

  return (
    <PanGestureHandler onGestureEvent={panGestureEventHandler} onHandlerStateChange={panGestureStateChangeHandler}>
      <View style={styles.fullSize}>
        <Canvas ref={handleSecondCanvas} style={styles.canvas} />
        <Canvas ref={handleCanvas} style={styles.canvas2} />
      </View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  fullSize: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  canvas: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.2
  },
  canvas2: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0
  }
})