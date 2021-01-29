import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Story} from '../../core/story'

export type StoryState = {
  isLoaded: boolean
  isOver: boolean
  isLoading: boolean
}

export type StoriesState = {
  entities: Story[]
  states: Record<string, StoryState>
}

const initialState: StoriesState = {
  entities: [],
  states: {}
}

const storiesSlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    setStories(state, action: PayloadAction<Story[]>) {
      state.entities = action.payload
    },
    setStoryStates(state, action: PayloadAction<Record<string, StoryState>>) {
      state.states = action.payload
    },
    setStoryState(state, action: PayloadAction<{storyId: string; state: StoryState}>) {
      state.states[action.payload.storyId] = action.payload.state
    }
  }
})

export const requestLoadStory = createAction<string>('stories/requestLoadStory')

export const {setStories, setStoryState, setStoryStates} = storiesSlice.actions
export default storiesSlice.reducer
