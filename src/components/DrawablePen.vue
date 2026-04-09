<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
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
  penId?: string // Unique ID for this pen instance to save its position
}

const props = withDefaults(defineProps<Props>(), {
  penEmoji: '✏️',
  strokeColor: '#111',
  strokeWidth: 3,
  tipOffsetX: 5,
  tipOffsetY: 45,
  canvasId: '', // Will be auto-set to current page path
})

// Use current page path as default canvasId
const effectiveCanvasId = props.canvasId || window.location.pathname

const penRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const backgroundCanvasRef = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const isDrawing = ref(false)
const isHovered = ref(false)
const penPosition = ref({ x: 0, y: 0 })
const mousePosition = ref({ x: 0, y: 0 })
const isDetached = ref(false)
const moveOnly = ref(false)
const flip = props.penEmoji === '✏️' || props.flip

// Auto-generate unique pen ID based on props if not provided
const autoPenId = `${props.penEmoji}-${props.strokeColor}-${props.strokeWidth}-${props.eraserMode}`
const effectivePenId = props.penId || autoPenId

let ctx: CanvasRenderingContext2D | null = null
let bgCtx: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0
let currentPath: { x: number, y: number }[] = []
let saveTimeout: number | null = null
let rafId: number | null = null

// Global shared canvas state per canvasId
const globalCanvases = ((window as any).__drawablePenCanvases__ ||= {})
const canvasData = (globalCanvases[effectiveCanvasId] ||= {
  strokes: [] as { points: { x: number, y: number }[], color: string, width: number, isEraser?: boolean }[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  backgroundCanvas: null as HTMLCanvasElement | null,
  bgCtx: null as CanvasRenderingContext2D | null,
})
const allStrokes = canvasData.strokes
const storageKey = `drawable-pen-${effectiveCanvasId}`
const penStorageKey = `drawable-pen-position-${effectiveCanvasId}-${effectivePenId}`

// Path simplification using Ramer-Douglas-Peucker algorithm
function simplifyPath(points: { x: number, y: number }[], tolerance = 2.0): { x: number, y: number }[] {
  if (points.length <= 2)
    return points

  function perpendicularDistance(point: { x: number, y: number }, lineStart: { x: number, y: number }, lineEnd: { x: number, y: number }): number {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y
    const mag = Math.sqrt(dx * dx + dy * dy)
    if (mag === 0)
      return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2)
    const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag)
    const ix = lineStart.x + u * dx
    const iy = lineStart.y + u * dy
    return Math.sqrt((point.x - ix) ** 2 + (point.y - iy) ** 2)
  }

  function rdp(points: { x: number, y: number }[], start: number, end: number, tolerance: number): { x: number, y: number }[] {
    let maxDist = 0
    let index = 0

    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(points[i], points[start], points[end])
      if (dist > maxDist) {
        maxDist = dist
        index = i
      }
    }

    if (maxDist > tolerance) {
      const left = rdp(points, start, index, tolerance)
      const right = rdp(points, index, end, tolerance)
      return [...left.slice(0, -1), ...right]
    }
    else {
      return [points[start], points[end]]
    }
  }

  return rdp(points, 0, points.length - 1, tolerance)
}

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

  // Debounce saves to avoid blocking on every stroke
  if (saveTimeout)
    clearTimeout(saveTimeout)

  saveTimeout = window.setTimeout(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(allStrokes))
    }
    catch (e) {
      console.warn('Failed to save strokes:', e)
    }
  }, 500)
}

function redrawAll() {
  const { bgCtx: sharedBgCtx, backgroundCanvas: sharedBgCanvas } = canvasData
  if (!sharedBgCtx || !sharedBgCanvas)
    return

  sharedBgCtx.clearRect(0, 0, sharedBgCanvas.width, sharedBgCanvas.height)

  for (const stroke of allStrokes) {
    sharedBgCtx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over'
    sharedBgCtx.strokeStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color
    sharedBgCtx.lineWidth = stroke.width

    sharedBgCtx.beginPath()
    sharedBgCtx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i++) {
      sharedBgCtx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    sharedBgCtx.stroke()
  }

  sharedBgCtx.globalCompositeOperation = 'source-over'
}

