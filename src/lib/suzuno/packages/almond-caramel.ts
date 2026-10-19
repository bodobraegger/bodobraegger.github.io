// The Almond Caramel bag of 筑豊製菓 (Chikuho Seika), 80 g, and its wrapped
// caramel: the fonts, the texts, the colours and the layout of the faces of
// AlmondCaramelBag.vue and AlmondCaramelPiece.vue. All places are in the
// pixels of the faces, reference/packages/almond-caramel-<face>.png. The
// layouts and the colours are fitted to these faces by
// tools/fits/packages/almond-caramel.mjs, which writes them into
// almond-caramel-fit.json.
import fitted from '~/lib/suzuno/packages/almond-caramel-fit.json'

export const ALMOND_CARAMEL_BAG = { width: 558, height: 777 }
export const ALMOND_CARAMEL_PIECE = { front: { width: 184, height: 122 }, back: { width: 104, height: 99 } }

export type AlmondCaramelSide = 'front' | 'back'

/** A web font of the print, with the cap height (or the em box for Japanese) that sizes it. */
export interface PrintFont {
  family: string
  weight: number
  /** The CSS font-stretch, for a font with a width axis. */
  stretch?: string
  /** The cap height in em; Japanese lettering is sized by its em box, so 1. */
  capHeight: number
  stylesheet: string
}

const GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?display=block&family='

/**
 * Free stand-ins for the faces of the print. The probable originals:
 * "ALMOND" is a black condensed grotesque like Helvetica Condensed Black, and
 * Roboto Condensed Black (OFL) scored best against the photo. The spaced
 * C-A-R-A-M-E-L is a bold extended grotesque like Helvetica Bold Extended,
 * and Archivo (OFL) has a width axis up to 125 %. The English lines are in
 * Times Roman, and Tinos (Apache 2.0) has its metrics. The ribbon text is a
 * rounded gothic like Jun 501 (Morisawa), and M PLUS Rounded 1c (OFL) is
 * close. The stamp 地釜炊き is hand-lettered with a marker; Yusei Magic (OFL)
 * has the same strokes. The small print is a plain gothic like Shin Go, and
 * Noto Sans JP (OFL) stands in.
 */
export const ALMOND_CARAMEL_FONTS = {
  condensed: { family: '\'Roboto Condensed\', \'Arial Narrow\', sans-serif', weight: 900, capHeight: 0.711, stylesheet: `${GOOGLE_FONTS}Roboto+Condensed:wght@900` },
  extended: { family: '\'Archivo\', \'Arial Black\', sans-serif', weight: 800, stretch: '125%', capHeight: 0.686, stylesheet: `${GOOGLE_FONTS}Archivo:wdth,wght@125,800` },
  serif: { family: '\'Tinos\', \'Times New Roman\', Times, serif', weight: 400, capHeight: 0.655, stylesheet: `${GOOGLE_FONTS}Tinos` },
  rounded: { family: '\'M PLUS Rounded 1c\', sans-serif', weight: 800, capHeight: 1, stylesheet: `${GOOGLE_FONTS}M+PLUS+Rounded+1c:wght@800` },
  marker: { family: '\'Yusei Magic\', sans-serif', weight: 400, capHeight: 1, stylesheet: `${GOOGLE_FONTS}Yusei+Magic` },
  gothic: { family: '\'Noto Sans JP\', sans-serif', weight: 400, capHeight: 1, stylesheet: `${GOOGLE_FONTS}Noto+Sans+JP:wght@400;700` },
  gothicBold: { family: '\'Noto Sans JP\', sans-serif', weight: 700, capHeight: 1, stylesheet: `${GOOGLE_FONTS}Noto+Sans+JP:wght@400;700` },
} satisfies Record<string, PrintFont>

/**
 * A line of text. x is the middle of the baseline, or its start for lines
 * that start at a margin; y is the baseline. size is the cap height, or the
 * em box for Japanese text. squeeze scales the letters horizontally, and
 * tracking adds space after each letter, in pixels before the squeeze.
 */
