import {Action} from '@reduxjs/toolkit'
import {from, Observable, of, merge, EMPTY} from 'rxjs'
import {filter, switchMap} from 'rxjs/operators'
import {load_story_resources} from '../stories/load_stories'
import {requestLoadStory, setStoryState, StoryState} from './stories_slice'
import {combineEpics, StateObservable} from 'redux-observable'
import {GlobalState} from '../global_store'

export const requestLoadStoryEpic = (action$: Observable<Action>, state$: StateObservable<GlobalState>) =>
  action$.pipe(
    filter(requestLoadStory.match),
    switchMap((action) => {
      const story = state$.value.stories.entities.find((x) => (x.id = action.payload))

      if (!story) {
        return EMPTY
      }

      const currentState: StoryState = state$.value.stories.states[action.payload] || {
        isOver: false,
        isLoaded: false,
        isLoading: false
      }

      return merge(
        of(
          setStoryState({
            storyId: action.payload,
            state: {
              ...currentState,
              isLoading: true
            }
          })
        ),
        from(
          (async () => {
            await load_story_resources(state$.value.config, story)
            return setStoryState({
              storyId: action.payload,
              state: {
                ...currentState,
                isLoading: false,
                isLoaded: true
              }
            })
          })()
        )
      )
    })
  )

export const storiesEpic = combineEpics(requestLoadStoryEpic)
