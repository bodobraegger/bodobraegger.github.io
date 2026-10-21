// The MARUKAWA bubble gum boxes (丸川製菓, 4 pieces of marble gum) of the
// photos, the export version with English text: the texts, the fruit images
// and the fitted designs of three flavours, and the fonts of their lettering. All
// places are in the pixels of the faces of the photos,
// reference/packages/marukawa-<flavour>-front.png (144 x 136). The front and
// the back of a box carry the same print. tools/fits/packages/marukawa.mjs
// fits the places and colours of the lettering to the reference faces and
// writes them to marukawa-fit.json; tools/fits/packages/marukawa_fruit.py
// composes the fruit images.
import melon from '~/assets/suzuno/packages/marukawa-export-melon.webp'
import orange from '~/assets/suzuno/packages/marukawa-export-orange.webp'
import strawberry from '~/assets/suzuno/packages/marukawa-export-strawberry.webp'
import type { FontMetrics } from '~/lib/suzuno/packages/font-metrics'
import { ARIMO, ARIMO_BOLD, FIRST_CHARACTER, FIRST_WIDE_CHARACTER, ULTRA } from '~/lib/suzuno/packages/font-metrics'
import FITTED from '~/lib/suzuno/packages/marukawa-fit.json'

export const MARUKAWA_FACE = { width: 144, height: 136 }

// The lettering of a box is measured without a browser, from the advance
// tables of font-metrics.ts, so that the server render already puts a box
// behind a word or a word after another word.

/** A web font of the lettering, with the stylesheet that loads it and its advance widths. */
export interface LetteringFont {
  family: string
  weight: number
  stylesheet: string
  metrics: FontMetrics
}

/** The cap height of the lettering parts in their own coordinates. */
export const CAP_HEIGHT = 100

/** A line of lettering in the coordinates of its parent. */
export interface LetteringPlace {
  /** The start of the baseline, or its middle for centred lettering. */
  x: number
  y: number
  /** The cap height. */
  size: number
  /** The horizontal scale of the letters. */
  squeeze: number
}

/** The transform that puts a lettering part, drawn with a cap height of CAP_HEIGHT, at its place. */
export function placeLettering(place: LetteringPlace) {
  const scale = place.size / CAP_HEIGHT
  return `translate(${place.x} ${place.y}) scale(${scale * place.squeeze} ${scale})`
}

/** The width of a text in em. ponytail: no kerning, add the kern pairs when a box must hug a word to the pixel. */
export function textWidth(text: string, font: FontMetrics) {
  let width = 0
  for (const character of text) {
    const code = character.codePointAt(0)!
    width += code < FIRST_WIDE_CHARACTER ? font.advances[code - FIRST_CHARACTER] ?? font.mean : font.wide
  }
  return width
}

/** The font size that gives a cap height. */
export function fontSizeForCapHeight(capHeight: number, font: FontMetrics) {
  return capHeight / font.capHeight
}

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?display=block&family='
const HELVETICA = '\'Arimo\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'

/**
 * Free stand-ins for the faces of the print. The flavour and "GUM" are in a
 * fat Clarendon, probably a phototype face such as Clarendon Ultra, and Ultra
 * (OFL) has the same ball terminals and bracketed slabs; the other lines are
 * in Helvetica, and Arimo (Apache 2.0) has its metrics.
 */
export const MARUKAWA_FONTS = {
  clarendon: { family: '\'Ultra\', \'Rockwell Extra Bold\', serif', weight: 400, stylesheet: `${GOOGLE_FONTS}Ultra`, metrics: ULTRA },
  helvetica: { family: HELVETICA, weight: 400, stylesheet: `${GOOGLE_FONTS}Arimo:wght@400;700`, metrics: ARIMO },
  helveticaBold: { family: HELVETICA, weight: 700, stylesheet: `${GOOGLE_FONTS}Arimo:wght@400;700`, metrics: ARIMO_BOLD },
} satisfies Record<string, LetteringFont>

/** The width of a text in a font with a cap height of CAP_HEIGHT. */
export function letteringWidth(text: string, font: LetteringFont) {
  return textWidth(text, font.metrics) * fontSizeForCapHeight(CAP_HEIGHT, font.metrics)
}

export type MarukawaPreset = 'melon' | 'strawberry' | 'orange'

/** The small label: a heading with a dark badge after it, and lines below. */
export interface MarukawaLabelText {
  heading: string
  badge: string
  lines: string[]
}

export interface MarukawaTexts {
  brand: string
  flavour: string
  /** "ARTIFICIALLY FLAVORED". */
  tagline: string
  /** The first and the second word of "BUBBLE GUM". */
  bubble: string
  gum: string
  /** The small label of the orange box. */
  label?: MarukawaLabelText
}

export interface MarukawaLayout {
  /** gap: the space between the mark and the name, in cap heights; markScale: the size of the mark. */
  logo: LetteringPlace & { gap: number, markScale: number }
  /** The flavour is narrowed further when it is wider than maxWidth. */
  flavour: LetteringPlace & { maxWidth: number }
  tagline: LetteringPlace
  /** gumScale and gumGap: the cap height of the second word and the space before it, relative to the first. */
  bubbleGum: LetteringPlace & { gumScale: number, gumGap: number }
  /** The small white label at the bottom of the orange box. */
  label?: { x: number, y: number, width: number, height: number }
}

/** The colours of a box; null removes a part. */
export interface MarukawaColours {
  flavourColor: string
  /** The dark edge around the flavour letters. */
  flavourOutline: string | null
  /** The box behind the flavour. */
  highlight: string | null
  bubbleColor: string
  gumColor: string
  gumOutline: string | null
  /** The ink of the logo line and the tagline. */
  ink: string
  paper: string
}

/** The fitted layout and colours of each box. */
export const MARUKAWA_DESIGNS = {
  melon: FITTED['export-melon'],
  strawberry: FITTED['export-strawberry'],
  orange: FITTED['export-orange'],
} as Record<MarukawaPreset, { layout: MarukawaLayout, colours: MarukawaColours }>

/** The fruit of each box, an image of the whole face with transparent paper. */
export const MARUKAWA_ILLUSTRATIONS: Record<MarukawaPreset, string> = { melon, strawberry, orange }

const TEXTS = { brand: 'MARUKAWA', tagline: 'ARTIFICIALLY FLAVORED', bubble: 'BUBBLE', gum: 'GUM' }

/** The texts of the print of each box. */
export const MARUKAWA_TEXTS: Record<MarukawaPreset, MarukawaTexts> = {
  melon: { ...TEXTS, flavour: 'melon' },
  strawberry: { ...TEXTS, flavour: 'Strawberry' },
  // The label is too small in the photos to read. Its text is a plausible
  // export label in the words of the maker; only the layout follows the photos.
  orange: { ...TEXTS, flavour: 'orange', label: { heading: 'Made in', badge: 'JAPAN', lines: ['4pcs. (5.4 g)', 'MARBLE BUBBLE GUM'] } },
}