export interface TextPlace {
  x: number
  y: number
  size: number
  squeeze: number
  tracking: number
}

/** The transform and the font attributes that put a line of text at its place. */
export function textAttributes(place: TextPlace, font: PrintFont) {
  return {
    'transform': `translate(${place.x} ${place.y}) scale(${place.squeeze} 1)`,
    'font-family': font.family,
    'font-weight': font.weight,
    'font-size': place.size / font.capHeight,
    'letter-spacing': place.tracking,
    'style': font.stretch ? `font-stretch: ${font.stretch}` : undefined,
  }
}

/** Lines of text below each other: the place of the first line and the distance of the baselines. */
export interface TextBlock extends TextPlace {
  leading: number
}

/** The place of each line of a block. */
export function blockLines(block: TextBlock, count: number): TextPlace[] {
  return Array.from({ length: count }, (_, index) => ({ ...block, y: block.y + index * block.leading }))
}

/** A box in face pixels. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** A part drawn in its own coordinates, put at x, y, turned by rotate degrees and scaled. */
export interface Placement {
  x: number
  y: number
  rotate: number
  scale: number
}

export function placementTransform(place: Placement) {
  return `translate(${place.x} ${place.y}) rotate(${place.rotate}) scale(${place.scale})`
}

/** An image in a box, turned by rotate degrees around the middle of the box. */
export interface ImagePlace extends Box {
  rotate: number
}

/** A seal band: lines across the bag, each with a colour name of the bag. */
/** A seal band; each line names its colour in a colour table of the package. */
export interface BandLayout<Color extends string = keyof AlmondCaramelColors> {
  top: number
  bottom: number
  lines: { y: number, width: number, color: Color }[]
}

/** The damask tile: its offset, its scale in each direction and the width of its strokes. */
export interface DamaskLayout {
  x: number
  y: number
  scaleX: number
  scaleY: number
  stroke: number
}

/** The oval label, in its own coordinates: the middle of the oval at the origin. */
export interface LabelLayout {
  rx: number
  ry: number
  /** The width of the outer line, the gap to the inner line and the width of the inner line. */
  outline: number
  gap: number
  inner: number
  intro: TextBlock
  name: TextPlace
  /** The spaced letters: the middle of the first letter, the distance of the letters and the radius of the dots. */
  spaced: TextPlace & { pitch: number, dot: number }
  rule: { y: number, left: number, right: number, width: number }
  sentence: TextBlock
}

/** The ribbon, in its own coordinates: the middle of the top edge of its band at the origin. */
export interface RibbonLayout {
  /** The band: its width, its height and how much higher its middle is than its ends. */
  width: number
  height: number
  arch: number
  /** The tails: how far they reach out from the band and down from its top edge, their height and the depth of their notch. */
  reach: number
  drop: number
  tail: number
  notch: number
  /** How far the folds reach in under the band, and the width of the outline. */
  fold: number
  outline: number
  /** The text along the middle of the band: dy moves it down from the top edge, slant leans it, in degrees. */
  text: { size: number, dy: number, tracking: number, slant: number }
}

/** The stamp: its box, its corner radius, the width of its frame, and the em size of its characters. */
export interface StampLayout extends Box {
  radius: number
  stroke: number
  size: number
}

/** A table with a heading column: the box, the width of the heading column and the text sizes. */
export interface TableLayout {
  x: number
  y: number
  width: number
  headingWidth: number
  /** The height of a row of one line, the extra height of each further line, and the width of the rules. */
  rowHeight: number
  leading: number
  rule: number
  size: number
  /** The title above the table: its baseline above the top rule. */
  title: { dy: number, size: number }
}

export interface BarcodeLayout extends Box {
  /** The em size of the digits under the bars. */
  size: number
}

