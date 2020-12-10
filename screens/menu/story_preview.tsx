import React from 'react'
import {View, StyleSheet, Text, Image} from 'react-native'

type Props = {
  title: string
  previewImage: string
}

export const StoryPreview = (props: Props) => {
  return (
    <View style={styles.root}>
      <View style={styles.coverContainer}>
        <View style={styles.previewCover}>
          <Image source={{uri: props.previewImage}} style={styles.previewImg} />
        </View>
      </View>
      <View style={styles.messageContainer}>
        <View style={styles.message}>
          <Text style={styles.messageText}>{props.title}</Text>
        </View>
      </View>
    </View>
  )
}

const SIZE = 160
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
  }
})
