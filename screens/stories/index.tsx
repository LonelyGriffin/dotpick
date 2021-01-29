import React, {useCallback} from 'react'
import {View, StyleSheet, ImageBackground} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {Screen} from '../../common/layout/Screen'
import {Header} from '../../common/layout/header'
import {useSelector, useDispatch} from 'react-redux'
import {GlobalState} from '../../common/global_store'
import {StoryPreview} from './story_preview'
import {requestLoadStory} from '../../common/stories/stories_slice'
import {queueNavigationAction} from '../../common/navigation/navigation_slice'
import {ScreenName} from '../../common/navigation/screen_name'

const backgroundImgSrc = require('../../common/assets/img/background.jpg')

export const StoriesScreen = () => {
  const stories = useSelector((state: GlobalState) => state.stories.entities)
  const dispatch = useDispatch()

  const handleRequestLoadStory = useCallback((storyId: string) => {
    dispatch(requestLoadStory(storyId))
  }, [])

  const handleOpenStory = useCallback((storyId) => {
    dispatch(
      queueNavigationAction({
        type: 'PUSH',
        payload: {
          name: ScreenName.Story,
          params: {
            storyId
          }
        }
      })
    )
  }, [])

  return (
    <Screen>
      <View style={styles.fullSize}>
        <ImageBackground source={backgroundImgSrc} style={styles.bg}>
          <Header showBrushFace showMenuButtons message={'Что рассказать?'} />
          <ScrollView horizontal>
            <View style={styles.list}>
              {stories.map((story) => (
                <StoryPreview
                  story={story}
                  key={story.id}
                  isLoadedResources={false}
                  onRequestLoading={handleRequestLoadStory}
                  onOpen={handleOpenStory}
                />
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
