import React, {useEffect} from 'react'
import {View, Text} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'
import {GlobalState, increment} from '../common/global_store/global_reducer'
import {GlobalStoreDispatch} from '../common/global_store/store'

const LoadingScreen = () => {
  const value = useSelector((state: GlobalState) => state)
  const dispatch = useDispatch<GlobalStoreDispatch>()

  useEffect(() => {
    setTimeout(() => {
      dispatch(increment())
    }, 3000)
  })
  return (
    <View>
      <Text>{`Loading... (${value})`}</Text>
    </View>
  )
}

export default LoadingScreen
