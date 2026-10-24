// The faces that SuzunoBag, SuzunoWrapper, SuzunoMarukawa, SuzunoFinancial
// and SuzunoRamune lay over their reference images, with the texts of each
// face.
// src/lib/suzuno/README.md lists the items, the faces and their texts.
import type { Component } from 'vue'
import type { FrameImage } from '~/lib/difference'
import SuzunoCover from '~/components/suzuno/SuzunoCover.vue'
import AlmondCaramelBag from '~/components/suzuno/packages/AlmondCaramelBag.vue'
import AlmondCaramelPiece from '~/components/suzuno/packages/AlmondCaramelPiece.vue'
import HokkaidoMilkBag from '~/components/suzuno/packages/HokkaidoMilkBag.vue'
import HokkaidoMilkCandy from '~/components/suzuno/packages/HokkaidoMilkCandy.vue'
import MarukawaBox from '~/components/suzuno/packages/MarukawaBox.vue'
import RamuneHeader from '~/components/suzuno/packages/RamuneHeader.vue'
import RamunePacket from '~/components/suzuno/packages/RamunePacket.vue'
import SaltLemonFront from '~/components/suzuno/packages/SaltLemonFront.vue'
import { COVER_SHEET, COVER_TEXTS } from '~/lib/suzuno/cover-typography'
import { ALMOND_CARAMEL_PIECE_TEXTS, ALMOND_CARAMEL_TEXTS } from '~/lib/suzuno/packages/almond-caramel'
import { HOKKAIDO_MILK_BAG_TEXTS, HOKKAIDO_MILK_CANDY_TEXTS } from '~/lib/suzuno/packages/hokkaido-milk'
import type { MarukawaPreset } from '~/lib/suzuno/packages/marukawa'
import { MARUKAWA_TEXTS } from '~/lib/suzuno/packages/marukawa'
import type { RamuneFlavour, RamuneItem, RamunePose } from '~/lib/suzuno/packages/ramune'
import { RAMUNE_FLAVOURS, RAMUNE_HEADER_TEXTS, RAMUNE_PACKET_TEXTS } from '~/lib/suzuno/packages/ramune'
import { SALT_LEMON_FRONT, SALT_LEMON_TEXTS } from '~/lib/suzuno/packages/salt-lemon'

export interface DifferenceFace {
  /** What the face shows, the alternative text of its reference image. */
  title: string
  /** The reference image, in the size of the recreation. */
  reference: FrameImage
  /** The recreation. It fills the width of its box and shows the texts of its prop `texts`. */
  component: Component
  /** The props that choose the face, such as its side. */
  props?: Record<string, unknown>
  /** The texts of the print. */
  texts: object
  /**
   * The texts for blank texts: they turn lettering that the recreation draws
   * as shapes, such as the traced 北海道, into text, which blank texts hide.
   */
  blank?: object
  /** Props with smaller images, for a face narrower than SMALL_FACE_WIDTH. */
  small?: Record<string, unknown>
}

/** The width in CSS pixels below which a face takes the small images of its recreation. */
export const SMALL_FACE_WIDTH = 160

// The reference images, the photos of the Suzuno project. The faces show WebP
// copies: small copies for a candy in a line of text, and the widths of the
// markdown images (scripts/markdown-images.ts). An image keeps its width when
// it is narrower. A lower quality shows as noise in the difference.
const REFERENCES = import.meta.glob<{ src: string, srcset?: string, w: number, h: number }>(
  '/src/assets/suzuno/reference/**/*.png',
  { eager: true, query: { w: '160;320;660;990;1320', format: 'webp', quality: '90', as: 'img' }, import: 'default' },
)

/** An image in src/assets/suzuno/reference/, for example reference('cover-lit.png'). */
function reference(name: string): FrameImage {
  const copies = REFERENCES[`/src/assets/suzuno/reference/${name}`]
  if (!copies)
    throw new Error(`src/assets/suzuno/reference/${name} does not exist`)
  return { src: copies.src, srcset: copies.srcset ?? copies.src, width: copies.w, height: copies.h }
}

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

export type Side = 'front' | 'back'

/** The big bags, for SuzunoBag. */
export const BAG_FACES = {
  'almond-caramel': {
    front: {
      title: 'The front of the Almond Caramel bag',
      reference: reference('packages/almond-caramel-front.png'),
      component: AlmondCaramelBag,
      props: { side: 'front' },
      texts: ALMOND_CARAMEL_TEXTS,
      small: { windowImage: smallImage('almond-caramel-window-front') },
    },
    back: {
      title: 'The back of the Almond Caramel bag',
      reference: reference('packages/almond-caramel-back.png'),
      component: AlmondCaramelBag,
      props: { side: 'back' },
      texts: ALMOND_CARAMEL_TEXTS,
      small: { windowImage: smallImage('almond-caramel-window-back') },
    },
  },
  'hokkaido-milk': {
    front: {
      title: 'The front of the Hokkaido milk candy bag',
      reference: reference('packages/hokkaido-milk-front.png'),
      component: HokkaidoMilkBag,
      props: { face: 'front' },
      texts: HOKKAIDO_MILK_BAG_TEXTS,
      blank: { title: '' },
      small: { illustration: smallImage('packages/hokkaido-milk-cow'), landscape: smallImage('packages/hokkaido-milk-farm') },
    },
    back: {
      title: 'The back of the Hokkaido milk candy bag',
      reference: reference('packages/hokkaido-milk-back.png'),
      component: HokkaidoMilkBag,
      props: { face: 'back' },
      texts: HOKKAIDO_MILK_BAG_TEXTS,
      blank: { title: '' },
    },
  },
  'salt-lemon': {
    front: {
      title: 'The front of the salt lemon candy bag',
      // The recreation has the size of the flat artwork of the maker, and the photo stretches to it
      reference: { ...reference('packages/salt-lemon-front.png'), ...SALT_LEMON_FRONT },
      component: SaltLemonFront,
      texts: SALT_LEMON_TEXTS,
      blank: { logo: { name: '' } },
      small: { photo: smallImage('salt-lemon-photo') },
    },
  },
} satisfies Record<string, Partial<Record<Side, DifferenceFace>>>

