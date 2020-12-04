import React, {useEffect} from 'react'
import {View, Text} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'
import {GlobalState, GlobalStoreDispatch} from '../common/global_store/store'
import {setCurrentScreen} from '../common/navigation/navigation_slice'
import {ScreenName} from '../common/navigation/screen_name'

const LoadingScreen = () => {
  const value = useSelector((state: GlobalState) => state.navigation.currentScreen)
  const dispatch = useDispatch<GlobalStoreDispatch>()

  useEffect(() => {
    setTimeout(() => {
      dispatch(setCurrentScreen(ScreenName.Home))
    }, 3000)
  }, [])
  return (
    <View>
      <Text>{`Loading... (${value})`}</Text>
    </View>
  )
}

export default LoadingScreen
