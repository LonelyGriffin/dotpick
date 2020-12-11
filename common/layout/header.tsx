import React from 'react'
import {View, StyleSheet, Text, Image} from 'react-native'
import {BrushFace} from '../components/brush_face'

const settingIconSrc = require('../assets/icon/setting.png')

type Props = {
  message?: string
  showBrushFace?: boolean
  showMenuButtons?: boolean
}

export const Header = (props: Props) => {
  return (
    <View style={styles.header}>
      {props.message && (
        <View style={styles.message}>
          <Text style={styles.messageText}>{props.message}</Text>
        </View>
      )}
      {props.showBrushFace && <BrushFace style={styles.brush_face} />}
      {props.showMenuButtons && (
        <View style={styles.menuButtons}>
          <Image source={settingIconSrc} style={styles.settingIcon} />
        </View>
      )}
    </View>
  )
}

const HEIGHT = 48

const styles = StyleSheet.create({
  header: {
    // padding: '0px 16px',
    height: HEIGHT,
    width: '100%',
    backgroundColor: '#A463EB',
    elevation: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brush_face: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{scaleX: -1, scaleY: 1}, {translateX: 10}, {translateY: -10}]
  },
  message: {
    height: 32,
    position: 'absolute',
    top: (HEIGHT - 32) / 2,
    left: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 32 / 2,
    borderColor: '#911394',
    borderWidth: 2,
    borderStyle: 'solid'
  },
  messageText: {
    color: '#911394',
    fontFamily: 'Roboto-Regular',
    fontSize: 24,
    marginLeft: 32,
    marginRight: 32
  },
  settingIcon: {
    width: 24,
    height: 24
  },
  menuButtons: {
    height: HEIGHT,
    position: 'absolute',
    top: 0,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})
