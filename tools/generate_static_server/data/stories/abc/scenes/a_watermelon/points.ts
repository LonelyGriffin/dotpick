import {ScenePoint} from '../../../../../../../core/story'

const points: ScenePoint[] = [
  {
    polygonsColor: 'green',
    polygons: [
      [
        [0, 0],
        [0, 100],
        [100, 100],
        [100, 0]
      ]
    ],
    videoPauseBegin: 10000,
    videoPauseEnd: 15500
  },
  {
    polygonsColor: 'red',
    polygons: [
      [
        [0, 0],
        [0, 100],
        [100, 100],
        [100, 0]
      ],
      [
        [300, 300],
        [500, 300],
        [500, 500]
      ]
    ],
    videoPauseBegin: 20300,
    videoPauseEnd: 25000
  }
]

export default points
