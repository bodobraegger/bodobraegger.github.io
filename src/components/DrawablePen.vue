<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '../lib/supabase'
import HoverTooltip from './HoverTooltip.vue'

interface Props {
  penEmoji?: string
  strokeColor?: string
  strokeWidth?: number
  hoverText?: string
  tipOffsetX?: number
  tipOffsetY?: number
  flip?: boolean
  canvasId?: string
  save?: boolean
  eraserMode?: boolean
  penId?: string
  shareId?: string
  maxCanvasHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  penEmoji: '🖉',
  strokeColor: '#111',
  strokeWidth: 3,
  tipOffsetX: 3.6,
  tipOffsetY: 37,
  canvasId: '',
  shareId: '',
  maxCanvasHeight: 10000,
})

const effectiveCanvasId = props.canvasId || window.location.pathname
const effectiveShareId = props.shareId || window.location.pathname

const penRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const isDrawing = ref(false)
const isHovered = ref(false)
const penPosition = ref({ x: 0, y: 0 })
const mousePosition = ref({ x: 0, y: 0 })
const isDetached = ref(false)
const moveOnly = ref(false)

const autoPenId = `${props.penEmoji}-${props.strokeColor}-${props.strokeWidth}-${props.eraserMode}`
const effectivePenId = props.penId || autoPenId
const notWindows = !navigator.userAgent.includes('Win')
const flip = (props.penEmoji === '✏️' && notWindows) || props.flip

let ctx: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0
let currentPath: { x: number, y: number }[] = []
let broadcastChannel: any = null

// Generate or retrieve persistent user ID
function getUserId(): string {
  const storageKey = 'drawable-pen-user-id'
  try {
    let userId = localStorage.getItem(storageKey)
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(storageKey, userId)
    }
    return userId
  }
  catch {
    // Fallback to session-based ID if localStorage unavailable
    if (!(window as any).__drawablePenUserId__) {
      (window as any).__drawablePenUserId__ = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    return (window as any).__drawablePenUserId__
  }
}

const currentUserId = getUserId()

interface Stroke {
  points: { x: number, y: number }[]
  color: string
  width: number
  isEraser?: boolean
  userId?: string
  timestamp?: number
}

const globalCanvases = ((window as any).__drawablePenCanvases__ ||= {})
const canvasData = (globalCanvases[effectiveCanvasId] ||= {
  strokes: [] as Stroke[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  undoStack: [] as Stroke[][], // Not used anymore but kept for compatibility
  redoStack: [] as Stroke[], // Stack of individual strokes that can be redone
  undoHandlerRegistered: false,
  scrollHandlerRegistered: false,
})
const allStrokes = canvasData.strokes
const storageKey = `drawable-pen-${effectiveCanvasId}`
const penStorageKey = `drawable-pen-position-${effectiveCanvasId}-${effectivePenId}`

function loadPenPosition() {
  if (!props.save)
    return
  try {
    const saved = localStorage.getItem(penStorageKey)
    if (saved) {
      const position = JSON.parse(saved)
      isDetached.value = position.isDetached
      if (position.isDetached) {
        penPosition.value = position.position
      }
    }
  }
  catch (e) {
    console.warn('Failed to load pen position:', e)
  }
}

function savePenPosition() {
  if (!props.save)
    return
  try {
    localStorage.setItem(penStorageKey, JSON.stringify({
      isDetached: isDetached.value,
      position: penPosition.value,
    }))
  }
  catch (e) {
    console.warn('Failed to save pen position:', e)
  }
}

function loadStrokes() {
  if (!props.save)
    return
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      allStrokes.length = 0
      allStrokes.push(...JSON.parse(saved))
      redrawAll()
    }
  }
  catch (e) {
    console.warn('Failed to load strokes:', e)
  }
}

function saveStrokes() {
  if (!props.save)
    return
  try {
    localStorage.setItem(storageKey, JSON.stringify(allStrokes))
  }
  catch (e) {
    console.warn('Failed to save strokes:', e)
  }
}

