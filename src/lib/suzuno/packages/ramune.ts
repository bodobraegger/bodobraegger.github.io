// The strip of あべっ子ラムネ (10連あべっ子ラムネ, 安部製菓, 4 g x 10, JAN
// 4901262810108): a yellow header card and ten heat-sealed packets of
// ramune tablets, in five flavours that repeat. The first five packets show
// their character in one pose, the last five in another. All places are in
// the pixels of one piece of the strip, seal to seal, upright (RAMUNE_FACE),
// the print of a packet before its offsets. ramune-fit.json holds the places
// and colours that a fit by pixel difference found; the fit scripts are not
// part of bbo.do.
import grape1 from '~/assets/suzuno/packages/ramune-grape-1.webp'
import grape2 from '~/assets/suzuno/packages/ramune-grape-2.webp'
import muscat1 from '~/assets/suzuno/packages/ramune-muscat-1.webp'
import muscat2 from '~/assets/suzuno/packages/ramune-muscat-2.webp'
import orange1 from '~/assets/suzuno/packages/ramune-orange-1.webp'
import orange2 from '~/assets/suzuno/packages/ramune-orange-2.webp'
import peach1 from '~/assets/suzuno/packages/ramune-peach-1.webp'
import peach2 from '~/assets/suzuno/packages/ramune-peach-2.webp'
import strawberry1 from '~/assets/suzuno/packages/ramune-strawberry-1.webp'
import strawberry2 from '~/assets/suzuno/packages/ramune-strawberry-2.webp'
import type { Side } from '~/lib/suzuno/faces'
import type { Box } from '~/lib/suzuno/packages/almond-caramel'
import FITTED from '~/lib/suzuno/packages/ramune-fit.json'
import { useStylesheets } from '~/lib/suzuno/packages/lettering'

export { default as RAMUNE_ALLERGENS } from '~/assets/suzuno/packages/ramune-allergens.webp'
export { default as RAMUNE_CHARACTERS } from '~/assets/suzuno/packages/ramune-header-characters.webp'

/** One piece of the strip, from the middle of a seal to the middle of the next. */
export const RAMUNE_FACE = { width: 300, height: 370 }

export const RAMUNE_FLAVOURS = ['strawberry', 'muscat', 'peach', 'grape', 'orange'] as const
export type RamuneFlavour = typeof RAMUNE_FLAVOURS[number]
export type RamuneItem = 'header' | RamuneFlavour
/** The pose of the character: 1 on the first five packets of the strip, 2 on the last five. */
export type RamunePose = 1 | 2
export const RAMUNE_POSES: RamunePose[] = [1, 2]

/** The number of packets of the strip, after the header card. */
export const RAMUNE_PACKET_COUNT = 10

export const { seals: RAMUNE_SEALS, front: FRONT_LAYOUT, back: BACK_LAYOUT, header: HEADER_LAYOUT, headerBack: HEADER_BACK_LAYOUT, colours: RAMUNE_COLOURS } = FITTED

const ART: Record<RamuneFlavour, Record<RamunePose, string>> = {
  strawberry: { 1: strawberry1, 2: strawberry2 },
  muscat: { 1: muscat1, 2: muscat2 },
  peach: { 1: peach1, 2: peach2 },
  grape: { 1: grape1, 2: grape2 },
  orange: { 1: orange1, 2: orange2 },
}

/** The character and the fruit of a packet, an image cut from the print, with its box. */
export function ramuneArt(flavour: RamuneFlavour, pose: RamunePose) {
  return { href: ART[flavour][pose], ...(FITTED.art[`${flavour}-${pose}`] as Box) }
}

/**
 * The offsets of the window and of the lettering of a packet from their
 * places in the layout, as on the packets of the photos. On the front, the
 * lettering moves down the strip by about 2 pixels per packet, because the
 * print runs a little longer than the seals. The back of a packet has the
 * same offsets in both poses.
 */
export function printOffsets(flavour: RamuneFlavour, side: Side, pose: RamunePose) {
  return FITTED.offsets[`${flavour}-${side === 'back' ? 'back' : pose}`] as { window: [number, number], print: [number, number] }
}

/**
 * Free stand-ins for the faces of the print. The brand lettering and the
 * allergen line are in a heavy rounded pop gothic with a white halo, perhaps
 * a phototype face of the 1980s, not identified; M PLUS Rounded 1c (OFL) at
 * its heaviest weight is the nearest free match of three candidates. The
 * small print is a plain gothic like Shin Go, here Noto Sans JP (OFL).
 */
export const RAMUNE_FONTS = {
  display: { family: '\'M PLUS Rounded 1c\', sans-serif', weight: 900 },
  label: { family: '\'M PLUS Rounded 1c\', sans-serif', weight: 800 },
  gothic: { family: '\'Noto Sans JP\', sans-serif', weight: 400 },
  gothicBold: { family: '\'Noto Sans JP\', sans-serif', weight: 700 },
}

export const RAMUNE_STYLESHEET = 'https://fonts.googleapis.com/css2?display=block&family=M+PLUS+Rounded+1c:wght@800;900&family=Noto+Sans+JP:wght@400;700'

