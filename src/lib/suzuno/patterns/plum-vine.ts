// The plum-blossom vine of the cover, from the ornament generator
// (src/lib/suzuno/ornament.ts), printed like the cover: the line art masks an ink
// that fades from grey to blue downwards, and the paper breaks the soft lines
// up. Seed 0 draws the fitted vine of the cover (assets/ornament-cover.json)
// in its frame on the sheet, fitted into the box; other seeds grow a new vine
// that fills the box, with the growth parameters. The texture of the paper is
// a tile of the fitted feTurbulence noise, which scripts/film-grain.ts writes.
import inkTextureTile from '~/assets/suzuno/ink-texture.webp'
import coverPlant from '~/assets/suzuno/ornament-cover.json'
import type { Ornament, Plant } from '~/lib/suzuno/ornament'
import { GROWTH, MASK_PAINT, animate, grow, toSvg } from '~/lib/suzuno/ornament'
import type { Box, ParameterSchemas, PatternGenerator } from '~/lib/suzuno/patterns/pattern'
import { fitInto, rectangle } from '~/lib/suzuno/patterns/pattern'

export interface PlumVineParameters {
  /** The ink at the top, in the middle and at the foot of the vine. */
  top: string
  middle: string
  bottom: string
  /** The blur of the lines, and how much of the texture of the print the paper shows: 1 is the fitted texture. */
  softness: number
  texture: number
  strokeWidth: number
  segment: number
  spread: number
  sway: number
  branching: number
  decay: number
  levels: number
  curl: number
  flowers: number
  buds: number
}

/** The cover vine on the sheet of SuzunoCover.vue (1414 x 1093). */
export const COVER_VINE_BOX: Box = { x: 1150, y: 250, width: 264, height: 620 }

// The ink gradient runs from 300 to 840 on the sheet, as shares of COVER_VINE_BOX
const INK_START = (300 - COVER_VINE_BOX.y) / COVER_VINE_BOX.height
const INK_END = (840 - COVER_VINE_BOX.y) / COVER_VINE_BOX.height
const COVER_PLANT = coverPlant as unknown as Plant
/** The texels of the texture tile, one for each unit of the sheet */
const TEXTURE_TEXELS = 160

function growth(name: keyof typeof GROWTH & keyof PlumVineParameters, label: string, min: number, max: number, step: number) {
  return { type: 'number', label, min, max, step, default: GROWTH[name] as number } as const
}

const PARAMETERS: ParameterSchemas<PlumVineParameters> = {
  // The top stop is darker than its fit (tools/fits/ornament-ink.mjs), so that the top flower has the ink depth of the print
  top: { type: 'color', label: 'Ink at the top', default: '#f5e9dd' },
  middle: { type: 'color', label: 'Ink in the middle', default: '#d4dee7' },
  bottom: { type: 'color', label: 'Ink at the foot', default: '#b7d5ec' },
  // Fitted by tools/fit-ornament-texture.mjs
  softness: { type: 'number', label: 'Softness', min: 0, max: 4, step: 0.025, default: 0.675 },
  texture: { type: 'number', label: 'Paper texture', min: 0, max: 1, step: 0.01, default: 1 },
  strokeWidth: growth('strokeWidth', 'Line width', 0.5, 10, 0.1),
  segment: growth('segment', 'Step length', 4, 60, 1),
  spread: growth('spread', 'Random turn', 0, 40, 1),
  sway: growth('sway', 'Sway', 0, 90, 1),
  branching: growth('branching', 'Branching', 0, 1, 0.01),
  decay: growth('decay', 'Branch shrink', 0.1, 1, 0.05),
  levels: growth('levels', 'Branch levels', 0, 4, 1),
  curl: growth('curl', 'Curls', 0, 1, 0.05),
  flowers: growth('flowers', 'Flowers', 0, 30, 1),
  buds: growth('buds', 'Buds', 0, 30, 1),
}

