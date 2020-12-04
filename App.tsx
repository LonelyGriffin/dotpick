import React from 'react'
import {StatusBar} from 'expo-status-bar'
import {PictureView} from './components/picture_view'
import {Picture} from './core/picture'
import paintingPictureJson from './assets/images/watermelon/painting.json'
import {Menu} from './components/menu'
import 'react-native-gesture-handler'
import {NavigationContainer} from '@react-navigation/native'
import {RootStack} from './navigation/root_stack'
import {ScreenOrientation} from './components/screen_orientation'
import {OrientationLock} from 'expo-screen-orientation'

const currentPicture: Picture = paintingPictureJson as any

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar hidden />
      <ScreenOrientation lockScreen={OrientationLock.LANDSCAPE} />
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
