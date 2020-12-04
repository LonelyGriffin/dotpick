import {configureStore} from '@reduxjs/toolkit'
import {globalReducer} from './global_reducer'

export const globalStore = configureStore({
  reducer: globalReducer
})

export type GlobalStoreDispatch = typeof globalStore.dispatch