function redrawAll() {
  const { ctx: sharedCtx, canvas: sharedCanvas } = canvasData
  if (!sharedCtx || !sharedCanvas)
    return

  sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)

  // Get viewport bounds
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const buffer = 100 // Buffer to render slightly outside viewport

  // Position canvas at current scroll position
  if (sharedCanvas.style.transform !== `translate(${scrollX}px, ${scrollY}px)`) {
    sharedCanvas.style.transform = `translate(${scrollX}px, ${scrollY}px)`
  }

  // Only render strokes that are visible in viewport
  for (const stroke of allStrokes) {
    // Quick bounds check
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const p of stroke.points) {
      if (p.x < minX)
        minX = p.x
      if (p.x > maxX)
        maxX = p.x
      if (p.y < minY)
        minY = p.y
      if (p.y > maxY)
        maxY = p.y
    }

    // Skip if stroke is completely outside viewport
    if (maxX < scrollX - buffer || minX > scrollX + viewportWidth + buffer
      || maxY < scrollY - buffer || minY > scrollY + viewportHeight + buffer) {
      continue
    }

    sharedCtx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over'
    sharedCtx.strokeStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color
    sharedCtx.lineWidth = stroke.width

    sharedCtx.beginPath()
    // Draw in viewport-relative coordinates (subtract scroll position)
    sharedCtx.moveTo(stroke.points[0].x - scrollX, stroke.points[0].y - scrollY)
    for (let i = 1; i < stroke.points.length; i++) {
      sharedCtx.lineTo(stroke.points[i].x - scrollX, stroke.points[i].y - scrollY)
    }
    sharedCtx.stroke()
  }

  sharedCtx.globalCompositeOperation = 'source-over'
}

function notifyUpdate() {
  window.dispatchEvent(new CustomEvent('drawingUpdated', { detail: { canvasId: effectiveCanvasId } }))
}

function notifyClear() {
  window.dispatchEvent(new CustomEvent('drawingCleared', { detail: { canvasId: effectiveCanvasId } }))
}

onMounted(() => {
  // Check if stored canvas still exists in DOM, if not reset it
  if (canvasData.canvas && !document.body.contains(canvasData.canvas)) {
    canvasData.canvas = null
    canvasData.ctx = null
  }

  if (!canvasData.canvas && canvasRef.value) {
    canvasData.canvas = canvasRef.value
    // Canvas is viewport-sized, not document-sized
    canvasData.canvas.width = window.innerWidth
    canvasData.canvas.height = window.innerHeight
    canvasData.ctx = canvasData.canvas.getContext('2d')
    ctx = canvasData.ctx

    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    loadStrokes()
    if (allStrokes.length > 0)
      redrawAll()

    window.addEventListener('resize', handleResize)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('drawingUpdated', handleDrawingUpdate)
    window.addEventListener('keydown', handleClearCommand)

    if (!canvasData.undoHandlerRegistered) {
      window.addEventListener('keydown', handleUndoRedo)
      canvasData.undoHandlerRegistered = true
    }

    if (!canvasData.scrollHandlerRegistered) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      canvasData.scrollHandlerRegistered = true
    }
  }
  else {
    ctx = canvasData.ctx
    if (canvasRef.value)
      canvasRef.value.style.display = 'none'
  }

  // All pen instances need to listen for clear events
  window.addEventListener('drawingCleared', handleDrawingCleared)

  loadPenPosition()
  loadFromHash()
  if (effectiveShareId)
    loadFromSupabase()

  const cleanup = setupSupabaseSync()
  if (cleanup)
    onUnmounted(cleanup)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('drawingUpdated', handleDrawingUpdate)
  window.removeEventListener('drawingCleared', handleDrawingCleared)
  window.removeEventListener('keydown', handleClearCommand)
})

function handleStorageChange(e: StorageEvent) {
  if (e.key === storageKey && e.newValue && props.save)
    loadStrokes()
}

function handleDrawingUpdate(e: Event) {
  if ((e as CustomEvent).detail?.canvasId === effectiveCanvasId)
    redrawAll()
}

function handleDrawingCleared(e: Event) {
  if ((e as CustomEvent).detail?.canvasId === effectiveCanvasId) {
    isDetached.value = false
    penPosition.value = { x: 0, y: 0 }
  }
}

function handleResize() {
  const { canvas: sharedCanvas } = canvasData
  if (!sharedCanvas)
    return

  // Resize canvas to match viewport
  sharedCanvas.width = window.innerWidth
  sharedCanvas.height = window.innerHeight
  redrawAll()
}

function handleScroll() {
  // Redraw when scrolling to show different parts of the infinite canvas
  redrawAll()
}

let typedChars = ''
let typedTimeout: number | null = null