export interface AlmondCaramelBagLayout {
  topBand: BandLayout
  bottomBand: BandLayout
  hole: { x: number, y: number, radius: number }
  /** The printed panel, and the windows in it that show the caramels. */
  panel: { top: number, bottom: number }
  windows: Box[]
  /** Areas of plain ground over the damask, such as the panel of the back texts. */
  plain?: Box[]
  damask: DamaskLayout
  label: Placement & LabelLayout
  ribbon: Placement & RibbonLayout
  almonds: ImagePlace
  /** The window image, in face pixels. */
  window: Box
  /** Front: the stamp and the printed date and weight. */
  stamp?: StampLayout
  dates?: TextBlock
  /** Back: the greeting, the tables, the recycling marks, the barcode and the notes. */
  greeting?: TextBlock
  ingredients?: TableLayout
  nutrition?: TableLayout & { note: TextPlace }
  recycling?: { mark: Box, lines: TextBlock, sorting: TextBlock }
  barcode?: BarcodeLayout
  footnote?: TextBlock
  homepage?: TextBlock
}

export interface AlmondCaramelColors {
  /** The yellow of the print, and the yellow of the seals. */
  ground: string
  seal: string
  damask: string
  /** The inside of the oval label. */
  label: string
  /** The dark brown of the outlines, "ALMOND", the lines and the small print. */
  ink: string
  /** The green of the spaced letters, the lines of the seals and the stamp. */
  green: string
  bandInk: string
  bandGreen: string
  ribbon: string
  /** The folds of the ribbon, which lie behind its band. */
  ribbonFold: string
  ribbonText: string
  stamp: string
  /** The printed date and weight. */
  date: string
  /** The hang hole shows what lies behind the bag. */
  hole: string
}

export interface AlmondCaramelTexts {
  /** The lines above "ALMOND". */
  intro: string[]
  name: string
  /** The letters of the spaced word, which get dots between them. */
  spaced: string
  /** The English sentence below the rule. */
  sentence: string[]
  ribbon: string
  /** The stamp: its columns from right to left. */
  stamp: string[]
  bestBefore: string
  weight: string
  greeting: string[]
  ingredientsTitle: string
  ingredients: TableRow[]
  nutritionTitle: string
  nutrition: TableRow[]
  nutritionNote: string
  recycling: string[]
  sorting: string[]
  /** The 13 digits of the EAN barcode. */
  barcode: string
  footnote: string[]
  homepage: string[]
}

/** A row of a table: the heading and the lines of the value. */
export interface TableRow {
  heading: string
  lines: string[]
}

/**
 * The texts of the 80 g bag of the photos. The back texts come from the
 * Daiso artwork of the same bag; the import sticker of the photo hides
 * the greeting, and its text is a plausible one in the style of the print.
 */
