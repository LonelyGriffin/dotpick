import {createStackNavigator} from '@react-navigation/stack'
import {Picture} from '../core/picture'

export type ScreensParams = {
  Loading: undefined
  Home: undefined
  Picture: {
    picture: Picture
    pictureLayerIndex: number
    onNextPictureLayer: () => void
  }
}

export const RootStack = createStackNavigator<ScreensParams>()
