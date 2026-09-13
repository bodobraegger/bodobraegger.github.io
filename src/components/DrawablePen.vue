<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, toRef, watch } from 'vue'
import { getSupabase, getUserId } from '../lib/supabase'
import type { Stroke } from '../types/strokes'
import { drawStroke } from '../utils/canvas'
import { splitLanguageSuffix } from '../logics/languages'
import type { PenEntry } from '../logics/pens'
import { PEN_GLYPH_TIP, getPenRegistry, registerPen, unregisterPen, usesPenGlyph } from '../logics/pens'
import HoverTooltip from './HoverTooltip.vue'
import PenGlyph from './PenGlyph.vue'
import PenToolbar from './PenToolbar.vue'

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
  /** Offer this pen in the touch toolbar on phones and tablets. */
  mobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  penEmoji: '🖉',
  strokeColor: '#111111',
  strokeWidth: 3,
  tipOffsetX: 3.6,
  tipOffsetY: 37,
  canvasId: '',
  cloudStorage: false,
  cloudStorageId: '',
  maxCanvasHeight: 10000,
  dragAndDraw: false,
  mobile: false,
})

// Translations of a page share one canvas, so the default id drops the language suffix.
const pageBasePath = typeof window !== 'undefined' ? splitLanguageSuffix(window.location.pathname).basePath : ''
const effectiveCanvasId = props.canvasId || pageBasePath
const effectiveCloudStorageId = props.cloudStorageId || (props.cloudStorage ? pageBasePath : '')

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
const controlsVisible = ref(false)
// Where the ink leaves a drawn pencil, measured from the pen's own corner. The
// hand-set offsets stay in charge of the pens that are still emoji.
const glyphTip = ref<{ x: number, y: number } | null>(null)

const autoPenId = `${props.penEmoji}-${props.strokeColor}-${props.strokeWidth}-${props.eraserMode}`
const effectivePenId = props.penId || autoPenId

// Color and width live in one shared entry, so the pen's own controls and the
// touch toolbar always write to the same values.
const penEntry = reactive<PenEntry>({
  color: props.strokeColor,
  emoji: props.penEmoji,
  eraser: !!props.eraserMode,
  id: effectivePenId,
  width: props.strokeWidth,
})
const currentStrokeColor = toRef(penEntry, 'color')
const currentStrokeWidth = toRef(penEntry, 'width')
const sliderValue = ref(Math.log2(props.strokeWidth)) // Linear slider value that maps to exponential width

// Computed pen size based on stroke width with offset
const penFontSize = computed(() => {
  // Base size with subtle correlation to stroke width
  // Offset of 2.3rem + stroke width mapped to rems (divided by 40 for subtle scaling)
  const baseSize = 2.3 // Base offset in rem
  const widthContribution = currentStrokeWidth.value / 40 // Scale stroke width to rem (more subtle)
  return `${baseSize + widthContribution}rem`
})

// Computed tip offsets that scale with the dynamic pen size
// The base offsets (3.6, 37) were for a 2.3rem pen, so we scale proportionally
const scaledTipOffsetX = computed(() => {
  const baseSize = 2.3
  const currentSize = 2.3 + currentStrokeWidth.value / 40
  const scale = currentSize / baseSize
  return props.tipOffsetX * scale
})

const scaledTipOffsetY = computed(() => {
  const baseSize = 2.3
  const currentSize = 2.3 + currentStrokeWidth.value / 40
  const scale = currentSize / baseSize
  return props.tipOffsetY * scale
})

// The drawn pencil reports its own point, the emoji pens keep the hand-set one.
const tipOffsetX = computed(() => glyphTip.value ? glyphTip.value.x : scaledTipOffsetX.value)
const tipOffsetY = computed(() => glyphTip.value ? glyphTip.value.y : scaledTipOffsetY.value)

// Computed in onMounted to avoid accessing navigator at module-init time (SSR-safe)
const flip = ref(false)

let ctx: CanvasRenderingContext2D | null = null
let lastX = 0
let lastY = 0
let strokeTipX = 0
let strokeTipY = 0
let currentPath: { x: number, y: number }[] = []
let broadcastChannel: any = null
let stopSupabaseSync: (() => void) | null = null

const currentUserId = getUserId()

// --- Touch support -------------------------------------------------------
// On a phone there is no cursor to carry a pen around, so all pens of a canvas
// share one toolbar: tap a pen to take it in hand, then draw with one finger
// and scroll with two. One instance (the first one mounted) renders that
// toolbar and owns the touch layer for the whole page.
const registry = getPenRegistry(effectiveCanvasId)
const registryId = ref(effectivePenId)
const isTouch = ref(false)
const touchEnabled = computed(() => props.mobile && isTouch.value)
const isToolbarOwner = computed(() => registry.ownerId.value === registryId.value)
const activePen = computed(() => registry.pens.find(pen => pen.id === registry.activeId.value) ?? null)
const showTouchHint = ref(false)
const touchHintKey = 'drawable-pen-touch-hint'

