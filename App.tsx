import React, {useCallback, useEffect, useState} from 'react'
import {StatusBar} from 'expo-status-bar'
import {SafeAreaView} from 'react-native'
import {PictureView} from './components/picture_view'
import {Picture} from './core/picture'
import paintingPictureJson from './assets/images/watermelon/painting.json'
import {Menu} from './components/menu'
import 'react-native-gesture-handler'
import {NavigationContainer} from '@react-navigation/native'
import * as ScreenOrientation from 'expo-screen-orientation'
import {RootStack} from './navigation/root_stack'

const currentPicture: Picture = paintingPictureJson as any

export default function App() {
  const [state, setState] = useState({
    currentPicture,
    currentPictureLayerIndex: 0
  })

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
  }, [])

  return (
    <NavigationContainer>
      <StatusBar hidden />
      <RootStack.Navigator initialRouteName='Picture'>
        <RootStack.Screen name='Home' component={Menu} />
        <RootStack.Screen
          name='Picture'
          component={PictureView}
          initialParams={{
            picture: currentPicture
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
