import {useEffect} from 'react'
import {OrientationLock, lockAsync} from 'expo-screen-orientation'

type Props = {
  lockScreenWithOrientation?: OrientationLock
}

export const ScreenOrientation = (props: Props) => {
  useEffect(() => {
    if (props.lockScreenWithOrientation) {
      lockAsync(props.lockScreenWithOrientation)
    }
  }, [props.lockScreenWithOrientation])
  return null
}
