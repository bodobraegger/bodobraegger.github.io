// The MARUKAWA bubble gum boxes (丸川製菓, 4 pieces of marble gum): the
// presets of MarukawaBox.vue for three flavours in two versions, and the fonts
// of their lettering. The export version with English text is the box of the
// photos; the domestic version for Japan has Japanese text. All places are in
// the pixels of the faces of the photos, reference/packages/marukawa-<flavour>-<face>.png
// (144 x 136). The front and the back of a box carry the same print.
// tools/fits/packages/marukawa.mjs fits the places and colours of the
// lettering to the reference faces and writes them to marukawa-fit.json;
// tools/fits/packages/marukawa_fruit.py composes the fruit images.
import domesticMelon from '~/assets/suzuno/packages/marukawa-domestic-melon.webp'
import domesticOrange from '~/assets/suzuno/packages/marukawa-domestic-orange.webp'
import domesticStrawberry from '~/assets/suzuno/packages/marukawa-domestic-strawberry.webp'
import exportMelon from '~/assets/suzuno/packages/marukawa-export-melon.webp'
import exportOrange from '~/assets/suzuno/packages/marukawa-export-orange.webp'
import exportStrawberry from '~/assets/suzuno/packages/marukawa-export-strawberry.webp'
import { ARIMO, ARIMO_BOLD, DARUMADROP_ONE, MOCHIY_POP_ONE, NOTO_SANS_JP, ULTRA } from '~/lib/suzuno/packages/font-metrics'
import type { LetteringFont, LetteringPlace } from '~/lib/suzuno/packages/lettering'
import { CAP_HEIGHT, fontSizeForCapHeight, textWidth } from '~/lib/suzuno/packages/lettering'
import FITTED from '~/lib/suzuno/packages/marukawa-fit.json'

export const MARUKAWA_FACE = { width: 144, height: 136 }

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?display=block&family='
const HELVETICA = '\'Arimo\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'

/**
 * Free stand-ins for the faces of the print. Export version: the flavour and
 * "GUM" are in a fat Clarendon, probably a phototype face such as Clarendon
 * Ultra, and Ultra (OFL) has the same ball terminals and bracketed slabs; the
 * other lines are in Helvetica, and Arimo (Apache 2.0) has its metrics.
 * Domestic version: the flavour, ガム and フーセン are hand-lettered with a
 * brush, and Darumadrop One (OFL) has the same heavy, rounded strokes; マルカワ
 * is a rounded pop gothic like Mochiy Pop One (OFL); the small print is a
 * plain gothic like Noto Sans JP (OFL).
 */
export const MARUKAWA_FONTS = {
  clarendon: { family: '\'Ultra\', \'Rockwell Extra Bold\', serif', weight: 400, stylesheet: `${GOOGLE_FONTS}Ultra`, metrics: ULTRA },
  helvetica: { family: HELVETICA, weight: 400, stylesheet: `${GOOGLE_FONTS}Arimo:wght@400;700`, metrics: ARIMO },
  helveticaBold: { family: HELVETICA, weight: 700, stylesheet: `${GOOGLE_FONTS}Arimo:wght@400;700`, metrics: ARIMO_BOLD },
  brush: { family: '\'Darumadrop One\', \'Mochiy Pop One\', sans-serif', weight: 400, stylesheet: `${GOOGLE_FONTS}Darumadrop+One`, metrics: DARUMADROP_ONE },
  pop: { family: '\'Mochiy Pop One\', sans-serif', weight: 400, stylesheet: `${GOOGLE_FONTS}Mochiy+Pop+One`, metrics: MOCHIY_POP_ONE },
  gothic: { family: '\'Noto Sans JP\', sans-serif', weight: 400, stylesheet: `${GOOGLE_FONTS}Noto+Sans+JP:wght@400`, metrics: NOTO_SANS_JP },
} satisfies Record<string, LetteringFont>

// The sizes of the lettering parts in their own coordinates (a cap height of CAP_HEIGHT)

/** The radius of the mark of the logo line; the mark is a little taller than the capitals. */
export const MARK_RADIUS = 0.58 * CAP_HEIGHT

/** The width of a text in a font with a cap height of CAP_HEIGHT, times scale. */
export function letteringWidth(text: string, font: LetteringFont, scale = 1) {
  return textWidth(text, font.metrics) * fontSizeForCapHeight(CAP_HEIGHT * scale, font.metrics)
}

/** The start of the name after the mark of the logo line. */
export function logoNameX(gap: number, markScale = 1) {
  return 2 * MARK_RADIUS * markScale + gap * CAP_HEIGHT
}

export type MarukawaVersion = 'domestic' | 'export'
export type MarukawaPreset = 'melon' | 'strawberry' | 'orange'

export interface MarukawaTexts {
  brand: string
  flavour: string
  /** "ARTIFICIALLY FLAVORED", or the flavouring line of the domestic box. */
  tagline: string
  /** The first and the second word of "BUBBLE GUM" or フーセン ガム. */
  bubble: string
  gum: string
}

export interface MarukawaLayout {
  /** gap: the space between the mark and the name, in cap heights; markScale: the size of the mark. */
  logo: LetteringPlace & { gap: number, markScale: number }
  /** The flavour is narrowed further when it is wider than maxWidth. */
  flavour: LetteringPlace & { maxWidth: number }
  tagline: LetteringPlace
  /** gumScale and gumGap: the cap height of the second word and the space before it, relative to the first. */
  bubbleGum: LetteringPlace & { gumScale: number, gumGap: number }
  /** The small white label at the bottom of the orange export box. */
  label?: { x: number, y: number, width: number, height: number }
  /** The ® mark of the domestic boxes: centre and radius. */
  registered?: { x: number, y: number, radius: number }
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
  /** The ink of the logo line, the tagline and the ® mark. */
  ink: string
  paper: string
}