function drawCurrentStroke() {
  if (!ctx || currentPath.length === 0)
    return

  const { canvas, backgroundCanvas, bgCtx: sharedBgCtx } = canvasData
  if (!canvas || !backgroundCanvas)
    return

  // Clear foreground
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // For eraser mode, we need to show the effect in real-time
  // Copy background and apply current eraser stroke to it
  if (props.eraserMode && sharedBgCtx) {
    // Hide background, show composite on foreground
    backgroundCanvas.style.opacity = '0'

    ctx.drawImage(backgroundCanvas, 0, 0)

    // Draw eraser stroke
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
    ctx.lineWidth = props.strokeWidth

    ctx.beginPath()
    ctx.moveTo(currentPath[0].x, currentPath[0].y)
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x, currentPath[i].y)
    }
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
  }
  else {
    // For normal drawing, just draw the current stroke
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = props.strokeColor
    ctx.lineWidth = props.strokeWidth

    ctx.beginPath()
    ctx.moveTo(currentPath[0].x, currentPath[0].y)
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x, currentPath[i].y)
    }
    ctx.stroke()
  }
}

function scheduleRedraw() {
  if (rafId !== null)
    return

  rafId = requestAnimationFrame(() => {
    drawCurrentStroke()
    rafId = null
  })
}

function notifyUpdate() {
  window.dispatchEvent(new CustomEvent('drawingUpdated', { detail: { canvasId: effectiveCanvasId } }))
}

