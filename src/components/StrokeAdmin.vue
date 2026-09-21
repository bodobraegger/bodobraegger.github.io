<script setup lang="ts">
import { useSelection } from '~/composables/useSelection'
import { useSupabaseAuth } from '~/composables/useSupabaseAuth'
import { getSupabase } from '~/lib/supabase'
import { drawStroke } from '~/utils/canvas'

/** A row of public.strokes, as the admin reads and restores it. */
interface StrokeRow {
  id: string
  stroke_id: string
  canvas_id: string
  user_id: string
  points: { x: number, y: number }[]
  color: string
  width: number
  eraser: boolean
  created_at: string
}

const canvasCounts = ref(new Map<string, number>())
const strokes = ref<StrokeRow[]>([])
const filterCanvas = ref('')
const loading = ref(true)
const error = ref('')

// Stacks hold deleted batches; undo re-inserts the rows, redo deletes them again
const undoStack = ref<StrokeRow[][]>([])
const redoStack = ref<StrokeRow[][]>([])

const auth = useSupabaseAuth(error, loading)
const { selectedIds, toggle, selectAll: selectAllIds, clear } = useSelection(() => strokes.value.map(s => s.stroke_id))
const showConfirmDelete = ref(false)

const confirmQuestion = computed(() => showConfirmDelete.value
  ? `Delete ${selectedIds.value.size} stroke${selectedIds.value.size === 1 ? '' : 's'} from ${filterCanvas.value}?`
  : null)

const viewportRef = ref<HTMLDivElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const canvasSpacerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let overlayCtx: CanvasRenderingContext2D | null = null
// Top-left of the stroke bounding box; drawing is shifted by this so
// strokes far from the page origin still land on the canvas
let viewOffset = { x: 0, y: 0 }

let isDragging = false
let dragStart = { x: 0, y: 0 }
let dragEnd = { x: 0, y: 0 }

const canvases = computed(() => Array.from(canvasCounts.value.keys()).sort())
const eraserCount = computed(() => strokes.value.filter(s => s.eraser).length)

async function loadCanvases() {
  const supabase = await getSupabase()
  if (!supabase) {
    error.value = 'Supabase is not configured.'
    loading.value = false
    return
  }

  const { data, error: err } = await supabase
    .from('strokes')
    .select('canvas_id')

  if (err) {
    error.value = err.message
    return
  }

  const counts = new Map<string, number>()
  for (const row of data ?? [])
    counts.set(row.canvas_id, (counts.get(row.canvas_id) ?? 0) + 1)
  canvasCounts.value = counts

  if (!filterCanvas.value && counts.size > 0)
    filterCanvas.value = canvases.value[0]
}

async function loadStrokes() {
  if (!filterCanvas.value) {
    strokes.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    const supabase = await getSupabase()
    if (!supabase) {
      error.value = 'Supabase is not configured.'
      return
    }

    const { data, error: err } = await supabase
      .from('strokes')
      .select('*')
      .eq('canvas_id', filterCanvas.value)
      .order('created_at', { ascending: true })

    if (err)
      throw err

    strokes.value = data ?? []
    await nextTick()
    setupCanvas()
  }
  catch (e: any) {
    error.value = e.message || 'Failed to load strokes'
    console.error('Load error:', e)
  }
  finally {
    loading.value = false
  }
}

function refresh() {
  loadCanvases()
  loadStrokes()
}

function calculateCanvasBounds() {
  if (strokes.value.length === 0)
    return { width: 800, height: 600, offsetX: 0, offsetY: 0 }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const stroke of strokes.value) {
    for (const point of stroke.points) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
  }

  const padding = 100
  return {
    width: Math.max(maxX - minX + padding * 2, 800),
    height: Math.max(maxY - minY + padding * 2, 600),
    offsetX: minX - padding,
    offsetY: minY - padding,
  }
}

function setupCanvas() {
  if (!canvasRef.value || !viewportRef.value)
    return

  const bounds = calculateCanvasBounds()
  viewOffset = { x: bounds.offsetX, y: bounds.offsetY }

  if (canvasSpacerRef.value) {
    canvasSpacerRef.value.style.width = `${bounds.width}px`
    canvasSpacerRef.value.style.height = `${bounds.height}px`
  }

  canvasRef.value.width = bounds.width
  canvasRef.value.height = bounds.height
  ctx = canvasRef.value.getContext('2d')

  // Overlay stays viewport-sized so highlights redraw cheaply while scrolling
  if (overlayCanvasRef.value) {
    overlayCanvasRef.value.width = viewportRef.value.clientWidth
    overlayCanvasRef.value.height = viewportRef.value.clientHeight
    overlayCtx = overlayCanvasRef.value.getContext('2d')
  }

  drawBase()
  drawOverlay()
}

