import React from 'react'
import {View, StyleSheet} from 'react-native'

type Props = {}

export const Header = (props: Props) => {
  return <View style={styles.header}></View>
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    width: '100%',
    backgroundColor: '#A463EB',
    shadowColor: 'rgba(120, 62, 121, 0.5)',
    shadowOffset: {width: -4, height: 2},
    shadowRadius: 5
  }
})
