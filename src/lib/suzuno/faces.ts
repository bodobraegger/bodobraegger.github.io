// The faces that SuzunoBag, SuzunoWrapper, SuzunoMarukawa and SuzunoFinancial
// lay over their reference images, with the texts of each face, and the
// options of these components. src/lib/suzuno/README.md lists the items, the
// faces and their texts.
import type { Component } from 'vue'
import SuzunoCover from '~/components/suzuno/SuzunoCover.vue'
import AlmondCaramelBag from '~/components/suzuno/packages/AlmondCaramelBag.vue'
import AlmondCaramelPiece from '~/components/suzuno/packages/AlmondCaramelPiece.vue'
import HokkaidoMilkBag from '~/components/suzuno/packages/HokkaidoMilkBag.vue'
import HokkaidoMilkCandy from '~/components/suzuno/packages/HokkaidoMilkCandy.vue'
import MarukawaBox from '~/components/suzuno/packages/MarukawaBox.vue'
import SaltLemonFront from '~/components/suzuno/packages/SaltLemonFront.vue'
import { COVER_TEXTS } from '~/lib/suzuno/cover-typography'
import { ALMOND_CARAMEL_PIECE_TEXTS, ALMOND_CARAMEL_TEXTS } from '~/lib/suzuno/packages/almond-caramel'
import { HOKKAIDO_MILK_CANDY_TEXTS, HOKKAIDO_MILK_CONTENT, HOKKAIDO_MILK_TEXTS } from '~/lib/suzuno/packages/hokkaido-milk'
import type { MarukawaPreset } from '~/lib/suzuno/packages/marukawa'
import { MARUKAWA_PRESETS } from '~/lib/suzuno/packages/marukawa'
import type { BadgeSphere } from '~/lib/suzuno/packages/salt-lemon'
import { ACID_BADGE_SPHERES, ACID_BADGE_TEXTS, FRONT_PART_TEXTS, FRONT_TEXTS, SALT_LEMON_TITLE } from '~/lib/suzuno/packages/salt-lemon'

// The table holds faces with texts of many types, so its entries take any texts
export interface DifferenceFace<Texts extends object = any> {
  /** What the face shows, the alternative text of its reference image. */
  title: string
  /** The reference image, a path in src/assets/suzuno/reference/. */
  reference: string
  /** The recreation. It fills the width of its box. */
  component: Component
  /** The props that choose the face, such as its side. */
  props?: Record<string, unknown>
  /** The texts of the print. */
  texts: Texts
  /** The props of the recreation that show the texts. */
  textProps: (texts: Texts) => Record<string, unknown>
  /**
   * The texts for blank texts: they turn lettering that the recreation draws
   * as shapes, such as the traced 北海道, into text, which blank texts hide.
   */
  blank?: Partial<Texts>
  /** Props with smaller images, for a face narrower than SMALL_FACE_WIDTH. */
  small?: Record<string, unknown>
}

/** The width in CSS pixels below which a face takes the small images of its recreation. */
export const SMALL_FACE_WIDTH = 160

// Copies of the images of the recreations for small faces, such as a candy in
// a line of text: the originals are made for a face of the full column
const SMALL_IMAGES = import.meta.glob<string>(
  ['/src/assets/suzuno/packages/{marukawa-export-*,hokkaido-milk-cow,hokkaido-milk-farm}.webp', '/src/assets/suzuno/{salt-lemon-photo,almond-caramel-window-*}.webp'],
  { eager: true, query: { w: '320', format: 'webp' }, import: 'default' },
)

/** The small copy of an image in src/assets/suzuno/, for example smallImage('salt-lemon-photo'). */
function smallImage(name: string) {
  return SMALL_IMAGES[`/src/assets/suzuno/${name}.webp`]
}

/** A face whose textProps takes the type of its texts. */
function defineFace<Texts extends object>(face: DifferenceFace<Texts>): DifferenceFace {
  return face
}

/** Texts for a recreation with a texts prop. */
function passTexts(texts: object) {
  return { texts }
}

/** Texts for a recreation with a prop for each text. */
function spreadTexts(texts: object) {
  return { ...texts }
}

const HOKKAIDO_MILK_BAG_TEXTS = { ...HOKKAIDO_MILK_TEXTS, weight: HOKKAIDO_MILK_CONTENT.weight, back: HOKKAIDO_MILK_CONTENT.back }

const SALT_LEMON_TEXTS = {
  ...SALT_LEMON_TITLE,
  ...FRONT_TEXTS,
  /** No name: the drawn letters カトウ. */
  logo: { name: undefined as string | undefined, tagline: FRONT_PART_TEXTS.logoTagline },
  saltBadge: FRONT_PART_TEXTS.saltLines,
  acidBadge: {
    label: ACID_BADGE_TEXTS.label,
    amount: ACID_BADGE_TEXTS.amountTemplate,
    mg: FRONT_PART_TEXTS.citricAcidMg,
    spheres: ACID_BADGE_SPHERES.map(({ symbol, caption }) => ({ symbol, caption })),
  },
}

