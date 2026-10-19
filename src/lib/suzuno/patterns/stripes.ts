// Straight stripes across a ground, such as the heat seal bands of a bag.
// Each stripe has its middle, its width and its colour; with a period, the
// stripes repeat down the box, like the ridges of a crimped seal. The defaults
// are the bottom band of the front of the Almond Caramel bag.
import type { ParameterSchemas, PatternGenerator, Stripe } from '~/lib/suzuno/patterns/pattern'
import { rectangle } from '~/lib/suzuno/patterns/pattern'

export interface StripesParameters {
  ground: string
  /** The opacity of the ground; 0 leaves only the stripes. */
  groundOpacity: number
  stripes: Stripe[]
  /** The distance at which the stripes repeat down the box; 0 draws them once. */
  period: number
}

const PARAMETERS: ParameterSchemas<StripesParameters> = {
  ground: { type: 'color', label: 'Ground', default: '#b2991c' },
  groundOpacity: { type: 'number', label: 'Ground opacity', min: 0, max: 1, step: 0.05, default: 1 },
  stripes: {
    type: 'stripes',
    label: 'Stripes',
    default: [{ offset: 28, width: 6, color: '#3f5708' }, { offset: 42, width: 10.75, color: '#201508' }],
  },
  period: { type: 'number', label: 'Repeat every', min: 0, max: 200, step: 0.5, default: 0 },
}

export const STRIPES: PatternGenerator<StripesParameters> = {
  name: 'stripes',
  title: 'Stripes',
  description: 'Stripes across a ground, like the seal bands of the Almond Caramel bag. With a period, they repeat down the box.',
  kind: 'free',
  seeded: false,
  parameters: PARAMETERS,
  render(_seed, { ground, groundOpacity, stripes, period }, box) {
    const opacity = groundOpacity === 1 ? '' : ` fill-opacity="${groundOpacity}"`
    const starts = period > 0 ? Array.from({ length: Math.ceil(box.height / period) }, (_, index) => index * period) : [0]
    const lines = starts.flatMap(start => stripes.map(({ offset, width, color }) =>
      rectangle({ x: box.x, y: box.y + start + offset - width / 2, width: box.width, height: width }, `fill="${color}"`)))
    return [rectangle(box, `fill="${ground}"${opacity}`), ...lines].join('')
  },
}
