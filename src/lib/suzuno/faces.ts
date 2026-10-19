// The faces that SuzunoDifference.vue lays over their reference images, with
// the texts of each face. src/lib/suzuno/README.md lists the items, the faces
// and their texts.
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

export type FaceName = 'front' | 'back' | 'wrapper-front' | 'wrapper-back'

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

function marukawaFace(preset: MarukawaPreset) {
  const design = MARUKAWA_PRESETS.export[preset]
  return {
    front: defineFace({
      title: `The MARUKAWA ${preset} bubble gum box`,
      reference: `packages/marukawa-${preset}-front.png`,
      component: MarukawaBox,
      props: { preset, version: 'export' },
      texts: design.label ? { ...design.texts, label: design.label } : design.texts,
      textProps: spreadTexts,
    }),
  }
}

export const DIFFERENCE_FACES = {
  'cover': {
    front: defineFace({
      title: 'The cover of the Suzuno brochure',
      reference: 'cover-lit.png',
      component: SuzunoCover,
      texts: COVER_TEXTS,
      textProps: passTexts,
    }),
  },
  'almond-caramel': {
    'front': defineFace({
      title: 'The front of the Almond Caramel bag',
      reference: 'packages/almond-caramel-front.png',
      component: AlmondCaramelBag,
      props: { side: 'front' },
      texts: ALMOND_CARAMEL_TEXTS,
      textProps: passTexts,
    }),
    'back': defineFace({
      title: 'The back of the Almond Caramel bag',
      reference: 'packages/almond-caramel-back.png',
      component: AlmondCaramelBag,
      props: { side: 'back' },
      texts: ALMOND_CARAMEL_TEXTS,
      textProps: passTexts,
    }),
    'wrapper-front': defineFace({
      title: 'The front of a wrapped almond caramel',
      reference: 'packages/almond-caramel-piece-front.png',
      component: AlmondCaramelPiece,
      props: { side: 'front' },
      texts: ALMOND_CARAMEL_PIECE_TEXTS,
      textProps: passTexts,
    }),
    'wrapper-back': defineFace({
      title: 'The back of a wrapped almond caramel',
      reference: 'packages/almond-caramel-piece-back.png',
      component: AlmondCaramelPiece,
      props: { side: 'back' },
      texts: ALMOND_CARAMEL_PIECE_TEXTS,
      textProps: passTexts,
    }),
  },
  'hokkaido-milk': {
    'front': defineFace({
      title: 'The front of the Hokkaido milk candy bag',
      reference: 'packages/hokkaido-milk-front.png',
      component: HokkaidoMilkBag,
      props: { face: 'front' },
      texts: HOKKAIDO_MILK_BAG_TEXTS,
      textProps: spreadTexts,
    }),
    'back': defineFace({
      title: 'The back of the Hokkaido milk candy bag',
      reference: 'packages/hokkaido-milk-back.png',
      component: HokkaidoMilkBag,
      props: { face: 'back' },
      texts: HOKKAIDO_MILK_BAG_TEXTS,
      textProps: spreadTexts,
    }),
    'wrapper-front': defineFace({
      title: 'The front of a wrapped Hokkaido milk candy',
      reference: 'packages/hokkaido-milk-piece-front-full.png',
      component: HokkaidoMilkCandy,
      props: { face: 'front' },
      texts: HOKKAIDO_MILK_CANDY_TEXTS,
      textProps: spreadTexts,
    }),
    'wrapper-back': defineFace({
      title: 'The back of a wrapped Hokkaido milk candy',
      reference: 'packages/hokkaido-milk-piece-back-full.png',
      component: HokkaidoMilkCandy,
      props: { face: 'back' },
      texts: HOKKAIDO_MILK_CANDY_TEXTS,
      textProps: spreadTexts,
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
    }),
  },
  'marukawa-melon': marukawaFace('melon'),
  'marukawa-strawberry': marukawaFace('strawberry'),
  'marukawa-orange': marukawaFace('orange'),
} satisfies Record<string, Partial<Record<FaceName, DifferenceFace>>>

export type DifferenceItem = keyof typeof DIFFERENCE_FACES

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

/** A face of an item, for example differenceFace('almond-caramel', 'wrapper-front'). */
export function differenceFace(item: string, face: string): DifferenceFace {
  const faces: Partial<Record<string, DifferenceFace>> | undefined = DIFFERENCE_FACES[item as DifferenceItem]
  if (!faces)
    throw new UnknownFaceError(`There is no item ${item}. The items are: ${Object.keys(DIFFERENCE_FACES).join(', ')}`)
  const found = faces[face]
  if (!found)
    throw new UnknownFaceError(`The item ${item} has no face ${face}. Its faces are: ${Object.keys(faces).join(', ')}`)
  return found
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