export type Side = 'front' | 'back'

/** The big bags, for SuzunoBag. */
export const BAG_FACES = {
  'almond-caramel': {
    front: defineFace({
      title: 'The front of the Almond Caramel bag',
      reference: 'packages/almond-caramel-front.png',
      component: AlmondCaramelBag,
      props: { side: 'front' },
      texts: ALMOND_CARAMEL_TEXTS,
      textProps: passTexts,
      small: { windowImage: smallImage('almond-caramel-window-front') },
    }),
    back: defineFace({
      title: 'The back of the Almond Caramel bag',
      reference: 'packages/almond-caramel-back.png',
      component: AlmondCaramelBag,
      props: { side: 'back' },
      texts: ALMOND_CARAMEL_TEXTS,
      textProps: passTexts,
      small: { windowImage: smallImage('almond-caramel-window-back') },
    }),
  },
  'hokkaido-milk': {
    front: defineFace({
      title: 'The front of the Hokkaido milk candy bag',
      reference: 'packages/hokkaido-milk-front.png',
      component: HokkaidoMilkBag,
      props: { face: 'front' },
      texts: HOKKAIDO_MILK_BAG_TEXTS,
      textProps: spreadTexts,
      blank: { title: '' },
      small: { illustration: smallImage('packages/hokkaido-milk-cow'), landscape: smallImage('packages/hokkaido-milk-farm') },
    }),
    back: defineFace({
      title: 'The back of the Hokkaido milk candy bag',
      reference: 'packages/hokkaido-milk-back.png',
      component: HokkaidoMilkBag,
      props: { face: 'back' },
      texts: HOKKAIDO_MILK_BAG_TEXTS,
      textProps: spreadTexts,
      blank: { title: '' },
    }),
  },
  'salt-lemon': {
    front: defineFace({
      title: 'The front of the salt lemon candy bag',
      reference: 'packages/salt-lemon-front.png',
      component: SaltLemonFront,
      texts: SALT_LEMON_TEXTS,
      textProps: ({ kanji, ruby, name, kind, banner, tagline, notes, logo, saltBadge, acidBadge }) => ({
        title: { kanji, ruby, name, kind },
        texts: { banner, tagline, notes },
        logoName: logo.name,
        logoTagline: logo.tagline,
        saltLines: saltBadge,
        citricAcidMg: acidBadge.mg,
        acidBadge: {
          label: acidBadge.label,
          amountTemplate: acidBadge.amount,
          // The colours of the spheres stay
          spheres: ACID_BADGE_SPHERES.map((sphere, index) => ({ ...sphere, ...acidBadge.spheres[index] })) as [BadgeSphere, BadgeSphere],
        },
      }),
      blank: { logo: { name: '', tagline: FRONT_PART_TEXTS.logoTagline } },
      small: { photo: smallImage('salt-lemon-photo') },
    }),
  },
} satisfies Record<string, Partial<Record<Side, DifferenceFace>>>

/** The wrapped candies, for SuzunoWrapper. */
export const WRAPPER_FACES = {
  'almond-caramel': {
    front: defineFace({
      title: 'The front of a wrapped almond caramel',
      reference: 'packages/almond-caramel-piece-front.png',
      component: AlmondCaramelPiece,
      props: { side: 'front' },
      texts: ALMOND_CARAMEL_PIECE_TEXTS,
      textProps: passTexts,
    }),
    back: defineFace({
      title: 'The back of a wrapped almond caramel',
      reference: 'packages/almond-caramel-piece-back.png',
      component: AlmondCaramelPiece,
      props: { side: 'back' },
      texts: ALMOND_CARAMEL_PIECE_TEXTS,
      textProps: passTexts,
    }),
  },
  'hokkaido-milk': {
    front: defineFace({
      title: 'The front of a wrapped Hokkaido milk candy',
      reference: 'packages/hokkaido-milk-piece-front-full.png',
      component: HokkaidoMilkCandy,
      // The cow is small on the wrapper at every size
      props: { face: 'front', illustration: smallImage('packages/hokkaido-milk-cow') },
      texts: HOKKAIDO_MILK_CANDY_TEXTS,
      textProps: spreadTexts,
    }),
    back: defineFace({
      title: 'The back of a wrapped Hokkaido milk candy',
      reference: 'packages/hokkaido-milk-piece-back-full.png',
      component: HokkaidoMilkCandy,
      props: { face: 'back' },
      texts: HOKKAIDO_MILK_CANDY_TEXTS,
      textProps: spreadTexts,
    }),
  },
} satisfies Record<string, Record<Side, DifferenceFace>>

