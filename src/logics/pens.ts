import type { Ref } from 'vue'
import { reactive, ref } from 'vue'

/**
 * A pen offered to the touch toolbar. `color` and `width` stay writable, so the
 * toolbar and the pen's own desktop controls edit the same values.
 */
export interface PenEntry {
  id: string
  emoji: string
  color: string
  width: number
  eraser: boolean
}

export interface PenRegistry {
  /** Pens of one canvas, in mount order. */
  pens: PenEntry[]
  /** Pen currently in hand, or null when the finger scrolls the page. */
  activeId: Ref<string | null>
  /** Whether the toolbar is expanded. */
  open: Ref<boolean>
  /** Pen instance that renders the shared toolbar and the touch layer. */
  ownerId: Ref<string | null>
}

/** The character the drawn pencil stands in for: U+1F589, lower left pencil. */
const DRAWN_PENCIL = '\u{1F589}'

/**
 * The pointer that draws through the touch toolbar instead of through a pen
 * that a cursor carries. The stylesheet of DrawablePen hides those pens behind
 * the same query, so exactly one of the two ways to draw is on a page. Change
 * the two together.
 */
export const TOUCH_POINTER_QUERY = '(hover: none) and (pointer: coarse)'

/**
 * The point of the drawn pencil, in the coordinates of its drawing: the corner
 * of the body path in PenGlyph.vue, carried out to the edge of the ink by half
 * the width of the line that draws it. Both files must be changed together.
 */
export const PEN_GLYPH_TIP = { x: 4.96, y: 95.04 }

/** True for pens whose icon is drawn by the site instead of taken from a font. */
export function usesPenGlyph(emoji: string) {
  return emoji === DRAWN_PENCIL
}

const registries = new Map<string, PenRegistry>()

export function getPenRegistry(canvasId: string): PenRegistry {
  let registry = registries.get(canvasId)
  if (!registry) {
    registry = {
      activeId: ref(null),
      open: ref(false),
      ownerId: ref(null),
      pens: reactive<PenEntry[]>([]),
    }
    registries.set(canvasId, registry)
  }
  return registry
}

/**
 * Adds a pen to its canvas registry and returns the id it got. Pens with the
 * same emoji, color and width share one auto id, so a suffix keeps them apart.
 */
export function registerPen(canvasId: string, entry: PenEntry): string {
  const registry = getPenRegistry(canvasId)

  let id = entry.id
  let suffix = 2
  while (registry.pens.some(pen => pen.id === id))
    id = `${entry.id}#${suffix++}`
  entry.id = id

  registry.pens.push(entry)
  if (!registry.ownerId.value)
    registry.ownerId.value = id

  return id
}

export function unregisterPen(canvasId: string, id: string) {
  const registry = registries.get(canvasId)
  if (!registry)
    return

  const index = registry.pens.findIndex(pen => pen.id === id)
  if (index !== -1)
    registry.pens.splice(index, 1)

  if (registry.activeId.value === id)
    registry.activeId.value = null
  if (registry.ownerId.value === id)
    registry.ownerId.value = registry.pens[0]?.id ?? null

  if (registry.pens.length === 0) {
    registry.open.value = false
    registries.delete(canvasId)
  }
}
