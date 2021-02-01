import * as FileSystem from 'expo-file-system'
import {Config} from '../config'
import {Scene, ScenePoint, Story} from '../../core/story'
import {StoryState} from './stories_slice'

export const load_stories = async (config: Config): Promise<Story[]> => {
  const remoteStories = await load_remote_stories(config)
  const localStories = await load_local_stories()

  if (remoteStories.length === 0) {
    return localStories
  }

  const result: Story[] = []
  let storiesWasChanged = false
  await Promise.all(
    remoteStories.map(async (remoteStory) => {
      const localStory = localStories.find((x) => x.id === remoteStory.id)

      if (!localStory) {
        await load_remote_story_preview(config, remoteStory)
        result.push(remoteStory)
        storiesWasChanged = true
      } else if (localStory.version < remoteStory.version) {
        await load_remote_story_preview(config, remoteStory)
        result.push(remoteStory)
        storiesWasChanged = true
      } else {
        result.push(localStory)
      }
    })
  )

  if (storiesWasChanged) {
    await save_local_stories(result)
  }

  return result
}

export const prepare_stories_dir = async () => {
  const storiesDirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + `stories`)

  if (!storiesDirInfo.exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + `stories`)
  }
}

export const load_remote_stories = async (config: Config): Promise<Story[]> => {
  try {
    const storiesRes = await fetch(config.api + '/stories/index.json')
    const stories = await storiesRes.json()

    return stories
  } catch {
    return []
  }
}

export const load_local_stories = async (): Promise<Story[]> => {
  const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + `stories/index.json`)

  if (info.exists) {
    return JSON.parse(await FileSystem.readAsStringAsync(FileSystem.documentDirectory + `stories/index.json`))
  }

  return []
}

export const save_local_stories = async (stories: Story[]) => {
  await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + `stories/index.json`, JSON.stringify(stories))
}

export const load_remote_story_preview = async (config: Config, story: Story): Promise<void> => {
  const storyDirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + `stories/${story.id}`)

  if (!storyDirInfo.exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + `stories/${story.id}`)
  }

  await FileSystem.createDownloadResumable(
    config.api + `/stories/${story.id}/preview.png`,
    FileSystem.documentDirectory + `stories/${story.id}/preview.png`
  ).downloadAsync()
}

export const load_stories_state = async (): Promise<Record<string, StoryState>> => {
  const storiesStateInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + `stories/state.json`)

  if (!storiesStateInfo.exists) {
    return {}
  }

  return JSON.parse(await FileSystem.readAsStringAsync(FileSystem.documentDirectory + `stories/state.json`))
}

export const get_story_preview_uri = async (story: Story) => {
  const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + `stories/${story.id}/preview.png`)

  if (info.exists) {
    return info.uri
  }
}

export const get_scene_preview_uri = async (story: Story, scene: Scene) => {
  const info = await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}/preview_empty.png`
  )

  if (info.exists) {
    return info.uri
  }
}

export const load_story_resources = async (config: Config, story: Story) => {
  const scenes: Scene[] = await (await fetch(config.api + `/stories/${story.id}/scenes.json`)).json()

  const info = await FileSystem.getInfoAsync(FileSystem.documentDirectory + `stories/${story.id}/scenes`)

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + `stories/${story.id}/scenes`)
  }

  await Promise.all([
    FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + `stories/${story.id}/scenes.json`,
      JSON.stringify(scenes)
    ),
    ...scenes.map(async (scene) => {
      const info = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}`
      )

      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}`)
      }

      await FileSystem.downloadAsync(
        config.api + `/stories/${story.id}/scenes/${scene.id}/points.json`,
        FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}/points.json`
      )

      const points = await get_scene_points(story, scene)

      await Promise.all([
        FileSystem.downloadAsync(
          config.api + `/stories/${story.id}/scenes/${scene.id}/preview_empty.png`,
          FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}/preview_empty.png`
        ),
        FileSystem.downloadAsync(
          config.api + `/stories/${story.id}/scenes/${scene.id}/preview_full.png`,
          FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}/preview_full.png`
        ),
        FileSystem.downloadAsync(
          config.api + `/stories/${story.id}/scenes/${scene.id}/video.mp4`,
          FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}/video.mp4`
        )
      ])
    })
  ])
}

export const load_scenes = async (story: Story): Promise<Scene[]> => {
  return JSON.parse(
    await FileSystem.readAsStringAsync(FileSystem.documentDirectory + `stories/${story.id}/scenes.json`)
  )
}

export const get_scene_points = async (story: Story, scene: Scene): Promise<ScenePoint[]> => {
  const res = await FileSystem.readAsStringAsync(
    FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}/points.json`
  )

  return JSON.parse(res)
}

export const get_scene_video_uri = async (story: Story, scene: Scene) => {
  const info = await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + `stories/${story.id}/scenes/${scene.id}/video.mp4`
  )

  return info.uri
}
