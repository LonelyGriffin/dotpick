import React from 'react'
import {View, Image, StyleSheet, StyleProp, ViewStyle} from 'react-native'

const brushPersonImgSrc = require('../assets/img/brush_person.png')

type Props = {
  style: StyleProp<ViewStyle>
}

export const BrushFace = (props: Props) => {
  return (
    <View style={[styles.root, props.style]}>
      <Image source={brushPersonImgSrc} style={styles.brushPersonImg} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#F9D8FA'
  },
  brushPersonImg: {
    width: 71 * 1.15,
    height: 324 * 1.15,
    transform: [{translateX: 8}, {translateY: -15}]
  }
})
