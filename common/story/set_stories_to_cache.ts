import remove from 'lodash-es/remove'
import {Result} from '../../core/result'
import {Story} from '../../core/story'
import {STORIES} from './cache'

export const setStoriesToCache = async (stories: Story[]): Promise<Result<boolean>> => {
  return new Promise((resolve) => {
    remove(STORIES, (story) => stories.findIndex((s) => s.id === story.id))
    STORIES.push(...stories)
    resolve(new Result(true))
  })
}
