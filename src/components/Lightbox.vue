<script setup lang="ts">
const imageModel = ref<HTMLImageElement>()
let images: HTMLImageElement[] = []
let index = -1

/** Every image starts at this share of the window, also when it is smaller. */
const FIT_SHARE = 0.8
const ZOOM_MIN = 0.5
const ZOOM_MAX = 10
/** Ctrl+click zooms in by this factor, and Shift+Ctrl+click zooms out by it. */
const ZOOM_STEP = 2
const WHEEL_ZOOM_RATE = 0.002
/** A drag shorter than this many pixels is still a click. */
const DRAG_THRESHOLD = 3
/** The classes of the image that the lightbox shows too, so it inverts with the theme in the same way. */
const COPIED_CLASSES = ['invertable-dark', 'invertable-white']

const lightboxImage = ref<HTMLImageElement>()
const natural = reactive({ width: 0, height: 0 })
const { width: windowWidth, height: windowHeight } = useWindowSize()
const zoom = ref(1)
const offset = reactive({ x: 0, y: 0 })
let drag: { x: number, y: number, moved: boolean } | undefined
let dragged = false

const fitScale = computed(() => natural.width
  ? Math.min(FIT_SHARE * windowWidth.value / natural.width, FIT_SHARE * windowHeight.value / natural.height)
  : 0)
const imageStyle = computed(() => fitScale.value
  ? {
      width: `${natural.width * fitScale.value}px`,
      height: `${natural.height * fitScale.value}px`,
      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom.value})`,
    }
  : {})
const copiedClasses = computed(() => COPIED_CLASSES.filter(name => imageModel.value?.classList.contains(name)))

function resetZoom() {
  zoom.value = 1
  offset.x = 0
  offset.y = 0
}

function takeNaturalSize() {
  const image = lightboxImage.value
  if (!image)
    return
  natural.width = image.naturalWidth
  natural.height = image.naturalHeight
}

/** Zooms by `factor` and keeps the point under the pointer in place. */
function zoomAt(factor: number, x: number, y: number) {
  const image = lightboxImage.value
  if (!image)
    return
  const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom.value * factor))
  const change = next / zoom.value
  const box = image.getBoundingClientRect()
  offset.x += (x - (box.left + box.width / 2)) * (1 - change)
  offset.y += (y - (box.top + box.height / 2)) * (1 - change)
  zoom.value = next
}

function zoomWithWheel(event: WheelEvent) {
  zoomAt(Math.exp(-event.deltaY * WHEEL_ZOOM_RATE), event.clientX, event.clientY)
}

function startDrag(event: PointerEvent) {
  drag = { x: event.clientX, y: event.clientY, moved: false }
}

function moveDrag(event: PointerEvent) {
  if (!drag)
    return
  const [dx, dy] = [event.clientX - drag.x, event.clientY - drag.y]
  if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD)
    return
  drag.moved = true
  offset.x += dx
  offset.y += dy
  drag.x = event.clientX
  drag.y = event.clientY
}

function endDrag() {
  dragged = drag?.moved ?? false
  drag = undefined
}

/** One image back, or one forward. */
type Step = -1 | 1

/** The largest generated variant when the build produced one, else whatever the page shows. */
function fullSource(image: HTMLImageElement) {
  return image.dataset.full || image.currentSrc || image.src
}

const lightboxSource = computed(() => imageModel.value ? fullSource(imageModel.value) : '')

function neighbourIndex(step: Step) {
  return (index + step + images.length) % images.length
}

function preloadNeighbours() {
  if (images.length < 2)
    return
  for (const step of [-1, 1] as Step[])
    new Image().src = fullSource(images[neighbourIndex(step)])
}

function show(newIndex: number) {
  index = newIndex
  imageModel.value = images[index]
  natural.width = 0
  resetZoom()
  preloadNeighbours()
}

function step(direction: Step) {
  show(neighbourIndex(direction))
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLElement

  if (imageModel.value && dragged) {
    dragged = false
    return
  }
  if (imageModel.value && (e.ctrlKey || e.metaKey)) {
    e.preventDefault()
    zoomAt(e.shiftKey ? 1 / ZOOM_STEP : ZOOM_STEP, e.clientX, e.clientY)
    return
  }

  const lightboxButton = (e.target as HTMLElement).closest('button.lightbox')
  if (lightboxButton) {
    step(lightboxButton.classList.contains('prev') ? -1 : 1)
    return
  }

  switch (first.tagName) {
    case 'IMG':
      if (first.classList.contains('no-preview')) {
        imageModel.value = undefined
        return
      }
      // Do not open image when they are moving. Mainly for mobile to avoid conflict with hovering behavior.
      const pos = first.getBoundingClientRect()
      await new Promise(resolve => setTimeout(resolve, 50))
      const newPos = first.getBoundingClientRect()
      if (pos.left !== newPos.left || pos.top !== newPos.top)
        return
      if (!first.dataset.folder || first.dataset.folder === 'root')
        images = Array.from(document.querySelectorAll(`main img:not(.no-preview):not(.hidden)`))
      else
        images = Array.from(document.querySelectorAll(`main img[data-folder=${first.dataset.folder}]:not(.no-preview)`))
      show(Math.max(0, images.indexOf(first as HTMLImageElement)))
      break
    default:
      imageModel.value = undefined
  }
})

onKeyStroke('Escape', (e) => {
  if (imageModel.value) {
    imageModel.value = undefined
    e.preventDefault()
  }
})

onKeyStroke('ArrowLeft', (e) => {
  if (imageModel.value) {
    step(-1)
    e.preventDefault()
  }
})
onKeyStroke('ArrowRight', (e) => {
  if (imageModel.value) {
    step(1)
    e.preventDefault()
  }
})
</script>

<template>
  <Transition name="fade">
    <div
      v-if="imageModel"
      class="lightbox  fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7 flex cursor-zoom-out "
      @wheel.prevent="zoomWithWheel"
      @pointermove="moveDrag"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <div class="absolute top-0 left-0 right-0 bottom-0 bg-white:50 dark:bg-dark:50 z--1" />
      <button v-if="images.length > 1" class="lightbox prev text-right cursor-w-resize h-full absolute top-0 left-0 min-w-6vw lg:flex-grow-1 lg:min-w-8vw lg:pr-2">
        <span class="prev  i-bi:arrow-left w-7 h-7 bg-transparent backdrop-invert font-mono text-xl"><-</span>
      </button>
      <figure class="m-auto max-w-100vw lg:max-w-84vw">
        <img
          id="lightbox"
          ref="lightboxImage"
          :src="lightboxSource"
          :alt="imageModel.alt"
          class="no-preview m-auto max-w-none touch-none select-none"
          :class="copiedClasses"
          :style="imageStyle"
          draggable="false"
          @load="takeNaturalSize"
          @pointerdown="startDrag"
        >
        <figcaption v-if="imageModel.dataset.caption" class="m-2 text-center">
          {{ imageModel.alt }}
        </figcaption>
      </figure>
      <button v-if="images.length > 1" class="lightbox next  text-left cursor-e-resize h-full absolute top-0 right-0 min-w-6vw lg:flex-grow-1 lg:min-w-8vw lg:pl-2 ">
        <span class="next  w-7 h-7 bg-transparent backdrop-invert font-mono text-xl i-bi:arrow-right">-></span>
      </button>
    </div>
  </Transition>
</template>

<style lang="css" scoped>
button.lightbox {
  border: none !important;
  span {
    border: 1px dashed var(--fg-deep);
    &:hover {
      border: 1px solid var(--fg-deeper);
    }
  }
}
</style>
