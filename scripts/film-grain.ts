// Generates the tiles and the frame offsets of the film grain layer
// (src/assets/film-grain/film-grain.css) into src/assets/film-grain/:
//   pnpm generate:grain
// The output is the same on each run, because one seed drives all random
// values.
//
// A tile is a periodic field of dye clouds: soft blobs with log-normal radii,
// in clusters around random centres (a Neyman-Scott process). The model
// follows the Boolean model of Newson et al., "Realistic Film Grain
// Rendering" (IPOL 2017), but it adds the clouds instead of their union, like
// the dye of a colour film. The parameters give the autocorrelation (lags of
// 1 to 4 pixels: 0.64, 0.28, 0.13, 0.05), the skew and the kurtosis of a
// 4000 ppi scan of a flat Kodak Ektar 100 negative (Wikimedia Commons,
// KodakEktar100GrainScan02.jpg, CC0), with one texel for one scan pixel.
//
// The layer shows two tiles on top of each other: a main tile of 256 texels
// and a prime tile of 241 texels. Their sum repeats only after 61696 texels,
// so a still grain shows no pattern.
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
}

const CLOUDS: CloudModel = { meanRadius: 0.3, radiusSpread: 0.5, blur: 0.2, clusterSize: 6, clusterSpread: 1.4, density: 6 }
/**
 * The scan has no correlation beyond 6 pixels. A tile has random blotches
 * at larger scales, which would show the repeat of the tile, so a high-pass
 * filter of this standard deviation (in texels) removes them.
 */
const HIGH_PASS_SIGMA = 8

// In the scan, the grain of the red, green and blue channels correlates with
// 0.61 (red, green), 0.34 (red, blue) and 0.43 (green, blue). A field that all
// channels share, with these weights, gives the same correlations.
const SHARED_WEIGHTS = [0.69, 0.88, 0.49]
// The blue-sensitive layer of a colour negative has the coarsest grain
// (Kodak VISION3 data sheets).
const CHANNEL_GAINS = [1, 0.9, 1.2]
const LUMA_WEIGHTS = [0.2126, 0.7152, 0.0722]

/**
 * The colour tile stores 128 + GREY_SCALE × the grain in standard deviations.
 * Each of the two tiles carries half of the variance, so ±5.6 σ fill the 8
 * bits.
 */
const GREY_SCALE = 32 / Math.SQRT2
/** An alpha tile changes a pixel by alpha, a grey tile by twice the distance from 128, for the same effect. */
const ALPHA_SCALE = 2 * GREY_SCALE
/** 32 levels of 8 are enough for noise at the strength of a grain layer, and they halve the file size. */
const LEVEL_STEP = 8
const WEBP_OPTIONS = { lossless: true, effort: 6 }

/** The animation shows FRAME_COUNT offsets of the tiles at FRAMES_PER_SECOND, like film. */
const FRAME_COUNT = 48
const FRAMES_PER_SECOND = 24
/** The offsets are below FRAME_RANGE texels; the layer extends this far past its box. */
const FRAME_RANGE = 64
/**
 * Two following offsets are at least this many texels apart. A jump of this
 * size looks like new grain instead of a movement of the old grain.
 */
const FRAME_MIN_JUMP = 16
/** A frame holds its offset until this short time (in percent of the loop) before the next frame. */
const FRAME_JUMP_PERCENT = 0.001

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

