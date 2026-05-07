<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Stroke as BaseStroke } from '../types/strokes'
import { drawStroke } from '../utils/canvas'

// Admin-specific stroke type with required fields
interface AdminStroke extends BaseStroke {
  id: string
  stroke_id: string
  canvas_id: string
  user_id: string
  created_at: string
}

const strokes = ref<AdminStroke[]>([])
const loading = ref(true)
const error = ref('')
const selectedStrokes = ref<Set<string>>(new Set())
const filterCanvas = ref('')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const dragEnd = ref({ x: 0, y: 0 })
const undoStack = ref<string[][]>([])
const redoStack = ref<string[][]>([])
const user = ref<User | null>(null)
const email = ref('')
const password = ref('')
const showAuth = ref(false)
const showConfirmDelete = ref(false)
let ctx: CanvasRenderingContext2D | null = null
let overlayCtx: CanvasRenderingContext2D | null = null

if (!supabase) {
  error.value = 'Supabase is not configured.'
  loading.value = false
}

const canvases = computed(() => {
  const unique = new Set(strokes.value.map(s => s.canvas_id))
  return Array.from(unique).sort()
})

const filteredStrokes = computed(() => {
  if (!filterCanvas.value)
    return []
  return strokes.value.filter(s => s.canvas_id === filterCanvas.value)
})

async function loadStrokes() {
  if (!supabase)
    return

  loading.value = true
  error.value = ''

  try {
    const { data, error: err } = await supabase
      .from('strokes')
      .select('*')
      .order('created_at', { ascending: true })

    if (err)
      throw err

    strokes.value = data || []

    if (canvases.value.length > 0 && !filterCanvas.value) {
      filterCanvas.value = canvases.value[0]
    }
  }
  catch (e: any) {
    error.value = e.message || 'Failed to load strokes'
    console.error('Load error:', e)
  }
  finally {
    loading.value = false
  }
}

function calculateCanvasBounds() {
  if (filteredStrokes.value.length === 0) {
    return { width: 800, height: 600 } // Default size when no strokes
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  // Find the bounding box of all strokes
  filteredStrokes.value.forEach((stroke) => {
    stroke.points.forEach((point) => {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    })
  })

  // Add padding
  const padding = 100
  const width = Math.max(maxX - minX + padding * 2, 800)
  const height = Math.max(maxY - minY + padding * 2, 600)

  return { width, height, offsetX: minX - padding, offsetY: minY - padding }
}

function setupCanvas() {
  if (!canvasRef.value)
    return

  const canvas = canvasRef.value
  const container = canvas.parentElement
  if (!container)
    return

  // Calculate bounds based on stroke positions
  const bounds = calculateCanvasBounds()

  // Set canvas to encompass all strokes with padding
  canvas.width = bounds.width
  canvas.height = bounds.height
  ctx = canvas.getContext('2d')

  // Setup overlay canvas
  if (overlayCanvasRef.value) {
    overlayCanvasRef.value.width = canvas.width
    overlayCanvasRef.value.height = canvas.height
    overlayCtx = overlayCanvasRef.value.getContext('2d')
  }

  drawAll()
}

function drawAll() {
  if (!ctx || !canvasRef.value)
    return

  const canvas = canvasRef.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw strokes using shared utility
  filteredStrokes.value.forEach((stroke) => {
    if (!ctx)
      return
    const isSelected = selectedStrokes.value.has(stroke.stroke_id)
    drawStroke(ctx, stroke, { isSelected, showAsEraser: true })
  })
}

function drawSelectionRect() {
  if (!overlayCtx || !overlayCanvasRef.value)
    return

  const canvas = overlayCanvasRef.value
  overlayCtx.clearRect(0, 0, canvas.width, canvas.height)

  if (isDragging.value) {
    overlayCtx.strokeStyle = '#4444ff'
    overlayCtx.lineWidth = 2
    overlayCtx.setLineDash([5, 5])
    const x = Math.min(dragStart.value.x, dragEnd.value.x)
    const y = Math.min(dragStart.value.y, dragEnd.value.y)
    const w = Math.abs(dragEnd.value.x - dragStart.value.x)
    const h = Math.abs(dragEnd.value.y - dragStart.value.y)
    overlayCtx.strokeRect(x, y, w, h)
    overlayCtx.setLineDash([])
  }
}

function handleMouseDown(e: MouseEvent) {
  if (!canvasRef.value)
    return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  dragStart.value = { x, y }
  dragEnd.value = { x, y }
  isDragging.value = true
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value)
    return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (isDragging.value) {
    dragEnd.value = { x, y }
    drawSelectionRect() // Only redraw selection rectangle, not all strokes
  }
}

