import React from 'react'
import {StatusBar} from 'expo-status-bar'
import {StoriesScreen} from './screens/stories'
import {NavigationContainer} from '@react-navigation/native'
import {Navigator} from './common/navigation/navigator'
import {ScreenOrientation} from './common/components/screen_orientation'
import {OrientationLock} from 'expo-screen-orientation'
import LoadingScreen from './screens/loading_screen'
import {ScreenName} from './common/navigation/screen_name'
import {Provider} from 'react-redux'
import {globalStore} from './common/global_store'
import {Bootstrap} from './common/bootstrap/bootstrap_component'
import {AppLoading} from 'expo'
import {useFonts} from 'expo-font'
import {StoryScreen} from './screens/story'
import SceneScreen from './screens/scene'

export default function App() {
  // TODO: Обработать ошибки. Внести в бутстрапинг
  let [fontsLoaded] = useFonts({
    'Roboto-Regular': require('./common/assets/font/Roboto/Roboto-Regular.ttf')
    // 'Roboto-Bold': require('./common/assets/font/Roboto/Roboto-Bold.ttf')
  })

  if (!fontsLoaded) {
    return <AppLoading />
  }

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
          <Navigator.Screen name={ScreenName.Stories} component={StoriesScreen} />
          <Navigator.Screen name={ScreenName.Story} component={StoryScreen} />
          <Navigator.Screen name={ScreenName.Scene} component={SceneScreen} />
        </Navigator.Navigator>
        <Bootstrap />
      </Provider>
    </NavigationContainer>
  )
}
