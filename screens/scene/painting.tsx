import {GLView} from 'expo-gl'
import React from 'react'
import {View} from 'react-native'
import {PanGestureHandler} from 'react-native-gesture-handler'
import {Polygon} from '../../core/polygon'
import {Vector} from '../../core/vector'

type Props = {
  viewportSize: Vector
  polygons: Polygon[]
  color: string
  onPaintingPercentChanged: () => void
}

export const Painting = () => {
  return (
    <PanGestureHandler onGestureEvent={panGestureEventHandler} onHandlerStateChange={panGestureStateChangeHandler}>
      <GLView style={styles.fullSize} onContextCreate={contextCreateHandler}></GLView>
    </PanGestureHandler>
  )
}
