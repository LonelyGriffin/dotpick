import {Polygon} from './polygon'

export type Story = {
  id: string
  order: number
  version: number
  title: string
  description: string
}

export type Scene = {
  id: string
  title: string
  videoDuration: number
}

export type ScenePoint = {
  polygons: Polygon[]
  polygonsColor: string
}
