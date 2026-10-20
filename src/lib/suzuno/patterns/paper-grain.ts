// The grain of the paper of the cover: a faint black noise. The fitted grain
// of the print (tools/bake-grain.mjs) was stronger than the user wants, so
// the cover uses this lighter one. The noise is the fractal noise of
// feTurbulence (base frequency 0.25, 2 octaves), which scripts/film-grain.ts
// writes into a tile, so that the browser draws an image and computes no
// noise.
import paperGrainTile from '~/assets/suzuno/paper-grain.webp'
import type { ParameterSchemas } from '~/lib/suzuno/patterns/pattern'
import { tilePattern } from '~/lib/suzuno/patterns/pattern'

export interface PaperGrainParameters {
  /** The opacity of the black where the noise is strongest. */
  strength: number
  /** The width and the height of the tile; the noise grows with it. */
  size: number
}

/** The texels of the tile, one for each unit of the sheet at the default size */
const TILE_TEXELS = 240
// A seed moves the tile by these steps, so that each seed shows the noise at another place
const SEED_SHIFT = { x: 97, y: 61 }

const PARAMETERS: ParameterSchemas<PaperGrainParameters> = {
  strength: { type: 'number', label: 'Strength', min: 0, max: 1, step: 0.01, default: 0.07 },
  size: { type: 'number', label: 'Tile size', min: 40, max: 600, step: 10, default: TILE_TEXELS },
}

export const PAPER_GRAIN = tilePattern<PaperGrainParameters>({
  name: 'paper-grain',
  title: 'Paper grain',
  description: 'The grain of the paper of the cover: a faint noise that tiles without seams. The seed moves the noise.',
  seeded: true,
  parameters: PARAMETERS,
  tile(seed, { strength, size }) {
    const shift = (step: number) => (seed * step) % TILE_TEXELS * size / TILE_TEXELS
    return {
      x: shift(SEED_SHIFT.x),
      y: shift(SEED_SHIFT.y),
      width: size,
      height: size,
      // Without smoothing, each pixel shows one texel, as the noise filter showed the noise at one point of each pixel
      markup: `<image href="${paperGrainTile}" width="${size}" height="${size}" opacity="${strength}" image-rendering="pixelated" />`,
    }
  },
})