/** A periodic field of dye clouds with zero mean and unit variance. */
function cloudField(next: Random, model: CloudModel, size: number) {
  const field = new Float64Array(size * size)
  const logSpread = Math.sqrt(Math.log(1 + model.radiusSpread ** 2))
  const logMean = Math.log(model.meanRadius) - logSpread ** 2 / 2
  const wrap = (index: number) => ((index % size) + size) % size
  const clusters = Math.round(size * size * model.density / model.clusterSize)
  for (let cluster = 0; cluster < clusters; cluster++) {
    const centreX = next() * size
    const centreY = next() * size
    const clouds = poisson(next, model.clusterSize)
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
  return standardize(field.map((value, index) => value - low[index]))
}

const quantize = (value: number) => Math.max(0, Math.min(255, Math.round(value / LEVEL_STEP) * LEVEL_STEP))

/**
 * A tile that darkens with black and lightens with white, with the size of
 * the grain as alpha. Over the page it needs no blend mode, and in a layer
 * with the overlay blend mode it has the effect of a grey tile.
 */
function alphaTile(grain: Float64Array) {
  const pixels = new Uint8Array(grain.length * 4)
  grain.forEach((value, index) => {
    pixels.fill(value > 0 ? 255 : 0, index * 4, index * 4 + 3)
    pixels[index * 4 + 3] = quantize(Math.abs(value) * ALPHA_SCALE)
  })
  return pixels
}

function encode(pixels: Uint8Array, size: number, channels: 3 | 4) {
  return sharp(pixels, { raw: { width: size, height: size, channels } }).webp(WEBP_OPTIONS).toBuffer()
}

/** Keyframes that hold each offset for one frame and then jump to the next offset. */
function frameKeyframes(next: Random) {
  const offsets: [number, number][] = []
  const farFrom = (offset: [number, number], other?: [number, number]) =>
    !other || Math.hypot(offset[0] - other[0], offset[1] - other[1]) >= FRAME_MIN_JUMP
  while (offsets.length < FRAME_COUNT) {
    const offset: [number, number] = [Math.floor(next() * FRAME_RANGE), Math.floor(next() * FRAME_RANGE)]
    // The last frame also jumps to the first one, when the loop starts again
    const isLast = offsets.length === FRAME_COUNT - 1
    if (farFrom(offset, offsets.at(-1)) && (!isLast || farFrom(offset, offsets[0])))
      offsets.push(offset)
  }
  const percent = (value: number) => `${Number(value.toFixed(3))}%`
  const frames = offsets.map(([x, y], index) => {
    const start = index * 100 / FRAME_COUNT
    const end = (index + 1) * 100 / FRAME_COUNT - FRAME_JUMP_PERCENT
    const translate = `translate(calc(var(--film-grain-size, 1) * ${-x}px), calc(var(--film-grain-size, 1) * ${-y}px))`
    return `  ${percent(start)},\n  ${index === FRAME_COUNT - 1 ? '100%' : percent(end)} {\n    transform: ${translate};\n  }`
  })
  return [
    '/* Generated by scripts/film-grain.ts. Do not edit. */',
    `/* ${FRAME_COUNT} frames at ${FRAMES_PER_SECOND} frames per second: the loop takes ${FRAME_COUNT / FRAMES_PER_SECOND}s */`,
    '@keyframes film-grain {',
    ...frames,
    '}',
    '',
  ].join('\n')
}

async function main() {
  const next = random(SEED)
  const shared = cloudField(next, CLOUDS, MAIN_TILE_SIZE)
  const channels = SHARED_WEIGHTS.map((weight, channel) => {
    const own = cloudField(next, CLOUDS, MAIN_TILE_SIZE)
    return standardize(own.map((value, index) => weight * shared[index] + Math.sqrt(1 - weight ** 2) * value))
      .map(value => value * CHANNEL_GAINS[channel])
  })
  const luma = standardize(channels[0].map((_, index) => LUMA_WEIGHTS.reduce((sum, weight, channel) => sum + weight * channels[channel][index], 0)))
  const color = new Uint8Array(luma.length * 3)
  channels.forEach((values, channel) => values.forEach((value, index) => {
    color[index * 3 + channel] = quantize(128 + GREY_SCALE * value)
  }))
  const prime = cloudField(next, CLOUDS, PRIME_TILE_SIZE)

  await mkdir(OUTPUT_DIRECTORY, { recursive: true })
  const files: [string, Buffer | string][] = [
    ['grain-mono.webp', await encode(alphaTile(luma), MAIN_TILE_SIZE, 4)],
    ['grain-color.webp', await encode(color, MAIN_TILE_SIZE, 3)],
    ['grain-prime.webp', await encode(alphaTile(prime), PRIME_TILE_SIZE, 4)],
    ['frames.css', frameKeyframes(next)],
  ]
  for (const [name, content] of files) {
    await writeFile(new URL(name, OUTPUT_DIRECTORY), content)
    console.log(`${name}: ${content.length} bytes`)
  }
}

main()
