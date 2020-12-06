import React, {useEffect} from 'react'
import {View, Text} from 'react-native'
import {useDispatch} from 'react-redux'
import {GlobalStoreDispatch} from '../global_store'
import {bootstrap} from './bootstrap_slice'

export const Bootstrap = () => {
  const dispatch = useDispatch<GlobalStoreDispatch>()
  useEffect(() => {
    dispatch(bootstrap())
  }, [])
  return null
}
