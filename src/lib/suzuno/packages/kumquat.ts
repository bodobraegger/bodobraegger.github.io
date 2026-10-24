// The bag of preserved kumquats 旬の味 甘草金桔 (Preserved Kumquat Conserve,
// 170 g): the size of its front, the fonts of its lettering, its texts and
// its fitted layout. The front is in the pixels of the face
// reference/packages/kumquat-front.png (1000 x 690), flattened from the photo
// of the user, with the zip at the right. The maker is not known: the
// photographed side shows no name and no barcode.
import fitted from '~/lib/suzuno/packages/kumquat-fit.json'
import { useStylesheets } from '~/lib/suzuno/packages/lettering'

export const KUMQUAT_FRONT = { width: 1000, height: 690 }

/** The default title. The face draws it as the traced lettering; another title is set in KUMQUAT_FONTS.brush. */
export const KUMQUAT_TITLE = '旬の味'

/**
 * Free stand-ins for the faces of the print. The title 旬の味 is heavy brush
 * lettering that no free font matches, so it is a traced path. The two
 * orange lines are in a casual brush script; Potta One (OFL) fits their ink
 * best of the free Japanese faces. 甘草金桔 and the opening line
 * are in a bold and a regular gothic like Shin Go, here Noto Sans JP (OFL).
 * The English and French lines of the badge are in a narrow grotesque like
 * Helvetica Condensed, here Roboto Condensed (OFL), bold italic and regular.
 */
export const KUMQUAT_FONTS = {
  brush: { family: '\'Potta One\', serif', weight: 400, style: 'normal' },
  gothic: { family: '\'Noto Sans JP\', sans-serif', weight: 400, style: 'normal' },
  gothicBold: { family: '\'Noto Sans JP\', sans-serif', weight: 700, style: 'normal' },
  narrow: { family: '\'Roboto Condensed\', sans-serif', weight: 400, style: 'normal' },
  narrowBold: { family: '\'Roboto Condensed\', sans-serif', weight: 700, style: 'italic' },
}

const STYLESHEET = 'https://fonts.googleapis.com/css2?display=block&family=Potta+One&family=Noto+Sans+JP:wght@400;700&family=Roboto+Condensed:ital,wght@0,400;1,700'

/** Loads the fonts of KUMQUAT_FONTS, once for all faces on a page. */
export function useKumquatFonts() {
  useStylesheets(STYLESHEET)
}

/** A line of lettering in face pixels: the start or the middle of its baseline, its size, its angle in degrees clockwise, its letter spacing and its horizontal stretch. */
export interface LetteringPlace {
  x: number
  y: number
  size: number
  rotate: number
  spacing: number
  stretch: number
}

/** The SVG attributes that set a line of lettering at its place in a font. */
export function letteringAttributes(place: LetteringPlace, font: { family: string, weight: number, style: string }) {
  return {
    'transform': `translate(${place.x} ${place.y}) rotate(${place.rotate}) scale(${place.stretch} 1)`,
    'font-family': font.family,
    'font-weight': font.weight,
    'font-style': font.style,
    'font-size': place.size,
    'letter-spacing': place.spacing,
  }
}

/** The texts of the front. */
export const KUMQUAT_TEXTS = {
  title: KUMQUAT_TITLE,
  /**
   * The two orange lines below the title, in the hand of the print. The
   * second line is pseudo-Japanese and reads as written.
   */
  lines: ['真心込めてつくりました', 'おやだい味おわす'],
  badge: {
    name: '甘草金桔',
    english: ['PRESERVED KUMQUAT', 'KUMQUAT CONSERVÉ'],
    weightLabel: 'Net Weight / Poids Net',
    weight: '170g (6 oz)',
  },
  /** The line along the left edge, beside the arrow. */
  opening: '請在此處開口(Please Open Here)',
  /** The price sticker of the shop. The price is hand-written and hard to read on the photo. */
  sticker: { shop: 'MEI-JO', price: 'R$ 12,90' },
}

export type KumquatTexts = typeof KUMQUAT_TEXTS

export const { layout: KUMQUAT_LAYOUT, colors: KUMQUAT_COLORS } = fitted.front