function handleMouseUp(e: MouseEvent) {
  if (!canvasRef.value || !isDragging.value)
    return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  dragEnd.value = { x, y }
  isDragging.value = false
  drawSelectionRect() // Clear the selection rectangle

  const dragDistance = Math.sqrt(
    (dragEnd.value.x - dragStart.value.x) ** 2
    + (dragEnd.value.y - dragStart.value.y) ** 2,
  )

  if (dragDistance < 5) {
    // Click - check if we hit a stroke
    let hitStroke = false
    for (let i = filteredStrokes.value.length - 1; i >= 0; i--) {
      const stroke = filteredStrokes.value[i]
      if (isPointNearStroke(x, y, stroke)) {
        toggleStroke(stroke.stroke_id)
        hitStroke = true
        break
      }
    }

    // If we didn't hit any stroke, deselect all
    if (!hitStroke) {
      selectedStrokes.value.clear()
    }
  }
  else {
    const minX = Math.min(dragStart.value.x, dragEnd.value.x)
    const minY = Math.min(dragStart.value.y, dragEnd.value.y)
    const maxX = Math.max(dragStart.value.x, dragEnd.value.x)
    const maxY = Math.max(dragStart.value.y, dragEnd.value.y)

    filteredStrokes.value.forEach((stroke) => {
      if (strokeTouchesRect(stroke, minX, minY, maxX, maxY)) {
        selectedStrokes.value.add(stroke.stroke_id)
      }
    })
  }

  drawAll()
}

function strokeTouchesRect(stroke: AdminStroke, minX: number, minY: number, maxX: number, maxY: number): boolean {
  for (const point of stroke.points) {
    if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
      return true
    }
  }

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i]
    const p2 = stroke.points[i + 1]

    if (lineIntersectsRect(p1.x, p1.y, p2.x, p2.y, minX, minY, maxX, maxY)) {
      return true
    }
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
    const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
    if (dist <= threshold)
      return true
  }

  for (let i = 0; i < stroke.points.length - 1; i++) {
    const p1 = stroke.points[i]
    const p2 = stroke.points[i + 1]

    if (distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y) <= threshold) {
      return true
    }
  }

  return false
}

function distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared))
  const projX = x1 + t * dx
  const projY = y1 + t * dy

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
}

function toggleStroke(strokeId: string) {
  if (selectedStrokes.value.has(strokeId)) {
    selectedStrokes.value.delete(strokeId)
  }
  else {
    selectedStrokes.value.add(strokeId)
  }
  drawAll()
}

function saveState() {
  undoStack.value.push(Array.from(selectedStrokes.value))
  redoStack.value = []
}

function undo() {
  if (undoStack.value.length === 0)
    return
  redoStack.value.push(Array.from(selectedStrokes.value))
  const prevState = undoStack.value.pop()!
  selectedStrokes.value = new Set(prevState)
  drawAll()
}

function redo() {
  if (redoStack.value.length === 0)
    return
  undoStack.value.push(Array.from(selectedStrokes.value))
  const nextState = redoStack.value.pop()!
  selectedStrokes.value = new Set(nextState)
  drawAll()
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    return

  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    undo()
  }
  else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault()
    redo()
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

