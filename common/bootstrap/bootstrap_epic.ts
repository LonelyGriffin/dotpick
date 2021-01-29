import {Action} from '@reduxjs/toolkit'
import {from, Observable, of} from 'rxjs'
import {filter, switchMap, delay, tap} from 'rxjs/operators'
import {CONFIG} from '../config'
import {queueNavigationAction} from '../navigation/navigation_slice'
import {ScreenName} from '../navigation/screen_name'
import {load_stories, load_stories_state, prepare_stories_dir} from '../stories/load_stories'
import {bootstrap} from './bootstrap_slice'
import {setStoryState, setStoryStates, setStories} from '../stories/stories_slice'
import {setConfig} from '../config/config_slice'
import {StateObservable} from 'redux-observable'
import {GlobalState} from '../global_store'

export const bootstrapEpic = (action$: Observable<Action>, _: StateObservable<GlobalState>) =>
  action$.pipe(
    filter(bootstrap.match),
    switchMap((_) => from(performBootstraping())),
    switchMap((bootstrapAction$) => bootstrapAction$)
  )

const performBootstraping = async (): Promise<Observable<Action>> => {
  await prepare_stories_dir()
  const storyStates = await load_stories(CONFIG)
  const storiesState = await load_stories_state()

  return of(
    setConfig(CONFIG),
    setStories(storyStates),
    setStoryStates(storiesState),
    queueNavigationAction({
      type: 'REPLACE',
      payload: {
        name: ScreenName.Stories
      }
    })
  )
}