/** Loads the fonts of RAMUNE_FONTS, once for all parts on a page. */
export function useRamuneFonts() {
  useStylesheets(RAMUNE_STYLESHEET)
}

const HALF_WIDTH = 0.6

/** The width of a text in em: a full width for kana and kanji, less for Latin letters and digits. */
export function textWidth(text: string) {
  let width = 0
  for (const character of text)
    width += character.charCodeAt(0) < 0x2E80 ? HALF_WIDTH : 1
  return width
}

/** The texts of the front and the back of a packet. */
export interface PacketTexts {
  /** The brand lettering, one colour per character; on the back in two lines. */
  logo: string
  flavour: string
  /** The smaller character after the flavour. */
  suffix: string
  juice: string
  /** The two lines of small print at the foot of the front. */
  note: string[]
  back: {
    logo: string[]
    kind: string
    nutritionTitle: string
    nutrition: { heading: string, value: string }[]
    /** The columns of the box of the label, from right to left. */
    details: string[]
    notice: string[]
  }
}

// The back of a packet is too small and too blurred in the photo to read
// every line. Its texts follow an older strip of the maker (2015), with the
// ingredients of the shop data of 2025; the nutrition values are plausible.
const PACKET_TEXTS: PacketTexts = {
  logo: 'あべっ子ラムネ',
  flavour: '',
  suffix: '味',
  juice: '無果汁',
  note: ['写真は', 'イメージです'],
  back: {
    logo: ['あべっ子', 'ラムネ'],
    kind: 'ラムネ菓子',
    nutritionTitle: '栄養成分表示(1袋4g当り)',
    nutrition: [
      { heading: 'エネルギー', value: '15kcal' },
      { heading: 'たんぱく質', value: '0g' },
      { heading: '脂質', value: '0g' },
      { heading: '炭水化物', value: '3.7g' },
      { heading: '食塩相当量', value: '0g' },
    ],
    details: [
      '名称/菓子',
      '原材料名/ブドウ糖(国内製造)、コーンスターチ、',
      '澱粉分解物/酸味料、香料、着色料',
      '内容量/4g',
      '保存方法/直射日光や高温多湿の',
      '場所を避けて保存して下さい。',
      '製造者/安部製菓株式会社',
      '名古屋市西区則武新町2-2-19',
    ],
    notice: [
      '万一、本品に不都合な点がありましたら',
      'お取替え致しますので、現品を直接当社',
      'までお送り下さい。開封後はお早めに',
      'お召し上がり下さい。',
    ],
  },
}

const FLAVOUR_NAMES: Record<RamuneFlavour, string> = {
  strawberry: 'イチゴ',
  muscat: 'マスカット',
  peach: 'ピーチ',
  grape: 'グレープ',
  orange: 'オレンジ',
}

/** The texts of the print of each packet. */
export const RAMUNE_PACKET_TEXTS = Object.fromEntries(RAMUNE_FLAVOURS.map(flavour => [flavour, { ...PACKET_TEXTS, flavour: FLAVOUR_NAMES[flavour] }])) as Record<RamuneFlavour, PacketTexts>

/** The texts of the front and the back of the header card. */
export const RAMUNE_HEADER_TEXTS = {
  logo: ['あべっ子', 'ラムネ'],
  /** The speech bubble: a small start, a larger middle and a small end. */
  slogan: ['主原料は', 'ぶどう糖', 'だヨ!!'],
  /** The names under the drawings of the eight allergens. */
  allergens: ['たまご', '乳成分', '小麦', 'そば', '落花生', 'えび', 'かに', 'くるみ'],
  warning: ['アレルゲン', '28品目不使用'],
  back: {
    caution: ['http://www.abeseika.co.jp', '【注意事項】', '開封後はお早めにお召し上がり下さい。'],
    recycling: ['PP', 'ゴミに出す時は市町村の', '区分に従って下さい。'],
    details: [
      '名称/菓子 原材料名/ブドウ糖(国内製造)、',
      'コーンスターチ、澱粉分解物/酸味料、',
      '香料、着色料(アントシアニン、クチナシ、',
      'アナトー、スピルリナ青) 内容量/4g×10連',
      '賞味期限/裏面上部に記載 保存方法/直射',
      '日光や高温多湿の場所を避けて保存して',
      '下さい。製造者 安部製菓株式会社',
      '名古屋市西区則武新町2-2-19',
    ],
    barcode: '4901262810108',
    notice: ['万一、本品に不都合な点が', 'ありましたらお取替え致し', 'ますので、現品を直接当', '社までお送り下さい。'],
    date: '2027.08.10',
  },
}

export type RamuneHeaderTexts = typeof RAMUNE_HEADER_TEXTS

/** The texts of a strip: the header card and the packets of each flavour. */
export const RAMUNE_STRIP_TEXTS = { header: RAMUNE_HEADER_TEXTS, packets: RAMUNE_PACKET_TEXTS }
export type RamuneStripTexts = typeof RAMUNE_STRIP_TEXTS
