/** The face a text box is set in. The fonts that stand for them are in DifferenceFrame.vue. */
export type TextFont = 'serif' | 'sans'

/**
 * One line of text that OCR found in the image of a difference frame, in the
 * pixels of the image. The box is the ink of the line, without its angle.
 * `color` is the colour of the letters and `background` the colour around
 * them. A box without `background` lets the image show around its letters.
 */
export interface TextBox {
  id: string
  text: string
  x: number
  y: number
  width: number
  height: number
  angle?: number
  font?: TextFont
  color: string
  background?: string
}

/** The content of text.json: the size of the image and the boxes in its pixels. */
export interface TextLayer {
  width: number
  height: number
  boxes: TextBox[]
}

/**
 * The `texts` prop of a difference frame. A list replaces the boxes by their
 * position and an object by their id; `null` in a list keeps a box as it is.
 */
export type TextReplacements = string | (string | null)[] | Record<string, string>

/**
 * Applies the `texts` prop to the boxes of a frame. Without it, every box keeps
 * the text that OCR found. An empty string empties every box, and a list or an
 * object replaces single boxes. A position or an id that the frame does not
 * have is an error, so a mistake in a page stops the build.
 */
export function replaceTexts(name: string, boxes: TextBox[], texts: TextReplacements | undefined): TextBox[] {
  if (texts === undefined)
    return boxes
  if (typeof texts === 'string') {
    if (texts.trim())
      throw new Error(`DifferenceFrame "${name}": texts takes an empty string, a list or an object, not "${texts}"`)
    return boxes.map(box => ({ ...box, text: '' }))
  }

  const replacements = new Map<string, string>()
  if (Array.isArray(texts)) {
    if (texts.length > boxes.length)
      throw new Error(`DifferenceFrame "${name}": texts has ${texts.length} entries, but the frame has ${boxes.length} text boxes`)
    texts.forEach((text, index) => {
      if (text !== null && text !== undefined)
        replacements.set(boxes[index].id, text)
    })
  }
  else {
    const ids = boxes.map(box => box.id)
    for (const [id, text] of Object.entries(texts)) {
      if (!ids.includes(id))
        throw new Error(`DifferenceFrame "${name}": no text box "${id}". The boxes are: ${ids.join(', ')}`)
      replacements.set(id, text)
    }
  }
  return boxes.map(box => replacements.has(box.id) ? { ...box, text: replacements.get(box.id)! } : box)
}
