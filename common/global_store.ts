import {combineReducers, configureStore} from '@reduxjs/toolkit'
import navigation from './navigation/navigation_slice'
import stories from './story/stories_slice'
import {createEpicMiddleware} from 'redux-observable'
import {rootEpic} from './root_epic'

const epicMiddleware = createEpicMiddleware()

export const globalStore = configureStore({
  reducer: combineReducers({
    navigation,
    stories
  }),
  middleware: [epicMiddleware]
})

epicMiddleware.run(rootEpic)

export type GlobalState = ReturnType<typeof globalStore.getState>
export type GlobalStoreDispatch = typeof globalStore.dispatch
