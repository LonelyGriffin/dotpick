import React from 'react'
import {StatusBar} from 'expo-status-bar'
import {PictureView} from './components/picture_view'
import {Picture} from './core/picture'
import paintingPictureJson from './assets/images/watermelon/painting.json'
import {Menu} from './components/menu'
import {NavigationContainer} from '@react-navigation/native'
import {RootStack} from './common/navigation/root_stack'
import {ScreenOrientation} from './components/screen_orientation'
import {OrientationLock} from 'expo-screen-orientation'
import LoadingScreen from './screens/loading_screen'
import {ScreenName} from './common/navigation/screen_name'
import {Provider} from 'react-redux'
import {globalStore} from './common/global_store/store'

const currentPicture: Picture = paintingPictureJson as any

export default function App() {
  return (
    <NavigationContainer>
      <Provider store={globalStore}>
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
      </Provider>
    </NavigationContainer>
  )
}
