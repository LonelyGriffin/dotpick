import {createAction, createReducer} from '@reduxjs/toolkit'

export const increment = createAction('increment')

export const globalReducer = createReducer(0, {
  [increment.type]: (state) => state + 1
})

export type GlobalState = ReturnType<typeof globalReducer>