const touchLayer = ref<HTMLElement>()
let drawingTouchId: number | null = null
let gestureIsScroll = false
let touchPen: PenEntry | null = null
let hintTimeout: number | null = null

// Global state to track which pen is currently picked up.
// Server render has no window, so it gets a fresh local object per render.
const globalPickedUpPen = typeof window === 'undefined'
  ? { penId: null }
  : ((window as any).__drawablePenPickedUp__ ||= { penId: null })

const globalCanvases = typeof window === 'undefined'
  ? {}
  : ((window as any).__drawablePenCanvases__ ||= {})
const canvasData = (globalCanvases[effectiveCanvasId] ||= {
  strokes: [] as Stroke[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  undoStack: [] as Stroke[][], // Not used anymore but kept for compatibility
  redoStack: [] as Stroke[], // Stack of individual strokes that can be redone
  top: 0, // Where the canvas band sits in the page
  height: 0, // How tall that band is, in CSS pixels
  docHeight: 0, // Page height without the canvas itself
  undoHandlerRegistered: false,
  scrollHandlerRegistered: false,
  supabaseLoaded: false, // Track if we've already loaded from Supabase for this canvas
})
const allStrokes = canvasData.strokes
// Whether this instance registered the shared window handlers for its canvas
let ownsUndoHandler = false
let ownsScrollHandler = false
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

/** The page height, measured without the canvas, which sits in the page too. */
function measureDocumentHeight() {
  const canvas = canvasData.canvas
  const display = canvas?.style.display
  if (canvas)
    canvas.style.display = 'none'
  const height = document.documentElement.scrollHeight
  if (canvas)
    canvas.style.display = display ?? ''
  return height
}

/** Where a band of the given height sits when the page is at this offset. */
function bandTopFor(scrollY: number) {
  const height = canvasData.height
  const middle = Math.round(scrollY - (height - window.innerHeight) / 2)
  const lowest = Math.max(0, canvasData.docHeight - height)
  return Math.min(Math.max(middle, 0), lowest)
}

/**
 * The canvas covers a band of the page twice the height of the viewport, at the
 * screen's pixel density, with the context scaled back to CSS pixels. The band
 * belongs to the page, not to the viewport, so the browser carries it along
 * while the page scrolls: no drawing code runs during a scroll, and the strokes
 * cannot fall behind the text. Only a scroll that leaves the band moves it.
 */
function sizeCanvas(canvas: HTMLCanvasElement) {
  const ratio = Math.min(window.devicePixelRatio || 1, 3)
  const width = window.innerWidth

  canvasData.docHeight = measureDocumentHeight()
  const height = Math.min(window.innerHeight * 2, Math.max(window.innerHeight, canvasData.docHeight))

  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  canvasData.height = height
  canvasData.top = bandTopFor(window.pageYOffset || document.documentElement.scrollTop)

  const canvasCtx = canvas.getContext('2d')
  if (canvasCtx) {
    // Resizing the bitmap resets the context, so the scale and the line style
    // are applied again here.
    canvasCtx.setTransform(ratio, 0, 0, ratio, 0, 0)
    canvasCtx.lineCap = 'round'
    canvasCtx.lineJoin = 'round'
  }
  return canvasCtx
}

function redrawAll() {
  const { ctx: sharedCtx, canvas: sharedCanvas } = canvasData
  if (!sharedCtx || !sharedCanvas)
    return

  const top = canvasData.top
  const height = canvasData.height

  sharedCtx.clearRect(0, 0, window.innerWidth, height)

  // Place the band in the page
  const transform = `translateY(${top}px)`
  if (sharedCanvas.style.transform !== transform)
    sharedCanvas.style.transform = transform

  // Only render strokes that reach into the band
  for (const stroke of allStrokes) {
    // Quick bounds check
    let minY = Infinity
    let maxY = -Infinity
    for (const p of stroke.points) {
      if (p.y < minY)
        minY = p.y
      if (p.y > maxY)
        maxY = p.y
    }

    if (maxY < top || minY > top + height)
      continue

    // Use shared drawing utility
    drawStroke(sharedCtx, stroke, { scrollX: 0, scrollY: top })
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
    hideControls()

    // Clean up event listeners if pen was picked up
    window.removeEventListener('mousemove', handlePenMove)
    window.removeEventListener('mousedown', handlePenMouseDown)
    window.removeEventListener('mouseup', handlePenMouseUp)
    window.removeEventListener('contextmenu', handleRightClick)
  }
}

onMounted(() => {
  // Safe to access navigator here (client-only, no SSR risk)
  const notWindows = !navigator.userAgent.includes('Win')
  flip.value = (props.penEmoji === '✏️' && notWindows) || !!props.flip

  // Check if stored canvas still exists in DOM, if not reset it
  if (canvasData.canvas && !document.body.contains(canvasData.canvas)) {
    canvasData.canvas = null
    canvasData.ctx = null
  }

  if (!canvasData.canvas && canvasRef.value) {
    canvasData.canvas = canvasRef.value
    // Canvas is viewport-sized, not document-sized
    canvasData.ctx = sizeCanvas(canvasData.canvas)
    ctx = canvasData.ctx

    loadStrokes()
    if (allStrokes.length > 0)
      redrawAll()

    window.addEventListener('resize', handleResize)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('drawingUpdated', handleDrawingUpdate)
    window.addEventListener('keydown', handleClearCommand)

    if (!canvasData.undoHandlerRegistered) {
      window.addEventListener('keydown', handleUndoRedo, { capture: true })
      canvasData.undoHandlerRegistered = true
      ownsUndoHandler = true
    }

    if (!canvasData.scrollHandlerRegistered) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      canvasData.scrollHandlerRegistered = true
      ownsScrollHandler = true
    }
  }
  else {
    ctx = canvasData.ctx
    if (canvasRef.value)
      canvasRef.value.style.display = 'none'
  }

  // All pen instances need to listen for reset events
  window.addEventListener('toolsReset', handleToolsReset)

  isTouch.value = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
  if (props.mobile)
    registryId.value = registerPen(effectiveCanvasId, penEntry)

  loadPenPosition()
  nextTick(measureGlyphTip)
  loadFromHash()
  // Only load from Supabase if cloudStorage is enabled
  if (props.cloudStorage && effectiveCloudStorageId)
    loadFromSupabase()

  // setupSupabaseSync is async (it awaits the lazily-loaded client), so its
  // cleanup is stored for the plain onUnmounted below instead of being
  // registered here: Vue only accepts lifecycle hook registration
  // synchronously within a hook callback, not after an await.
  void setupSupabaseSync().then((cleanup) => {
    stopSupabaseSync = cleanup ?? null
  })
})