onMounted(() => {
  // Check if stored canvas still exists in DOM, if not reset it
  if (canvasData.canvas && !document.body.contains(canvasData.canvas)) {
    canvasData.canvas = null
    canvasData.ctx = null
    canvasData.backgroundCanvas = null
    canvasData.bgCtx = null
  }

  if (!canvasData.canvas && canvasRef.value && backgroundCanvasRef.value) {
    // First instance - initialize shared canvases
    const width = Math.max(document.documentElement.scrollWidth, window.innerWidth)
    const height = Math.max(document.documentElement.scrollHeight, window.innerHeight)

    // Background canvas for completed strokes
    canvasData.backgroundCanvas = backgroundCanvasRef.value
    canvasData.backgroundCanvas.width = width
    canvasData.backgroundCanvas.height = height
    canvasData.bgCtx = canvasData.backgroundCanvas.getContext('2d')
    bgCtx = canvasData.bgCtx

    // Foreground canvas for current stroke
    canvasData.canvas = canvasRef.value
    canvasData.canvas.width = width
    canvasData.canvas.height = height
    canvasData.ctx = canvasData.canvas.getContext('2d')
    ctx = canvasData.ctx

    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    if (bgCtx) {
      bgCtx.lineCap = 'round'
      bgCtx.lineJoin = 'round'
    }

    loadStrokes()

    // Redraw any existing strokes
    if (allStrokes.length > 0) {
      redrawAll()
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('drawingUpdated', handleDrawingUpdate)
  }
  else {
    // Subsequent instances - use shared canvas
    ctx = canvasData.ctx
    bgCtx = canvasData.bgCtx
    if (canvasRef.value)
      canvasRef.value.style.display = 'none'
    if (backgroundCanvasRef.value)
      backgroundCanvasRef.value.style.display = 'none'
  }

  // Load this pen's saved position
  loadPenPosition()

  // Listen for global "clear" command
  window.addEventListener('keydown', handleClearCommand)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('drawingUpdated', handleDrawingUpdate)
  window.removeEventListener('keydown', handleClearCommand)

  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
})

function handleStorageChange(e: StorageEvent) {
  if (e.key === storageKey && e.newValue && props.save)
    loadStrokes()
}

function handleDrawingUpdate(e: Event) {
  if ((e as CustomEvent).detail?.canvasId === effectiveCanvasId)
    redrawAll()
}

function handleResize() {
  const { bgCtx: sharedBgCtx, backgroundCanvas: sharedBgCanvas, ctx: sharedCtx, canvas: sharedCanvas } = canvasData
  if (!sharedBgCtx || !sharedBgCanvas || !sharedCtx || !sharedCanvas)
    return

  const bgImageData = sharedBgCtx.getImageData(0, 0, sharedBgCanvas.width, sharedBgCanvas.height)
  const width = Math.max(document.documentElement.scrollWidth, window.innerWidth)
  const height = Math.max(document.documentElement.scrollHeight, window.innerHeight)

  sharedBgCanvas.width = width
  sharedBgCanvas.height = height
  sharedCanvas.width = width
  sharedCanvas.height = height

  sharedBgCtx.putImageData(bgImageData, 0, 0)

  if (sharedCtx) {
    sharedCtx.lineCap = 'round'
    sharedCtx.lineJoin = 'round'
  }
  if (sharedBgCtx) {
    sharedBgCtx.lineCap = 'round'
    sharedBgCtx.lineJoin = 'round'
  }
}

// Track typed characters for "clear" command
const typedCharsBuffer: string[] = []
let typedTimeout: number | null = null

function handleClearCommand(e: KeyboardEvent) {
  // Ignore if user is typing in an input/textarea
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    return

  // Add character to buffer
  typedCharsBuffer.push(e.key.toLowerCase())

  // Keep buffer size reasonable
  if (typedCharsBuffer.length > 10)
    typedCharsBuffer.shift()

  // Clear timeout
  if (typedTimeout)
    clearTimeout(typedTimeout)

  // Reset after 2 seconds of no typing
  typedTimeout = window.setTimeout(() => {
    typedCharsBuffer.length = 0
  }, 2000)

  // Check if "clear" was typed
  const typed = typedCharsBuffer.join('')
  if (typed.includes('clear')) {
    typedCharsBuffer.length = 0
    clearAllData()
  }
}

function clearAllData() {
  const { bgCtx: sharedBgCtx, backgroundCanvas: sharedBgCanvas, ctx: sharedCtx, canvas: sharedCanvas } = canvasData
  if (sharedBgCtx && sharedBgCanvas && sharedCtx && sharedCanvas) {
    sharedBgCtx.clearRect(0, 0, sharedBgCanvas.width, sharedBgCanvas.height)
    sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
    allStrokes.length = 0
    currentPath = []

    // Clear from localStorage
    if (props.save) {
      localStorage.removeItem(storageKey)
      // Clear all pen positions for this canvasId
      const keysToRemove: string[] = []
      const prefix = `drawable-pen-position-${effectiveCanvasId}-`
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }

    // Reset all pens to inline position
    isDetached.value = false
    penPosition.value = { x: 0, y: 0 }

    // Notify other pens
    notifyUpdate()
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

  // Account for scroll position
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

      // Use requestAnimationFrame to batch drawing updates
      scheduleRedraw()

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
    allStrokes.push({
      points: [...currentPath],
      color: props.strokeColor,
      width: props.strokeWidth,
      isEraser: props.eraserMode,
    })

    // Draw completed stroke to background canvas
    if (bgCtx) {
      bgCtx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
      bgCtx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : props.strokeColor
      bgCtx.lineWidth = props.strokeWidth

      bgCtx.beginPath()
      bgCtx.moveTo(currentPath[0].x, currentPath[0].y)
      for (let i = 1; i < currentPath.length; i++) {
        bgCtx.lineTo(currentPath[i].x, currentPath[i].y)
      }
      bgCtx.stroke()
      bgCtx.globalCompositeOperation = 'source-over'
    }

    // Clear foreground canvas and show background again
    if (ctx && canvasData.canvas) {
      ctx.clearRect(0, 0, canvasData.canvas.width, canvasData.canvas.height)
    }
    if (canvasData.backgroundCanvas) {
      canvasData.backgroundCanvas.style.opacity = '1'
    }

    saveStrokes()
    notifyUpdate()
  }

  isDragging.value = false
  isDrawing.value = false
  moveOnly.value = false
  currentPath = []

  // Save pen position when drag ends
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
    const { bgCtx: sharedBgCtx, backgroundCanvas: sharedBgCanvas, ctx: sharedCtx, canvas: sharedCanvas } = canvasData
    if (sharedBgCtx && sharedBgCanvas && sharedCtx && sharedCanvas) {
      sharedBgCtx.clearRect(0, 0, sharedBgCanvas.width, sharedBgCanvas.height)
      sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
      allStrokes.length = 0
      currentPath = []
      saveStrokes()
    }
  },
  saveDrawing: saveStrokes,
  loadDrawing: loadStrokes,
})
</script>

<template>
  <canvas ref="backgroundCanvasRef" class="drawing-canvas background-canvas" />
  <canvas ref="canvasRef" class="drawing-canvas foreground-canvas" />

  <span class="pen-inline-container">
    <span
      ref="penRef"
      class="pen-emoji"
      :class="{ dragging: isDragging, detached: isDetached, flipped: flip }"
      :style="isDetached ? { position: 'fixed', left: `${penPosition.x}px`, top: `${penPosition.y}px` } : {}"
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
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.background-canvas {
  z-index: 9997;
}

.foreground-canvas {
  z-index: 9998;
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
  transform: scale(1.1) rotate(-15deg);
}

.pen-emoji:hover:not(.dragging) {
  transform: scale(1.15);
}

.pen-emoji.flipped {
  transform: scaleX(-1);
}

.pen-emoji.flipped.dragging {
  transform: scaleX(-1) scale(1.1) rotate(15deg);
}

.pen-emoji.flipped:hover:not(.dragging) {
  transform: scaleX(-1) scale(1.15);
}
</style>
