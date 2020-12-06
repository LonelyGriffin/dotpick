import React from 'react'
import {View, Text} from 'react-native'
import {NavigationStateSynchronizer} from '../common/navigation/navigation_store_synchronizer'

const LoadingScreen = () => {
  return (
    <View>
      <NavigationStateSynchronizer />
      <Text>{`Loading...`}</Text>
    </View>
  )
}

export default LoadingScreen
