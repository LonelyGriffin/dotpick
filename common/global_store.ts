import {combineReducers, configureStore} from '@reduxjs/toolkit'
import navigation from './navigation/navigation_slice'

export const globalStore = configureStore({
  reducer: combineReducers({
    navigation
  })
})

export type GlobalState = ReturnType<typeof globalStore.getState>
export type GlobalStoreDispatch = typeof globalStore.dispatch
