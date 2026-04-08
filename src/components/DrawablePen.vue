<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import HoverTooltip from './HoverTooltip.vue'

interface Props {
  penEmoji?: string
  strokeColor?: string
  strokeWidth?: number
  hoverText?: string
  initialX?: number
  initialY?: number
}

const props = withDefaults(defineProps<Props>(), {
  penEmoji: '✏️',
  strokeColor: '#111',
  strokeWidth: 3,
})

const penRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const inlineContainerRef = ref<HTMLSpanElement>()
const isDragging = ref(false)
const isDrawing = ref(false)
const isHovered = ref(false)
const penPosition = ref({ x: 0, y: 0 }) // Relative to viewport when dragging
const mousePosition = ref({ x: 0, y: 0 })
const isDetached = ref(false) // Track if pen has been dragged away from inline position

let ctx: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0

// Pen tip offset - adjust these to position the drawing at the visual tip
const TIP_OFFSET_X = -5
const TIP_OFFSET_Y = 35

onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  if (canvasRef.value && ctx) {
    const imageData = ctx.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
    ctx.putImageData(imageData, 0, 0)
  }
}

function startDrag(e: MouseEvent) {
  const rect = penRef.value?.getBoundingClientRect()
  if (!rect)
    return

  // Detach from inline position on first drag
  if (!isDetached.value) {
    isDetached.value = true
    // Set initial viewport position based on current position
    penPosition.value = {
      x: rect.left,
      y: rect.top,
    }
  }

  // Calculate offset from where user clicked within the pen emoji
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  isDragging.value = true
  isDrawing.value = false // Don't start drawing until first movement
  mousePosition.value = { x: e.clientX, y: e.clientY }

  // Calculate pen tip position - will be used when drawing starts
  lastX = rect.left + TIP_OFFSET_X
  lastY = rect.top + TIP_OFFSET_Y

  e.preventDefault()

  // Store the click offset for dragging
  ;(drag as any).offsetX = offsetX
  ;(drag as any).offsetY = offsetY

  // Add global mouse move and mouse up listeners
  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', endDrag)
}

function drag(e: MouseEvent) {
  if (!isDragging.value)
    return

  // Move pen based on where user grabbed it
  const offsetX = (drag as any).offsetX || 20
  const offsetY = (drag as any).offsetY || 20
  penPosition.value = {
    x: e.clientX - offsetX,
    y: e.clientY - offsetY,
  }
  mousePosition.value = { x: e.clientX, y: e.clientY }

  // Calculate current pen tip position - use actual viewport position
  const currentX = e.clientX + TIP_OFFSET_X - (drag as any).offsetX
  const currentY = e.clientY + TIP_OFFSET_Y - (drag as any).offsetY

  if (ctx) {
    if (!isDrawing.value) {
      // First movement - just update position without drawing
      isDrawing.value = true
      lastX = currentX
      lastY = currentY
    }
    else {
      // Draw line from last position to current
      ctx.strokeStyle = props.strokeColor
      ctx.lineWidth = props.strokeWidth
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(currentX, currentY)
      ctx.stroke()
      lastX = currentX
      lastY = currentY
    }
  }
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

function endDrag() {
  isDragging.value = false
  isDrawing.value = false

  // Remove global listeners
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', endDrag)
}

// Expose clear method for parent components if needed
defineExpose({
  clearCanvas: () => {
    if (ctx && canvasRef.value) {
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  },
})
</script>

<template>
  <!-- Canvas layer for drawing - fixed position covering viewport -->
  <canvas
    ref="canvasRef"
    class="drawing-canvas"
  />

  <!-- Inline container that flows with document content -->
  <span ref="inlineContainerRef" class="pen-inline-container">
    <span
      ref="penRef"
      class="pen-emoji"
      :class="{ dragging: isDragging, detached: isDetached }"
      :style="isDetached ? {
        position: 'fixed',
        left: `${penPosition.x}px`,
        top: `${penPosition.y}px`,
      } : {}"
      @mousedown="startDrag"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      {{ penEmoji }}
    </span>
  </span>

  <HoverTooltip
    :text="hoverText || ''"
    :x="mousePosition.x"
    :y="mousePosition.y"
    :show="isHovered && !isDragging"
  />
</template>

<style scoped>
.drawing-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
  /* Fixed size to prevent reflow when pen detaches */
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
  transform: scaleX(-1);
  line-height: 1;
}

.pen-emoji.detached {
  z-index: 10000;
}

.pen-emoji.dragging {
  cursor: grabbing;
  transform: scaleX(-1) scale(1.1) rotate(-15deg);
}

.pen-emoji:hover:not(.dragging) {
  transform: scaleX(-1) scale(1.15);
}
</style>
