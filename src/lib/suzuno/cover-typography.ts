// The type of the cover, in sheet coordinates (1414 x 1093). The fitted
// values belong to the face they were fitted with: after a change of the
// family, refit them (README, "Open points") and write them here.

export const TITLE_TEXT = 'Suzuno Financial Holdings'
export const BANNER_TEXT = 'すずのフィナンシャルHD'

/** The lettering of the cover: the title and the line on the banner. */
export interface CoverTexts {
  title: string
  banner: string
}

export const COVER_TEXTS: CoverTexts = { title: TITLE_TEXT, banner: BANNER_TEXT }

export interface TitleType {
  family: string
  weight: number
  size: number
  /** The horizontal scale of the 長体 of the print. */
  squeeze: number
  /** The letter spacing, in unsqueezed units. */
  tracking: number
  /** The start of the baseline. */
  x: number
  y: number
  /** The offset of each glyph (SVG dx), in unsqueezed units. */
  glyphOffsets: number[]
  /** Characters that the face has no glyph for; they stay blank. */
  missing?: string
}

export interface BannerType {
  family: string
  weight: number
  size: number
  squeeze: number
  tracking: number
  /** The start of the baseline, in the coordinates of the upright banner. */
  x: number
  y: number
  /** Characters that the face has no glyph for; they stay blank. */
  missing?: string
}

export interface CoverTypography {
  title: TitleType
  banner: BannerType
  /** Stylesheets that load the faces, for example Google Fonts subsets. */
  stylesheets: string[]
}

/**
 * 'Suzuno Latin' and 'Suzuno Kana' are the slots of the print's composite
 * font (Adobe Caslon Pro Bold and Ro本明朝Std E, see SuzunoCover.vue). Until
 * their files are in place, the free faces after them stand in, and the
 * values below are fitted to those.
 */
export const COVER_TYPOGRAPHY: CoverTypography = {
  title: {
    family: '\'Suzuno Latin\', \'Libre Caslon Condensed\', serif',
    weight: 700,
    size: 305.7,
    squeeze: 0.412,
    tracking: -2.6,
    x: 14.65,
    y: 1012.25,
    glyphOffsets: [-7.28, 4.85, 2.43, -2.43, 2.43, 2.43, -2.43, -2.43, 12.14, 2.43, -2.43, -2.43, 2.43, 0, -9.71, 0, 0, 0, 0, 0, 1.21, -1.21, -4.85, -3.64, 1.21],
  },
  banner: {
    family: '\'Suzuno Kana\', \'Suzuno Latin\', \'BIZ UDPMincho\', serif',
    weight: 700,
    size: 53.75,
    squeeze: 0.8495,
    tracking: -2.7,
    x: 183.5,
    y: 119.75,
  },
  stylesheets: [
    // The banner face that matched the print (tools/font-fit-banner.mjs), only the glyphs of the banner text
    'https://fonts.googleapis.com/css2?family=BIZ+UDPMincho:wght@700&text=%E3%81%99%E3%81%9A%E3%81%AE%E3%83%95%E3%82%A3%E3%83%8A%E3%83%B3%E3%82%B7%E3%83%A3%E3%83%ABHD&display=block',
    // The title face that scored best against the print (tools/font-fit.mjs)
    'https://fonts.googleapis.com/css2?family=Libre+Caslon+Condensed:wght@700&text=SuzunoFinancialHoldings&display=block',
  ],
}
