// A damask: a symmetric motif of a crown, fronds, a drop and curls, repeated
// in a half-drop, so that each row is moved by half a tile against the row
// above. The tile has one motif at its corners and one in its middle. Drawn
// after the damask of the Almond Caramel bag, in its face pixels; the
// defaults are those of the front of the bag.
import type { ParameterSchemas } from '~/lib/suzuno/patterns/pattern'
import { tilePattern } from '~/lib/suzuno/patterns/pattern'

export interface DamaskParameters {
  color: string
  /** The offset of the tile and its scale in each direction. */
  x: number
  y: number
  scaleX: number
  scaleY: number
  /** The width of the scroll lines, in tile units. */
  stroke: number
  /** The size of the motif in the tile. */
  motif: number
  /** The size of the tile, before its scale. */
  width: number
  height: number
}

const PARAMETERS: ParameterSchemas<DamaskParameters> = {
  color: { type: 'color', label: 'Colour', default: '#b89428' },
  x: { type: 'number', label: 'Offset x', min: 0, max: 176, step: 0.05, default: 72.45 },
  y: { type: 'number', label: 'Offset y', min: 0, max: 140, step: 0.5, default: 91 },
  scaleX: { type: 'number', label: 'Scale x', min: 0.25, max: 4, step: 0.01, default: 1 },
  scaleY: { type: 'number', label: 'Scale y', min: 0.25, max: 4, step: 0.01, default: 1.06 },
  stroke: { type: 'number', label: 'Line width', min: 0, max: 8, step: 0.1, default: 2.5 },
  // The motif is drawn a little smaller than the print
  motif: { type: 'number', label: 'Motif size', min: 0.3, max: 3, step: 0.05, default: 1.2 },
  width: { type: 'number', label: 'Tile width', min: 40, max: 400, step: 1, default: 176 },
  height: { type: 'number', label: 'Tile height', min: 40, max: 400, step: 1, default: 140 },
}

// The motif around its middle: a crown of three petals over a ring, two
// fronds, a long drop with a bud below it, and curls on both sides that
// reach between the motifs of the next rows. The axis parts are symmetric;
// the side parts are drawn for the right half and mirrored.
const AXIS_FILLS = [
  // The middle petal of the crown, the drop and the bud
  'M0 -33C1.6 -30 1.6 -27 0 -24C-1.6 -27 -1.6 -30 0 -33Z',
  'M0 4C3.5 10 3.5 16 0 26C-3.5 16 -3.5 10 0 4Z',
  'M0 34C1.8 37 1.8 40 0 43C-1.8 40 -1.8 37 0 34Z',
]
const AXIS_DOTS = [
  { cx: 0, cy: -15, r: 1.2 },
]
const AXIS_STROKES = [
  // The ring, and the stems between the crown, the ring, the drop and the bud
  'M0 -18.5A3.5 3.5 0 1 1 0 -11.5A3.5 3.5 0 1 1 0 -18.5',
  'M0 -24V-18.5M0 -11.5V4M0 26V34',
]
const SIDE_STROKES = [
  // The curl below the frond, the inner and the outer curl beside the drop,
  // the small curl at the foot, the curl at the tip of the frond, and the
  // curl that reaches towards the next motif
  'M3 -4C8 -8 14 -8 19 -6C25 -4 27 2 24 5C21 8 17 6 17 3C17 1 19 0 21 1',
  'M2.5 12C8 14 13 16 16 19C19 23 17 27 14 27C11 27 10 24 12 22C13 21 15 22 15 23',
  'M10 10C18 8 28 10 34 14C38 17 38 23 34 24C31 25 29 22 31 20C32 19 34 20 34 21',
  'M4 32C10 32 18 30 23 32C27 34 27 39 24 40C21 41 20 38 22 37',
  'M24 -28C30 -32 37 -32 40 -28C43 -24 41 -19 37 -19C34 -19 33 -22 35 -23',
  'M36 24C42 30 50 32 55 28C59 25 57 19 53 20C50 21 51 25 54 25',
]
const SIDE_FILLS = [
  // The side petal of the crown, the frond and the side leaf
  'M0.5 -25C1.5 -28 3 -30.5 5 -31C4.5 -28 3 -26 0.5 -25Z',
  'M2 -9C6 -17 14 -24 24 -28C19 -21 13 -14 8 -7C5 -6 3 -7 2 -9Z',
  'M29 5C35 6 41 10 45 17C39 15 33 11 29 5Z',
]
const SIDE_DOTS = [
  { cx: 7.5, cy: -21, r: 1.2 },
  { cx: 9, cy: -27, r: 1 },
  { cx: 12, cy: 31, r: 1 },
  { cx: 40, cy: 2, r: 1 },
]
const MIRRORS = [1, -1]

const fill = (d: string) => `<path d="${d}" stroke="none" />`
const dot = ({ cx, cy, r }: { cx: number, cy: number, r: number }) => `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="none" />`

function motif({ color, stroke, motif: scale }: DamaskParameters, [x, y]: number[]) {
  const line = (d: string, cap = '') => `<path d="${d}" fill="none" stroke-width="${stroke / scale}"${cap} />`
  const half = (mirror: number) => `<g transform="scale(${mirror} 1)">${[
    ...SIDE_STROKES.map(d => line(d, ' stroke-linecap="round"')),
    ...SIDE_FILLS.map(fill),
    ...SIDE_DOTS.map(dot),
  ].join('')}</g>`
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}" stroke="${color}">${[
    ...AXIS_FILLS.map(fill),
    ...AXIS_DOTS.map(dot),
    ...AXIS_STROKES.map(d => line(d)),
    ...MIRRORS.map(half),
  ].join('')}</g>`
}

export const DAMASK = tilePattern<DamaskParameters>({
  name: 'damask',
  title: 'Damask',
  description: 'The damask of the Almond Caramel bag: a crown with fronds and curls, in a half-drop repeat.',
  seeded: false,
  parameters: PARAMETERS,
  tile(_seed, parameters) {
    const { width, height, x, y, scaleX, scaleY } = parameters
    // Copies of the motif that reach into the tile: the corners, the middle,
    // and the middles of the rows above and below and of the columns at the sides
    const copies = [
      [0, 0],
      [width, 0],
      [0, height],
      [width, height],
      [width / 2, height / 2],
      [width / 2, -height / 2],
      [width / 2, 1.5 * height],
      [-width / 2, height / 2],
      [1.5 * width, height / 2],
    ]
    return {
      width,
      height,
      transform: `translate(${x} ${y}) scale(${scaleX} ${scaleY})`,
      markup: copies.map(copy => motif(parameters, copy)).join(''),
    }
  },
})
