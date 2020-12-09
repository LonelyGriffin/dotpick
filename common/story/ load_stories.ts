import {IResult, Result, ResultError} from '../../core/result'
import {Story} from '../../core/story'
import {Config} from '../config'
import {Database, SQLTransaction, SQLResultSet} from 'expo-sqlite'
import memoize from 'lodash-es/memoize'
import {removeCachedStories} from './remove_cached_stories'
import {setStoriesToCache} from './set_stories_to_cache'
import {uniq} from 'ramda'
import {STORIES} from './cache'

type StoryServerInvalidationState = {
  id: string
  timestamp: string
}

export const loadStories = async (config: Config, db: Database): Promise<IResult<Story[], any>> => {
  const cachedStories = await loadCachedStories(config, db)
  console.log('cachedStories', cachedStories)
  if (cachedStories.fail) {
    return new ResultError<Story[]>(new Error('stories loading failed'))
  }

  const storiesServerInvalidationState = await loadStoriesServerInvalidationState(config)

  if (storiesServerInvalidationState.fail) {
    return cachedStories
  }

  const invalidationResult = invalidateStories(cachedStories.unwrap(), storiesServerInvalidationState.unwrap())
  console.log('invalidationResult', invalidationResult)
  const isRemoved = await removeCachedStories(invalidationResult.needRemove)
  const isNeedRemove = (ids: string[]) => (story: Story) => ids.findIndex((id) => id === story.id) < 0
  const storiesAfterRemoving =
    isRemoved.success && isRemoved.unwrap()
      ? cachedStories.unwrap().filter(isNeedRemove(invalidationResult.needRemove))
      : cachedStories.unwrap()

  console.log('storiesAfterRemoving', storiesAfterRemoving)

  if (invalidationResult.needLoad.length === 0 && invalidationResult.needUpdate.length === 0) {
    return new Result(storiesAfterRemoving)
  }

  const fixedStories = await fetchInvalidStories(config, invalidationResult.needUpdate, invalidationResult.needLoad)

  if (fixedStories.fail) {
    return new Result(storiesAfterRemoving)
  }

  const isSet = await setStoriesToCache(fixedStories.unwrap())

  if (isSet.fail || !isSet.unwrap()) {
    return new Result(storiesAfterRemoving)
  }

  const isInvalid = (ids: string[]) => (story: Story) => ids.findIndex((id) => id === story.id) >= 0
  const storiesAfterInvalidation = storiesAfterRemoving
    .filter(isInvalid(fixedStories.unwrap().map((x) => x.id)))
    .concat(fixedStories.unwrap())

  return new Result(storiesAfterInvalidation)
}

const loadCachedStories = async (config: Config, db: Database) => {
  return new Promise<IResult<Story[]>>((resolve) => {
    resolve(new Result(STORIES.slice()))
    // const error = () => resolve(new ResultError<Story[]>(new Error('Load cached stories transaction failed')))
    // const success = (_: any, result: SQLResultSet) => {
    //   const length = result.rows.length
    //   const stories: Story[] = []
    //   for (let i = 0; i < length; i++) {
    //     const story: Story | null = result.rows.item(i)

    //     if (story) {
    //       stories.push(story)
    //     }

    //     resolve(new Result(stories))
    //   }
    // }
    // const callback = (tx: SQLTransaction) => {
    //   tx.executeSql('SELECT * FROM ?', [config.storiesDBTable], success)
    // }

    // db.transaction(callback, error)
  })
}

const loadStoriesServerInvalidationState = async (config: Config) => {
  try {
    const result = await fetch(config.api + '/stories/invalidation.json')
    const storiesInvalidationInfo: StoryServerInvalidationState[] = await result.json()
    return new Result(storiesInvalidationInfo)
  } catch (e) {
    return new ResultError<StoryServerInvalidationState[]>(new Error('Story invalidation info failed'))
  }
}

const invalidateStories = (stories: Story[], invalidationStates: StoryServerInvalidationState[]) => {
  const getStoryById = createByIdMemoGetter(stories)
  const getInvalidationState = createByIdMemoGetter(invalidationStates)

  const isExpiredStory = (story: Story, invalidationState: StoryServerInvalidationState) =>
    new Date(invalidationState.timestamp).getTime() - new Date(story.timestamp).getTime() > 0
  const isNeedRemove = (story: Story) => !getInvalidationState(story.id)
  const isNeedLoad = (invalidationState: StoryServerInvalidationState) => !getStoryById(invalidationState.id)
  const isNeedUpdate = (story: Story) =>
    getInvalidationState(story.id) ? isExpiredStory(story, getInvalidationState(story.id)!) : false

  return {
    needUpdate: stories.filter(isNeedUpdate).map((x) => x.id),
    needRemove: stories.filter(isNeedRemove).map((x) => x.id),
    needLoad: invalidationStates.filter(isNeedLoad).map((x) => x.id)
  }
}

const fetchInvalidStories = async (config: Config, toUpdateIds: string[], toLoadIds: string[]) => {
  const allStories = await fetchAllStories(config)

  if (allStories.fail) {
    return new ResultError<Story[]>(new Error('Invalid stories loading failed'))
  }

  const getStoryById = createByIdMemoGetter(allStories.unwrap())
  const ids = uniq([...toUpdateIds, ...toLoadIds])

  return new Result((ids.map(getStoryById).filter(Boolean) as any) as Story[])
}

const fetchAllStories = async (config: Config) => {
  try {
    const result = await fetch(config.api + '/stories/all.json')
    const stories = await result.json()

    return new Result<Story[]>(stories)
  } catch {
    return new ResultError<Story[]>(new Error('All stories loading failed'))
  }
}

const createByIdMemoGetter = <T extends {id: string}>(entities: T[]) =>
  memoize((id: string) => {
    return entities.find((story) => story.id === id)
  })
