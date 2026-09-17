export const HYDRA_BACKGROUND_MARKER = 'background'
export const HYDRA_BACKGROUND_ATTRIBUTE = 'data-hydra-background'

/**
 * A page runs one of its own sketches behind the text. The fence of that code
 * block names it, as in ```javascript background, and the highlighter turns the
 * marker into the attribute that the background component looks for.
 */
export function marksBackground(fenceMeta: string | undefined) {
  return !!fenceMeta && fenceMeta.split(/\s+/).includes(HYDRA_BACKGROUND_MARKER)
}
