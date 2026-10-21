// The options of DifferenceFrame and of the Suzuno faces, which show their
// recreations in a DifferenceFrame. A markdown tag gives an attribute without
// a colon as a string, so the options also take their values as text.

/** The face a text box is set in. The fonts that stand for them are in DifferenceFrame.vue. */
export type TextFont = 'serif' | 'sans'

/**
 * One line of text that OCR found in the image of a difference frame, in the
 * pixels of the image. The box is the ink of the line, without its angle.
 * `color` is the colour of the letters and `background` the colour around
 * them. A box without `background` lets the image show around its letters.
 */
export interface TextBox {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  angle?: number
  font?: TextFont
  color: string
  background?: string
}

/** The content of text.json: the size of the image and the boxes in its pixels. */
export interface TextLayer {
  width: number
  height: number
  boxes: TextBox[]
}

/**
 * The `texts` prop of a difference frame. A list replaces the boxes by their
 * position and an object by their id; `null` in a list keeps a box as it is.
 */
export type TextReplacements = string | (string | null)[] | Record<string, string>

/** An image for a frame without a folder: its largest copy, all copies for srcset, and its size. */
export interface FrameImage {
  src: string
  srcset: string
  width: number
  height: number
}

/** A value of a markdown attribute that a frame cannot use, such as opacity="half". */
export class InvalidOptionError extends Error {
  name = 'InvalidOptionError'
}

export class UnknownTextError extends Error {
  name = 'UnknownTextError'

  constructor(path: string, known: string[]) {
    super(`There is no text ${path}. The texts at this level are: ${known.join(', ')}`)
  }
}

const OFF_VALUES = ['false', 'off', '0']
const PERCENT = 100
const OPACITY = { difference: PERCENT, overlay: 50 }

/** False for "false", "off" or "0", and for false. */
export function isOn(value: boolean | string) {
  return !OFF_VALUES.includes(String(value).trim().toLowerCase())
}

/** The opacity from 0 to 1, from a percentage such as 30, "30" or "30%". Without a value: full in the difference, half in the overlay. */
export function opacityOption(value: number | string | undefined, difference: boolean) {
  if (value === undefined || String(value).trim() === '')
    return (difference ? OPACITY.difference : OPACITY.overlay) / PERCENT
  const percent = Number.parseFloat(String(value))
  if (!(percent >= 0 && percent <= PERCENT))
    throw new InvalidOptionError(`The opacity is a percentage from 0 to 100, not ${value}`)
  return percent / PERCENT
}

/**
 * The texts option: a missing value keeps the original texts, an object
 * replaces some of them, and a blank string such as texts="" removes them all.
 */
export function textsOption(value: object | string | undefined) {
  if (typeof value !== 'string')
    return { blank: false, given: value }
  if (value.trim())
    throw new InvalidOptionError(`texts takes an object with a colon, such as :texts="{ name: '...' }", or texts="" for no texts, not texts="${value}"`)
  return { blank: true, given: undefined }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The texts with the given texts in place of the defaults. Objects merge key
 * by key; a string, a number or a list replaces the default as a whole. A key
 * that the defaults do not have is an error, so that a typing error does not
 * go unseen.
 */
export function mergeTexts<Texts>(defaults: Texts, given: unknown, path = 'texts'): Texts {
  if (given === undefined)
    return defaults
  if (!isRecord(defaults) || !isRecord(given))
    return given as Texts
  for (const key of Object.keys(given)) {
    if (!(key in defaults))
      throw new UnknownTextError(`${path}.${key}`, Object.keys(defaults))
  }
  return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, mergeTexts(value, given[key], `${path}.${key}`)])) as Texts
}

/** The text boxes of a frame with the `texts` prop applied to them. */
export function replaceTexts(boxes: TextBox[], texts: TextReplacements | undefined): TextBox[] {
  let byId = texts
  if (Array.isArray(texts)) {
    if (texts.length > boxes.length)
      throw new InvalidOptionError(`texts has ${texts.length} entries, but the frame has ${boxes.length} text boxes`)
    byId = Object.fromEntries(texts.flatMap((text, index) => text === null ? [] : [[boxes[index].id, text]]))
  }
  const { blank, given } = textsOption(byId)
  const shown = mergeTexts(Object.fromEntries(boxes.map(box => [box.id, box.text])), given)
  return boxes.map(box => ({ ...box, text: blank ? '' : shown[box.id] }))
}
