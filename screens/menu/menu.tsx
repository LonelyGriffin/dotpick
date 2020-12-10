import React from 'react'
import {View, StyleSheet, ImageBackground} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {Screen} from '../../common/layout/Screen'
import {Header} from '../../common/layout/header'
import {useSelector} from 'react-redux'
import {GlobalState} from '../../common/global_store'
import {StoryPreview} from './story_preview'

const backgroundImgSrc = require('../../common/assets/img/background.jpg')

type Props = {}

export const Menu = (props: Props) => {
  const stories = useSelector((state: GlobalState) => state.stories)
  const config = useSelector((state: GlobalState) => state.config)

  console.log('render', stories)

  return (
    <Screen>
      <View style={styles.fullSize}>
        <ImageBackground source={backgroundImgSrc} style={styles.bg}>
          <Header showBrushFace showMenuButtons message={'Что рассказать?'} />
          <ScrollView horizontal>
            <View style={styles.list}>
              {stories.map((item) => (
                <StoryPreview title={item.title} previewImage={item.previewImage} key={item.id} />
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
