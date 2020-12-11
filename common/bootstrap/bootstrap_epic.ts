import {Action} from '@reduxjs/toolkit'
import {from, Observable, of} from 'rxjs'
import {filter, switchMap, delay, tap} from 'rxjs/operators'
import {loadConfig} from '../config'
import {queueNavigationAction} from '../navigation/navigation_slice'
import {ScreenName} from '../navigation/screen_name'
import {loadStories} from '../story/load_stories'
import {bootstrap} from './bootstrap_slice'
import {setStories} from '../story/stories_slice'
import {DataBaseManager} from '../db'
import {setConfig} from '../config/config_slice'

export const bootstrapEpic = (action$: Observable<Action>) =>
  action$.pipe(
    filter(bootstrap.match),
    switchMap((_) => from(performBootstraping())),
    switchMap((bootstrapAction$) => bootstrapAction$)
  )

const performBootstraping = async (): Promise<Observable<Action>> => {
  const config = await loadConfig()

  const db = new DataBaseManager()

  await db.init()
  const stories = await loadStories(config, db)
  if (stories.fail) {
    throw stories.error
  }

  const storyStates = stories.unwrap().map((story) => ({
    ...story,
    isOver: false,
    isLoadedResources: false
  }))
  return of(
    setConfig(config),
    setStories(storyStates),
    queueNavigationAction({
      type: 'REPLACE',
      payload: {
        name: ScreenName.Home
      }
    })
  )
}
