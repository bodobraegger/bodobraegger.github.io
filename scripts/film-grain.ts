// Generates the tiles and the stock presets of the film grain layer
// (src/assets/film-grain/film-grain.css) into src/assets/film-grain/:
//   pnpm generate:grain
// The output is the same on each run, because one seed drives all random
// values.
//
// The grain is the grain of a 35 mm photo whose frame fills the screen: the
// short side of the frame (24 mm) covers about 1200 device pixels, so a
// device pixel shows about 20 µm of film. One texel of a tile is one device
// pixel. At this scale, scans of Portra 400, Gold 200, Superia 400, Ektar
// 100, Tri-X 400 and HP5 Plus (Wikimedia Commons) show a grain that is near
// to white noise, with small correlations between neighbour pixels.
//
// A tile is a periodic field of dye clouds or silver clumps: soft blobs with
// log-normal radii, alone or in clusters (a Neyman-Scott process), after the
// Boolean model of Newson et al., "Realistic Film Grain Rendering" (IPOL
// 2017). Lab scanners sharpen, which gives the negative correlation at a
// distance of two pixels that the scans show.
//
// The layer shows a prime tile of 241 texels over a main tile of 256 texels.
// Their sum repeats only after 61696 texels, so the grain shows no pattern.
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { random } from '../src/lib/orchid'

const OUTPUT_DIRECTORY = new URL('../src/assets/film-grain/', import.meta.url)
const SEED = 35
const MAIN_TILE_SIZE = 256
const PRIME_TILE_SIZE = 241

interface CloudModel {
  /** The mean radius of a cloud, in texels */
  meanRadius: number
  /** The standard deviation of the radius, relative to the mean */
  radiusSpread: number
  /** The blur of the optics and the scanner, in texels */
  blur: number
  /** The mean number of clouds in a cluster */
  clusterSize: number
  /** The standard deviation of a cloud from the centre of its cluster, in texels */
  clusterSpread: number
  /** The mean number of clouds for each texel */
  density: number
  /** The amount of the unsharp mask of the scanner */
  sharpen: number
}

// The two structures that the scans show at the scale of a frame that fills
// the screen, measured after a high-pass filter of 3 pixels: the correlation
// of neighbours at a distance of 1, 2 and 3 pixels, and the kurtosis.
const GRAINS = {
  // Portra 400, Gold 200, Superia 400, Tri-X 400: 0.10, -0.13, 0.05; kurtosis 3.1
  fine: { meanRadius: 0.15, radiusSpread: 0.5, blur: 0.2, clusterSize: 1, clusterSpread: 0, density: 6, sharpen: 1.5 },
  // HP5 Plus: 0.42, -0.04, 0.03; kurtosis 3.3
  clumped: { meanRadius: 0.3, radiusSpread: 0.5, blur: 0.2, clusterSize: 6, clusterSpread: 1.5, density: 6, sharpen: 1 },
} satisfies Record<string, CloudModel>
type Grain = keyof typeof GRAINS

interface Stock {
  grain: Grain
  color: boolean
  /**
   * The standard deviation of the grain in the luma of a midtone (8-bit
   * levels), in the flattest midtone areas of the scans. Kodak rates the
   * graininess of Ektar 100 below that of Portra 400 (Print Grain Index under
   * 25 and 37) and Portra 400 below Gold 200 (44).
   */
  deviation: number
}

const STOCKS: Record<string, Stock> = {
  'ektar-100': { grain: 'fine', color: true, deviation: 4 },
  'portra-400': { grain: 'fine', color: true, deviation: 6.3 },
  'gold-200': { grain: 'fine', color: true, deviation: 8 },
  'superia-400': { grain: 'fine', color: true, deviation: 11 },
  'tri-x-400': { grain: 'fine', color: false, deviation: 14 },
  'hp5': { grain: 'clumped', color: false, deviation: 11 },
}

/**
 * The scans have no correlation beyond a few pixels. A tile has random
 * blotches at larger scales, which would show the repeat of the tile, so a
 * high-pass filter of this standard deviation (in texels) removes them.
 */
const HIGH_PASS_SIGMA = 8
/** The width of the unsharp mask of the scanner, in texels */
const SHARPEN_SIGMA = 1

// In the scans, the grain of the red, green and blue channels correlates
// with about 0.88, and red and blue vary about 15 % more than green. The
// colour tile shares a field between its channels with this weight; the
// grey prime tile over it adds the rest of the correlation.
const SHARED_WEIGHT = 0.87
const CHANNEL_GAINS = [1.15, 1, 1.15]
const LUMA_WEIGHTS = [0.2126, 0.7152, 0.0722]

/**
 * A grey or colour tile stores 128 + GREY_SCALE × the grain in standard
 * deviations. Each of the two tiles carries half of the variance, so ±3.8 σ
 * fill the 8 bits.
 */
