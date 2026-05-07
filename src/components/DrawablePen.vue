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
  localStorage?: boolean
  eraserMode?: boolean
  penId?: string
  cloudStorage?: boolean
  cloudStorageId?: string
  maxCanvasHeight?: number
  dragAndDraw?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  penEmoji: '🖉',
  strokeColor: '#111',
  strokeWidth: 3,
  tipOffsetX: 3.6,
  tipOffsetY: 37,
  canvasId: '',
  cloudStorage: false,
  cloudStorageId: '',
  maxCanvasHeight: 10000,
  dragAndDraw: false,
})

const effectiveCanvasId = props.canvasId || window.location.pathname
const effectiveCloudStorageId = props.cloudStorageId || (props.cloudStorage ? window.location.pathname : '')

const penRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isDragging = ref(false)
const isDrawing = ref(false)
const isHovered = ref(false)
const penPosition = ref({ x: 0, y: 0 })
const mousePosition = ref({ x: 0, y: 0 })
const isDetached = ref(false)
const moveOnly = ref(false)
const isPickedUp = ref(false)
const showControls = ref(false)
const currentStrokeColor = ref(props.strokeColor)
const currentStrokeWidth = ref(props.strokeWidth)
const sliderValue = ref(Math.log2(props.strokeWidth)) // Linear slider value that maps to exponential width

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
  if (!props.localStorage)
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
  if (!props.localStorage)
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
  if (!props.localStorage)
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
  if (!props.localStorage)
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
    sharedCtx.lineCap = 'round'
    sharedCtx.lineJoin = 'round'

    sharedCtx.beginPath()
    // Draw in viewport-relative coordinates (subtract scroll position)
    sharedCtx.moveTo(stroke.points[0].x - scrollX, stroke.points[0].y - scrollY)

    if (stroke.points.length === 1) {
      // For single-point strokes (dots), draw a tiny line to make it visible
      sharedCtx.lineTo(stroke.points[0].x - scrollX + 0.1, stroke.points[0].y - scrollY + 0.1)
    }
    else {
      // For multi-point strokes, draw the full path
      for (let i = 1; i < stroke.points.length; i++) {
        sharedCtx.lineTo(stroke.points[i].x - scrollX, stroke.points[i].y - scrollY)
      }
    }
    sharedCtx.stroke()
  }

  sharedCtx.globalCompositeOperation = 'source-over'
}

function notifyUpdate() {
  window.dispatchEvent(new CustomEvent('drawingUpdated', { detail: { canvasId: effectiveCanvasId } }))
}

function notifyReset() {
  window.dispatchEvent(new CustomEvent('toolsReset', { detail: { canvasId: effectiveCanvasId } }))
}

function handleToolsReset(e: Event) {
  // Reset this pen instance when the local reset event is triggered
  if ((e as CustomEvent).detail?.canvasId === effectiveCanvasId) {
    isDetached.value = false
    penPosition.value = { x: 0, y: 0 }
    moveOnly.value = false
    isDragging.value = false
    isDrawing.value = false
    isPickedUp.value = false
    showControls.value = false

    // Clean up event listeners if pen was picked up
    window.removeEventListener('mousemove', handlePenMove)
    window.removeEventListener('mousedown', handlePenMouseDown)
    window.removeEventListener('mouseup', handlePenMouseUp)
    window.removeEventListener('contextmenu', handleRightClick)
  }
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
  window.addEventListener('toolsReset', handleToolsReset)

  loadPenPosition()
  loadFromHash()
  // Only load from Supabase if cloudStorage is enabled
  if (props.cloudStorage && effectiveCloudStorageId)
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
  window.removeEventListener('toolsReset', handleToolsReset)
  window.removeEventListener('keydown', handleClearCommand)
})