/** A MARUKAWA box, for SuzunoMarukawa. The front and the back carry the same print, so one face stands for both. */
function marukawaFace(preset: MarukawaPreset) {
  const design = MARUKAWA_PRESETS.export[preset]
  return defineFace({
    title: `The MARUKAWA ${preset} bubble gum box`,
    reference: `packages/marukawa-${preset}-front.png`,
    component: MarukawaBox,
    props: { preset, version: 'export' },
    texts: design.label ? { ...design.texts, label: design.label } : design.texts,
    textProps: spreadTexts,
    small: { illustration: smallImage(`packages/marukawa-export-${preset}`) },
  })
}

export const MARUKAWA_FACES = {
  melon: { front: marukawaFace('melon') },
  strawberry: { front: marukawaFace('strawberry') },
  orange: { front: marukawaFace('orange') },
} satisfies Record<MarukawaPreset, Record<'front', DifferenceFace>>

/** The cover of the Suzuno brochure, for SuzunoFinancial. */
export const FINANCIAL_FACE = defineFace({
  title: 'The cover of the Suzuno brochure',
  reference: 'cover-lit.png',
  component: SuzunoCover,
  texts: COVER_TEXTS,
  textProps: passTexts,
})

export type BagItem = keyof typeof BAG_FACES
export type WrapperItem = keyof typeof WRAPPER_FACES
export type MarukawaItem = keyof typeof MARUKAWA_FACES

export class UnknownFaceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnknownFaceError'
  }
}

export class UnknownTextError extends Error {
  constructor(path: string, known: string[]) {
    super(`The face has no text ${path}. Its texts at this level are: ${known.join(', ')}`)
    this.name = 'UnknownTextError'
  }
}

/** A value of a markdown attribute that a component cannot use, such as opacity="half". */
export class InvalidOptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidOptionError'
  }
}

/** A face of a package, for example packageFace('SuzunoBag', BAG_FACES, 'salt-lemon', 'front'). */
export function packageFace(component: string, faces: Record<string, Partial<Record<Side, DifferenceFace>>>, item: string, side: string): DifferenceFace {
  const sides = faces[item]
  if (!sides)
    throw new UnknownFaceError(`${component} has no item ${item}. Its items are: ${Object.keys(faces).join(', ')}`)
  const found = sides[side as Side]
  if (!found)
    throw new UnknownFaceError(`${component} ${item} has no face ${side}. Its faces are: ${Object.keys(sides).join(', ')}`)
  return found
}

// A markdown tag gives an attribute without a colon as a string, so the
// options also take their values as text
const OFF_VALUES = ['false', 'off', '0']
const OPACITY = { difference: 100, overlay: 50 }

/** False for difference="false", "off" or "0", and for :difference="false". */
export function differenceOption(value: boolean | string) {
  return !OFF_VALUES.includes(String(value).trim().toLowerCase())
}

/** The opacity of the recreation from 0 to 1, from a percentage such as 30, "30" or "30%". Without a value: full in difference mode, half in overlay mode. */
export function opacityOption(value: number | string | undefined, difference: boolean) {
  if (value === undefined || String(value).trim() === '')
    return (difference ? OPACITY.difference : OPACITY.overlay) / 100
  const percent = Number.parseFloat(String(value))
  if (!(percent >= 0 && percent <= 100))
    throw new InvalidOptionError(`The opacity is a percentage from 0 to 100, not ${value}`)
  return percent / 100
}

/**
 * The texts option: a missing value keeps the texts of the print, an object
 * replaces some of them, and a blank string such as texts="" removes them all.
 */
export function textsOption(value: Record<string, unknown> | string | undefined) {
  if (typeof value !== 'string')
    return { blank: false, given: value }
  if (value.trim())
    throw new InvalidOptionError(`texts takes an object with a colon, such as :texts="{ name: '...' }", or texts="" for no texts, not texts="${value}"`)
  return { blank: true, given: undefined }
}

// The characters that the recreations draw besides their texts: the space,
// the digits of the amounts, the plus of the citric acid badge, the R of the
// registered mark and the プラ of a recycling mark without a material
const DRAWN_GLYPHS = ' 0123456789+Rプラ'

/** The characters of the texts of a face, for the font subsets of its recreation. */
export function textGlyphs(texts: unknown) {
  const glyphs = new Set(DRAWN_GLYPHS)
  const visit = (value: unknown) => {
    if (typeof value === 'string' || typeof value === 'number') {
      for (const character of String(value))
        glyphs.add(character)
    }
    else if (value && typeof value === 'object') {
      Object.values(value).forEach(visit)
    }
  }
  visit(texts)
  return [...glyphs].join('')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The texts of a face with the given texts in place of the defaults. Objects
 * merge key by key; a string, a number or a list replaces the default as a
 * whole. A key that the defaults do not have is an error, so that a typing
 * error does not go unseen.
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
