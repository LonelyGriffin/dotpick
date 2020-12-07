import {Action} from '@reduxjs/toolkit'
import {of} from 'ramda'
import {Observable} from 'rxjs'
import {filter, switchMap, delay} from 'rxjs/operators'
import {queueNavigationAction} from '../navigation/navigation_slice'
import {ScreenName} from '../navigation/screen_name'
import {bootstrap} from './bootstrap_slice'

export const bootstrapEpic = (action$: Observable<Action>) =>
  action$.pipe(
    filter(bootstrap.match),
    delay(3000),
    switchMap((_) =>
      of(
        queueNavigationAction({
          type: 'REPLACE',
          payload: {
            name: ScreenName.Home
          }
        })
      )
    )
  )