/** The small label: a heading with a dark badge after it, and lines below. */
export interface MarukawaLabelText {
  heading: string
  badge: string
  lines: string[]
}

export interface MarukawaDesign extends MarukawaColours {
  texts: MarukawaTexts
  fonts: Record<keyof MarukawaTexts, LetteringFont>
  /** The fruit, an image of the whole face with transparent paper. */
  illustration: string
  label: MarukawaLabelText | null
  layout: MarukawaLayout
}

/** The fitted layout and colours of a box, from marukawa-fit.json. */
function fitted(version: MarukawaVersion, preset: MarukawaPreset) {
  const { layout, colours } = (FITTED as Record<string, { layout: MarukawaLayout, colours: MarukawaColours }>)[`${version}-${preset}`]
  return { layout, ...colours }
}

const EXPORT_FONTS = {
  brand: MARUKAWA_FONTS.helveticaBold,
  flavour: MARUKAWA_FONTS.clarendon,
  tagline: MARUKAWA_FONTS.helvetica,
  bubble: MARUKAWA_FONTS.helveticaBold,
  gum: MARUKAWA_FONTS.clarendon,
}
const EXPORT_TEXTS = { brand: 'MARUKAWA', tagline: 'ARTIFICIALLY FLAVORED', bubble: 'BUBBLE', gum: 'GUM' }

const DOMESTIC_FONTS = {
  brand: MARUKAWA_FONTS.pop,
  flavour: MARUKAWA_FONTS.brush,
  tagline: MARUKAWA_FONTS.gothic,
  bubble: MARUKAWA_FONTS.brush,
  gum: MARUKAWA_FONTS.brush,
}
const DOMESTIC_TEXTS = { brand: 'マルカワ', bubble: 'フーセン', gum: 'ガム' }

export const MARUKAWA_PRESETS: Record<MarukawaVersion, Record<MarukawaPreset, MarukawaDesign>> = {
  export: {
    melon: { texts: { ...EXPORT_TEXTS, flavour: 'melon' }, fonts: EXPORT_FONTS, illustration: exportMelon, label: null, ...fitted('export', 'melon') },
    strawberry: { texts: { ...EXPORT_TEXTS, flavour: 'Strawberry' }, fonts: EXPORT_FONTS, illustration: exportStrawberry, label: null, ...fitted('export', 'strawberry') },
    orange: {
      texts: { ...EXPORT_TEXTS, flavour: 'orange' },
      fonts: EXPORT_FONTS,
      illustration: exportOrange,
      // The label is too small in the photos to read. Its text is a plausible
      // export label in the words of the maker; only the layout follows the photos.
      label: { heading: 'Made in', badge: 'JAPAN', lines: ['4pcs. (5.4 g)', 'MARBLE BUBBLE GUM'] },
      ...fitted('export', 'orange'),
    },
  },
  domestic: {
    melon: { texts: { ...DOMESTIC_TEXTS, flavour: 'メロン', tagline: 'メロン香料使用' }, fonts: DOMESTIC_FONTS, illustration: domesticMelon, label: null, ...fitted('domestic', 'melon') },
    strawberry: { texts: { ...DOMESTIC_TEXTS, flavour: 'いちご', tagline: 'ストロベリー香料使用' }, fonts: DOMESTIC_FONTS, illustration: domesticStrawberry, label: null, ...fitted('domestic', 'strawberry') },
    orange: { texts: { ...DOMESTIC_TEXTS, flavour: 'オレンジ', tagline: 'オレンジ香料使用' }, fonts: DOMESTIC_FONTS, illustration: domesticOrange, label: null, ...fitted('domestic', 'orange') },
  },
}

/** A freely licensed photo that the fruit images use; the display pages credit it. */
export interface ImageSource {
  title: string
  author: string
  licence: string
  /** The licence text, or null for the public domain. */
  licenceUrl: string | null
  page: string
  flavours: MarukawaPreset[]
}

// The photos of tools/fits/packages/marukawa_fruit.py, see assets/SOURCES.md
export const MARUKAWA_IMAGE_SOURCES: ImageSource[] = [
  { title: 'Cantaloupe', author: 'Renee Comet', licence: 'public domain', licenceUrl: null, page: 'https://commons.wikimedia.org/wiki/File:Cantaloupe.jpg', flavours: ['melon'] },
  { title: 'Musk melon for sale, Tokyo', author: 'Nesnad', licence: 'CC BY 4.0', licenceUrl: 'https://creativecommons.org/licenses/by/4.0', page: 'https://commons.wikimedia.org/wiki/File:Musk_melon_for_sale_-_Tokyo_-_Jan_21_2021.jpeg', flavours: ['melon'] },
  { title: 'Garden strawberry, single', author: 'Ivar Leidus', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Garden_strawberry_(Fragaria_%C3%97_ananassa)_single.jpg', flavours: ['strawberry'] },
  { title: 'Oranges, whole, halved, segment', author: 'Ivar Leidus', licence: 'CC BY-SA 4.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Oranges_-_whole-halved-segment.jpg', flavours: ['orange'] },
  { title: 'Clementine leaf', author: 'asdfVic', licence: 'CC BY-SA 3.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0', page: 'https://commons.wikimedia.org/wiki/File:Clementine012.png', flavours: ['orange'] },
]

export const MARUKAWA_FLAVOURS: { preset: MarukawaPreset, title: string }[] = [
  { preset: 'melon', title: 'MARUKAWA Melon' },
  { preset: 'strawberry', title: 'MARUKAWA Strawberry' },
  { preset: 'orange', title: 'MARUKAWA Orange' },
]
