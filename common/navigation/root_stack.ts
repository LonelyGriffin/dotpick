import {createStackNavigator} from '@react-navigation/stack'
import {Picture} from '../../core/picture'
import {ScreenName} from './screen_name'

export type ScreensParams = {
  [ScreenName.Loading]: undefined
  [ScreenName.Home]: undefined
  [ScreenName.Picture]: {
    picture: Picture
    pictureLayerIndex: number
    onNextPictureLayer: () => void
  }
}

export const RootStack = createStackNavigator<ScreensParams>()
