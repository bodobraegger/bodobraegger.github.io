// Brush strokes of watercolour paint, like the darker blue strokes in the
// Hokkaido map of the RIBON bag. Seed 0 draws the strokes traced from the
// photo (tools/packages/hokkaido_milk_trace.py) in the frame of the map,
// fitted into the box; other seeds paint new strokes over the box, each a
// bent line that is widest in its middle.
import { MAP_STROKES_PATH } from '~/lib/suzuno/packages/hokkaido-milk-paths'
import { random, ribbonPath } from '~/lib/suzuno/ornament'
import type { Box, ParameterSchemas, PatternGenerator } from '~/lib/suzuno/patterns/pattern'
import { fitInto } from '~/lib/suzuno/patterns/pattern'

export interface BrushStrokesParameters {
  color: string
  /** The blur of the paint. */
  softness: number
  count: number
  /** The mean length and width of a stroke, as shares of the shorter side of the box. */
  length: number
  width: number
  /** The mean direction of the strokes and the random turn of each, in degrees. */
  angle: number
  spread: number
  /** How far a stroke bends away from a straight line, as a share of its length. */
  bend: number
}

/** The box of the map outline of HokkaidoMap.vue, in its coordinates, around the traced strokes. */
export const TRACED_STROKES_BOX: Box = { x: -47.2, y: -46.2, width: 100, height: 104 }

// The points along one stroke, and the random range of its length and width around their mean
const STROKE_POINTS = 12
const SIZE_RANGE = [0.6, 1.4]

const PARAMETERS: ParameterSchemas<BrushStrokesParameters> = {
  color: { type: 'color', label: 'Colour', default: '#3aa6e0' },
  softness: { type: 'number', label: 'Softness', min: 0, max: 10, step: 0.1, default: 0 },
  count: { type: 'number', label: 'Strokes', min: 1, max: 200, step: 1, default: 14 },
  length: { type: 'number', label: 'Length', min: 0.02, max: 1.5, step: 0.01, default: 0.35 },
  width: { type: 'number', label: 'Width', min: 0.005, max: 0.3, step: 0.005, default: 0.06 },
  angle: { type: 'number', label: 'Direction', min: -180, max: 180, step: 1, default: -35 },
  spread: { type: 'number', label: 'Random turn', min: 0, max: 180, step: 1, default: 30 },
  bend: { type: 'number', label: 'Bend', min: 0, max: 1, step: 0.01, default: 0.2 },
}

/** The path data of new strokes over the box. */
function paint(seed: number, { count, length, width, angle, spread, bend }: BrushStrokesParameters, box: Box) {
  const next = random(seed)
  const between = ([low, high]: number[]) => low + (high - low) * next()
  const side = Math.min(box.width, box.height)
  return Array.from({ length: count }, () => {
    const start = [box.x + next() * box.width, box.y + next() * box.height]
    const direction = (angle + between([-spread, spread])) * Math.PI / 180
    const strokeLength = side * length * between(SIZE_RANGE)
    const strokeWidth = side * width * between(SIZE_RANGE)
    const end = [start[0] + strokeLength * Math.cos(direction), start[1] + strokeLength * Math.sin(direction)]
    // The control point of a quadratic curve, moved across the stroke
    const offset = strokeLength * bend * between([-1, 1])
    const control = [(start[0] + end[0]) / 2 - offset * Math.sin(direction), (start[1] + end[1]) / 2 + offset * Math.cos(direction)]
    const points = Array.from({ length: STROKE_POINTS + 1 }, (_, index): [number, number] => {
      const t = index / STROKE_POINTS
      const along = (axis: number) => (1 - t) ** 2 * start[axis] + 2 * t * (1 - t) * control[axis] + t ** 2 * end[axis]
      return [along(0), along(1)]
    })
    return ribbonPath(points, strokeWidth)
  }).join('')
}

export const BRUSH_STROKES: PatternGenerator<BrushStrokesParameters> = {
  name: 'brush-strokes',
  title: 'Brush strokes',
  description: 'The blue watercolour strokes in the map of the Hokkaido milk bag. Seed 0 is the traced strokes; other seeds paint new strokes.',
  kind: 'free',
  seeded: true,
  parameters: PARAMETERS,
  render(seed, parameters, box, id) {
    const { color, softness } = parameters
    const strokes = seed ? `<path d="${paint(seed, parameters, box)}" fill="${color}" />` : fitInto(TRACED_STROKES_BOX, box, `<path d="${MAP_STROKES_PATH}" fill="${color}" />`)
    if (!softness)
      return strokes
    return `<filter id="${id}-soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${softness}" /></filter><g filter="url(#${id}-soft)">${strokes}</g>`
  },
}
