// A pale glow of sky over a horizon, like the sky behind the farm of the
// RIBON bag: an ellipse that fades out from the middle of the horizon. The
// glow is as wide as the box and rises from the horizon to its top.
import type { ParameterSchemas, PatternGenerator } from '~/lib/suzuno/patterns/pattern'

export interface SkyGlowParameters {
  color: string
  /** The opacity of the colour at the middle of the horizon. */
  strength: number
  /** The height of the horizon, as a share of the box from its top. */
  horizon: number
}

const PARAMETERS: ParameterSchemas<SkyGlowParameters> = {
  color: { type: 'color', label: 'Colour', default: '#cfe6f4' },
  strength: { type: 'number', label: 'Strength', min: 0, max: 1, step: 0.05, default: 1 },
  horizon: { type: 'number', label: 'Horizon', min: 0, max: 1, step: 0.01, default: 1 },
}

export const SKY_GLOW: PatternGenerator<SkyGlowParameters> = {
  name: 'sky-glow',
  title: 'Sky glow',
  description: 'The pale sky behind the farm of the Hokkaido milk bag: a glow that fades out from the middle of the horizon.',
  kind: 'free',
  seeded: false,
  parameters: PARAMETERS,
  render(_seed, { color, strength, horizon }, box, id) {
    const centre = strength === 1 ? '' : ` stop-opacity="${strength}"`
    return [
      `<defs><radialGradient id="${id}">`,
      `<stop offset="0" stop-color="${color}"${centre} /><stop offset="1" stop-color="${color}" stop-opacity="0" />`,
      `</radialGradient></defs>`,
      `<ellipse cx="${box.x + box.width / 2}" cy="${box.y + box.height * horizon}" rx="${box.width / 2}" ry="${box.height}" fill="url(#${id})" />`,
    ].join('')
  },
}