async function deleteSelected() {
  if (selectedStrokes.value.size === 0 || !supabase)
    return

  // Check authentication
  if (!user.value) {
    error.value = 'You must be authenticated to delete strokes'
    showAuth.value = true
    return
  }

  // Show confirmation UI instead of browser confirm
  showConfirmDelete.value = true
}

async function confirmDelete() {
  if (!supabase)
    return

  showConfirmDelete.value = false
  saveState()

  loading.value = true
  error.value = ''

  try {
    const strokeIds = Array.from(selectedStrokes.value)

    const { error: err } = await supabase
      .from('strokes')
      .delete()
      .in('stroke_id', strokeIds)

    if (err)
      throw err

    strokes.value = strokes.value.filter(s => !selectedStrokes.value.has(s.stroke_id))
    selectedStrokes.value.clear()
    drawAll()
  }
  catch (e: any) {
    error.value = e.message || 'Failed to delete strokes'
    console.error('Delete error:', e)
  }
  finally {
    loading.value = false
  }
}

function cancelDelete() {
  showConfirmDelete.value = false
}

watch(filterCanvas, () => {
  selectedStrokes.value.clear()
  undoStack.value = []
  redoStack.value = []
  setTimeout(() => {
    setupCanvas()
  }, 50)
})

onMounted(async () => {
  // Check initial auth state
  if (supabase) {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user.value = currentUser

    // Subscribe to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  loadStrokes()
  setupCanvas()

  window.addEventListener('resize', setupCanvas)
  window.addEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="admin-container">
    <header class="admin-header">
      <span>stroke admin</span>

      <div class="admin-controls">
        <select v-if="!loading || strokes.length > 0" v-model="filterCanvas">
          <option value="">
            choose canvas
          </option>
          <option v-for="canvas in canvases" :key="canvas" :value="canvas">
            {{ canvas }}
          </option>
        </select>
        <button v-if="!loading || strokes.length > 0" :disabled="loading" @click="loadStrokes">
          refresh
        </button>
        <button
          v-if="!loading || strokes.length > 0"
          :disabled="selectedStrokes.size === 0 || !user"
          :title="!user ? 'Sign in to delete' : ''"
          @click="deleteSelected"
        >
          delete ({{ selectedStrokes.size }})
        </button>
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

    <p v-if="error">
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
        <p>Delete {{ selectedStrokes.size }} stroke{{ selectedStrokes.size === 1 ? '' : 's' }}?</p>
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

    <div class="canvas-container">
      <canvas
        v-if="filterCanvas"
        ref="canvasRef"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      />
      <canvas
        v-if="filterCanvas"
        ref="overlayCanvasRef"
        class="overlay-canvas"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
      />

      <div v-else-if="!loading" class="empty-state">
        <p>select a canvas to begin</p>
      </div>

      <div v-if="loading && strokes.length === 0" class="loading-state">
        <p>loading strokes...</p>
      </div>
    </div>
  </div>
</template>

<style>
main > div:last-child {
  display: none;
}
</style>

<style scoped>
html {
  overflow: hidden;
  scrollbar-gutter: unset;
}

.admin-container {
  position: fixed;
  inset: 0;
  z-index: 999;
  font-family: var(--fonts-mono);
}

html.dark .admin-container canvas {
  filter: invert(1);
}

header {
  position: sticky;
  /* account for the normal page header */
  top: 3.5rem;
  background: transparent;
  border-bottom: 1px dashed var(--fg-deep);
  padding: 1.25rem 1.75rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1.2rem;
}

.admin-controls {
  display: flex;
  gap: 1.2rem;
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

.delete-btn {
  color: #f44;
  border-color: #f44;
}

.canvas-container {
  position: absolute;
  top: 7.9rem;
  left: 0;
  right: 0;
  bottom: 3.5rem;
  /* scroll without scrollbars */
  overflow: auto;
  scrollbar-width: none;
}

canvas {
  cursor: crosshair;
}

.overlay-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
</style>
