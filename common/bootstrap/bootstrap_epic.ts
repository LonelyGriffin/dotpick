import {Action} from '@reduxjs/toolkit'
import {Observable} from 'rxjs'
import {filter, tap} from 'rxjs/operators'
import {bootstrap} from './bootstrap_slice'

export const bootstrapEpic = (action$: Observable<Action>) => action$.pipe(filter(bootstrap.match), tap(console.log))
