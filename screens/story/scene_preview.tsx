import React, {useCallback, useEffect, useState} from 'react'
import {View, StyleSheet, Text, Image, Button} from 'react-native'
import {useSelector} from 'react-redux'
import {GlobalState} from '../../common/global_store'
import {get_scene_preview_uri, get_story_preview_uri} from '../../common/stories/load_stories'
import {StoryState} from '../../common/stories/stories_slice'
import {Scene, Story} from '../../core/story'

type Props = {
  story: Story
  scene: Scene
  onOpen: (sceneId: string) => void
}

export const ScenePreview = (props: Props) => {
  const [previewUri, setPreviewUri] = useState<string | undefined>(undefined)

  useEffect(() => {
    let canceled = false

    ;(async () => {
      const previewUri = await get_scene_preview_uri(props.story, props.scene)

      if (canceled) {
        return
      }

      setPreviewUri(previewUri)
    })()

    return () => {
      canceled = true
    }
  }, [])

  const handleOpenButtonPress = useCallback(() => {
    props.onOpen(props.scene.id)
  }, [props.story.id])

  return (
    <View style={styles.root}>
      <View style={styles.coverContainer}>
        <View style={styles.previewCover}>
          {previewUri ? (
            <Image source={{uri: previewUri}} style={styles.previewImg} />
          ) : (
            <View style={[styles.previewImg, styles.previewImgStub]} />
          )}
        </View>
      </View>
      <View style={styles.messageContainer}>
        <View style={styles.message}>
          <Text style={styles.messageText}>{props.scene.title}</Text>
        </View>
      </View>
      <Button title={'Открыть'} onPress={handleOpenButtonPress} />
    </View>
  )
}

const SIZE = 200
const MESSAGE_HEIGHT = 28

const styles = StyleSheet.create({
  root: {
    width: SIZE,
    height: SIZE,
    marginLeft: 32
  },
  messageContainer: {
    width: '100%',
    height: MESSAGE_HEIGHT,
    position: 'absolute',
    top: -MESSAGE_HEIGHT / 2,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000
  },
  message: {
    height: MESSAGE_HEIGHT,
    backgroundColor: '#ffffff',
    borderRadius: MESSAGE_HEIGHT / 2,
    borderColor: '#911394',
    borderWidth: 1,
    borderStyle: 'solid'
  },
  messageText: {
    color: '#911394',
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    marginLeft: 16,
    marginRight: 16
  },
  coverContainer: {
    width: SIZE,
    height: SIZE,
    borderRadius: 16
  },
  previewCover: {
    width: SIZE,
    height: SIZE,
    borderRadius: 16,
    overflow: 'hidden'
  },
  previewImg: {
    width: SIZE,
    height: SIZE
  },
  previewImgStub: {
    backgroundColor: 'gray'
  }
})