onUnmounted(() => {
  stopSupabaseSync?.()

  if (props.mobile)
    unregisterPen(effectiveCanvasId, registryId.value)
  if (hintTimeout)
    clearTimeout(hintTimeout)

  window.removeEventListener('resize', handleResize)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('drawingUpdated', handleDrawingUpdate)
  window.removeEventListener('toolsReset', handleToolsReset)
  window.removeEventListener('keydown', handleClearCommand)

  // Only the instance that registered the shared handlers may remove them;
  // other instances hold different function identities for the same canvas.
  if (ownsUndoHandler) {
    window.removeEventListener('keydown', handleUndoRedo, { capture: true })
    canvasData.undoHandlerRegistered = false
  }
  if (ownsScrollHandler) {
    window.removeEventListener('scroll', handleScroll)
    canvasData.scrollHandlerRegistered = false
  }
})

/**
 * Works out where the ink leaves a drawn pencil, as an offset from the corner
 * of the pen.
 *
 * Both the point and that corner are taken on the screen, and only the distance
 * between them is kept. An offset inside the pen holds in the page as well,
 * while a position on the screen would not: the page itself is shifted against
 * the screen here, because the root carries a filter.
 *
 * The corner is worked out from the middle of the pen, since a tilt turns the
 * pen about its middle and leaves that point where it is.
 */
function measureGlyphTip() {
  const pen = penRef.value
  const glyph = pen?.querySelector('svg') as SVGSVGElement | null
  const screen = glyph?.getScreenCTM?.()
  if (!usesPenGlyph(props.penEmoji) || !pen || !glyph || !screen) {
    glyphTip.value = null
    return
  }

  const point = glyph.createSVGPoint()
  point.x = PEN_GLYPH_TIP.x
  point.y = PEN_GLYPH_TIP.y
  const tip = point.matrixTransform(screen)

  const style = getComputedStyle(pen)
  const rect = pen.getBoundingClientRect()
  const width = Number.parseFloat(style.width) || rect.width
  const height = Number.parseFloat(style.height) || rect.height
  const transform = style.transform === 'none' ? null : new DOMMatrixReadOnly(style.transform)
  const middleX = rect.left + rect.width / 2 - (transform?.e ?? 0)
  const middleY = rect.top + rect.height / 2 - (transform?.f ?? 0)

  glyphTip.value = {
    x: tip.x - (middleX - width / 2),
    y: tip.y - (middleY - height / 2),
  }
}

// The pen eases into the hand, so the point is read again once it has settled.
watch(
  () => [isPickedUp.value, isDragging.value, isDetached.value, currentStrokeWidth.value],
  () => nextTick(measureGlyphTip),
)

function handleStorageChange(e: StorageEvent) {
  if (e.key === storageKey && e.newValue && props.localStorage)
    loadStrokes()
}

function handleDrawingUpdate(e: Event) {
  if ((e as CustomEvent).detail?.canvasId === effectiveCanvasId)
    redrawAll()
}

function handleResize() {
  const { canvas: sharedCanvas } = canvasData
  if (!sharedCanvas)
    return

  // A phone hides and shows its address bar as the page scrolls, which changes
  // the viewport height alone. The band is half a viewport taller than it needs
  // to be, so it still covers the page and needs no rebuild.
  if (sharedCanvas.style.width === `${window.innerWidth}px` && window.innerHeight <= canvasData.height)
    return

  // Resize canvas to match viewport
  canvasData.ctx = sizeCanvas(sharedCanvas)
  ctx = canvasData.ctx
  redrawAll()
}