function handleClearCommand(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    return

  // Ignore modifier keys
  if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key))
    return

  typedChars += e.key

  typedChars = typedChars.slice(-6)

  if (typedTimeout)
    clearTimeout(typedTimeout)
  typedTimeout = window.setTimeout(() => typedChars = '', 2000)

  const lowerChars = typedChars.toLowerCase()

  if (lowerChars.includes('delete')) {
    typedChars = ''
    if (supabase && effectiveShareId) {
      clearAllData()
      deleteFromSupabase()
    }
  }
  else if (lowerChars.includes('clear')) {
    clearAllData()
  }
  else if (lowerChars.includes('share')) {
    typedChars = ''
    exportToHash()
  }
  else if (lowerChars.includes('cloud') && supabase && effectiveShareId) {
    typedChars = ''
    saveToSupabase()
  }
}

function handleUndoRedo(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault()
      undo()
    }
    else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault()
      redo()
    }
  }
}

function undo() {
  // Find the last stroke by current user
  let lastUserStrokeIndex = -1
  for (let i = allStrokes.length - 1; i >= 0; i--) {
    if (allStrokes[i].userId === currentUserId) {
      lastUserStrokeIndex = i
      break
    }
  }

  if (lastUserStrokeIndex === -1)
    return // No strokes by current user to undo

  // Save to redo stack (only the stroke being removed)
  const removedStroke = allStrokes[lastUserStrokeIndex]
  canvasData.redoStack.push({ ...removedStroke, points: [...removedStroke.points] })

  // Remove the stroke
  allStrokes.splice(lastUserStrokeIndex, 1)

  redrawAll()
  saveStrokes()
  notifyUpdate()

  // Automatically save to Supabase if shareId is set
  if (effectiveShareId && supabase) {
    saveToSupabase()
  }

  // Broadcast the removal to other clients with full stroke data
  if (broadcastChannel) {
    broadcastChannel.send({
      type: 'broadcast',
      event: 'stroke_removed',
      payload: {
        stroke: removedStroke,
      },
    })
  }
}

function redo() {
  if (canvasData.redoStack.length === 0)
    return

  const strokeToRestore = canvasData.redoStack.pop()
  if (!strokeToRestore)
    return

  // Add the stroke back
  allStrokes.push(strokeToRestore)

  redrawAll()
  saveStrokes()
  notifyUpdate()

  // Automatically save to Supabase if shareId is set
  if (effectiveShareId && supabase) {
    saveToSupabase()
  }

  // Broadcast the restoration to other clients
  if (broadcastChannel) {
    broadcastChannel.send({
      type: 'broadcast',
      event: 'stroke_added',
      payload: {
        stroke: strokeToRestore,
      },
    })
  }
}

function compressData(strokes: any[]) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(strokes))))
}

function decompressData(compressed: string) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(compressed))))
  }
  catch {
    return null
  }
}

function exportToHash() {
  console.info('Exporting drawing to URL hash...', { strokeCount: allStrokes.length })
  const url = `${window.location.origin}${window.location.pathname}#draw=${compressData(allStrokes)}`
  navigator.clipboard.writeText(url)
}

