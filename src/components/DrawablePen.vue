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
let lastX = 0
let lastY = 0
let currentPath: { x: number, y: number }[] = []

// Global shared canvas state per canvasId
const globalCanvases = ((window as any).__drawablePenCanvases__ ||= {})
const canvasData = (globalCanvases[effectiveCanvasId] ||= {
  strokes: [] as { points: { x: number, y: number }[], color: string, width: number, isEraser?: boolean }[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
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

  for (const stroke of allStrokes) {
    sharedCtx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over'
    sharedCtx.strokeStyle = stroke.isEraser ? 'rgba(0,0,0,1)' : stroke.color
    sharedCtx.lineWidth = stroke.width

    sharedCtx.beginPath()
    sharedCtx.moveTo(stroke.points[0].x, stroke.points[0].y)
    for (let i = 1; i < stroke.points.length; i++) {
      sharedCtx.lineTo(stroke.points[i].x, stroke.points[i].y)
    }
    sharedCtx.stroke()
  }

  sharedCtx.globalCompositeOperation = 'source-over'
}

function notifyUpdate() {
  window.dispatchEvent(new CustomEvent('drawingUpdated', { detail: { canvasId: effectiveCanvasId } }))
}

onMounted(() => {
  // Check if stored canvas still exists in DOM, if not reset it
  if (canvasData.canvas && !document.body.contains(canvasData.canvas)) {
    canvasData.canvas = null
    canvasData.ctx = null
  }

  if (!canvasData.canvas && canvasRef.value) {
    // First instance - initialize shared canvas
    canvasData.canvas = canvasRef.value
    // Use document dimensions to cover the entire scrollable area
    canvasData.canvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth)
    canvasData.canvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
    canvasData.ctx = canvasData.canvas.getContext('2d')
    ctx = canvasData.ctx

    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    loadStrokes()

    // Redraw any existing strokes (in case we navigated back to a page with existing strokes)
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
    if (canvasRef.value)
      canvasRef.value.style.display = 'none'
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
  const { ctx: sharedCtx, canvas: sharedCanvas } = canvasData
  if (!sharedCtx || !sharedCanvas)
    return

  const imageData = sharedCtx.getImageData(0, 0, sharedCanvas.width, sharedCanvas.height)
  // Update to cover entire scrollable area
  sharedCanvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth)
  sharedCanvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight)
  sharedCtx.putImageData(imageData, 0, 0)
}

// Track typed characters for "clear" command
let typedChars = ''
let typedTimeout: number | null = null

function handleClearCommand(e: KeyboardEvent) {
  // Ignore if user is typing in an input/textarea
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    return

  // Add character to buffer
  typedChars += e.key.toLowerCase()

  // Clear timeout
  if (typedTimeout)
    clearTimeout(typedTimeout)

  // Reset after 2 seconds of no typing
  typedTimeout = window.setTimeout(() => {
    typedChars = ''
  }, 2000)

  // Check if "clear" was typed
  if (typedChars.includes('clear')) {
    typedChars = ''
    clearAllData()
  }
}

function clearAllData() {
  const { ctx: sharedCtx, canvas: sharedCanvas } = canvasData
  if (sharedCtx && sharedCanvas) {
    sharedCtx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
    allStrokes.length = 0
    currentPath = []

    // Clear from localStorage
    if (props.save) {
      localStorage.removeItem(storageKey)
      // Clear all pen positions for this canvasId
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`drawable-pen-position-${effectiveCanvasId}-`)) {
          localStorage.removeItem(key)
        }
      })
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
      redrawAll()

      // Draw current path in progress
      ctx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
      ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : props.strokeColor
      ctx.lineWidth = props.strokeWidth

      ctx.beginPath()
      ctx.moveTo(currentPath[0].x, currentPath[0].y)
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y)
      }
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
    allStrokes.push({
      points: [...currentPath],
      color: props.strokeColor,
      width: props.strokeWidth,
      isEraser: props.eraserMode,
    })
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
})
</script>

<template>
  <canvas ref="canvasRef" class="drawing-canvas" />

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
