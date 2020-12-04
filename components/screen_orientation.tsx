import {useEffect} from 'react'
import {OrientationLock, lockAsync} from 'expo-screen-orientation'

type Props = {
  lockScreen?: OrientationLock
}

export const ScreenOrientation = (props: Props) => {
  useEffect(() => {
    if (props.lockScreen) {
      lockAsync(props.lockScreen)
    }
  }, [props.lockScreen])
  return null
}
