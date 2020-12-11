import {IResult, Result, ResultError} from '../../core/result'
import {Story} from '../../core/story'
import {Config} from '../config'
import memoize from 'lodash-es/memoize'
import {DataBaseManager} from '../db'
import uniq from 'lodash-es/uniq'

type StoryServerInvalidationState = {
  id: string
  timestamp: string
}

export const loadStories = async (config: Config, db: DataBaseManager): Promise<IResult<Story[], any>> => {
  const cachedStories = await db.getStories()
  console.log('cachedStories loaded')
  if (cachedStories.fail) {
    return new ResultError<Story[]>(new Error('stories loading failed'))
  }

  console.log(
    'cachedStories',
    cachedStories.unwrap().map((s) => ({...s, previewImage: s.previewImage.slice(0, 10)}))
  )

  const storiesServerInvalidationState = await loadStoriesServerInvalidationState(config)

  if (storiesServerInvalidationState.fail) {
    return cachedStories
  }

  const invalidationResult = invalidateStories(cachedStories.unwrap(), storiesServerInvalidationState.unwrap())
  console.log('invalidationResult', invalidationResult)
  const isRemoved = await db.deleteStories(invalidationResult.needRemove)
  const isNeedRemove = (ids: string[]) => (story: Story) => ids.findIndex((id) => id === story.id) < 0
  const storiesAfterRemoving = isRemoved.success
    ? cachedStories.unwrap().filter(isNeedRemove(invalidationResult.needRemove))
    : cachedStories.unwrap()
  console.log(
    'storiesAfterRemoving',
    storiesAfterRemoving.map((s) => ({...s, previewImage: s.previewImage.slice(0, 10)}))
  )

  if (invalidationResult.needLoad.length === 0 && invalidationResult.needUpdate.length === 0) {
    return new Result(storiesAfterRemoving)
  }

  const fixedStories = await fetchInvalidStories(config, invalidationResult.needUpdate, invalidationResult.needLoad)

  if (fixedStories.fail) {
    return new Result(storiesAfterRemoving)
  }

  console.log(
    'fixedStories',
    fixedStories.unwrap().map((s) => ({...s, previewImage: s.previewImage.slice(0, 10)}))
  )

  const isSet = await db.setStories(fixedStories.unwrap())
  console.log('isSet', isSet)

  if (isSet.fail) {
    return new Result(storiesAfterRemoving)
  }

  const isNotInvalid = (ids: string[]) => (story: Story) => ids.findIndex((id) => id === story.id) < 0
  const storiesAfterInvalidation = storiesAfterRemoving
    .filter(isNotInvalid(fixedStories.unwrap().map((x) => x.id)))
    .concat(fixedStories.unwrap())

  return new Result(storiesAfterInvalidation)
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
