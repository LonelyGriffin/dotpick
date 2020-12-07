import {Action} from '@reduxjs/toolkit'
import {from, Observable, of} from 'rxjs'
import {filter, switchMap, delay, tap} from 'rxjs/operators'
import {loadConfig} from '../config'
import {queueNavigationAction} from '../navigation/navigation_slice'
import {ScreenName} from '../navigation/screen_name'
import {bootstrap} from './bootstrap_slice'

export const bootstrapEpic = (action$: Observable<Action>) =>
  action$.pipe(
    filter(bootstrap.match),
    delay(3000),
    switchMap((_) => from(performBootstraping())),
    switchMap((bootstrapAction$) => bootstrapAction$)
  )

const performBootstraping = async (): Promise<Observable<Action>> => {
  const config = await loadConfig()
  console.log('config', config)
  return of(
    queueNavigationAction({
      type: 'REPLACE',
      payload: {
        name: ScreenName.Home
      }
    })
  )
}
