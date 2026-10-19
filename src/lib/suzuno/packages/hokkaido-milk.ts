// The RIBON bag 北海道 ミルクソフトキャンデー (株式会社リボン, 49 g) and its wrapped
// candy: the fonts, the default texts and the fitted layout of the faces.
// All places are in the pixels of the faces of the photos,
// reference/packages/hokkaido-milk-<face>.png. tools/fits/packages/hokkaido-milk.mjs
// fits the layout against them and writes hokkaido-milk-layout.json.
import { useHead } from '@unhead/vue'
import layout from './hokkaido-milk-layout.json'
import can from '~/assets/suzuno/packages/hokkaido-milk-can.webp'
import cow from '~/assets/suzuno/packages/hokkaido-milk-cow.webp'
import farm from '~/assets/suzuno/packages/hokkaido-milk-farm.webp'
import mascot from '~/assets/suzuno/packages/hokkaido-milk-mascot.webp'
import type { BandLayout, TableRow } from '~/lib/suzuno/packages/almond-caramel'

export const HOKKAIDO_MILK_FACES = {
  front: { width: 526, height: 733 },
  back: { width: 518, height: 712 },
  candyFront: { width: 236, height: 168 },
  candyBack: { width: 256, height: 156 },
}

export type HokkaidoMilkFace = keyof typeof HOKKAIDO_MILK_FACES

/**
 * Free stand-ins for the faces of the print. The kana line, the badges and the
 * stamp text are in a heavy mincho such as リュウミン H; Noto Serif JP Black
 * (OFL) scores best of the free faces on the kana. "Hokkaido Soft", "120mg"
 * and the stamp lines are in a bold Times; Tinos (Apache 2.0) has its
 * metrics. The small print of the back is a plain gothic like Noto Sans JP
 * (OFL). The RIBON logo has flared capitals; Marcellus (OFL) is close.
 * The title 北海道 is custom lettering, so it is a traced path (HokkaidoTitle.vue).
 */
export const HOKKAIDO_MILK_FONTS = {
  mincho: '\'Noto Serif JP\', \'Hiragino Mincho ProN\', serif',
  times: 'Tinos, \'Times New Roman\', Times, serif',
  gothic: '\'Noto Sans JP\', \'Hiragino Sans\', sans-serif',
  logo: 'Marcellus, \'Optima\', serif',
  stylesheet: 'https://fonts.googleapis.com/css2?family=Marcellus&family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@900&family=Tinos:wght@700&display=block',
}

/** Loads the fonts of the bag and the candy, once for a page. */
export function useHokkaidoMilkFonts() {
  useHead({ link: [{ key: 'hokkaido-milk-fonts', rel: 'stylesheet', href: HOKKAIDO_MILK_FONTS.stylesheet }] })
}

/** The place of a part in face pixels; the part is drawn around its own origin. */
export interface PartPlace {
  x: number
  y: number
  scale: number
  /** The horizontal scale relative to the vertical one; negative mirrors the part. */
  squeeze?: number
  /** Degrees, clockwise. */
  rotate?: number
}

/** The transform of a part. */
export function placePart({ x, y, scale, squeeze = 1, rotate = 0 }: PartPlace) {
  return `translate(${x} ${y}) rotate(${rotate}) scale(${scale * squeeze} ${scale})`
}

/**
 * The crimp ridges of a heat seal as the lines of a SealBand: each ridge is a
 * light line above a dark one. weight is the width of a line relative to the
 * spacing of the ridges.
 */
export function sealRidges(depth: number, ridges: number, weight = 0.22): BandLayout<string> {
  const spacing = depth / ridges
  const width = spacing * weight
  return {
    top: 0,
    bottom: depth,
    lines: Array.from({ length: ridges }, (_, index) => (index + 0.5) * spacing).flatMap(y => [
      { y: y - width / 2, width, color: 'seal-light' },
      { y: y + width / 2, width, color: 'seal-dark' },
    ]),
  }
}

export interface FaceLayout {
  parts: Record<string, PartPlace>
  /** The letter spacing of lettering parts, in their own units. */
  spacings?: Record<string, number>
  /** Colours by name; <part>:<name> names the colour of one part. */
  inks: Record<string, string>
}

export const HOKKAIDO_MILK_LAYOUT = layout as Record<HokkaidoMilkFace, FaceLayout>

/** A line of a badge: its text and its cap height relative to the badge. */
export interface BadgeLine {
  text: string
  size?: number
  font?: 'mincho' | 'times'
}

export const HOKKAIDO_MILK_TEXTS = {
  brand: 'RIBON',
  title: '北海道',
  subtitle: 'ミルクソフトキャンデー',
  tagline: 'Hokkaido Soft',
  stamp: { top: 'Rich Milk', middle: '濃厚ミルク', middleSuffix: '味', bottom: 'flavor' },
  badges: [
    [{ text: 'オリゴ糖配合!' }],
    [{ text: '北海道産' }, { text: '練 乳・バター' }, { text: '生クリーム使用' }],
    [{ text: 'カルシウム強化!' }, { text: '1袋あたり', size: 0.6 }, { text: '120mg', size: 1.15, font: 'times' }],
  ] as BadgeLine[][],
}

/**
 * The texts of the back. The import sticker of the photo covers the middle;
 * the hidden texts follow the Daiso artwork of the 54 g bag and the back of
 * the 110 g bag, with the weight of the photo.
 */
