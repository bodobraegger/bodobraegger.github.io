// The texts and the type of the cover, in sheet coordinates (1414 x 1093).
// The fitted values belong to the face they were fitted with: after a change
// of the family, refit them in the Suzuno project and write them here.

/** The lettering of the cover: the title and the line on the banner. */
export interface CoverTexts {
  title: string
  banner: string
}

export const COVER_TEXTS: CoverTexts = { title: 'Suzuno Financial Holdings', banner: 'すずのフィナンシャルHD' }

/** The sheet of the cover, the size of its reference screenshot. */
export const COVER_SHEET = { width: 1414, height: 1093 }

// 'Suzuno Latin' and 'Suzuno Kana' are the slots of the composite font of the
// print (Adobe Caslon Pro Bold and Ro本明朝Std E, see SuzunoCover.vue). Until
// their files are in place, the free faces after them stand in, and the
// values below are fitted to those. squeeze is the horizontal scale of the
// 長体 of the print, tracking is the letter spacing in unsqueezed units, and
// x and y are the start of the baseline.

export const TITLE_TYPE = {
  family: '\'Suzuno Latin\', \'Libre Caslon Condensed\', serif',
  weight: 700,
  size: 305.7,
  squeeze: 0.412,
  tracking: -2.6,
  x: 14.65,
  y: 1012.25,
  /** The offset of each glyph (SVG dx), in unsqueezed units. */
  glyphOffsets: [-7.28, 4.85, 2.43, -2.43, 2.43, 2.43, -2.43, -2.43, 12.14, 2.43, -2.43, -2.43, 2.43, 0, -9.71, 0, 0, 0, 0, 0, 1.21, -1.21, -4.85, -3.64, 1.21],
}

/** The banner line, in the coordinates of the upright banner. */
export const BANNER_TYPE = {
  family: '\'Suzuno Kana\', \'Suzuno Latin\', \'BIZ UDPMincho\', serif',
  weight: 700,
  size: 53.75,
  squeeze: 0.8495,
  tracking: -2.7,
  x: 183.5,
  y: 119.75,
}