/** The plant of a seed: the cover plant for seed 0, else a vine grown into the box. */
function plant(seed: number, parameters: PlumVineParameters, box: Box): Plant {
  if (!seed)
    return { ...COVER_PLANT, strokeWidth: parameters.strokeWidth }
  const { texture, softness, top, middle, bottom, ...growthParameters } = parameters
  return grow(seed, { ...growthParameters, box: [box.x, box.y, box.width, box.height] })
}

/**
 * A vine (a plant or a spec) printed in its frame: the line art in the mask
 * `<g data-ornament>`, which `animate` grows.
 */
export function vineMarkup(ornament: Ornament, { top, middle, bottom, softness, texture }: PlumVineParameters, frame: Box, id: string) {
  const ids = { ink: `${id}-ink`, soft: `${id}-soft`, lines: `${id}-lines`, paper: `${id}-paper`, texture: `${id}-texture` }
  const region = `x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}"`
  return [
    '<defs>',
    `<linearGradient id="${ids.ink}" gradientUnits="userSpaceOnUse" x1="0" y1="${frame.y + frame.height * INK_START}" x2="0" y2="${frame.y + frame.height * INK_END}">`,
    `<stop offset="0" stop-color="${top}" /><stop offset="0.55" stop-color="${middle}" /><stop offset="1" stop-color="${bottom}" />`,
    '</linearGradient>',
    `<filter id="${ids.soft}" filterUnits="userSpaceOnUse" ${region} color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${softness}" /></filter>`,
    // The softness is in the mask, because a filter on the masked rect runs before the mask
    `<mask id="${ids.lines}" maskUnits="userSpaceOnUse" ${region}><g filter="url(#${ids.soft})" data-ornament="">${toSvg(ornament)}</g></mask>`,
    // The paper breaks the ink up: its grey is the share of the ink that it
    // keeps, between white (no texture) and the texture of the print. Without
    // smoothing, each pixel shows one texel, as the noise filter of the print
    // showed the noise at one point of each pixel.
    `<pattern id="${ids.texture}" patternUnits="userSpaceOnUse" x="${frame.x}" y="${frame.y}" width="${TEXTURE_TEXELS}" height="${TEXTURE_TEXELS}">`,
    `<rect width="${TEXTURE_TEXELS}" height="${TEXTURE_TEXELS}" fill="#fff" />`,
    `<image href="${inkTextureTile}" width="${TEXTURE_TEXELS}" height="${TEXTURE_TEXELS}" opacity="${texture}" image-rendering="pixelated" />`,
    '</pattern>',
    `<mask id="${ids.paper}" maskUnits="userSpaceOnUse" ${region}>${rectangle(frame, `fill="url(#${ids.texture})"`)}</mask>`,
    '</defs>',
    `<g mask="url(#${ids.paper})">${rectangle(frame, `fill="url(#${ids.ink})" mask="url(#${ids.lines})"`)}</g>`,
  ].join('')
}

/** The plant of a seed and the frame that it is drawn in. */
function placed(seed: number, parameters: PlumVineParameters, box: Box) {
  return { plant: plant(seed, parameters, box), frame: seed ? box : COVER_VINE_BOX }
}

export const PLUM_VINE: PatternGenerator<PlumVineParameters> = {
  name: 'plum-vine',
  title: 'Plum vine',
  description: 'The plum-blossom vine of the cover. Seed 0 is the vine of the cover; other seeds grow new vines that fill the box.',
  kind: 'free',
  seeded: true,
  parameters: PARAMETERS,
  render(seed, parameters, box, id) {
    const { plant, frame } = placed(seed, parameters, box)
    return fitInto(frame, box, vineMarkup(plant, parameters, frame, id))
  },
  animate(target, seed, parameters, box, options = {}) {
    return animate(target.querySelector('[data-ornament]')!, placed(seed, parameters, box).plant, { paint: MASK_PAINT, ...options })
  },
}
