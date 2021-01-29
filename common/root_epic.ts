import {combineEpics} from 'redux-observable'
import {bootstrapEpic} from './bootstrap/bootstrap_epic'
import {storiesEpic} from './stories/stories_epic'

export const rootEpic = combineEpics(bootstrapEpic, storiesEpic)