function loadFromHash() {
  const match = window.location.hash.match(/#draw=(.+)/)
  if (match) {
    const data = decompressData(match[1])
    if (data) {
      allStrokes.length = 0
      allStrokes.push(...data)
      redrawAll()
      saveStrokes()
    }
  }
}

async function saveToSupabase() {
  console.info('Saving to Supabase...', { shareId: effectiveShareId, canvasId: effectiveCanvasId, strokeCount: allStrokes.length })
  if (!supabase || !effectiveShareId)
    return
  try {
    const { error } = await supabase.from('drawings').upsert({
      id: effectiveShareId,
      canvas_id: effectiveCanvasId,
      strokes: allStrokes,
      updated_at: new Date().toISOString(),
    })
    if (error) {
      console.error('Supabase save error:', error)
    }
    else {
      console.info('Successfully saved to Supabase')
    }
  }
  catch (e) {
    console.error('Supabase save failed:', e)
  }
}

async function loadFromSupabase() {
  if (!supabase || !effectiveShareId)
    return
  try {
    const { data, error } = await supabase
      .from('drawings')
      .select('strokes')
      .eq('id', effectiveShareId)
      .single()

    if (!error && data?.strokes) {
      allStrokes.length = 0
      allStrokes.push(...data.strokes)
      redrawAll()
      saveStrokes()
    }
  }
  catch (e) {
    console.error('Supabase load failed:', e)
  }
}

async function deleteFromSupabase() {
  console.info('Deleting from Supabase...', { shareId: effectiveShareId })
  if (!supabase || !effectiveShareId)
    return

  try {
    const { error } = await supabase
      .from('drawings')
      .delete()
      .eq('id', effectiveShareId)

    if (error) {
      console.error('Supabase delete error:', error)
    }
    else {
      console.info('Successfully deleted from Supabase')
    }
  }
  catch (e) {
    console.error('Supabase delete failed:', e)
  }
}

function setupSupabaseSync() {
  if (!supabase || !effectiveShareId)
    return

  broadcastChannel = supabase
    .channel(`drawing:${effectiveShareId}:strokes`, { config: { broadcast: { self: false } } })
    .on('broadcast', { event: 'stroke_added' }, ({ payload }) => {
      if (payload.stroke) {
        allStrokes.push(payload.stroke)
        redrawAll()
        saveStrokes()
      }
    })
    .on('broadcast', { event: 'stroke_removed' }, ({ payload }) => {
      // Find and remove the stroke by matching userId and timestamp
      // This is more reliable than using index which can change
      if (payload.stroke) {
        const index = allStrokes.findIndex((s: Stroke) =>
          s.userId === payload.stroke.userId
          && s.timestamp === payload.stroke.timestamp
          && JSON.stringify(s.points) === JSON.stringify(payload.stroke.points),
        )
        if (index !== -1) {
          console.info(`Removing stroke from user ${payload.stroke.userId}`)
          allStrokes.splice(index, 1)
          redrawAll()
          saveStrokes()
        }
      }
    })
    .on('broadcast', { event: 'clear' }, () => {
      allStrokes.length = 0
      redrawAll()
      saveStrokes()
      // Also reset pen position on clear
      isDetached.value = false
      penPosition.value = { x: 0, y: 0 }
    })
    .subscribe()

  return () => {
    if (broadcastChannel && supabase) {
      supabase.removeChannel(broadcastChannel)
      broadcastChannel = null
    }
  }
}

function clearAllData() {
  console.info('Clearing canvas')
  const { ctx: sharedCtx, canvas: sharedCanvas } = canvasData
  if (sharedCtx && sharedCanvas) {
    sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
    allStrokes.length = 0
    currentPath = []

    if (props.save) {
      localStorage.removeItem(storageKey)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`drawable-pen-position-${effectiveCanvasId}-`))
          localStorage.removeItem(key)
      })
    }

    isDetached.value = false
    penPosition.value = { x: 0, y: 0 }

    // if (broadcastChannel) {
    //   broadcastChannel.send({ type: 'broadcast', event: 'clear', payload: {} })
    // }

    // notifyUpdate()
    // notifyClear()
  }
}

function startDrag(e: MouseEvent) {
  const rect = penRef.value?.getBoundingClientRect()
  if (!rect)
    return

  if (!isDetached.value) {
    isDetached.value = true
    penPosition.value = { x: rect.left, y: rect.top }
  }

  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  isDragging.value = true
  moveOnly.value = e.shiftKey
  isDrawing.value = false
  mousePosition.value = { x: e.clientX, y: e.clientY }
  currentPath = []

  // Account for scroll position when starting to draw
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  lastX = rect.left + scrollX + props.tipOffsetX
  lastY = rect.top + scrollY + props.tipOffsetY

  e.preventDefault()

  ;(drag as any).offsetX = offsetX
  ;(drag as any).offsetY = offsetY

  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', endDrag)
}

