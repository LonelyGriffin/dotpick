import {combineReducers, configureStore} from '@reduxjs/toolkit'
import navigation from './navigation/navigation_slice'
import stories from './stories/stories_slice'
import config from './config/config_slice'
import {createEpicMiddleware} from 'redux-observable'
import {rootEpic} from './root_epic'

const epicMiddleware = createEpicMiddleware()

export const globalStore = configureStore({
  reducer: combineReducers({
    config,
    navigation,
    stories
  }),
  middleware: [epicMiddleware]
})

epicMiddleware.run(rootEpic as any)

export type GlobalState = ReturnType<typeof globalStore.getState>
export type GlobalStoreDispatch = typeof globalStore.dispatch