export const ALMOND_CARAMEL_TEXTS: AlmondCaramelTexts = {
  intro: ['WE PROUDLY PRESENT YOU', 'CHIKUHO CARAMEL,'],
  name: 'ALMOND',
  spaced: 'CARAMEL',
  sentence: ['IN THE MOST REFINED FORM AFTER YEARS', 'OF TECHNICAL DEVELOPMENT IN OUR', 'RESEARCH KITCHENS,'],
  ribbon: 'アーモンドキャラメル',
  stamp: ['地釜', '炊き'],
  bestBefore: '賞味期限 2027.04.30',
  weight: '個包装紙込み 80 g',
  greeting: [
    '毎度お買い上げいただきまして誠にありが',
    'とうございます。当社の製品をいつまでも',
    'おいしくお召し上がりいただくため、品質',
    'には細心の注意をはらっております。開封',
    '後はなるべくお早めにお召し上がりくだ',
    'さい。品質には万全を期して製造いたし',
    'ておりますが、万一お気付きの点がござ',
    'いましたら、お買い求めの店名と日時を',
    'ご記入の上、現品を添えて当社お客様係',
    'までお送りください。郵送料は当社で負担し、',
    '代品とお取りかえいたします。',
  ],
  ingredientsTitle: 'アーモンドキャラメル',
  ingredients: [
    { heading: '名称', lines: ['キャラメル'] },
    { heading: '原材料名', lines: ['水飴(国内製造)、砂糖、加糖練乳、', 'パーム油、アーモンド、デキストリ', 'ン、食塩／甘味料(ソルビトール)、', '乳化剤、香料、着色料(カラメル)、', '(一部に乳成分・アーモンドを含む)'] },
    { heading: '内容量', lines: ['表面左上部に記載'] },
    { heading: '賞味期限', lines: ['表面左上部に記載'] },
    { heading: '保存方法', lines: ['直射日光、高温多湿を避けて', '常温で保存してください。'] },
    { heading: '製造者', lines: ['筑豊製菓株式会社', '福岡県飯塚市津島408-1', '0120-22-7349'] },
  ],
  nutritionTitle: '栄養成分表示(100gあたり)',
  nutrition: [
    { heading: '熱量', lines: ['420 kcal'] },
    { heading: 'たんぱく質', lines: ['2.4 g'] },
    { heading: '脂質', lines: ['8.7 g'] },
    { heading: '炭水化物', lines: ['83.1 g'] },
    { heading: '食塩相当量', lines: ['0.3 g'] },
  ],
  nutritionNote: 'この表示値は目安です',
  recycling: ['外袋：PP', '内袋：PP, PET'],
  sorting: ['包材の分別区分：袋 プラスチック', 'ごみに出すときは市町村の区分に', 'したがってください。'],
  barcode: '4902013500477',
  footnote: ['※ごくまれに、小包装にキャラメルが入っ', 'ていない場合が有りますが、品質の良否に', 'はかかわりございません。'],
  homepage: ['筑豊製菓ホームページ', 'http://www.chikuho-seika.co.jp'],
}

export interface AlmondCaramelBagDesign {
  layout: AlmondCaramelBagLayout
  colors: AlmondCaramelColors
}

/** The fitted layout and colours of each side of the bag. */
export const ALMOND_CARAMEL_BAG_DESIGNS = fitted.bag as Record<AlmondCaramelSide, AlmondCaramelBagDesign>

/** The grid of the inner paper of a wrapped caramel: its offset, the size of a cell and the width of its lines. */
export interface GridLayout {
  x: number
  y: number
  cell: number
  line: number
}

export interface AlmondCaramelPieceLayout {
  front: {
    /** The clear oval of the wrapper, which shows the inner paper. */
    window: { x: number, y: number, rx: number, ry: number, outline: number }
    grid: GridLayout
    name: TextPlace
    spaced: TextPlace & { pitch: number, dot: number }
    lines: TextBlock
  }
  back: {
    /** The clear part of the back, which shows the inner paper. */
    window: Box
    grid: GridLayout
    frame: Box & { stroke: number }
    /** The top of the columns, the middle of the right column, the em size and the distance of the columns. */
    columns: { x: number, y: number, size: number, pitch: number }
  }
}

export interface AlmondCaramelPieceColors {
  /** The printed film, the inner paper seen through the clear parts, its grid, and the ink. */
  film: string
  window: string
  grid: string
  ink: string
}

export interface AlmondCaramelPieceTexts {
  name: string
  spaced: string
  /** Small lines below the spaced word on the front; the wrapper of the photos has none. */
  lines: string[]
  /** The columns of the back, from right to left. */
  columns: string[]
}

export const ALMOND_CARAMEL_PIECE_TEXTS: AlmondCaramelPieceTexts = {
  name: 'ALMOND',
  spaced: 'CARAMEL',
  lines: [],
  columns: ['アーモンドキャラメル', '筑豊製菓株式会社', '福岡県飯塚市津島408-1'],
}

/** The fitted layout and colours of each side of the wrapper. */
export const ALMOND_CARAMEL_PIECE_DESIGNS = fitted.piece as {
  [side in AlmondCaramelSide]: { layout: AlmondCaramelPieceLayout[side], colors: AlmondCaramelPieceColors }
}