function drawBase() {
  if (!ctx || !canvasRef.value)
    return

  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  for (const stroke of strokes.value)
    drawStroke(ctx, stroke, { showAsEraser: true, scrollX: viewOffset.x, scrollY: viewOffset.y })
}

function drawOverlay() {
  if (!overlayCtx || !overlayCanvasRef.value || !containerRef.value)
    return

  const canvas = overlayCanvasRef.value
  overlayCtx.clearRect(0, 0, canvas.width, canvas.height)

  const shiftX = viewOffset.x + containerRef.value.scrollLeft
  const shiftY = viewOffset.y + containerRef.value.scrollTop

  if (selectedIds.value.size > 0) {
    for (const stroke of strokes.value) {
      if (selectedIds.value.has(stroke.stroke_id))
        drawStroke(overlayCtx, stroke, { isSelected: true, showAsEraser: true, scrollX: shiftX, scrollY: shiftY })
    }
  }

  if (isDragging) {
    overlayCtx.strokeStyle = '#4444ff'
    overlayCtx.lineWidth = 2
    overlayCtx.setLineDash([5, 5])
    overlayCtx.strokeRect(
      Math.min(dragStart.x, dragEnd.x) - shiftX,
      Math.min(dragStart.y, dragEnd.y) - shiftY,
      Math.abs(dragEnd.x - dragStart.x),
      Math.abs(dragEnd.y - dragStart.y),
    )
    overlayCtx.setLineDash([])
  }
}

let overlayRedrawQueued = false
function scheduleOverlayRedraw() {
  if (overlayRedrawQueued)
    return
  overlayRedrawQueued = true
  requestAnimationFrame(() => {
    overlayRedrawQueued = false
    drawOverlay()
  })
}

function toWorld(e: MouseEvent) {
  const container = containerRef.value!
  const rect = container.getBoundingClientRect()
  return {
    x: e.clientX - rect.left + container.scrollLeft + viewOffset.x,
    y: e.clientY - rect.top + container.scrollTop + viewOffset.y,
  }
}

function handleMouseDown(e: MouseEvent) {
  if (!containerRef.value || !filterCanvas.value)
    return

  dragStart = toWorld(e)
  dragEnd = dragStart
  isDragging = true
}

// Move and up handlers live on window so a drag survives leaving the container
function handleWindowMouseMove(e: MouseEvent) {
  if (!isDragging || !containerRef.value)
    return

  dragEnd = toWorld(e)
  scheduleOverlayRedraw()
}

function handleWindowMouseUp(e: MouseEvent) {
  if (!isDragging || !containerRef.value)
    return

  dragEnd = toWorld(e)
  isDragging = false

  const dragDistance = Math.hypot(dragEnd.x - dragStart.x, dragEnd.y - dragStart.y)

  if (dragDistance < 5) {
    // Click: toggle the topmost stroke under the cursor, or deselect all
    let hitStroke = false
    for (let i = strokes.value.length - 1; i >= 0; i--) {
      const stroke = strokes.value[i]
      if (isPointNearStroke(dragEnd.x, dragEnd.y, stroke)) {
        toggle(stroke.stroke_id)
        hitStroke = true
        break
      }
    }

    if (!hitStroke)
      clear()
  }
  else {
    const minX = Math.min(dragStart.x, dragEnd.x)
    const minY = Math.min(dragStart.y, dragEnd.y)
    const maxX = Math.max(dragStart.x, dragEnd.x)
    const maxY = Math.max(dragStart.y, dragEnd.y)

    for (const stroke of strokes.value) {
      if (strokeTouchesRect(stroke, minX, minY, maxX, maxY))
        selectedIds.value.add(stroke.stroke_id)
    }
  }

  drawOverlay()
}

