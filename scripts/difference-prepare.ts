// Makes the layer data of a difference frame, see src/components/DifferenceFrame.vue.
//   pnpm difference:prepare <name>
// It reads the text of src/assets/difference/<name>/image.* with OCR into
// text.json and traces the image into the colour SVG trace.svg. A file that
// is already there is kept, because text.json is corrected by hand after OCR.
// Delete a file to make it again.
//
// OCR runs in tesseract.js (a dev dependency). The trace runs in the vtracer
// Python package through uv, which fetches it into its cache and installs
// nothing in the project.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import process from 'node:process'
import sharp from 'sharp'
import { OEM, PSM, createWorker } from 'tesseract.js'
import type { TextBox, TextLayer } from '../src/lib/difference'

const FRAMES_DIRECTORY = resolve(import.meta.dirname, '../src/assets/difference')
const IMAGE_PATTERN = /^image\.(?:png|jpe?g|webp)$/
const TEXT_FILE = 'text.json'
const TRACE_FILE = 'trace.svg'

const OCR_LANGUAGES = ['jpn', 'eng']
// tesseract.js downloads the language data on the first run and keeps it here
const OCR_CACHE_DIRECTORY = resolve(import.meta.dirname, '../node_modules/.cache/tesseract')
// Tesseract reads the small print of a photo better at three times its size,
// in grey, with the contrast stretched and the edges sharpened.
const OCR_SCALE = 3
const OCR_MINIMUM_CONFIDENCE = 60
// A line needs two letters or digits besides the long vowel mark and the
// kanji for one, which OCR finds in every crease and stripe of a bag.
const OCR_MINIMUM_LETTERS = 2
const OCR_NOISE_PATTERN = /[ー一]/gu
const LETTER_PATTERN = /[\p{L}\p{N}]/gu
// A baseline that leans less than this is written as straight.
const ANGLE_THRESHOLD_DEGREES = 0.5
const COLOR_ROUNDS = 8

const VTRACER_VERSION = '0.6.15'
// The wheel of vtracer 0.6.15 crashes in Python 3.14
const TRACE_PYTHON_VERSION = '3.13'
const TRACE_PROGRAM = 'import json, sys, vtracer; vtracer.convert_image_to_svg_py(sys.argv[1], sys.argv[2], **json.loads(sys.argv[3]))'
// Few colours and no small specks: the trace flattens the creases, the
// gradients and the fine print of the photo, which then come out as thin
// coloured lines in the difference. The SVG of a bag stays near 35 KB.
const TRACE_SETTINGS = {
  colormode: 'color',
  hierarchical: 'cutout',
  mode: 'spline',
  filter_speckle: 16,
  color_precision: 3,
  layer_difference: 48,
  path_precision: 1,
}
const TRACE_SIZE_LIMIT = 300 * 1024
const SVG_HEADER_PATTERN = /^[\s\S]*?<svg[^>]* width="(\d+)" height="(\d+)"[^>]*>/

type Rgb = [number, number, number]

const hex = (rgb: Rgb) => `#${rgb.map(channel => Math.round(channel).toString(16).padStart(2, '0')).join('')}`
const distance = (a: Rgb, b: Rgb) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
const lightness = (rgb: Rgb) => rgb[0] + rgb[1] + rgb[2]

/**
 * Splits the pixels of a box into two colours with k-means, seeded with the
 * darkest and the lightest pixel. The colour that covers more of the box is
 * the background, the other one the letters.
 */
async function sampleColors(image: string, box: Pick<TextBox, 'x' | 'y' | 'width' | 'height'>) {
  const { data } = await sharp(image)
    .flatten({ background: '#ffffff' })
    .extract({ left: box.x, top: box.y, width: box.width, height: box.height })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pixels: Rgb[] = []
  for (let index = 0; index < data.length; index += 3)
    pixels.push([data[index], data[index + 1], data[index + 2]])

  const byLightness = [...pixels].sort((a, b) => lightness(a) - lightness(b))
  let centres: Rgb[] = [byLightness[0], byLightness[byLightness.length - 1]]
  let groups: Rgb[][] = [[], []]
  for (let round = 0; round < COLOR_ROUNDS; round++) {
    groups = [[], []]
    for (const pixel of pixels)
      groups[distance(pixel, centres[0]) <= distance(pixel, centres[1]) ? 0 : 1].push(pixel)
    centres = groups.map((group, index) => group.length
      ? [0, 1, 2].map(channel => group.reduce((sum, pixel) => sum + pixel[channel], 0) / group.length) as Rgb
      : centres[index])
  }
  const [letters, background] = groups[0].length < groups[1].length ? [0, 1] : [1, 0]
  return { color: hex(centres[letters]), background: hex(centres[background]) }
}

/** One box per line, so that a box is easy to find and to correct by hand. */
function formatTextLayer({ width, height, boxes }: TextLayer) {
  const lines = boxes.map(box => `    { ${Object.entries(box).map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(', ')} }`)
  return `{\n  "width": ${width},\n  "height": ${height},\n  "boxes": [\n${lines.join(',\n')}\n  ]\n}\n`
}

