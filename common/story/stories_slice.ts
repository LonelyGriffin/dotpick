import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Story} from '../../core/story'

type StoryState = Story & {
  isOver: boolean
  isLoadedResources: boolean
}

export type StoriesState = StoryState[]

const initialState: StoriesState = []

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setStories(_, action: PayloadAction<StoryState[]>) {
      return action.payload
    }
  }
})

export const {setStories} = storiesSlice.actions
export default storiesSlice.reducer
