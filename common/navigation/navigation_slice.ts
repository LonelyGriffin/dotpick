import {createSlice} from '@reduxjs/toolkit'
import {ScreenName} from './screen_name'
import {PayloadAction} from '@reduxjs/toolkit'

export type NavigationState = {
  currentScreen: ScreenName
}

const initialState: NavigationState = {
  currentScreen: ScreenName.Loading
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentScreen(state: NavigationState, action: PayloadAction<ScreenName>) {
      state.currentScreen = action.payload
    }
  }
})

export const {setCurrentScreen} = navigationSlice.actions
export default navigationSlice.reducer
