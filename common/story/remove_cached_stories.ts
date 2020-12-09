import {Result} from '../../core/result'
import remove from 'lodash-es/remove'
import {STORIES} from './cache'

export const removeCachedStories = async (storyIds: string[]): Promise<Result<boolean>> => {
  return new Promise((resolve) => {
    remove(STORIES, (story) => storyIds.findIndex((id) => id === story.id) >= 0)
    resolve(new Result(true))
  })
}