function drag(e: MouseEvent) {
  if (!isDragging.value)
    return

  const offsetX = (drag as any).offsetX || 20
  const offsetY = (drag as any).offsetY || 20
  penPosition.value = { x: e.clientX - offsetX, y: e.clientY - offsetY }
  mousePosition.value = { x: e.clientX, y: e.clientY }

  // Account for scroll position when drawing
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const currentX = e.clientX + scrollX + props.tipOffsetX - offsetX
  const currentY = e.clientY + scrollY + props.tipOffsetY - offsetY

  if (ctx && !moveOnly.value) {
    if (!isDrawing.value) {
      isDrawing.value = true
      currentPath = [{ x: currentX, y: currentY }]
      lastX = currentX
      lastY = currentY
    }
    else {
      currentPath.push({ x: currentX, y: currentY })

      // Get current scroll position to transform coordinates
      const viewScrollX = window.pageXOffset || document.documentElement.scrollLeft
      const viewScrollY = window.pageYOffset || document.documentElement.scrollTop

      ctx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
      ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : props.strokeColor
      ctx.lineWidth = props.strokeWidth

      ctx.beginPath()
      ctx.moveTo(lastX - viewScrollX, lastY - viewScrollY)
      ctx.lineTo(currentX - viewScrollX, currentY - viewScrollY)
      ctx.stroke()

      lastX = currentX
      lastY = currentY
    }
  }
  else if (moveOnly.value) {
    lastX = currentX
    lastY = currentY
  }
}

function endDrag() {
  if (isDrawing.value && currentPath.length > 0) {
    // Clear redo stack when a new stroke is added
    canvasData.redoStack.length = 0

    const newStroke: Stroke = {
      points: [...currentPath],
      color: props.strokeColor,
      width: props.strokeWidth,
      isEraser: props.eraserMode,
      userId: currentUserId,
      timestamp: Date.now(),
    }
    allStrokes.push(newStroke)
    saveStrokes()
    notifyUpdate()

    // Automatically save to Supabase if shareId is set
    if (effectiveShareId && supabase) {
      saveToSupabase()
    }

    if (broadcastChannel) {
      broadcastChannel.send({ type: 'broadcast', event: 'stroke_added', payload: { stroke: newStroke } })
    }
  }

  isDragging.value = false
  isDrawing.value = false
  moveOnly.value = false
  currentPath = []
  savePenPosition()

  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', endDrag)
}

function handleMouseMove(e: MouseEvent) {
  if (isHovered.value && !isDragging.value) {
    mousePosition.value = { x: e.clientX, y: e.clientY }
  }
}

function handleMouseEnter(e: MouseEvent) {
  isHovered.value = true
  mousePosition.value = { x: e.clientX, y: e.clientY }
}

function handleMouseLeave() {
  isHovered.value = false
}

defineExpose({
  clearCanvas: () => {
    const { ctx: sharedCtx, canvas: sharedCanvas } = canvasData
    if (sharedCtx && sharedCanvas) {
      sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
      allStrokes.length = 0
      currentPath = []
      saveStrokes()
    }
  },
  saveDrawing: saveStrokes,
  loadDrawing: loadStrokes,
  exportToHash,
  loadFromHash,
  saveToSupabase,
  loadFromSupabase,
})
</script>

<template>
  <canvas ref="canvasRef" class="drawing-canvas" />

  <span class="pen-inline-container">
    <span
      ref="penRef"
      class="pen-emoji"
      :class="{ dragging: isDragging, detached: isDetached, flipped: flip }"
      :style="{
        ...(isDetached ? { position: 'fixed', left: `${penPosition.x}px`, top: `${penPosition.y}px` } : {}),
        color: strokeColor,
      }"
      @mousedown="startDrag"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      {{ penEmoji }}
    </span>
  </span>

  <HoverTooltip :text="hoverText || ''" :x="mousePosition.x" :y="mousePosition.y" :show="isHovered && !isDragging" />
</template>

<style scoped>
.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9998;
  will-change: transform;
}

html.dark .drawing-canvas {
  filter: invert(1);
}

.pen-inline-container {
  display: inline-block;
  position: relative;
  vertical-align: middle;
  line-height: 0;
  width: 2.5rem;
  height: 2.5rem;
}

.pen-emoji {
  display: inline-block;
  font-size: 2.5rem;
  cursor: grab;
  user-select: none;
  transition: transform 0.1s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  line-height: 1;
}

.pen-emoji.detached {
  z-index: 10000;
}

.pen-emoji.dragging {
  cursor: grabbing;
  transform: scale(1.1) rotate(-5deg);
}

.pen-emoji:hover:not(.dragging) {
  transform: scale(1.15);
}

.pen-emoji.flipped {
  transform: scaleX(-1);
}

.pen-emoji.flipped.dragging {
  transform: scaleX(-1) scale(1.1) rotate(5deg);
}

.pen-emoji.flipped:hover:not(.dragging) {
  transform: scaleX(-1) scale(1.15);
}
</style>
