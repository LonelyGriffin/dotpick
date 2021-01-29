import React, {useCallback, useEffect, useState} from 'react'
import {View, StyleSheet, ImageBackground} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {Screen} from '../../common/layout/Screen'
import {Header} from '../../common/layout/header'
import {useSelector, useDispatch} from 'react-redux'
import {GlobalState} from '../../common/global_store'
import {ScenePreview} from './scene_preview'
import {requestLoadStory} from '../../common/stories/stories_slice'
import {queueNavigationAction} from '../../common/navigation/navigation_slice'
import {ScreenName} from '../../common/navigation/screen_name'
import {ScreensParams} from '../../common/navigation/screens_params'
import {Route} from '@react-navigation/native'
import {Scene} from '../../core/story'
import LoadingScreen from '../loading_screen'
import {load_scenes} from '../../common/stories/load_stories'

const backgroundImgSrc = require('../../common/assets/img/background.jpg')

type Props = {
  route: Route<ScreenName.Story, ScreensParams[ScreenName.Story]>
}

export const StoryScreen = (props: Props) => {
  const story = useSelector(
    (state: GlobalState) => state.stories.entities.find((x) => x.id === props.route.params.storyId)!
  )
  const [scenes, setScenes] = useState([] as Scene[])
  const dispatch = useDispatch()

  const handleOpenScene = useCallback((sceneId) => {
    dispatch(
      queueNavigationAction({
        type: 'PUSH',
        payload: {
          name: ScreenName.Scene,
          params: {
            storyId: story.id,
            sceneId
          }
        }
      })
    )
  }, [])

  useEffect(() => {
    let canceled = false

    ;(async () => {
      const scenes = await load_scenes(story)

      if (canceled) {
        return
      }

      setScenes(scenes)
    })()

    return () => {
      canceled = true
    }
  })

  if (scenes.length === 0) {
    return <LoadingScreen />
  }

  return (
    <Screen>
      <View style={styles.fullSize}>
        <ImageBackground source={backgroundImgSrc} style={styles.bg}>
          <Header showBrushFace showMenuButtons message={'Что рассказать?'} />
          <ScrollView horizontal>
            <View style={styles.list}>
              {scenes.map((scene) => (
                <ScenePreview scene={scene} story={story} key={story.id} onOpen={handleOpenScene} />
              ))}
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  fullSize: {
    width: '100%',
    height: '100%'
  },
  bg: {
    flex: 1,
    resizeMode: 'cover'
  },
  list: {
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 32
  },
  item: {
    width: 72,
    height: 72,
    margin: 20,
    backgroundColor: '#C4C4C4'
  }
})
