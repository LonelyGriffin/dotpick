import {ScreenName} from './screen_name'

export type ScreensParams = {
  [ScreenName.Loading]: undefined
  [ScreenName.Stories]: undefined
  [ScreenName.Story]: {
    storyId: string
  }
  [ScreenName.Scene]: {
    storyId: string
    sceneId: string
  }
}