export const HOKKAIDO_MILK_BACK_TEXTS = {
  opening: ['▼開けにくい場合はタテ方向にお開け', 'ください。'],
  bestBefore: { label: '賞味期限', date: '2027年04月/SB3' },
  calciumHeading: 'カルシウム強化',
  calciumText: ['カルシウムは体の基礎となる', '骨や歯をつくる栄養素です。不足しない', 'ように毎日の食事から摂りましょう。'],
  nutrition: {
    heading: '栄養成分表示',
    serving: '1粒(約6g)あたり',
    rows: [
      { heading: '熱量', lines: ['27 kcal'] },
      { heading: 'たんぱく質', lines: ['0.20 g'] },
      { heading: '脂質', lines: ['0.76 g'] },
      { heading: '炭水化物', lines: ['4.8 g'] },
      { heading: '食塩相当量', lines: ['0.0081 g'] },
      { heading: 'カルシウム', lines: ['14 mg'] },
    ] as TableRow[],
    note: 'サンプル品による分析値',
  },
  afterOpening: '開封後はお早めにお召し上がりください。',
  /** The label of the product: a heading, then rows of a name and the lines of its value. */
  label: {
    heading: '商品名:ミルクソフトキャンデー',
    /** Then a row with the weight of the bag, then rowsAfterWeight. */
    rows: [
      { heading: '名称', lines: ['キャンデー'] },
      { heading: '原材料名', lines: ['水飴(国内製造)、乳加工品', '(砂糖、生乳、植物油脂)、砂', '糖、ショートニング(大豆を含', 'む)、イソマルトオリゴ糖、加', '糖練乳、クリーム、脱脂粉', '乳、植物たん白(小麦を含', 'む)、ミルクカルシウム、バ', 'ター、植物油脂、ゼラチン/', 'ソルビトール、乳化剤、香料'] },
    ] as TableRow[],
    /** The name of the weight row, and the text after the weight. */
    weightRow: ['内容量', '(個包装込み)'],
    rowsAfterWeight: [
      { heading: '賞味期限', lines: ['枠外上部に記載'] },
      { heading: '保存方法', lines: ['直射日光、高温多湿をお避け', 'ください。'] },
      { heading: '製造者', lines: ['株式会社リボン', '愛知県小牧市小木1丁目48'] },
    ] as TableRow[],
  },
  notice: ['万一製品に不都合がございましたらお買', '上げの月日・店名をご記入の上、包装ごと', '現品をお客様相談室あてにお送りください。', '代品と郵送料をお送りします。', '尚、完全自動包装の為、まれに空袋(中身', 'がカラの個包装)が混入することがござい', 'ますが、計量につきましては、この様な場', '合も加味し、厳正に致しておりますので、', '表示の内容量には変わりありません。何卒、', 'ご容赦ください。'],
  address: ['〒485-0058 愛知県小牧市小木1丁目48', '株式会社リボン お客様相談室', '0120-898-066', '受付時間', '9:00~17:00(12:00~13:00を除く)土日祝日を除く'],
  illustration: 'イラストはイメージです',
  barcode: '4903316443409',
  homepage: ['リボンホームページ', 'http://www.ribon-jp.com'],
  recycling: { mark: 'プラ', parts: ['外 袋', '個包装'], text: ['ごみに出すときは市区町村の区分に', 'したがってください。'] },
}

export type HokkaidoMilkBackTexts = typeof HOKKAIDO_MILK_BACK_TEXTS

/** Everything a user can replace on the bag, front and back. */
export interface HokkaidoMilkBagContent {
  brand: string
  title: string
  subtitle: string
  tagline: string
  stamp: typeof HOKKAIDO_MILK_TEXTS.stamp
  /** The three claims across the middle of the front, each a list of lines. */
  badges: BadgeLine[][]
  /** The net weight, on the label of the back. */
  weight: string
  /** Image URLs: the cow, the farm behind it, the can behind each claim, the mascot of the back. */
  illustration: string
  landscape: string
  can: string
  mascot: string
  back: HokkaidoMilkBackTexts
}

export const HOKKAIDO_MILK_CONTENT: HokkaidoMilkBagContent = {
  ...HOKKAIDO_MILK_TEXTS,
  weight: '49g',
  illustration: cow,
  landscape: farm,
  can,
  mascot,
  back: HOKKAIDO_MILK_BACK_TEXTS,
}

/** The works of other authors in the faces, from assets/SOURCES.md. */
export const HOKKAIDO_MILK_CREDITS = [
  { work: 'Holstein-Fresian cow, plate IV (Gray Lith. Co., N.Y.)', licence: 'public domain', url: 'https://commons.wikimedia.org/wiki/File:HOLSTEIN-FRESIAN_COW_(22899914244).jpg' },
  { work: 'Farm', author: 'Hiroshi Miyazaki', licence: 'CC BY 2.0', url: 'https://www.flickr.com/photos/7163280@N06/3616435204' },
  { work: 'Cow and milk churn, Newtownmanor', author: 'Oliver Dixon', licence: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Cow_and_milk_churn,_Newtownmanor_-_geograph.org.uk_-_799328.jpg' },
  { work: 'Hokkaido coastline', author: 'Natural Earth', licence: 'public domain', url: 'https://www.naturalearthdata.com/' },
]

/** The texts of the wrapped candy. */
export const HOKKAIDO_MILK_CANDY_TEXTS = {
  subtitle: 'ミルクソフトキャンディ',
  title: '北海道',
  recycling: 'プラ',
}