/** The wrapped candies, for SuzunoWrapper. */
export const WRAPPER_FACES = {
  'almond-caramel': {
    front: {
      title: 'The front of a wrapped almond caramel',
      reference: reference('packages/almond-caramel-piece-front.png'),
      component: AlmondCaramelPiece,
      props: { side: 'front' },
      texts: ALMOND_CARAMEL_PIECE_TEXTS,
    },
    back: {
      title: 'The back of a wrapped almond caramel',
      reference: reference('packages/almond-caramel-piece-back.png'),
      component: AlmondCaramelPiece,
      props: { side: 'back' },
      texts: ALMOND_CARAMEL_PIECE_TEXTS,
    },
  },
  'hokkaido-milk': {
    front: {
      title: 'The front of a wrapped Hokkaido milk candy',
      reference: reference('packages/hokkaido-milk-piece-front-full.png'),
      component: HokkaidoMilkCandy,
      // The cow is small on the wrapper at every size
      props: { face: 'front', illustration: smallImage('packages/hokkaido-milk-cow') },
      texts: HOKKAIDO_MILK_CANDY_TEXTS,
    },
    back: {
      title: 'The back of a wrapped Hokkaido milk candy',
      reference: reference('packages/hokkaido-milk-piece-back-full.png'),
      component: HokkaidoMilkCandy,
      props: { face: 'back' },
      texts: HOKKAIDO_MILK_CANDY_TEXTS,
    },
  },
} satisfies Record<string, Record<Side, DifferenceFace>>

/** A MARUKAWA box, for SuzunoMarukawa. The front and the back carry the same print, so one face stands for both. */
function marukawaFace(preset: MarukawaPreset): DifferenceFace {
  return {
    title: `The MARUKAWA ${preset} bubble gum box`,
    reference: reference(`packages/marukawa-${preset}-front.png`),
    component: MarukawaBox,
    props: { preset },
    texts: MARUKAWA_TEXTS[preset],
    small: { illustration: smallImage(`packages/marukawa-export-${preset}`) },
  }
}

export const MARUKAWA_FACES = {
  melon: { front: marukawaFace('melon') },
  strawberry: { front: marukawaFace('strawberry') },
  orange: { front: marukawaFace('orange') },
} satisfies Record<MarukawaPreset, Record<'front', DifferenceFace>>

/** The cover of the Suzuno brochure, for SuzunoFinancial. */
export const FINANCIAL_FACE: DifferenceFace = {
  title: 'The cover of the Suzuno brochure',
  // The largest copy of the screenshot is narrower than the sheet
  reference: { ...reference('cover-lit.png'), ...COVER_SHEET },
  component: SuzunoCover,
  texts: COVER_TEXTS,
}

/**
 * A face of a piece of the あべっ子ラムネ strip, for SuzunoRamune. The fronts
 * of the first pose and of the header card are fitted to the render of the
 * maker, the other faces to the photos.
 */
function ramuneFace(item: RamuneItem, side: Side, pose: RamunePose = 1): DifferenceFace {
  if (item === 'header') {
    return {
      title: `The ${side} of the header card of the あべっ子ラムネ strip`,
      reference: reference(`packages/ramune-header-${side}.png`),
      component: RamuneHeader,
      props: { side },
      texts: RAMUNE_HEADER_TEXTS,
    }
  }
  const name = side === 'back' ? 'back' : pose === 2 ? 'front-2' : 'front'
  return {
    title: `The ${side} of a ${item} packet of あべっ子ラムネ${side === 'front' ? `, pose ${pose}` : ''}`,
    reference: reference(`packages/ramune-${item}-${name}.png`),
    component: RamunePacket,
    props: { flavour: item, side, pose },
    texts: RAMUNE_PACKET_TEXTS[item],
  }
}

/** The pieces of the あべっ子ラムネ strip, for SuzunoRamune: the faces of the first pose. */
export const RAMUNE_FACES = Object.fromEntries((['header', ...RAMUNE_FLAVOURS] as RamuneItem[]).map(item => [item, {
  front: ramuneFace(item, 'front'),
  back: ramuneFace(item, 'back'),
}])) as Record<RamuneItem, Record<Side, DifferenceFace>>

/** The front of a packet in the second pose, for SuzunoRamune. */
export const RAMUNE_SECOND_POSE = Object.fromEntries(RAMUNE_FLAVOURS.map(flavour => [flavour, ramuneFace(flavour, 'front', 2)])) as Record<RamuneFlavour, DifferenceFace>

export type BagItem = keyof typeof BAG_FACES
export type WrapperItem = keyof typeof WRAPPER_FACES
export type MarukawaItem = keyof typeof MARUKAWA_FACES

export class UnknownFaceError extends Error {
  name = 'UnknownFaceError'
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

// The characters that the recreations draw besides their texts: the space,
// the digits of the amounts, the plus of the citric acid badge and the プラ
// of a recycling mark without a material
const DRAWN_GLYPHS = ' 0123456789+プラ'

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
