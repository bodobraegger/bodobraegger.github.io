/**
 * A stroke as the client holds it. The database row names the same fields in
 * snake case; DrawablePen maps between the two where it reads and writes rows.
 */
export interface Stroke {
  id: string
  points: { x: number, y: number }[]
  color: string
  width: number
  eraser: boolean
  userId: string
  timestamp: number
}

/** What drawStroke needs of a stroke; a database row satisfies it as well. */
export type DrawableStroke = Pick<Stroke, 'points' | 'color' | 'width' | 'eraser'>