const GREY_SCALE = 48 / Math.SQRT2
/** An alpha tile changes a pixel by alpha, a grey tile by twice the distance from 128, for the same effect. */
const ALPHA_SCALE = 2 * GREY_SCALE
/** 32 levels of 8 are enough for noise at the strength of a grain layer, and they halve the file size. */
const LEVEL_STEP = 8
const WEBP_OPTIONS = { lossless: true, effort: 6 }
/** The grey of the midtone bin of the scans (90 to 160) */
const MIDTONE = 125 / 255

type Random = () => number

function gaussian(next: Random) {
  return Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next())
}

function poisson(next: Random, mean: number) {
  const limit = Math.exp(-mean)
  let count = 0
  let product = next()
  while (product > limit) {
    count++
    product *= next()
  }
  return count
}

function standardize(values: Float64Array) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length)
  return values.map(value => (value - mean) / deviation)
}

/** A periodic Gaussian blur, one direction after the other. */
function blur(values: Float64Array, size: number, sigma: number) {
  const reach = Math.ceil(3 * sigma)
  const weights = Array.from({ length: 2 * reach + 1 }, (_, index) => Math.exp(-((index - reach) ** 2) / (2 * sigma ** 2)))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const pass = (input: Float64Array, step: [number, number]) => input.map((_, index) => {
    const row = Math.floor(index / size)
    const column = index % size
    let sum = 0
    for (let offset = -reach; offset <= reach; offset++) {
      const sampleRow = (row + offset * step[1] + size) % size
      const sampleColumn = (column + offset * step[0] + size) % size
      sum += weights[offset + reach] * input[sampleRow * size + sampleColumn]
    }
    return sum / total
  })
  return pass(pass(values, [1, 0]), [0, 1])
}

/** A periodic field of clouds with zero mean and unit variance. */
function cloudField(next: Random, model: CloudModel, size: number) {
  const field = new Float64Array(size * size)
  const logSpread = Math.sqrt(Math.log(1 + model.radiusSpread ** 2))
  const logMean = Math.log(model.meanRadius) - logSpread ** 2 / 2
  const wrap = (index: number) => ((index % size) + size) % size
  const clusters = Math.round(size * size * model.density / model.clusterSize)
  for (let cluster = 0; cluster < clusters; cluster++) {
    const centreX = next() * size
    const centreY = next() * size
    const clouds = model.clusterSize === 1 ? 1 : poisson(next, model.clusterSize)
    for (let cloud = 0; cloud < clouds; cloud++) {
      const x = centreX + gaussian(next) * model.clusterSpread
      const y = centreY + gaussian(next) * model.clusterSpread
      const radius = Math.exp(logMean + logSpread * gaussian(next))
      // A Gaussian cloud, integrated over a texel and blurred, is again a
      // Gaussian with the sum of the variances. Its dye grows with its area.
      const variance = radius ** 2 + 1 / 12 + model.blur ** 2
      const peak = radius ** 2 / (2 * Math.PI * variance)
      const reach = Math.ceil(3 * Math.sqrt(variance))
      for (let row = Math.floor(y) - reach; row <= Math.floor(y) + reach; row++) {
        const offsetY = row + 0.5 - y
        const rowStart = wrap(row) * size
        for (let column = Math.floor(x) - reach; column <= Math.floor(x) + reach; column++) {
          const offsetX = column + 0.5 - x
          field[rowStart + wrap(column)] += peak * Math.exp(-(offsetX ** 2 + offsetY ** 2) / (2 * variance))
        }
      }
    }
  }
  const low = blur(field, size, HIGH_PASS_SIGMA)
  const grain = field.map((value, index) => value - low[index])
  const soft = blur(grain, size, SHARPEN_SIGMA)
  return standardize(grain.map((value, index) => value + model.sharpen * (value - soft[index])))
}

const quantize = (value: number) => Math.max(0, Math.min(255, Math.round(value / LEVEL_STEP) * LEVEL_STEP))

/**
 * A tile that darkens with black and lightens with white, with the size of
 * the grain as alpha. Over the main tile it adds its grain to the grain of
 * the main tile.
 */
function alphaTile(grain: Float64Array) {
  const pixels = new Uint8Array(grain.length * 4)
  grain.forEach((value, index) => {
    pixels.fill(value > 0 ? 255 : 0, index * 4, index * 4 + 3)
    pixels[index * 4 + 3] = quantize(Math.abs(value) * ALPHA_SCALE)
  })
  return pixels
}

function encode(pixels: Uint8Array, size: number, channels: 1 | 3 | 4) {
  return sharp(pixels, { raw: { width: size, height: size, channels } }).webp(WEBP_OPTIONS).toBuffer()
}

/** The soft-light blend mode of CSS (Compositing and Blending Level 1) */
function softLight(backdrop: number, source: number) {
  if (source <= 0.5)
    return backdrop - (1 - 2 * source) * backdrop * (1 - backdrop)
  const lighter = backdrop <= 0.25 ? ((16 * backdrop - 12) * backdrop + 4) * backdrop : Math.sqrt(backdrop)
  return backdrop + (2 * source - 1) * (lighter - backdrop)
}

