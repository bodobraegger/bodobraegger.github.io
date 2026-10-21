// The salt lemon candy bag (塩レモンキャンディ, 加藤製菓, 58 g): the size of its
// front, the fonts of its lettering and its texts. The front is in the pixels
// of the flat print artwork of the maker (677 x 891), upright and
// rectangular. tools/fits/packages/salt-lemon.mjs fits the places and colours
// of salt-lemon-fit.json to flattened references.
import fitted from '~/lib/suzuno/packages/salt-lemon-fit.json'
import { useStylesheets } from '~/lib/suzuno/packages/lettering'

export const SALT_LEMON_FRONT = { width: 677, height: 891 }

export interface SaltLemonFont {
  family: string
  weight: number
}

/**
 * Free stand-ins for the faces of the print. The title is a thin rounded
 * gothic, probably Morisawa じゅん 101, and Kosugi Maru (Apache 2.0) has the
 * same round stroke ends. The banner, the tagline and the salt badge are in a
 * heavier rounded gothic like じゅん 501, here M PLUS Rounded 1c (OFL). クエン酸
 * and the amount are in a bold display Mincho with brush ends, probably
 * A-OTF 見出ミン MA31, here Kaisei Tokumin (OFL). The small print of the back
 * is a plain gothic like Shin Go, here Noto Sans JP (OFL).
 */
export const SALT_LEMON_FONTS = {
  title: { family: '\'Kosugi Maru\', sans-serif', weight: 400 },
  rounded: { family: '\'M PLUS Rounded 1c\', sans-serif', weight: 500 },
  roundedBold: { family: '\'M PLUS Rounded 1c\', sans-serif', weight: 700 },
  mincho: { family: '\'Kaisei Tokumin\', serif', weight: 800 },
  gothic: { family: '\'Noto Sans JP\', sans-serif', weight: 400 },
  gothicBold: { family: '\'Noto Sans JP\', sans-serif', weight: 700 },
} satisfies Record<string, SaltLemonFont>

// Google Fonts splits each Japanese family into ranges of characters, and the
// browser loads only the ranges that a page uses
const STYLESHEET = 'https://fonts.googleapis.com/css2?display=block&family=Kosugi+Maru&family=M+PLUS+Rounded+1c:wght@500;700&family=Kaisei+Tokumin:wght@800&family=Noto+Sans+JP:wght@400;700'

/** Loads the fonts of SALT_LEMON_FONTS, once for all parts on a page. */
export function useSaltLemonFonts() {
  useStylesheets(() => [STYLESHEET])
}

/** The place of a part in its parent: the origin of the part and its scale. */
export interface PartPlace {
  x: number
  y: number
  scale: number
}

export function placePart(place: PartPlace) {
  return `translate(${place.x} ${place.y}) scale(${place.scale})`
}

/** A line of text: its x, the middle of its height, and its font size. */
export interface TextPlace {
  x: number
  y: number
  size: number
}

/** A box in the coordinates of its parent. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** A vertical line of lettering: the middle of the column, its top, the font size and the letter spacing. */
export interface ColumnPlace {
  x: number
  y: number
  size: number
  spacing: number
}

export interface TitleLayout {
  /** The distance of the frame from the edge of the panel, and the width of its line. */
  frameInset: number
  frameWidth: number
  /** The line below the field of the kanji. */
  divider: number
  /** The middle of the kanji. */
  kanji: { x: number, y: number, size: number }
  name: ColumnPlace
  kind: ColumnPlace
  /** The reading, outside the right edge of the panel. */
  ruby: ColumnPlace & { outline: number }
}

/** The colours of the front. The parts take further colours as their own props. */
export interface FrontColors {
  /** The clear film of the seams round the print. */
  film: string
  panel: [string, string]
  ink: string
  logoRed: string
  saltDisc: string
  saltWaves: string
  acidDisc: [string, string]
  /** The blue edge of the banner, the tagline and the lettering of the badge. */
  edge: string
  /** The small print at the foot. */
  notes: string
}

/** The places of the parts of the front, in face pixels. */
export interface FrontLayout {
  /** The printed area inside the seams, where the photo lies. */
  print: Box
  hangHole: { x: number, y: number, radius: number }
  /** The tear notches in both side edges: their middle, depth and height. */
  notches: { y: number, depth: number, height: number }
  title: Box
  logo: PartPlace
  saltBadge: PartPlace
  acidBadge: PartPlace
  banner: PartPlace
  /** The middle of the tagline, its font size and the width of its blue edge. */
  tagline: { x: number, y: number, size: number, edge: number }
  /** The small print at the foot: the start of the left note and the end of the right note. */
  notes: { left: TextPlace, right: TextPlace }
}

/** The ring round the oval of KatoLogo, and the middle, font size, width and white edge of its tagline. */
export interface LogoLayout {
  ring: number
  tagline: { y: number, size: number, width: number, halo: number }
}

/** For each line of SaltBadge: its middle, its font size and its width. */
export type SaltBadgeLayout = { y: number, size: number, width: number }[]

/** The places in CitricAcidBadge, in units of its horizontal radius of 100. */
export interface AcidBadgeLayout {
  radiusY: number
  rimWidth: number
  label: { y: number, size: number, width: number }
  amount: { y: number, size: number, width: number }
  /** The two spheres: the middle of their row, the distance of each from the middle, their radius, and the sizes and place of the lettering. */
  spheres: { y: number, spacing: number, radius: number, size: number, captionSize: number, captionY: number }
  /** The width of the blue glow round the lettering. */
  glow: number
}

/** The lettering of SaltLemonBanner, in font sizes: the width of the edge, the letter spacing and the dashes. */
export interface BannerLayout {
  edgeWidth: number
  tracking: number
  dashes: { length: number, gap: number, thickness: number }
}

/** The texts of the front. */
export const SALT_LEMON_TEXTS = {
  /** The title panel: the large character in the top field, its reading beside the panel, and the large and the small vertical line below. */
  kanji: '塩',
  ruby: 'しお',
  name: 'レモン',
  kind: 'キャンディ',
  banner: '気軽に塩分補給',
  tagline: 'ほんのりすっぱいレモン味',
  /** The small print at the foot, left and right. */
  notes: ['写真はイメージです。', '無果汁'],
  /** Without a name, the logo shows the drawn letters カトウ. */
  logo: { name: undefined as string | undefined, tagline: '一粒の小さな友達' },
  saltBadge: ['鳴門の塩', '使用'],
  /** The citric acid in one bag, in mg, for {mg} in the amount, and the symbol or formula and the caption of each sphere. */
  acidBadge: {
    label: 'クエン酸',
    amount: '(1袋あたり{mg}mg)',
    mg: 830,
    spheres: [{ symbol: 'Na', caption: 'ナトリウム' }, { symbol: 'C6H8O7', caption: 'クエン酸' }],
  },
}

export type SaltLemonTexts = typeof SALT_LEMON_TEXTS

/** The layouts inside the parts of the front. */
export interface FrontParts {
  title: TitleLayout
  logo: LogoLayout
  saltBadge: SaltBadgeLayout
  acidBadge: AcidBadgeLayout
  banner: BannerLayout
}

// The fitted design, written by tools/fits/packages/fit.mjs with the job salt-lemon.mjs
export const FRONT_LAYOUT = fitted.front.layout as FrontLayout
export const FRONT_PARTS = fitted.front.parts as FrontParts
export const FRONT_COLORS = fitted.front.colors as FrontColors
