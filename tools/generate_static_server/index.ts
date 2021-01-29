const path = require('path')
import {promises as fs} from 'fs'
import STORIES from './data/stories'
import {Scene} from '../../core/story'

const DESTINATION = path.join(__dirname, '../../static_server')
const asyncForeach = <T>(array: T[], foreach: (value: T, index: number, array: T[]) => Promise<void>) => {
  return Promise.all(array.map(foreach))
}

const checkIds = (entries: Array<{id: string | number}>) => {
  const ids: any[] = []
  entries.forEach((entry) => {
    if (ids.indexOf(entry.id) >= 0) {
      throw `Duplicate story id: ${entry.id}`
    }

    ids.push(entry.id)
  })
}

;(async () => {
  await fs.rmdir(DESTINATION, {recursive: true})
  await fs.mkdir(DESTINATION)

  const storiesDestination = path.join(DESTINATION, 'stories')
  await fs.mkdir(storiesDestination)

  checkIds(STORIES)
  await fs.writeFile(path.join(storiesDestination, 'index.json'), JSON.stringify(STORIES))

  await asyncForeach(STORIES, async (story) => {
    const storySource = path.join(__dirname, `./data/stories/${story.id}`)
    const storyDestination = path.join(storiesDestination, story.id)

    const scenes: Scene[] = require(path.join(storySource, 'scenes.ts')).default
    checkIds(scenes)

    await fs.mkdir(storyDestination)
    await fs.writeFile(path.join(storyDestination, 'scenes.json'), JSON.stringify(scenes))
    await fs.copyFile(path.join(storySource, 'preview.png'), path.join(storyDestination, 'preview.png'))

    const scenesSources = path.join(storySource, 'scenes/')
    const scenesDestination = path.join(storyDestination, 'scenes/')

    await fs.mkdir(scenesDestination)

    await asyncForeach(scenes, async (scene) => {
      const sceneSource = path.join(scenesSources, scene.id)
      const sceneDestination = path.join(scenesDestination, scene.id)

      await fs.mkdir(sceneDestination)

      await fs.copyFile(path.join(sceneSource, 'preview_empty.png'), path.join(sceneDestination, 'preview_empty.png'))
      await fs.copyFile(path.join(sceneSource, 'preview_full.png'), path.join(sceneDestination, 'preview_full.png'))

      const points = require(path.join(sceneSource, 'points.ts')).default
      await fs.writeFile(path.join(sceneDestination, 'points.json'), JSON.stringify(points))

      await asyncForeach(points, async (_, index) => {
        await fs.copyFile(
          path.join(sceneSource, `video_${index}.mp4`),
          path.join(sceneDestination, `video_${index}.mp4`)
        )
      })

      await fs.copyFile(
        path.join(sceneSource, `video_${points.length}.mp4`),
        path.join(sceneDestination, `video_${points.length}.mp4`)
      )
    })
  })
})()