function strokeTouchesRect(stroke: StrokeRow, minX: number, minY: number, maxX: number, maxY: number): boolean {
  // A single dot has no segment to test
  if (stroke.points.length === 1) {
    const [point] = stroke.points
    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  }

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i]
    const p2 = stroke.points[i + 1]

    if (lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, minX, minY, maxX, maxY))
      return true
  }

  return false
}

function lineIntersectsRect(x1: number, y1: number, x2: number, y2: number, minX: number, minY: number, maxX: number, maxY: number): boolean {
  return (
    lineSegmentsIntersect(x1, y1, x2, y2, minX, minY, maxX, minY)
    || lineSegmentsIntersect(x1, y1, x2, y2, maxX, minY, maxX, maxY)
    || lineSegmentsIntersect(x1, y1, x2, y2, maxX, maxY, minX, maxY)
    || lineSegmentsIntersect(x1, y1, x2, y2, minX, maxY, minX, minY)
  )
}

function lineSegmentsIntersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  if (denom === 0)
    return false

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  return t >= 0 && t <= 1 && u >= 0 && u <= 1
}

function isPointNearStroke(x: number, y: number, stroke: StrokeRow): boolean {
  const threshold = Math.max(stroke.width / 2 + 5, 10)

  if (stroke.points.length === 1)
    return Math.hypot(x - stroke.points[0].x, y - stroke.points[0].y) <= threshold

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i]
    const p2 = stroke.points[i + 1]

    if (distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y) <= threshold)
      return true
  }

  return false
}

function distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0)
    return Math.hypot(px - x1, py - y1)

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared))
  const projX = x1 + t * dx
  const projY = y1 + t * dy

  return Math.hypot(px - projX, py - projY)
}

function selectAll() {
  selectAllIds()
  drawOverlay()
}

function clearSelection() {
  clear()
  drawOverlay()
}

function bumpCanvasCount(canvasId: string, delta: number) {
  const counts = canvasCounts.value
  counts.set(canvasId, Math.max((counts.get(canvasId) ?? 0) + delta, 0))
}

async function requestDelete() {
  if (selectedIds.value.size === 0)
    return

  const supabase = await getSupabase()
  if (!supabase)
    return

  if (!auth.user.value) {
    error.value = 'You must be authenticated to delete strokes'
    auth.showAuth.value = true
    return
  }

  showConfirmDelete.value = true
}

async function deleteBatch(batch: StrokeRow[]): Promise<boolean> {
  const supabase = await getSupabase()
  if (!supabase)
    return false

  const { error: err } = await supabase
    .from('strokes')
    .delete()
    .eq('canvas_id', batch[0].canvas_id)
    .in('stroke_id', batch.map(s => s.stroke_id))

  if (err) {
    error.value = err.message
    console.error('Delete error:', err)
    return false
  }

  const deletedIds = new Set(batch.map(s => s.stroke_id))
  strokes.value = strokes.value.filter(s => !deletedIds.has(s.stroke_id))
  bumpCanvasCount(batch[0].canvas_id, -batch.length)
  return true
}

async function confirmDelete() {
  showConfirmDelete.value = false

  const batch = strokes.value.filter(s => selectedIds.value.has(s.stroke_id))
  if (batch.length === 0)
    return

  loading.value = true
  error.value = ''

  if (await deleteBatch(batch)) {
    clear()
    undoStack.value.push(batch)
    redoStack.value = []
    setupCanvas()
  }

  loading.value = false
}

function cancelDelete() {
  showConfirmDelete.value = false
}

async function undoDelete() {
  if (undoStack.value.length === 0 || loading.value)
    return

  const supabase = await getSupabase()
  if (!supabase)
    return

  const batch = undoStack.value[undoStack.value.length - 1]
  loading.value = true
  error.value = ''

  // Restore the exact rows that were deleted; the insert policy is public
  const { error: err } = await supabase.from('strokes').insert(batch.map(s => ({
    id: s.id,
    stroke_id: s.stroke_id,
    canvas_id: s.canvas_id,
    user_id: s.user_id,
    points: s.points,
    color: s.color,
    width: s.width,
    eraser: s.eraser,
    created_at: s.created_at,
  })))

  if (err) {
    error.value = err.message
    console.error('Undo error:', err)
  }
  else {
    undoStack.value.pop()
    redoStack.value.push(batch)
    strokes.value = [...strokes.value, ...batch]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
    bumpCanvasCount(batch[0].canvas_id, batch.length)
    setupCanvas()
  }

  loading.value = false
}