async function readText(image: string): Promise<TextLayer> {
  const { width, height } = await sharp(image).metadata()
  const enlarged = await sharp(image)
    .resize(Math.round(width! * OCR_SCALE))
    .greyscale()
    .normalise()
    .sharpen()
    .png()
    .toBuffer()

  await mkdir(OCR_CACHE_DIRECTORY, { recursive: true })
  const worker = await createWorker(OCR_LANGUAGES, OEM.LSTM_ONLY, { cachePath: OCR_CACHE_DIRECTORY })
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT })
  const { data } = await worker.recognize(enlarged, {}, { blocks: true })
  await worker.terminate()

  const lines = (data.blocks ?? [])
    .flatMap(block => block.paragraphs)
    .flatMap(paragraph => paragraph.lines)
    .filter(line => line.confidence >= OCR_MINIMUM_CONFIDENCE)
    .filter(line => (line.text.replace(OCR_NOISE_PATTERN, '').match(LETTER_PATTERN)?.length ?? 0) >= OCR_MINIMUM_LETTERS)

  const boxes: TextBox[] = []
  for (const [index, line] of lines.entries()) {
    const { bbox, baseline } = line
    const box = {
      x: Math.round(bbox.x0 / OCR_SCALE),
      y: Math.round(bbox.y0 / OCR_SCALE),
      width: Math.max(1, Math.round((bbox.x1 - bbox.x0) / OCR_SCALE)),
      height: Math.max(1, Math.round((bbox.y1 - bbox.y0) / OCR_SCALE)),
    }
    const angle = Math.atan2(baseline.y1 - baseline.y0, baseline.x1 - baseline.x0) * 180 / Math.PI
    boxes.push({
      id: `line-${String(index + 1).padStart(2, '0')}`,
      // Tesseract puts a space between Japanese characters
      text: line.text.trim().replace(/(?<=[^\x20-\x7E]) (?=[^\x20-\x7E])/g, ''),
      ...box,
      angle: Math.abs(angle) < ANGLE_THRESHOLD_DEGREES ? 0 : Math.round(angle * 10) / 10,
      font: 'sans',
      ...await sampleColors(image, box),
    })
  }
  return { width: width!, height: height!, boxes }
}

async function trace(image: string, target: string) {
  const raw = join(tmpdir(), `difference-prepare-${process.pid}.svg`)
  execFileSync('uv', [
    'run',
    '--no-project',
    '--python',
    TRACE_PYTHON_VERSION,
    '--with',
    `vtracer==${VTRACER_VERSION}`,
    'python',
    '-I',
    '-c',
    TRACE_PROGRAM,
    image,
    raw,
    JSON.stringify(TRACE_SETTINGS),
  ], { stdio: 'inherit' })
  const svg = await readFile(raw, 'utf-8')
  await rm(raw)

  // The trace fills the frame like the image does: a viewBox instead of a
  // size, and stretched to the box of the frame.
  const header = svg.match(SVG_HEADER_PATTERN)
  if (!header)
    throw new Error(`vtracer wrote no width and height into the SVG of ${image}`)
  const [, width, height] = header
  const fitted = svg.replace(SVG_HEADER_PATTERN, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`)
  await writeFile(target, fitted)
  return fitted.length
}

const name = process.argv[2]
const folder = join(FRAMES_DIRECTORY, name ?? '')
if (!name || !existsSync(folder)) {
  console.error('Usage: pnpm difference:prepare <name>')
  console.error(`The frames are the folders of ${FRAMES_DIRECTORY}: ${readdirSync(FRAMES_DIRECTORY).join(', ')}`)
  process.exit(1)
}
const imageFile = readdirSync(folder).find(file => IMAGE_PATTERN.test(file))
if (!imageFile) {
  console.error(`${folder} has no image.png, image.jpg or image.webp`)
  process.exit(1)
}
const image = join(folder, imageFile)

const textPath = join(folder, TEXT_FILE)
if (existsSync(textPath)) {
  console.log(`Kept ${textPath}`)
}
else {
  const layer = await readText(image)
  await writeFile(textPath, formatTextLayer(layer))
  console.log(`Wrote ${layer.boxes.length} text boxes to ${textPath}. Correct the texts, the boxes and the fonts by hand.`)
}

const tracePath = join(folder, TRACE_FILE)
if (existsSync(tracePath)) {
  console.log(`Kept ${tracePath}`)
}
else {
  const size = await trace(image, tracePath)
  console.log(`Wrote ${(size / 1024).toFixed(0)} KB to ${tracePath}`)
  if (size > TRACE_SIZE_LIMIT)
    console.warn(`The trace is larger than ${TRACE_SIZE_LIMIT / 1024} KB. Raise filter_speckle or layer_difference in TRACE_SETTINGS.`)
}