function handleScroll() {
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  // The browser carries the band along with the page, so a scroll inside the
  // band costs nothing at all.
  if (scrollY >= canvasData.top && scrollY + window.innerHeight <= canvasData.top + canvasData.height)
    return

  // The page can have grown since the band was measured.
  if (scrollY + window.innerHeight > canvasData.docHeight)
    canvasData.docHeight = measureDocumentHeight()

  canvasData.top = bandTopFor(scrollY)
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
}

function handleUndoRedo(e: KeyboardEvent) {
  // Don't interfere with typing in input fields
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
    return

  // Check if target is inside pen controls - still allow undo/redo
  const isControlPanel = (e.target as HTMLElement)?.closest?.('.pen-controls-container')

  if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault()
      e.stopPropagation()
      undo()
    }
    else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault()
      e.stopPropagation()
      redo()
    }
  }
  // Also support Ctrl+Shift+Z for redo
  else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault()
    e.stopPropagation()
    redo()
  }
}

async function undo() {
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
  const removedStrokeCopy = { ...removedStroke, points: [...removedStroke.points] }

  // Try to delete from Supabase FIRST before modifying local state
  // (deleteStrokeFromSupabase no-ops when the client isn't configured)
  if (effectiveCloudStorageId && removedStroke.id) {
    try {
      await deleteStrokeFromSupabase(removedStroke.id)
    }
    catch (error) {
      console.error('Failed to delete stroke from backend:', error)
      return // Don't proceed with local removal
    }
  }

  // Only proceed with local changes if backend delete succeeded (or no backend)
  canvasData.redoStack.push(removedStrokeCopy)
  allStrokes.splice(lastUserStrokeIndex, 1)

  redrawAll()
  saveStrokes()
  notifyUpdate()

  // Broadcast for real-time collaboration (only after successful backend delete)
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

async function redo() {
  if (canvasData.redoStack.length === 0)
    return

  const strokeToRestore = canvasData.redoStack.pop()
  if (!strokeToRestore)
    return

  // Try to save to Supabase FIRST before modifying local state
  // (saveStrokeToSupabase no-ops when the client isn't configured)
  if (effectiveCloudStorageId) {
    try {
      await saveStrokeToSupabase(strokeToRestore)
    }
    catch (error) {
      console.error('Failed to save stroke to backend:', error)
      canvasData.redoStack.push(strokeToRestore) // Put it back
      return // Don't proceed with local addition
    }
  }

  // Only proceed with local changes if backend save succeeded (or no backend)
  allStrokes.push(strokeToRestore)

  redrawAll()
  saveStrokes()
  notifyUpdate()

  // Broadcast for real-time collaboration (only after successful backend save)
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

// Save a single stroke to Supabase (new schema - one row per stroke)
async function saveStrokeToSupabase(stroke: Stroke) {
  if (!effectiveCloudStorageId)
    return

  const supabase = await getSupabase()
  if (!supabase)
    return

  try {
    // Generate a unique ID for the stroke if it doesn't have one
    if (!stroke.id)
      stroke.id = `${currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insert without 'id' field - let database generate it
    const insertData: any = {
      canvas_id: effectiveCloudStorageId,
      stroke_id: stroke.id,
      user_id: stroke.userId || currentUserId,
      points: stroke.points,
      color: stroke.color,
      width: stroke.width,
      eraser: stroke.isEraser || false,
    }

    const { error } = await supabase.from('strokes').insert(insertData)

    if (error) {
      console.error('Supabase stroke save error:', error)
    }
  }
  catch (e) {
    console.error('Supabase stroke save failed:', e)
  }
}

// Delete a stroke from Supabase (for undo)
async function deleteStrokeFromSupabase(strokeId: string) {
  if (!effectiveCloudStorageId)
    return

  const supabase = await getSupabase()
  if (!supabase)
    return

  try {
    const { error } = await supabase.from('strokes')
      .delete()
      .eq('stroke_id', strokeId)

    if (error) {
      console.error('Supabase stroke delete error:', error)
    }
  }
  catch (e) {
    console.error('Supabase stroke delete failed:', e)
  }
}

async function loadFromSupabase() {
  if (!effectiveCloudStorageId)
    return

  const supabase = await getSupabase()
  if (!supabase)
    return

  // Check if this canvas has already loaded from Supabase
  if (canvasData.supabaseLoaded)
    return

  // Mark as loading immediately to prevent duplicate fetches from other pen instances
  canvasData.supabaseLoaded = true

  try {
    // New schema: load all strokes for this canvas
    const { data, error } = await supabase
      .from('strokes')
      .select('*')
      .eq('canvas_id', effectiveCloudStorageId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      allStrokes.length = 0
      // Convert database rows to Stroke format
      allStrokes.push(...data.map(row => ({
        id: row.stroke_id,
        points: row.points,
        color: row.color,
        width: row.width,
        isEraser: row.eraser,
        userId: row.user_id,
        timestamp: new Date(row.created_at).getTime(),
      })))
      redrawAll()
      saveStrokes() // Save to localStorage
    }
  }
  catch (e) {
    console.error('Supabase load failed:', e)
    // Reset flag on error so it can be retried
    canvasData.supabaseLoaded = false
  }
}
async function setupSupabaseSync() {
  if (!effectiveCloudStorageId)
    return

  const supabase = await getSupabase()
  if (!supabase)
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
    if (broadcastChannel) {
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

function setNavLinksDisplay(display: string) {
  for (const id of ['projects', 'notes']) {
    const link = document.getElementById(id)
    if (link)
      link.style.display = display
  }
}

function showControls() {
  controlsVisible.value = true
  setNavLinksDisplay('none')
}
function hideControls() {
  controlsVisible.value = false
  setNavLinksDisplay('')
}

function pickUpPen(e: MouseEvent) {
  const rect = penRef.value?.getBoundingClientRect()
  if (!rect)
    return

  // Check if another pen is already picked up
  if (globalPickedUpPen.penId && globalPickedUpPen.penId !== effectivePenId)
    return

  // Mark this pen as picked up globally
  globalPickedUpPen.penId = effectivePenId

  isPickedUp.value = true
  isDetached.value = true
  showControls()

  // Store offset as percentages of the pen's size to handle dynamic sizing
  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  // Store as ratio of the pen's dimensions for dynamic resizing
  ;(handlePenMove as any).offsetRatioX = offsetX / rect.width
  ;(handlePenMove as any).offsetRatioY = offsetY / rect.height

  penPosition.value = { x: e.clientX - offsetX, y: e.clientY - offsetY }
  mousePosition.value = { x: e.clientX, y: e.clientY }

  window.addEventListener('mousemove', handlePenMove)
  window.addEventListener('mousedown', handlePenMouseDown)
  window.addEventListener('mouseup', handlePenMouseUp)
  window.addEventListener('contextmenu', handleRightClick)
}

function putDownPen() {
  isPickedUp.value = false
  hideControls()
  savePenPosition()

  // Clear global picked up state
  if (globalPickedUpPen.penId === effectivePenId)
    globalPickedUpPen.penId = null

  window.removeEventListener('mousemove', handlePenMove)
  window.removeEventListener('mousedown', handlePenMouseDown)
  window.removeEventListener('mouseup', handlePenMouseUp)
  window.removeEventListener('contextmenu', handleRightClick)
}

function returnPen() {
  isPickedUp.value = false
  hideControls()
  isDetached.value = false
  penPosition.value = { x: 0, y: 0 }
  savePenPosition()

  // Clear global picked up state
  if (globalPickedUpPen.penId === effectivePenId)
    globalPickedUpPen.penId = null

  window.removeEventListener('mousemove', handlePenMove)
  window.removeEventListener('mousedown', handlePenMouseDown)
  window.removeEventListener('mouseup', handlePenMouseUp)
  window.removeEventListener('contextmenu', handleRightClick)
}

function handlePenMove(e: MouseEvent) {
  if (!isPickedUp.value)
    return

  // Get current pen dimensions to calculate offset based on stored ratios
  const rect = penRef.value?.getBoundingClientRect()
  const offsetRatioX = (handlePenMove as any).offsetRatioX || 0.5
  const offsetRatioY = (handlePenMove as any).offsetRatioY || 0.5

  // Calculate actual offset based on current pen size
  const offsetX = rect ? rect.width * offsetRatioX : 20
  const offsetY = rect ? rect.height * offsetRatioY : 20

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
  measureGlyphTip()
  strokeTipX = tipOffsetX.value
  strokeTipY = tipOffsetY.value

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop

  // Use the pen's current position plus the tip offset
  lastX = penPosition.value.x + scrollX + strokeTipX
  lastY = penPosition.value.y + scrollY + strokeTipY
  isDrawing.value = true
  currentPath = [{ x: lastX, y: lastY }]

  // Draw initial dot for single clicks
  if (ctx) {
    const top = canvasData.top
    ctx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
    ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : currentStrokeColor.value
    ctx.lineWidth = currentStrokeWidth.value
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(lastX, lastY - top)
    ctx.lineTo(lastX + 0.1, lastY - top + 0.1)
    ctx.stroke()
  }
}

function drawAtPosition(e: MouseEvent, offsetX: number, offsetY: number) {
  if (!ctx || !isDrawing.value)
    return
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const currentX = e.clientX + scrollX + strokeTipX - offsetX
  const currentY = e.clientY + scrollY + strokeTipY - offsetY

  currentPath.push({ x: currentX, y: currentY })

  const top = canvasData.top
  ctx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
  ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : currentStrokeColor.value
  ctx.lineWidth = currentStrokeWidth.value
  ctx.beginPath()
  ctx.moveTo(lastX, lastY - top)
  ctx.lineTo(currentX, currentY - top)
  ctx.stroke()

  lastX = currentX
  lastY = currentY
}

function endDrawing() {
  if (isDrawing.value && currentPath.length > 0) {
    saveStroke({
      points: [...currentPath],
      color: currentStrokeColor.value,
      width: currentStrokeWidth.value,
      isEraser: props.eraserMode,
      userId: currentUserId,
      timestamp: Date.now(),
    })
  }
  isDrawing.value = false
  currentPath = []
}

// Legacy mode uses same drag function with different setup
function startDragLegacy(e: MouseEvent) {
  const rect = penRef.value?.getBoundingClientRect()
  if (!rect)
    return

  if (!isDetached.value) {
    isDetached.value = true
    penPosition.value = { x: rect.left, y: rect.top }
  }

  measureGlyphTip()
  isDragging.value = true
  moveOnly.value = e.shiftKey
  mousePosition.value = { x: e.clientX, y: e.clientY }
  currentPath = []

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  strokeTipX = tipOffsetX.value
  strokeTipY = tipOffsetY.value
  lastX = rect.left + scrollX + strokeTipX
  lastY = rect.top + scrollY + strokeTipY

  e.preventDefault()

  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top
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

  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  const currentX = e.clientX + scrollX + strokeTipX - offsetX
  const currentY = e.clientY + scrollY + strokeTipY - offsetY

  if (ctx && !moveOnly.value) {
    if (!isDrawing.value) {
      isDrawing.value = true
      currentPath = [{ x: currentX, y: currentY }]
      lastX = currentX
      lastY = currentY
    }
    else {
      currentPath.push({ x: currentX, y: currentY })

      const top = canvasData.top
      ctx.globalCompositeOperation = props.eraserMode ? 'destination-out' : 'source-over'
      ctx.strokeStyle = props.eraserMode ? 'rgba(0,0,0,1)' : currentStrokeColor.value
      ctx.lineWidth = currentStrokeWidth.value
      ctx.beginPath()
      ctx.moveTo(lastX, lastY - top)
      ctx.lineTo(currentX, currentY - top)
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
    saveStroke({
      points: [...currentPath],
      color: currentStrokeColor.value,
      width: currentStrokeWidth.value,
      isEraser: props.eraserMode,
      userId: currentUserId,
      timestamp: Date.now(),
    })
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

async function saveStroke(stroke: Stroke) {
  canvasData.redoStack.length = 0

  // Save to Supabase FIRST if cloud storage is enabled
  // (saveStrokeToSupabase no-ops when the client isn't configured)
  if (effectiveCloudStorageId) {
    try {
      await saveStrokeToSupabase(stroke)
    }
    catch (error) {
      console.error('Failed to save stroke to backend:', error)
      return // Don't proceed with local save
    }
  }

  // Only save locally after successful backend save (or if no backend)
  allStrokes.push(stroke)
  saveStrokes()
  notifyUpdate()

  // If it's an eraser stroke, redraw the entire canvas to properly apply the eraser
  if (stroke.isEraser) {
    redrawAll()
  }

  // Broadcast for real-time collaboration (only after successful save)
  if (broadcastChannel) {
    broadcastChannel.send({ type: 'broadcast', event: 'stroke_added', payload: { stroke } })
  }
}

// --- Touch drawing -------------------------------------------------------

function paintSegment(from: { x: number, y: number }, to: { x: number, y: number }, pen: PenEntry) {
  const sharedCtx = canvasData.ctx
  if (!sharedCtx)
    return

  const top = canvasData.top

  sharedCtx.globalCompositeOperation = pen.eraser ? 'destination-out' : 'source-over'
  sharedCtx.strokeStyle = pen.eraser ? 'rgba(0,0,0,1)' : pen.color
  sharedCtx.lineWidth = pen.width
  sharedCtx.lineCap = 'round'
  sharedCtx.lineJoin = 'round'
  sharedCtx.beginPath()
  sharedCtx.moveTo(from.x, from.y - top)
  sharedCtx.lineTo(to.x, to.y - top)
  sharedCtx.stroke()
}

function documentPoint(touch: Touch) {
  return {
    x: touch.clientX + (window.pageXOffset || document.documentElement.scrollLeft),
    y: touch.clientY + (window.pageYOffset || document.documentElement.scrollTop),
  }
}

function startTouchStroke(touch: Touch) {
  const pen = activePen.value
  if (!pen)
    return

  // A copy keeps the stroke on the settings it started with, even if the
  // toolbar changes color or width while the finger is down.
  touchPen = { ...pen }
  const point = documentPoint(touch)
  currentPath = [point]
  isDrawing.value = true
  // A tap without movement still leaves a dot.
  paintSegment(point, { x: point.x + 0.1, y: point.y + 0.1 }, touchPen)
}

function extendTouchStroke(touch: Touch) {
  if (!isDrawing.value || !touchPen)
    return

  const point = documentPoint(touch)
  paintSegment(currentPath[currentPath.length - 1], point, touchPen)
  currentPath.push(point)
}

function finishTouchStroke() {
  if (isDrawing.value && touchPen && currentPath.length > 0) {
    saveStroke({
      points: [...currentPath],
      color: touchPen.color,
      width: touchPen.width,
      isEraser: touchPen.eraser,
      userId: currentUserId,
      timestamp: Date.now(),
    })
  }
  isDrawing.value = false
  currentPath = []
  touchPen = null
}

function cancelTouchStroke() {
  if (!isDrawing.value)
    return

  isDrawing.value = false
  currentPath = []
  touchPen = null
  // Repaints the saved strokes, which drops the line that was abandoned.
  redrawAll()
}

function findTouch(list: TouchList, id: number) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].identifier === id)
      return list[i]
  }
  return null
}

/**
 * One finger draws, and the page must hold still under it. Two fingers belong
 * to the browser: the gesture is left alone, so the page scrolls, throws and
 * pinches exactly as it does everywhere else.
 */
function handleTouchStart(e: TouchEvent) {
  if (!activePen.value)
    return

  if (e.touches.length > 1) {
    cancelTouchStroke()
    drawingTouchId = null
    gestureIsScroll = true
    return
  }

  gestureIsScroll = false
  const touch = e.changedTouches[0]
  drawingTouchId = touch.identifier
  startTouchStroke(touch)
}

function handleTouchMove(e: TouchEvent) {
  if (gestureIsScroll || drawingTouchId === null)
    return

  if (e.touches.length > 1) {
    cancelTouchStroke()
    drawingTouchId = null
    gestureIsScroll = true
    return
  }

  const touch = findTouch(e.changedTouches, drawingTouchId)
  if (!touch)
    return

  // The line follows the finger, so the page must not scroll with it.
  if (e.cancelable)
    e.preventDefault()

  extendTouchStroke(touch)
}

function handleTouchEnd(e: TouchEvent) {
  if (drawingTouchId !== null && findTouch(e.changedTouches, drawingTouchId)) {
    finishTouchStroke()
    drawingTouchId = null
  }

  if (e.touches.length === 0)
    gestureIsScroll = false
}

function handleTouchCancel() {
  cancelTouchStroke()
  drawingTouchId = null
  gestureIsScroll = false
}

// Drawing needs touchmove to be cancelable, which Vue's template listeners are
// not, so the layer takes its listeners directly.
watch(touchLayer, (layer, previous) => {
  if (previous) {
    previous.removeEventListener('touchstart', handleTouchStart)
    previous.removeEventListener('touchmove', handleTouchMove)
    previous.removeEventListener('touchend', handleTouchEnd)
    previous.removeEventListener('touchcancel', handleTouchCancel)
  }
  if (layer) {
    layer.addEventListener('touchstart', handleTouchStart, { passive: false })
    layer.addEventListener('touchmove', handleTouchMove, { passive: false })
    layer.addEventListener('touchend', handleTouchEnd)
    layer.addEventListener('touchcancel', handleTouchCancel)
  }
})

function selectTouchPen(id: string) {
  registry.activeId.value = id
  showHintOnce()
}

function putDownTouchPen() {
  cancelTouchStroke()
  drawingTouchId = null
  gestureIsScroll = false
  registry.activeId.value = null
  registry.open.value = false
}

/** Explains the two-finger gesture the first time a pen is taken in hand. */
function showHintOnce() {
  try {
    if (localStorage.getItem(touchHintKey))
      return
    localStorage.setItem(touchHintKey, '1')
  }
  catch {
    // A browser that blocks storage shows the hint every time, which is fine.
  }

  showTouchHint.value = true
  if (hintTimeout)
    clearTimeout(hintTimeout)
  hintTimeout = window.setTimeout(() => showTouchHint.value = false, 5000)
}

defineExpose({
  saveDrawing: saveStrokes,
  loadDrawing: loadStrokes,
  exportToHash,
  loadFromHash,
  loadFromSupabase,
})
</script>

<template>
  <canvas ref="canvasRef" class="drawing-canvas" />

  <span class="pen-inline-container" :class="{ 'legacy-mode': dragAndDraw }">
    <span
      ref="penRef"
      class="pen-emoji"
      :class="{ 'dragging': isDragging, 'flipped': flip, 'picked-up': isPickedUp, 'drawing': isDrawing }"
      :style="{
        ...(isDetached ? { position: 'fixed', left: `${penPosition.x}px`, top: `${penPosition.y}px` } : {}),
        color: currentStrokeColor,
        fontSize: penFontSize,
      }"
      @mousedown="startDrag"
      @transitionend="measureGlyphTip"
      @mouseenter="handleMouseEnter"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <PenGlyph v-if="usesPenGlyph(penEmoji)" />
      <template v-else>{{ penEmoji }}</template>
    </span>
  </span>

  <!-- Control panel when pen is picked up (new mode only) -->
  <div
    v-if="controlsVisible && !props.dragAndDraw"
    class="pen-controls-container z-1000"
    @mousedown.stop @mouseup.stop @click.stop @contextmenu.stop
  >
    <button class="close-btn" title="Return pen to original position" @click="returnPen">
      <span>✕</span>
      <sub>right-click</sub>
    </button>
    <button title="Undo (Ctrl+Z)" @click="undo">
      <span>↶</span>
      <sub>ctrl+z</sub>
    </button>
    <button title="Redo (Ctrl+Y)" @click="redo">
      <span>↷</span>
      <sub>ctrl+y</sub>
    </button>
    <div class="pen-controls-items">
      <input
        v-model.number="sliderValue"
        type="range"
        min="0"
        max="8"
        step="0.1"
        @input="handleWidthChange"
      >
      <span>{{ Math.round(currentStrokeWidth) }}px</span>
      <input
        v-if="!props.eraserMode"
        v-model="currentStrokeColor"
        type="color"
      >
    </div>
  </div>

  <!-- Touch layer: catches the finger while a pen is in hand -->
  <div
    v-if="touchEnabled && isToolbarOwner && activePen"
    ref="touchLayer"
    class="pen-touch-layer"
    @contextmenu.prevent
  />

  <!-- One shared toolbar for every pen of this canvas -->
  <PenToolbar
    v-if="touchEnabled && isToolbarOwner && registry.pens.length"
    :pens="registry.pens"
    :active-id="registry.activeId.value"
    :open="registry.open.value"
    :hint="showTouchHint && !!activePen"
    @update:open="registry.open.value = $event"
    @select="selectTouchPen"
    @put-down="putDownTouchPen"
    @undo="undo"
  />

  <HoverTooltip :text="hoverText || ''" :x="mousePosition.x" :y="mousePosition.y" :show="isHovered && !isDragging && !isPickedUp" />
</template>

<style>
:root {
  --pen-filter: drop-shadow(0 2px 4px rgba(255, 127, 255, 0.5));
  --pen-transform: scale(1.15) rotate(-8deg);
}

html.dark {
  --pen-filter: invert(1) drop-shadow(0 2px 4px rgba(255, 127, 255, 0.5));
}
.flipped {
  --pen-transform: scaleX(-1) scale(1.15) rotate(-8deg);
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
  pointer-events: none;
  z-index: 998;
}
.pen-inline-container {
  line-height: 0;
  /* Remove fixed dimensions to allow pen to grow/shrink with stroke width */
  min-width: 2.5rem;
  min-height: 2.5rem;
  z-index: 999;
}

/* New control scheme: pens fixed on the side */
.pen-inline-container:not(.legacy-mode) {
  position: fixed;
  left: 1rem;
}

/* Stack pens vertically using nth-of-type (only for new mode) */
.pen-inline-container:not(.legacy-mode):nth-of-type(1) {
  top: 6rem;
}
.pen-inline-container:not(.legacy-mode):nth-of-type(2) {
  top: calc(6rem + 4rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(3) {
  top: calc(6rem + 8rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(4) {
  top: calc(6rem + 12rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(5) {
  top: calc(6rem + 16rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(6) {
  top: calc(6rem + 20rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(7) {
  top: calc(6rem + 24rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(8) {
  top: calc(6rem + 28rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(9) {
  top: calc(6rem + 32rem);
}
.pen-inline-container:not(.legacy-mode):nth-of-type(10) {
  top: calc(6rem + 36rem);
}

/* Legacy mode: pens positioned inline where placed */
.pen-inline-container.legacy-mode {
  position: relative;
  display: inline-block;
}

/* The cursor-driven pen and its panel have no meaning without a pointer;
   touch devices get the toolbar below instead. */
@media (hover: none) and (pointer: coarse) {
  .pen-emoji,
  .pen-controls-container {
    display: none !important;
  }
}

.pen-touch-layer {
  position: fixed;
  inset: 0;
  z-index: 997;
  /* The browser keeps its own scrolling and pinching for two fingers. A single
     finger is taken over by the drawing handlers. */
  touch-action: pan-x pan-y pinch-zoom;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}

.pen-emoji {
  display: inline-block;
  /* font-size is now dynamic, set via inline style */
  user-select: none;
  transition: transform 0.2s ease;
  filter: var(--pen-filter, drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)));
  line-height: 1;
  transform: var(--pen-transform);
  cursor: grabbing;
  z-index: 10000;
}

[class='pen-emoji'] {
  cursor: grab;
  transform: unset;
}

.pen-controls-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  right: auto;
  pointer-events: auto;
  display: flex;
  gap: 1rem;
  padding: 1.75rem;

  button {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    sub {
      margin: -0.5rem 0 0.5rem;
    }
  }
  .pen-controls-items {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: nowrap;
    label {
      gap: 0.5rem;
    }
    input {
      cursor: pointer;
    }
    input[type='range'] {
      width: 40%;
    }
    input[type='color'] {
      height: 2rem;
      width: 2rem;
      background: transparent;
      padding: 0;
    }
  }
}
</style>