function handleStorageChange(e: StorageEvent) {
  if (e.key === storageKey && e.newValue && props.localStorage)
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
    isPickedUp.value = false
    showControls.value = false

    // Clean up event listeners if pen was picked up
    window.removeEventListener('mousemove', handlePenMove)
    window.removeEventListener('mousedown', handlePenMouseDown)
    window.removeEventListener('mouseup', handlePenMouseUp)
    window.removeEventListener('contextmenu', handleRightClick)
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

  // if (lowerChars.includes('delete')) {
  //   typedChars = ''
  //   if (supabase && effectiveShareId) {
  //     clearAllData()
  //     deleteFromSupabase()
  //   }
  // }
  // else if (lowerChars.includes('clear')) {
  //   clearAllData()
  // }
  if (lowerChars.includes('reset')) {
    typedChars = ''
    resetTools()
  }
  else if (lowerChars.includes('share')) {
    typedChars = ''
    exportToHash()
  }
  else if (lowerChars.includes('cloud') && supabase && effectiveCloudStorageId) {
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

  // Automatically save to Supabase if cloudStorage is set
  if (effectiveCloudStorageId && supabase) {
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

  // Automatically save to Supabase if cloudStorage is set
  if (effectiveCloudStorageId && supabase) {
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
  console.info('Saving to Supabase...', { cloudStorageId: effectiveCloudStorageId, canvasId: effectiveCanvasId, strokeCount: allStrokes.length })
  if (!supabase || !effectiveCloudStorageId)
    return
  try {
    const { error } = await supabase.from('drawings').upsert({
      id: effectiveCloudStorageId,
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
  if (!supabase || !effectiveCloudStorageId)
    return
  try {
    const { data, error } = await supabase
      .from('drawings')
      .select('strokes')
      .eq('id', effectiveCloudStorageId)
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

function setupSupabaseSync() {
  if (!supabase || !effectiveCloudStorageId)
    return

  broadcastChannel = supabase
    .channel(`drawing:${effectiveCloudStorageId}:strokes`, { config: { broadcast: { self: false } } })
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

function resetTools() {
  // Notify all local pen instances (on this browser) to reset
  notifyReset()

  // Clear all pen positions from localStorage
  if (props.localStorage) {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`drawable-pen-position-${effectiveCanvasId}-`))
        localStorage.removeItem(key)
    })
  }
}

function startDrag(e: MouseEvent) {
  // Legacy drag-and-draw mode
  if (props.dragAndDraw) {
    startDragLegacy(e)
    return
  }

  // New mode: left-click to pick up only
  if (e.button === 0 && !isPickedUp.value) { // Left click to pick up
    e.preventDefault()
    pickUpPen(e)
  }
}

function pickUpPen(e: MouseEvent) {
  const rect = penRef.value?.getBoundingClientRect()
  if (!rect)
    return

  isPickedUp.value = true
  isDetached.value = true
  showControls.value = true

  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  penPosition.value = { x: e.clientX - offsetX, y: e.clientY - offsetY }
  mousePosition.value = { x: e.clientX, y: e.clientY }

  ;(handlePenMove as any).offsetX = offsetX
  ;(handlePenMove as any).offsetY = offsetY

  window.addEventListener('mousemove', handlePenMove)
  window.addEventListener('mousedown', handlePenMouseDown)
  window.addEventListener('mouseup', handlePenMouseUp)
  window.addEventListener('contextmenu', handleRightClick)
}

function putDownPen() {
  isPickedUp.value = false
  showControls.value = false
  savePenPosition()

  window.removeEventListener('mousemove', handlePenMove)
  window.removeEventListener('mousedown', handlePenMouseDown)
  window.removeEventListener('mouseup', handlePenMouseUp)
  window.removeEventListener('contextmenu', handleRightClick)
}

function handlePenMove(e: MouseEvent) {
  if (!isPickedUp.value)
    return

  const offsetX = (handlePenMove as any).offsetX || 20
  const offsetY = (handlePenMove as any).offsetY || 20

  penPosition.value = { x: e.clientX - offsetX, y: e.clientY - offsetY }
  mousePosition.value = { x: e.clientX, y: e.clientY }

  // Draw if mouse is down
  if (isDrawing.value) {
    drawAtPosition(e, offsetX, offsetY)
  }
}

function handlePenMouseDown(e: MouseEvent) {
  if (e.button === 0 && isPickedUp.value && !e.defaultPrevented) { // Left click while picked up
    e.preventDefault()
    startDrawing(e)
  }
}

function handlePenMouseUp(e: MouseEvent) {
  if (e.button === 0 && isDrawing.value) { // Left click release
    e.preventDefault()
    endDrawing()
  }
}

function handleRightClick(e: MouseEvent) {
  if (isPickedUp.value) {
    e.preventDefault()
    putDownPen()
  }
}

function startDrawing(e: MouseEvent) {
  const offsetX = (handlePenMove as any).offsetX || 20
  const offsetY = (handlePenMove as any).offsetY || 20

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  lastX = e.clientX + scrollX + props.tipOffsetX - offsetX
  lastY = e.clientY + scrollY + props.tipOffsetY - offsetY

  isDrawing.value = true
  currentPath = [{ x: lastX, y: lastY }]

  // Draw a dot for single clicks (no movement)
  if (ctx) {
    const viewScrollX = window.pageXOffset || document.documentElement.scrollLeft
    const viewScrollY = window.pageYOffset || document.documentElement.scrollTop

    ctx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
    ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : currentStrokeColor.value
    ctx.lineWidth = currentStrokeWidth.value
    ctx.lineCap = 'round'

    // Draw a single point as a small line
    ctx.beginPath()
    ctx.moveTo(lastX - viewScrollX, lastY - viewScrollY)
    ctx.lineTo(lastX - viewScrollX + 0.1, lastY - viewScrollY + 0.1)
    ctx.stroke()
  }
}

function drawAtPosition(e: MouseEvent, offsetX: number, offsetY: number) {
  if (!ctx || !isDrawing.value)
    return

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const currentX = e.clientX + scrollX + props.tipOffsetX - offsetX
  const currentY = e.clientY + scrollY + props.tipOffsetY - offsetY

  currentPath.push({ x: currentX, y: currentY })

  const viewScrollX = window.pageXOffset || document.documentElement.scrollLeft
  const viewScrollY = window.pageYOffset || document.documentElement.scrollTop

  ctx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
  ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : currentStrokeColor.value
  ctx.lineWidth = currentStrokeWidth.value

  ctx.beginPath()
  ctx.moveTo(lastX - viewScrollX, lastY - viewScrollY)
  ctx.lineTo(currentX - viewScrollX, currentY - viewScrollY)
  ctx.stroke()

  lastX = currentX
  lastY = currentY
}

function endDrawing() {
  if (isDrawing.value && currentPath.length > 0) {
    canvasData.redoStack.length = 0

    const newStroke: Stroke = {
      points: [...currentPath],
      color: currentStrokeColor.value,
      width: currentStrokeWidth.value,
      isEraser: props.eraserMode,
      userId: currentUserId,
      timestamp: Date.now(),
    }
    allStrokes.push(newStroke)
    saveStrokes()
    notifyUpdate()

    if (effectiveCloudStorageId && supabase) {
      saveToSupabase()
    }

    if (broadcastChannel) {
      broadcastChannel.send({ type: 'broadcast', event: 'stroke_added', payload: { stroke: newStroke } })
    }
  }

  isDrawing.value = false
  currentPath = []
}

const dragLegacy = drag
const endDragLegacy = endDrag

// Legacy drag-and-draw mode
function startDragLegacy(e: MouseEvent) {
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

  ;(dragLegacy as any).offsetX = offsetX
  ;(dragLegacy as any).offsetY = offsetY

  window.addEventListener('mousemove', dragLegacy)
  window.addEventListener('mouseup', endDragLegacy)
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
      ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : currentStrokeColor.value
      ctx.lineWidth = currentStrokeWidth.value

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
      color: currentStrokeColor.value,
      width: currentStrokeWidth.value,
      isEraser: props.eraserMode,
      userId: currentUserId,
      timestamp: Date.now(),
    }
    allStrokes.push(newStroke)
    saveStrokes()
    notifyUpdate()

    // Automatically save to Supabase if cloudStorage is set
    if (effectiveCloudStorageId && supabase) {
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

function handleWidthChange(e: Event) {
  const target = e.target as HTMLInputElement
  const linearValue = Number(target.value)
  sliderValue.value = linearValue
  currentStrokeWidth.value = 2 ** linearValue
}

defineExpose({
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
      :class="{ 'dragging': isDragging || isPickedUp, 'detached': isDetached, 'flipped': flip, 'picked-up': isPickedUp }"
      :style="{
        ...(isDetached ? { position: 'fixed', left: `${penPosition.x}px`, top: `${penPosition.y}px` } : {}),
        color: currentStrokeColor,
      }"
      @mousedown="startDrag"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      {{ penEmoji }}
    </span>
  </span>

  <!-- Control panel when pen is picked up (new mode only) -->
  <div
    v-if="showControls && !props.dragAndDraw"
    class="pen-controls-container"
  >
    <div class="pen-controls-header" @mousedown.stop @mouseup.stop @click.stop>
      <button title="Put down pen (or right-click)" @click="putDownPen">
        ✕
      </button>
      <div class="pen-controls-items">
        <label>
          <input
            v-model.number="sliderValue"
            type="range"
            min="0"
            max="8"
            step="0.1"
            @input="handleWidthChange"
          >
          <span>{{ Math.round(currentStrokeWidth) }}px</span>
        </label>
        <label v-if="!props.eraserMode">
          <input
            v-model="currentStrokeColor"
            type="color"
          >
        </label>
      </div>
    </div>
  </div>

  <HoverTooltip :text="hoverText || ''" :x="mousePosition.x" :y="mousePosition.y" :show="isHovered && !isDragging && !isPickedUp" />
</template>

<style>
:root {
  --pen-filter: drop-shadow(0 2px 4px rgba(255, 127, 255, 0.5));
}

html.dark {
  --pen-filter: invert(1) drop-shadow(0 2px 4px rgba(255, 127, 255, 0.5));
}
</style>

<style scoped>
html.dark .drawing-canvas {
  filter: invert(1);
}

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
  filter: var(--pen-filter, drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)));
  line-height: 1;

  &.detached {
    z-index: 10000;
  }

  &.dragging,
  &.picked-up {
    cursor: grabbing;
    transform: scale(1.1) rotate(-5deg);
  }

  &:hover:not(.dragging):not(.picked-up) {
    transform: scale(1.15);
  }

  &.flipped {
    transform: scaleX(-1);

    &.dragging,
    &.picked-up {
      transform: scaleX(-1) scale(1.1) rotate(5deg);
    }

    &:hover:not(.dragging):not(.picked-up) {
      transform: scaleX(-1) scale(1.15);
    }
  }
}

.pen-controls-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  right: auto;
  z-index: 10001;
  pointer-events: none;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.pen-controls-header {
  pointer-events: auto;
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1.75rem;
  justify-content: center;
}

/* Remove backdrop filter on very large screens (matching header behavior) */
@media (min-width: 1817px) {
  .pen-controls-container {
    backdrop-filter: unset;
    -webkit-backdrop-filter: unset;
  }
}

.pen-controls-header button {
  cursor: pointer;
}

.pen-controls-items {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: nowrap;
}

.pen-controls-items label {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  white-space: nowrap;
}

.pen-controls-items input[type='range'] {
  cursor: pointer;
  min-width: 100px;
}

/* Shrink range input if not enough room */
@media (min-width: 640px) and (max-width: 900px) {
  .pen-controls-items input[type='range'] {
    min-width: 60px;
    width: 60px;
  }
}

.pen-controls-items input[type='color'] {
  cursor: pointer;
  height: 2rem;
  width: 3rem;
}

.pen-controls-items span {
  font-family: monospace;
  font-size: 0.875rem;
  min-width: 3rem;
}
</style>
