<script setup lang="ts">
import type { User } from '@supabase/supabase-js'
import { supabase } from '~/lib/supabase'
import type { Stroke as BaseStroke } from '~/types/strokes'
import { drawStroke } from '~/utils/canvas'

// Admin-specific stroke type with required fields
interface AdminStroke extends BaseStroke {
  id: string
  stroke_id: string
  canvas_id: string
  user_id: string
  created_at: string
}

const canvasCounts = ref(new Map<string, number>())
const strokes = ref<AdminStroke[]>([])
const selectedIds = ref(new Set<string>())
const filterCanvas = ref('')
const loading = ref(true)
const error = ref('')

// Stacks hold deleted batches; undo re-inserts the rows, redo deletes them again
const undoStack = ref<AdminStroke[][]>([])
const redoStack = ref<AdminStroke[][]>([])

const user = ref<User | null>(null)
const email = ref('')
const password = ref('')
const showAuth = ref(false)
const showConfirmDelete = ref(false)

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

if (!supabase) {
  error.value = 'Supabase is not configured.'
  loading.value = false
}

const canvases = computed(() => Array.from(canvasCounts.value.keys()).sort())
const eraserCount = computed(() => strokes.value.filter(s => s.eraser).length)

async function loadCanvases() {
  if (!supabase)
    return

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
  if (!supabase)
    return

  if (!filterCanvas.value) {
    strokes.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
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
        toggleStroke(stroke.stroke_id)
        hitStroke = true
        break
      }
    }

    if (!hitStroke)
      selectedIds.value.clear()
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

