import React from 'react'
import {StatusBar} from 'expo-status-bar'
import {PictureView} from './screens/picture_view'
import {Picture} from './core/picture'
import paintingPictureJson from './assets/images/watermelon/painting.json'
import {Menu} from './screens/menu'
import {NavigationContainer} from '@react-navigation/native'
import {Navigator} from './common/navigation/navigator'
import {ScreenOrientation} from './common/components/screen_orientation'
import {OrientationLock} from 'expo-screen-orientation'
import LoadingScreen from './screens/loading_screen'
import {ScreenName} from './common/navigation/screen_name'
import {Provider} from 'react-redux'
import {globalStore} from './common/global_store'
import {Bootstrap} from './common/bootstrap/bootstrap_component'

const currentPicture: Picture = paintingPictureJson as any

export default function App() {
  return (
    <NavigationContainer>
      <Provider store={globalStore}>
        <StatusBar hidden />
        <ScreenOrientation lockScreen={OrientationLock.LANDSCAPE} />
        <Navigator.Navigator
          initialRouteName={ScreenName.Loading}
          screenOptions={{
            headerShown: false
          }}
        >
          <Navigator.Screen name={ScreenName.Loading} component={LoadingScreen} />
          <Navigator.Screen name={ScreenName.Home} component={Menu} />
          <Navigator.Screen
            name={ScreenName.Picture}
            component={PictureView}
            initialParams={{
              picture: currentPicture
            }}
          />
        </Navigator.Navigator>
        <Bootstrap />
      </Provider>
    </NavigationContainer>
  )
}
