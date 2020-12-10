import React from 'react'
import {View, StyleSheet} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {Screen} from '../../common/layout/Screen'
import {Header} from '../../common/layout/header'
import {useSelector} from 'react-redux'
import {GlobalState} from '../../common/global_store'

type Props = {
  title: string
  previewImgSrc: string
}

export const StoryPreview = (props: Props) => {
  const stories = useSelector((state: GlobalState) => state.stories)

  return (
    <Screen>
      <View style={styles.fullSize}>
        <Header />
        <ScrollView horizontal>
          <View style={styles.list}>
            {stories.map((item) => (
              <View key={item.id} style={styles.item}></View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  fullSize: {
    width: '100%',
    height: '100%'
  },
  list: {
    backgroundColor: '#E5E5E5',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    flexWrap: 'wrap'
  },
  item: {
    width: 72,
    height: 72,
    margin: 20,
    backgroundColor: '#C4C4C4'
  }
})
