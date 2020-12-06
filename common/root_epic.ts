import {combineEpics} from 'redux-observable'
import {bootstrapEpic} from './bootstrap/bootstrap_epic'

export const rootEpic = combineEpics(bootstrapEpic)
