// Shared Stroke interface for DrawablePen and StrokeAdmin
export interface Stroke {
  id?: string // UUID from database
  stroke_id?: string // Client-generated unique ID (admin view)
  canvas_id?: string // Canvas identifier (admin view)
  user_id?: string // User identifier (admin view)
  points: { x: number, y: number }[]
  color: string
  width: number
  isEraser?: boolean // DrawablePen uses this
  eraser?: boolean // Database uses this
  userId?: string // DrawablePen uses this
  timestamp?: number
  created_at?: string // Database timestamp
}