async function redoDelete() {
  if (redoStack.value.length === 0 || loading.value)
    return

  const batch = redoStack.value[redoStack.value.length - 1]
  loading.value = true
  error.value = ''

  if (await deleteBatch(batch)) {
    redoStack.value.pop()
    undoStack.value.push(batch)
    setupCanvas()
  }

  loading.value = false
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    return

  if (e.key === 'Escape') {
    if (showConfirmDelete.value)
      cancelDelete()
    else
      clearSelection()
    return
  }

  const modifier = e.ctrlKey || e.metaKey
  const key = e.key.toLowerCase()

  if (modifier && key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undoDelete()
  }
  else if (modifier && (key === 'y' || (key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redoDelete()
  }
  else if (modifier && key === 'a') {
    e.preventDefault()
    selectAll()
  }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.value.size > 0) {
    e.preventDefault()
    requestDelete()
  }
}

watch(filterCanvas, () => {
  clear()
  undoStack.value = []
  redoStack.value = []
  loadStrokes()
})

onMounted(async () => {
  window.addEventListener('resize', setupCanvas)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mousemove', handleWindowMouseMove)
  window.addEventListener('mouseup', handleWindowMouseUp)

  await loadCanvases()
  // No canvases means the filterCanvas watch never fires to clear the flag
  if (!filterCanvas.value)
    loading.value = false
})

onUnmounted(() => {
  window.removeEventListener('resize', setupCanvas)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('mousemove', handleWindowMouseMove)
  window.removeEventListener('mouseup', handleWindowMouseUp)
})
</script>

<template>
  <AdminShell
    title="stroke admin"
    noun="stroke"
    :auth="auth"
    :error="error"
    :loading="loading"
    :confirm-question="confirmQuestion"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  >
    <template #controls>
      <select v-model="filterCanvas">
        <option value="">
          choose canvas
        </option>
        <option v-for="canvas in canvases" :key="canvas" :value="canvas">
          {{ canvas }} ({{ canvasCounts.get(canvas) }})
        </option>
      </select>
      <button :disabled="loading" @click="refresh">
        refresh
      </button>
      <button :disabled="strokes.length === 0" @click="selectAll">
        all
      </button>
      <button :disabled="selectedIds.size === 0" @click="clearSelection">
        none
      </button>
      <button :disabled="undoStack.length === 0 || loading" @click="undoDelete">
        undo
      </button>
      <button :disabled="redoStack.length === 0 || loading" @click="redoDelete">
        redo
      </button>
      <button
        :disabled="selectedIds.size === 0 || !auth.user.value"
        :title="!auth.user.value ? 'Sign in to delete' : ''"
        @click="requestDelete"
      >
        delete ({{ selectedIds.size }})
      </button>
    </template>

    <template v-if="filterCanvas" #stats>
      <span>{{ strokes.length }} strokes · {{ eraserCount }} erasers · {{ selectedIds.size }} selected</span>
      <span>click or drag selects · del deletes · ctrl+z undoes delete</span>
    </template>

    <div ref="viewportRef" class="canvas-viewport">
      <div
        ref="containerRef"
        class="canvas-container"
        @mousedown="handleMouseDown"
        @scroll.passive="scheduleOverlayRedraw"
      >
        <div ref="canvasSpacerRef" class="canvas-spacer">
          <canvas
            v-if="filterCanvas"
            ref="canvasRef"
          />
        </div>

        <div v-if="!filterCanvas && !loading" class="empty-state">
          <p>select a canvas to begin</p>
        </div>

        <div v-if="loading && strokes.length === 0" class="loading-state">
          <p>loading strokes...</p>
        </div>
      </div>
      <canvas
        v-if="filterCanvas"
        ref="overlayCanvasRef"
        class="overlay-canvas"
      />
    </div>
  </AdminShell>
</template>

<style scoped>
html.dark .admin-container canvas {
  filter: invert(1);
}

.canvas-viewport {
  position: relative;
  flex: 1;
  min-height: 0;
}

.canvas-container {
  position: absolute;
  inset: 0;
  /* scroll without scrollbars */
  overflow: auto;
  scrollbar-width: none;
  cursor: crosshair;
}

.canvas-spacer {
  position: relative;
  /* Size set dynamically by JS */
}

canvas {
  display: block;
}

.overlay-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}
</style>
