import React from 'react'
import {NavigationStateSynchronizer} from '../navigation/navigation_store_synchronizer'

type Props = {
  children: React.ReactNode
}

export const Screen = (props: Props) => {
  return (
    <>
      <NavigationStateSynchronizer />
      {props.children}
    </>
  )
}
