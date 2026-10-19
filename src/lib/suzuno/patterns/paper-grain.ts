// The grain of the paper of the cover: a faint noise tile, a fractal noise
// that sets the opacity of one colour. The fitted grain of the print
// (tools/bake-grain.mjs) was stronger than the user wants, so the cover
// uses this lighter one.
import type { ParameterSchemas } from '~/lib/suzuno/patterns/pattern'
import { colorChannels, tilePattern } from '~/lib/suzuno/patterns/pattern'

export interface PaperGrainParameters {
  color: string
  /** The opacity of the colour where the noise is strongest. */
  strength: number
  frequency: number
  octaves: number
  /** The width and the height of the tile. */
  size: number
}

const PARAMETERS: ParameterSchemas<PaperGrainParameters> = {
  color: { type: 'color', label: 'Colour', default: '#000000' },
  strength: { type: 'number', label: 'Strength', min: 0, max: 1, step: 0.01, default: 0.07 },
  frequency: { type: 'number', label: 'Frequency', min: 0.01, max: 1, step: 0.01, default: 0.25 },
  octaves: { type: 'number', label: 'Octaves', min: 1, max: 5, step: 1, default: 2 },
  size: { type: 'number', label: 'Tile size', min: 40, max: 600, step: 10, default: 240 },
}

/** An SVG document as a data URL, with the few characters that a URL cannot carry escaped. */
function svgDataUrl(markup: string) {
  return `data:image/svg+xml,${markup.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23')}`
}

export const PAPER_GRAIN = tilePattern<PaperGrainParameters>({
  name: 'paper-grain',
  title: 'Paper grain',
  description: 'The grain of the paper of the cover: a faint noise that tiles without seams. The seed changes the noise.',
  seeded: true,
  parameters: PARAMETERS,
  tile(seed, { color, strength, frequency, octaves, size }) {
    const [red, green, blue] = colorChannels(color)
    // The noise is in an image of its own, because a noise filter over the whole box makes each repaint slow
    const noise = svgDataUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>`
      + `<filter id='g' color-interpolation-filters='sRGB'>`
      + `<feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='${octaves}'${seed ? ` seed='${seed}'` : ''} stitchTiles='stitch'/>`
      + `<feColorMatrix values='0 0 0 0 ${red}  0 0 0 0 ${green}  0 0 0 0 ${blue}  0 0 0 ${strength} 0'/>`
      + `</filter><rect width='${size}' height='${size}' filter='url(#g)'/></svg>`)
    return { width: size, height: size, markup: `<image href="${noise}" width="${size}" height="${size}" />` }
  },
})
