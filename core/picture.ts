import {curry} from 'ramda'
import {Box} from './box'
import {Polygon} from './polygon'

export type Picture = {
  box: Box
  layers: PictureLayer[]
}
export type PictureLayer = Polygon[]

export const picturePolygonsBeforeLayer = curry((picture: Picture, layerIndex: number) =>
  picture.layers.reduce((polygons, layer, i) => (i < layerIndex ? [...polygons, ...layer] : polygons), [])
)

export const pictureLayerPolygons = curry((picture: Picture, layerIndex: number) => picture.layers[layerIndex])