/**
 * The standard deviation (8-bit levels) of the luma of a midtone grey under
 * the layer at full opacity: the prime tile over the main tile, in the
 * soft-light blend mode.
 */
function midtoneDeviation(main: Uint8Array, mainChannels: 1 | 3, prime: Uint8Array) {
  const lumas: number[] = []
  for (let y = 0; y < 2 * MAIN_TILE_SIZE; y++) {
    for (let x = 0; x < 2 * MAIN_TILE_SIZE; x++) {
      const mainIndex = ((y % MAIN_TILE_SIZE) * MAIN_TILE_SIZE + x % MAIN_TILE_SIZE) * mainChannels
      const primeIndex = ((y % PRIME_TILE_SIZE) * PRIME_TILE_SIZE + x % PRIME_TILE_SIZE) * 4
      const alpha = prime[primeIndex + 3] / 255
      lumas.push(LUMA_WEIGHTS.reduce((sum, weight, channel) => {
        const source = main[mainIndex + (mainChannels === 3 ? channel : 0)] / 255
        const layer = source + alpha * (prime[primeIndex] / 255 - source)
        return sum + weight * softLight(MIDTONE, layer)
      }, 0))
    }
  }
  const mean = lumas.reduce((sum, value) => sum + value, 0) / lumas.length
  return 255 * Math.sqrt(lumas.reduce((sum, value) => sum + (value - mean) ** 2, 0) / lumas.length)
}

interface GrainTiles {
  mono: Uint8Array
  color: Uint8Array
  prime: Uint8Array
}

function grainTiles(next: Random, model: CloudModel): GrainTiles {
  const shared = cloudField(next, model, MAIN_TILE_SIZE)
  const channels = CHANNEL_GAINS.map((gain) => {
    const own = cloudField(next, model, MAIN_TILE_SIZE)
    return standardize(own.map((value, index) => SHARED_WEIGHT * shared[index] + Math.sqrt(1 - SHARED_WEIGHT ** 2) * value))
      .map(value => value * gain)
  })
  const luma = standardize(channels[0].map((_, index) => LUMA_WEIGHTS.reduce((sum, weight, channel) => sum + weight * channels[channel][index], 0)))
  const color = new Uint8Array(luma.length * 3)
  channels.forEach((values, channel) => values.forEach((value, index) => {
    color[index * 3 + channel] = quantize(128 + GREY_SCALE * value)
  }))
  return {
    mono: Uint8Array.from(luma, value => quantize(128 + GREY_SCALE * value)),
    color,
    prime: alphaTile(cloudField(next, model, PRIME_TILE_SIZE)),
  }
}

/** One rule for each stock: its tiles and its strength. */
function stockRules(tiles: Record<Grain, GrainTiles>) {
  const rules = Object.entries(STOCKS).map(([name, stock]) => {
    const own = tiles[stock.grain]
    const deviation = midtoneDeviation(stock.color ? own.color : own.mono, stock.color ? 3 : 1, own.prime)
    const strength = Number((stock.deviation / deviation).toFixed(2))
    const main = `grain-${stock.grain}-${stock.color ? 'color' : 'mono'}.webp`
    return [
      `.film-grain--${name}::after {`,
      `  background-image: url('./grain-${stock.grain}-prime.webp'), url('./${main}');`,
      `  opacity: var(--film-grain-strength, ${strength});`,
      '}',
    ].join('\n')
  })
  return ['/* Generated by scripts/film-grain.ts. Do not edit. */', ...rules, ''].join('\n')
}

async function main() {
  const next = random(SEED)
  const tiles = Object.fromEntries(Object.entries(GRAINS).map(([grain, model]) => [grain, grainTiles(next, model)])) as Record<Grain, GrainTiles>
  await mkdir(OUTPUT_DIRECTORY, { recursive: true })
  const files: [string, Buffer | string][] = [['stocks.css', stockRules(tiles)]]
  for (const [grain, { mono, color, prime }] of Object.entries(tiles)) {
    const stocks = Object.values(STOCKS).filter(stock => stock.grain === grain)
    files.push([`grain-${grain}-prime.webp`, await encode(prime, PRIME_TILE_SIZE, 4)])
    if (stocks.some(stock => !stock.color))
      files.push([`grain-${grain}-mono.webp`, await encode(mono, MAIN_TILE_SIZE, 1)])
    if (stocks.some(stock => stock.color))
      files.push([`grain-${grain}-color.webp`, await encode(color, MAIN_TILE_SIZE, 3)])
  }
  for (const [name, content] of files) {
    await writeFile(new URL(name, OUTPUT_DIRECTORY), content)
    console.log(`${name}: ${content.length} bytes`)
  }
}

main()
