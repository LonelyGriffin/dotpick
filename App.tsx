import React from 'react'
import {StatusBar} from 'expo-status-bar'
import {PictureView} from './components/picture_view'
import {Picture} from './core/picture'
import paintingPictureJson from './assets/images/watermelon/painting.json'
import {Menu} from './components/menu'
import {NavigationContainer} from '@react-navigation/native'
import {RootStack} from './navigation/root_stack'
import {ScreenOrientation} from './components/screen_orientation'
import {OrientationLock} from 'expo-screen-orientation'
import LoadingScreen from './screens/loading_screen'
import {ScreenName} from './navigation/screen_name'

const currentPicture: Picture = paintingPictureJson as any

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar hidden />
      <ScreenOrientation lockScreen={OrientationLock.LANDSCAPE} />
      <RootStack.Navigator
        initialRouteName={ScreenName.Loading}
        screenOptions={{
          headerShown: false
        }}
      >
        <RootStack.Screen name={ScreenName.Loading} component={LoadingScreen} />
        <RootStack.Screen name={ScreenName.Home} component={Menu} />
        <RootStack.Screen
          name={ScreenName.Picture}
          component={PictureView}
          initialParams={{
            picture: currentPicture
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