function strokeTouchesRect(stroke: AdminStroke, minX: number, minY: number, maxX: number, maxY: number): boolean {
  for (const point of stroke.points) {
    if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY)
      return true
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

function isPointNearStroke(x: number, y: number, stroke: AdminStroke): boolean {
  const threshold = Math.max(stroke.width / 2 + 5, 10)

  for (const point of stroke.points) {
    const dist = Math.hypot(x - point.x, y - point.y)
    if (dist <= threshold)
      return true
  }

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

function toggleStroke(strokeId: string) {
  if (selectedIds.value.has(strokeId))
    selectedIds.value.delete(strokeId)
  else
    selectedIds.value.add(strokeId)
}

function selectAll() {
  selectedIds.value = new Set(strokes.value.map(s => s.stroke_id))
  drawOverlay()
}

function clearSelection() {
  selectedIds.value.clear()
  drawOverlay()
}

function bumpCanvasCount(canvasId: string, delta: number) {
  const counts = canvasCounts.value
  counts.set(canvasId, Math.max((counts.get(canvasId) ?? 0) + delta, 0))
}

function requestDelete() {
  if (selectedIds.value.size === 0 || !supabase)
    return

  if (!user.value) {
    error.value = 'You must be authenticated to delete strokes'
    showAuth.value = true
    return
  }

  showConfirmDelete.value = true
}

async function deleteBatch(batch: AdminStroke[]): Promise<boolean> {
  const { error: err } = await supabase!
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
  if (!supabase)
    return

  const batch = strokes.value.filter(s => selectedIds.value.has(s.stroke_id))
  if (batch.length === 0)
    return

  loading.value = true
  error.value = ''

  if (await deleteBatch(batch)) {
    selectedIds.value.clear()
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
  if (undoStack.value.length === 0 || !supabase || loading.value)
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
    eraser: s.eraser ?? false,
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
  if (redoStack.value.length === 0 || !supabase || loading.value)
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

async function signIn() {
  if (!supabase || !email.value || !password.value)
    return

  loading.value = true
  error.value = ''

  try {
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (err)
      throw err

    user.value = data.user
    showAuth.value = false
    password.value = ''
  }
  catch (e: any) {
    error.value = e.message || 'Failed to sign in'
    console.error('Sign in error:', e)
  }
  finally {
    loading.value = false
  }
}

async function signOut() {
  if (!supabase)
    return

  try {
    await supabase.auth.signOut()
    user.value = null
  }
  catch (e: any) {
    error.value = e.message || 'Failed to sign out'
    console.error('Sign out error:', e)
  }
}

watch(filterCanvas, () => {
  selectedIds.value.clear()
  undoStack.value = []
  redoStack.value = []
  loadStrokes()
})

let authSubscription: { unsubscribe: () => void } | null = null

onMounted(async () => {
  window.addEventListener('resize', setupCanvas)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mousemove', handleWindowMouseMove)
  window.addEventListener('mouseup', handleWindowMouseUp)

  if (supabase) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
    authSubscription = data.subscription
  }

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
  authSubscription?.unsubscribe()
})
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <span>stroke admin</span>

      <div class="admin-center">
        <div class="admin-controls">
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
            :disabled="selectedIds.size === 0 || !user"
            :title="!user ? 'Sign in to delete' : ''"
            @click="requestDelete"
          >
            delete ({{ selectedIds.size }})
          </button>
        </div>
        <div v-if="filterCanvas" class="admin-stats">
          <span>{{ strokes.length }} strokes · {{ eraserCount }} erasers · {{ selectedIds.size }} selected</span>
          <span>click or drag selects · del deletes · ctrl+z undoes delete</span>
        </div>
      </div>

      <div class="auth-status">
        <span v-if="user">{{ user.email }}</span>
        <button v-if="user" @click="signOut">
          sign out
        </button>
        <button v-else @click="showAuth = !showAuth">
          {{ showAuth ? 'hide login' : 'sign in' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="error-message">
      {{ error }}
    </p>

    <!-- Auth Form -->
    <div v-if="showAuth && !user" class="auth-form">
      <h3>sign in to delete strokes</h3>
      <form @submit.prevent="signIn">
        <input
          v-model="email"
          type="email"
          placeholder="email"
          required
          autocomplete="email"
        >
        <input
          v-model="password"
          type="password"
          placeholder="password"
          required
          autocomplete="current-password"
        >
        <button type="submit" :disabled="loading">
          {{ loading ? 'signing in...' : 'sign in' }}
        </button>
      </form>
    </div>

    <!-- Confirm Delete Dialog -->
    <div v-if="showConfirmDelete" class="confirm-overlay">
      <div class="confirm-dialog">
        <h3>confirm deletion</h3>
        <p>Delete {{ selectedIds.size }} stroke{{ selectedIds.size === 1 ? '' : 's' }} from {{ filterCanvas }}?</p>
        <div class="confirm-actions">
          <button @click="cancelDelete">
            cancel
          </button>
          <button class="delete-btn" @click="confirmDelete">
            delete
          </button>
        </div>
      </div>
    </div>

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
  </div>
</template>

<style>
/* Hide the page footer and page scrollbar behind the fullscreen admin view */
main > div:last-child {
  display: none;
}

html:has(.admin-container) {
  overflow: hidden;
  scrollbar-gutter: unset;
}
</style>

<style scoped>
.admin-container {
  position: fixed;
  inset: 0;
  z-index: 39;
  /* clear the site header and footer chrome */
  padding: 3.5rem 0;
  display: flex;
  flex-direction: column;
  font-family: var(--fonts-mono);
}

html.dark .admin-container canvas {
  filter: invert(1);
}

header {
  border-bottom: 1px dashed var(--fg-deep);
  padding: 1rem 1.75rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.2rem;
}

.admin-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.admin-controls {
  display: flex;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.admin-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.75rem;
  opacity: 0.6;
}

.auth-status {
  display: flex;
  gap: 0.8rem;
  justify-self: end;
}

/* Reuse site button styles */
select,
button {
  background: var(--c-bg);
  color: var(--fg);
  border: 1px dashed var(--fg-deep);
  padding: 0 4px;
  opacity: 0.7;
}

select:hover,
button:hover:not(:disabled) {
  opacity: 1;
}

button:disabled {
  opacity: 0.35;
}

.error-message {
  color: #f44;
  margin: 0;
  padding: 0.5rem 1.75rem;
}

.auth-form,
.confirm-dialog {
  background: var(--c-bg);
  border: 1px dashed var(--fg-deep);
  padding: 1rem;
  min-width: 300px;
}

.auth-form {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.auth-form form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: grid;
  place-items: center;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: end;
}

.delete-btn {
  color: #f44;
  border-color: #f44;
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

.empty-state,
.loading-state {
  display: grid;
  place-items: center;
  height: 100%;
  opacity: 0.6;
}
</style>
