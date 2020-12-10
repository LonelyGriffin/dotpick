import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Config, BUILD_CONFIG} from '.'

export type ConfigState = Config

const initialState: ConfigState = BUILD_CONFIG

const configSlice = createSlice({
  name: 'config',
  initialState: initialState,
  reducers: {
    setConfig(_, action: PayloadAction<ConfigState>) {
      return action.payload
    }
  }
})
export const {setConfig} = configSlice.actions
export default configSlice.reducer
