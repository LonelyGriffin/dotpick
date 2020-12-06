import {Action, createSlice, Reducer} from '@reduxjs/toolkit'
import {PayloadAction} from '@reduxjs/toolkit'
import {NavigationState as ReactNavigationState, CommonNavigationAction} from '@react-navigation/core'
import {ScreensParams} from './screens_params'

export type NavigationState = {
  actionsForExecutionQueue: CommonNavigationAction[]
  navigationState: ReactNavigationState<ScreensParams>
}

const initialState: NavigationState = {
  actionsForExecutionQueue: [],
  navigationState: {
    key: 'INITIAL',
    index: -1,
    routeNames: [],
    routes: [],
    stale: false,
    type: 'INITIAL'
  }
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: initialState,
  reducers: {
    setNavigationState(state, action: PayloadAction<ReactNavigationState<ScreensParams>>) {
      state.navigationState = action.payload
    },
    queueNavigationAction(state, action: PayloadAction<CommonNavigationAction>) {
      state.actionsForExecutionQueue.push(action.payload)
    },
    unqueueNavigationAction(state) {
      state.actionsForExecutionQueue.splice(0, 1)
    }
  }
})
export const {setNavigationState, queueNavigationAction, unqueueNavigationAction} = navigationSlice.actions
export default navigationSlice.reducer
