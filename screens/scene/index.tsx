import {subtract, __} from 'ramda'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {View, StyleSheet, LayoutChangeEvent, Button} from 'react-native'
import {fitVectorInProportional, newVector, Vector, vectorHeight, vectorScalar, vectorWidth} from '../../core/vector'
import Video from './video'
import {Screen} from '../../common/layout/Screen'
import {get_scene_points, get_scene_video_uri, load_scenes} from '../../common/stories/load_stories'
import {Route} from '@react-navigation/native'
import {ScreenName} from '../../common/navigation/screen_name'
import {ScreensParams} from '../../common/navigation/screens_params'
import {GlobalState} from '../../common/global_store'
import {useSelector} from 'react-redux'
import {Scene, ScenePoint, Story} from '../../core/story'
import LoadingScreen from '../loading_screen'
import scenes from '../../tools/generate_static_server/data/stories/abc/scenes'

const CONTAINER_SIZE = newVector(1792, 828)
const PICTURE_PADDING = 50
const getPictureContainerSize = fitVectorInProportional(CONTAINER_SIZE)

type State = {
  screenSize?: Vector
  scene?: Scene
  videoUri?: string
  points?: ScenePoint[]
  currentPointNumber: number
  resourcesLoading: boolean
  pointState: 'video' | 'action'
}

const initialState: State = {
  resourcesLoading: true,
  currentPointNumber: 0,
  pointState: 'video'
}

type Props = {
  route: Route<ScreenName.Scene, ScreensParams[ScreenName.Scene]>
}

export const SceneScreen = (props: Props) => {
  const [state, setState] = useState(initialState)
  const pictureContainerSize = getPictureContainerSize(
    vectorScalar(subtract(__, PICTURE_PADDING), state.screenSize || newVector(1, 1))
  )
  const story = useSelector((state: GlobalState) =>
    state.stories.entities.find((x) => x.id === props.route.params.storyId)
  )

  const handleLayoutChange = useCallback((e: LayoutChangeEvent) => {
    const {width, height} = e.nativeEvent.layout
    // console.log('handleLayoutChange', newVector(width, height))
    setState((state) => ({...state, screenSize: newVector(width, height)}))
  }, [])

  useEffect(() => {
    if (!story) {
      return
    }

    let canceled = false
    ;(async () => {
      setState((state) => ({
        ...state,
        resourcesLoading: true
      }))
      const scenes = await load_scenes(story)
      const scene = scenes.find((x) => x.id === props.route.params.sceneId)
      if (!scene) {
        return
      }

      const videoUri = await get_scene_video_uri(story, scene)
      const points = await get_scene_points(story, scene)

      if (canceled) {
        return
      }

      setState((state) => ({
        ...state,
        resourcesLoading: false,
        points,
        scene,
        videoUri
      }))
    })()

    return () => {
      canceled = true
    }
  }, [story])

  const handleVideoFinish = useCallback(() => {
    setState((state) => ({
      ...state,
      pointState: 'action'
    }))
  }, [])

  const gotToNextPoint = () => {
    setState((state) => ({
      ...state,
      currentPointNumber:
        state.points!.length >= state.currentPointNumber ? state.currentPointNumber + 1 : state.currentPointNumber,
      pointState: state.points!.length >= state.currentPointNumber ? 'video' : 'action'
    }))
  }

  const isLoading = state.resourcesLoading || !state.screenSize
  if (isLoading) {
    // console.log('isLoading', state.resourcesLoading, state.screenSize)
    return (
      <View style={styles.root} onLayout={handleLayoutChange}>
        <LoadingScreen />
      </View>
    )
  }

  const currentPoint: ScenePoint | undefined = state.points![state.currentPointNumber]
  const prevPoint: ScenePoint | undefined = state.points![state.currentPointNumber - 1]

  return (
    <Screen>
      <View style={styles.root} onLayout={handleLayoutChange}>
        <View
          style={[
            styles.pictureContainer,
            {
              width: vectorWidth(pictureContainerSize),
              height: vectorHeight(pictureContainerSize)
            }
          ]}
        >
          <Video
            from={prevPoint ? prevPoint.videoPauseEnd : 0}
            to={currentPoint ? currentPoint.videoPauseBegin : state.scene!.videoDuration}
            videoURI={state.videoUri!}
            onFinished={handleVideoFinish}
          />
          {state.pointState === 'action' && (
            <View style={styles.action}>
              <Button title={'next'} onPress={gotToNextPoint} />
            </View>
          )}
        </View>
      </View>
    </Screen>
  )
}

export default SceneScreen

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pictureContainer: {
    // backgroundColor: 'red'
  },
  action: {
    position: 'absolute',
    left: 0,
    right: 0
  }
})
