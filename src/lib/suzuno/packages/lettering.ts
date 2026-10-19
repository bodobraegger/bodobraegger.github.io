// Measures package lettering without a browser, from the advance tables of
// src/lib/suzuno/packages/font-metrics.ts, so that the server render already puts a
// box behind a word or a word after another word.
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import type { FontMetrics } from '~/lib/suzuno/packages/font-metrics'
import { FIRST_CHARACTER, FIRST_KANA, FIRST_WIDE_CHARACTER } from '~/lib/suzuno/packages/font-metrics'

/** A web font of a lettering part, with the stylesheet that loads it and its advance widths. */
export interface LetteringFont {
  family: string
  weight: number
  stylesheet: string
  metrics: FontMetrics
}

/** Loads the stylesheets of the fonts that a getter gives, once for each stylesheet on a page. */
export function useWebFonts(fonts: () => Pick<LetteringFont, 'stylesheet'>[]) {
  const stylesheets = computed(() => [...new Set(fonts().map(font => font.stylesheet))])
  useHead({ link: computed(() => stylesheets.value.map(href => ({ key: href, rel: 'stylesheet', href }))) })
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
    if (code < FIRST_WIDE_CHARACTER)
      width += font.advances[code - FIRST_CHARACTER] ?? font.mean
    else
      width += font.kana[code - FIRST_KANA] ?? font.wide
  }
  return width
}

/** The font size that gives a cap height. */
export function fontSizeForCapHeight(capHeight: number, font: FontMetrics) {
  return capHeight / font.capHeight
}
