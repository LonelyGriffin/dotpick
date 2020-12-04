const INPUT = '../assets/images/watermelon/painting.svg'
const OUTPUT = '../assets/images/watermelon/painting.json'

const fs = require('fs')
const path = require('path')
const parseXML = require('xml2js').parseString

const svgString = fs.readFileSync(path.join(__dirname, INPUT))
const svgMesh3d = require('svg-mesh-3d')
const shortId = require('shortid')
const SVGPathInterpolator = require('svg-path-interpolator')

const parse = require('parse-svg-path')
const simplify = require('simplify-path')
const contours = require('svg-path-contours')
const triangulate = require('triangulate-contours')

const invertY = (coord) => [coord[0], -coord[1]]

parseXML(svgString, (e, svgData) => {
  if (e) {
    console.error(e)
    return
  }

  let box

  const layers = svgData.svg.g.map((g) => {
    return g.path.map((p) => {
      const lines = contours(parse(p.$.d))
      // const simplifyLines = lines.map((path) => simplify(path, 0.01));
      const {positions, cells} = triangulate(lines)

      const color = p.$.fill
      // const { positions, cells } = svgMesh3d(p.$.d, {
      //   normalize: false,
      //   scale: 16,
      //   delaunay: true,
      // });

      const polygon = {
        id: shortId(),
        color,
        vertexes: positions.map(invertY),
        indexes: cells,
        contour: lines[0].map(invertY)
      }

      polygon.vertexes.forEach(([x, y]) => {
        if (!box) {
          box = [
            [x, y],
            [x, y]
          ]
        } else {
          if (box[0][0] > x) {
            box[0][0] = x
          }

          if (box[0][1] > y) {
            box[0][1] = y
          }

          if (box[1][0] < x) {
            box[1][0] = x
          }

          if (box[1][1] < y) {
            box[1][1] = y
          }
        }
      })

      return polygon
    })
  })

  fs.writeFileSync(
    path.join(__dirname, OUTPUT),
    JSON.stringify({
      box,
      layers
    })
  )
})
