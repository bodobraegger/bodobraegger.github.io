// The salt lemon candy bag (塩レモンキャンディ, 加藤製菓, 58 g): the size of its
// front, the fonts of its lettering and its texts. The front is in the pixels
// of the flat print artwork of the maker (677 x 891), upright and
// rectangular. tools/fits/packages/salt-lemon.mjs fits the places and colours
// of salt-lemon-fit.json to flattened references.
import fitted from '~/lib/suzuno/packages/salt-lemon-fit.json'
import { useStylesheets } from '~/lib/suzuno/packages/lettering'

export const SALT_LEMON_FRONT = { width: 677, height: 891 }

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
}

// Google Fonts splits each Japanese family into ranges of characters, and the
// browser loads only the ranges that a page uses
const STYLESHEET = 'https://fonts.googleapis.com/css2?display=block&family=Kosugi+Maru&family=M+PLUS+Rounded+1c:wght@500;700&family=Kaisei+Tokumin:wght@800&family=Noto+Sans+JP:wght@400;700'

/** Loads the fonts of SALT_LEMON_FONTS, once for all parts on a page. */
export function useSaltLemonFonts() {
  useStylesheets(STYLESHEET)
}

/** The transform that puts a part at its place: the origin of the part and its scale. */
export function placePart(place: { x: number, y: number, scale: number }) {
  return `translate(${place.x} ${place.y}) scale(${place.scale})`
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

// The fitted design of tools/fits/packages/fit.mjs with the job
// salt-lemon.mjs: the places of the parts in face pixels, the layouts inside
// the parts in their own units, and the colours
export const { layout: FRONT_LAYOUT, parts: FRONT_PARTS, colors: FRONT_COLORS } = fitted.front
