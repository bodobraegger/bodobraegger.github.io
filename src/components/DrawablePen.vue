<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import HoverTooltip from './HoverTooltip.vue'

interface Props {
  penEmoji?: string
  strokeColor?: string
  strokeWidth?: number
  hoverText?: string
}

const props = withDefaults(defineProps<Props>(), {
  penEmoji: '✏️',
  strokeColor: '#111',
  strokeWidth: 3,
  hoverText: 'Drag me to draw!',
})

const penRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const isDrawing = ref(false)
const isHovered = ref(false)
const penPosition = ref({ x: 100, y: 100 })
const mousePosition = ref({ x: 0, y: 0 })

let ctx: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0

// Pen tip offset - adjust these to position the drawing at the visual tip
const TIP_OFFSET_X = -6
const TIP_OFFSET_Y = 50

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

  // Calculate offset from where user clicked within the pen emoji
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  isDragging.value = true
  isDrawing.value = false // Don't start drawing until first movement
  mousePosition.value = { x: e.clientX, y: e.clientY }

  // Calculate pen tip position - will be used when drawing starts
  lastX = penPosition.value.x + TIP_OFFSET_X
  lastY = penPosition.value.y + TIP_OFFSET_Y

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

  // Calculate current pen tip position using same offset
  const currentX = penPosition.value.x + TIP_OFFSET_X
  const currentY = penPosition.value.y + TIP_OFFSET_Y

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
  <div class="drawable-pen-container">
    <canvas
      ref="canvasRef"
      class="drawing-canvas"
    />

    <div
      ref="penRef"
      class="pen-emoji"
      :class="{ dragging: isDragging }"
      :style="{
        left: `${penPosition.x}px`,
        top: `${penPosition.y}px`,
      }"
      @mousedown="startDrag"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      {{ penEmoji }}
    </div>

    <HoverTooltip
      :text="hoverText || ''"
      :x="mousePosition.x"
      :y="mousePosition.y"
      :show="isHovered && !isDragging"
    />
  </div>
</template>

<style scoped>
.drawable-pen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

html.dark .drawing-canvas {
  filter: invert(1);
}

.pen-emoji {
  position: absolute;
  font-size: 2.5rem;
  cursor: grab;
  user-select: none;
  pointer-events: auto;
  transition: transform 0.1s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  z-index: 10000;
  transform: scaleX(-1);
}

.pen-emoji.dragging {
  cursor: grabbing;
  transform: scaleX(-1) scale(1.1) rotate(-15deg);
}

.pen-emoji:hover:not(.dragging) {
  transform: scaleX(-1) scale(1.15);
}
</style>
