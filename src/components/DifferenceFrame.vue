<script setup lang="ts">
/*
DifferenceFrame: an image with a second layer on top of it in the blend mode
`difference`. Where the two layers agree, the frame is black. Where they differ
by a few pixels, a font or a colour, thin coloured lines show on the black.

  <DifferenceFrame name="hokkaido-milk-front" layer="text" />

Folder: each frame is a folder src/assets/difference/<name>/ with these files:
  image.png (or .jpg, .webp)  the photo. The build makes AVIF and WebP files
                              of it from 160 to 1280 pixels wide.
  text.json                   the text boxes for the layer `text`.
  trace.svg                   the colour trace for the layer `trace`.
Make text.json and trace.svg with `pnpm difference:prepare <name>`, see
scripts/difference-prepare.ts. Correct text.json by hand after OCR: each box
has an id, the text, the box in image pixels, an angle in degrees, the font
(`serif` or `sans`), the colour of the letters and the background colour.

Props:
  name        the folder of the frame.
  alt         the alternative text of the image. Without it, the image
              counts as decoration.
  layer       `self`, `text` or `trace`, or several of them separated by
              spaces, lowest first ("trace text"). The default is `self`, or
              no layer when the default slot has content.
  difference  true (default) blends in `difference`. false lays the layers on
              the image at `opacity`, to compare the positions.
  opacity     the opacity of the layers in percent when difference is false.
              The default is 50.
  scale, translate, rotate, hue-rotate, transform
              change the image of the layer `self`. translate is "x y" in
              percent of the width and the height of the frame, so the effect
              is the same at every size; rotate and hue-rotate are in degrees;
              transform is any CSS transform and applies after the others.
  texts       replaces the text of the layer `text`. Without it, the boxes show
              the OCR text; "" empties all boxes; a list replaces boxes by
              position (null keeps a box); an object replaces boxes by id.
  drift       true moves the layers slowly by less than a pixel. Off when the
              reader asks for reduced motion.
The default slot is a layer of your own, in HTML or SVG, laid over the image
copy. Place its content in percent of the frame.

The size comes from the class or the style of the tag: the frame is a block
of the full width, and `class="inline-block w-20"` makes a small one inside a
paragraph. Static strings work for every prop: difference="false", opacity="30".
Where no layer paints, a copy of the image lies under the layers, so the frame
stays black there. The layers mount when the frame comes near the window.
*/
import type { TextBox, TextFont, TextLayer, TextReplacements } from '~/lib/difference'
import { replaceTexts } from '~/lib/difference'

const props = withDefaults(defineProps<{
  name: string
  alt?: string
  layer?: string
  difference?: boolean | 'true' | 'false'
  opacity?: number | string
  scale?: number | string
  translate?: string
  rotate?: number | string
  hueRotate?: number | string
  transform?: string
  texts?: TextReplacements
  drift?: boolean | 'true' | 'false'
}>(), {
  alt: '',
  difference: true,
  opacity: 50,
  scale: 1.006,
  translate: '0.2 0.15',
  rotate: 0.15,
  hueRotate: 0,
  drift: false,
})

const slots = useSlots()

interface Picture {
  sources: Record<string, string>
  img: { src: string, w: number, h: number }
}

/** A text box with the transform that fits the ink of its text into the box. */
interface FittedBox extends TextBox {
  fit?: string
}

const LAYERS = ['self', 'text', 'trace'] as const
type Layer = typeof LAYERS[number]

const FRAMES_DIRECTORY = '/src/assets/difference/'
// The widths reach from a frame of 5rem on a phone (160) to the prose
// column at twice the density (1280). The build makes no width that is larger
// than the photo.
const pictures = import.meta.glob<Picture>('/src/assets/difference/*/image.{png,jpg,jpeg,webp}', {
  query: '?w=160;320;640;960;1280&format=avif;webp&as=picture',
  import: 'default',
  eager: true,
})
const traces = import.meta.glob<string>('/src/assets/difference/*/trace.svg', { query: '?url', import: 'default', eager: true })
// ponytail: eager, so a wrong id in `texts` stops the build. Every text.json
// is in the chunk of the component; load them lazily when there are many.
const textLayers = import.meta.glob<TextLayer>('/src/assets/difference/*/text.json', { import: 'default', eager: true })

/** Before the layout, the frame is taken as wide as the prose column. */
const SIZES_BEFORE_LAYOUT = 'auto, (min-width: 720px) 660px, 100vw'
/** The layers mount when the frame is half a window away. */
const NEAR_MARGIN = '50% 0px'
const PERCENT = 100

const FONTS: Record<TextFont, { family: string, weight: number, generic: string }> = {
  serif: { family: 'Noto Serif JP', weight: 900, generic: 'serif' },
  sans: { family: 'Noto Sans JP', weight: 700, generic: 'sans-serif' },
}
const FONT_STYLESHEET = 'https://fonts.googleapis.com/css2'
/** The texts are measured and drawn at this size and then scaled to their box. */
const MEASURE_SIZE = 100

function isOn(value: boolean | string) {
  return value !== false && value !== 'false'
}

function frameFile<T>(files: Record<string, T>, file: string) {
  const path = Object.keys(files).find(path => path.startsWith(`${FRAMES_DIRECTORY}${props.name}/${file}`))
  return path ? files[path] : undefined
}

/** The build makes one file for every width larger than the photo; the browser needs one of them. */
function uniqueWidths(srcset: string) {
  const candidates = new Map(srcset.split(', ').map(candidate => [candidate.split(' ')[1], candidate]))
  return [...candidates.values()].join(', ')
}

const picture = frameFile(pictures, 'image.')
if (!picture)
  throw new Error(`DifferenceFrame: no image in ${FRAMES_DIRECTORY}${props.name}/`)
const { w: width, h: height } = picture.img
const avifSrcset = uniqueWidths(picture.sources.avif)
const webpSrcset = uniqueWidths(picture.sources.webp)

const layers = (props.layer ?? (slots.default ? '' : 'self')).split(/\s+/).filter(Boolean) as Layer[]
for (const layer of layers) {
  if (!LAYERS.includes(layer))
    throw new Error(`DifferenceFrame "${props.name}": no layer "${layer}". The layers are: ${LAYERS.join(', ')}`)
}

function prepared<T>(files: Record<string, T>, file: string) {
  const content = frameFile(files, file)
  if (!content)
    throw new Error(`DifferenceFrame "${props.name}": no ${file}. Run pnpm difference:prepare ${props.name}`)
  return content
}
const trace = layers.includes('trace') ? prepared(traces, 'trace.svg') : undefined
// Runs in setup, so a wrong id in `texts` stops the build of the page.
const textLayer = layers.includes('text') ? prepared(textLayers, 'text.json') : undefined
const textBoxes = textLayer ? replaceTexts(props.name, textLayer.boxes, props.texts) : []

const [translateX = 0, translateY = translateX] = props.translate.trim().split(/\s+/).map(Number)
if (Number.isNaN(translateX) || Number.isNaN(translateY))
  throw new Error(`DifferenceFrame "${props.name}": translate takes "x y" in percent of the frame, without units, not "${props.translate}"`)

const isDifference = computed(() => isOn(props.difference))
const isDrifting = computed(() => isOn(props.drift))

const selfStyle = computed(() => ({
  scale: String(props.scale),
  translate: `${translateX}% ${translateY}%`,
  rotate: `${props.rotate}deg`,
  transform: props.transform,
  filter: Number(props.hueRotate) ? `hue-rotate(${props.hueRotate}deg)` : undefined,
}))

const topStyle = computed(() => isDifference.value ? undefined : { opacity: Number(props.opacity) / PERCENT })

const frame = ref<HTMLElement>()
const baseImage = ref<HTMLImageElement>()
const sizes = ref(SIZES_BEFORE_LAYOUT)
/**
 * The file the browser chose for the image. The layers show the same file, so
 * that their copy of the image matches it to the pixel.
 */
const baseSource = ref('')
const isNear = ref(false)
const fittedBoxes = shallowRef<FittedBox[]>()

function takeBaseSource() {
  if (baseImage.value?.complete && baseImage.value.naturalWidth)
    baseSource.value = baseImage.value.currentSrc
}

const stylesheets = new Map<string, Promise<void>>()

function loadStylesheet(href: string) {
  if (!stylesheets.has(href)) {
    stylesheets.set(href, new Promise((resolve, reject) => {
      const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href })
      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`DifferenceFrame: cannot load the fonts at ${href}`))
      document.head.append(link)
    }))
  }
  return stylesheets.get(href)!
}

/** One stylesheet for the fonts of the boxes, cut down to the characters they show. */
function fontStylesheet(boxes: TextBox[]) {
  const fonts = [...new Set(boxes.map(box => FONTS[box.font ?? 'sans']))]
  const families = fonts.map(({ family, weight }) => `family=${family.replaceAll(' ', '+')}:wght@${weight}`)
  const characters = [...new Set(boxes.flatMap(box => [...box.text.replace(/\s/g, '')]))].join('')
  return `${FONT_STYLESHEET}?${families.join('&')}&text=${encodeURIComponent(characters)}&display=swap`
}

/**
 * Scales the ink of each text to its box. The canvas gives the extent of the
 * ink, which the font metrics of an SVG text do not give.
 */
async function fitBoxes(boxes: TextBox[]): Promise<FittedBox[]> {
  const texts = boxes.filter(box => box.text.trim())
  if (texts.length) {
    await loadStylesheet(fontStylesheet(texts)).catch((error: Error) => {
      // The texts are then measured and drawn in the generic font
      console.warn(error.message)
    })
  }
  const context = document.createElement('canvas').getContext('2d')!
  return Promise.all(boxes.map(async (box) => {
    if (!box.text.trim())
      return box
    const { family, weight } = FONTS[box.font ?? 'sans']
    const font = `${weight} ${MEASURE_SIZE}px "${family}"`
    await document.fonts.load(font, box.text)
    context.font = font
    const ink = context.measureText(box.text)
    const inkWidth = ink.actualBoundingBoxLeft + ink.actualBoundingBoxRight
    const inkHeight = ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent
    if (!inkWidth || !inkHeight)
      return box
    const fit = `translate(${box.x} ${box.y}) scale(${box.width / inkWidth} ${box.height / inkHeight}) `
      + `translate(${ink.actualBoundingBoxLeft} ${ink.actualBoundingBoxAscent})`
    return { ...box, fit }
  }))
}

function fontFamily(font: TextFont = 'sans') {
  return `'${FONTS[font].family}', ${FONTS[font].generic}`
}

const { stop: stopObserving } = useIntersectionObserver(frame, ([entry]) => {
  if (!entry?.isIntersecting)
    return
  isNear.value = true
  stopObserving()
  if (textBoxes.length)
    fitBoxes(textBoxes).then(boxes => fittedBoxes.value = boxes)
}, { rootMargin: NEAR_MARGIN })

onMounted(() => {
  // A browser that cannot size the image by its layout (sizes="auto") takes
  // the measured width
  const frameWidth = Math.ceil(frame.value!.getBoundingClientRect().width)
  if (frameWidth)
    sizes.value = `auto, ${frameWidth}px`
  takeBaseSource()
})
</script>

<template>
  <span
    ref="frame"
    class="difference-frame relative isolate overflow-hidden bg-black"
    :style="{ aspectRatio: `${width} / ${height}` }"
  >
    <picture>
      <source type="image/avif" :srcset="avifSrcset" :sizes="sizes">
      <img
        ref="baseImage"
        class="difference-layer no-preview"
        :src="picture.img.src"
        :srcset="webpSrcset"
        :sizes="sizes"
        :width="width"
        :height="height"
        :alt="alt"
        loading="lazy"
        decoding="async"
        @load="takeBaseSource"
      >
    </picture>
    <span
      v-if="isNear && baseSource"
      class="difference-layer"
      :class="{ 'mix-blend-difference': isDifference }"
      :style="topStyle"
      aria-hidden="true"
    >
      <img class="difference-layer no-preview" :src="baseSource" alt="">
      <span class="difference-layer" :class="{ 'difference-drift': isDrifting }">
        <template v-for="layer in layers" :key="layer">
          <img v-if="layer === 'self'" class="difference-layer no-preview" :src="baseSource" :style="selfStyle" alt="">
          <img v-else-if="layer === 'trace'" class="difference-layer no-preview" :src="trace" alt="">
          <svg
            v-else-if="layer === 'text' && fittedBoxes"
            class="difference-layer"
            :viewBox="`0 0 ${textLayer!.width} ${textLayer!.height}`"
            preserveAspectRatio="none"
          >
            <g
              v-for="box in fittedBoxes"
              :key="box.id"
              :transform="box.angle ? `rotate(${box.angle} ${box.x + box.width / 2} ${box.y + box.height / 2})` : undefined"
            >
              <rect v-if="box.background" :x="box.x" :y="box.y" :width="box.width" :height="box.height" :fill="box.background" />
              <text
                v-if="box.fit"
                :transform="box.fit"
                :fill="box.color"
                :font-family="fontFamily(box.font)"
                :font-weight="FONTS[box.font ?? 'sans'].weight"
                :font-size="MEASURE_SIZE"
              >{{ box.text }}</text>
            </g>
          </svg>
        </template>
        <slot />
      </span>
    </span>
  </span>
</template>

<style>
/* No specificity, so a display class on the tag wins */
:where(.difference-frame) {
  display: block;
}

/* Every layer has the box of the frame to the fraction of a pixel. A layer
   that ends a pixel short leaves a bright line along the edge. This also
   undoes the margins and the size that the prose gives to images. */
.difference-frame .difference-layer {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
}

.difference-drift {
  animation: difference-drift 9s ease-in-out infinite alternate;
}

@keyframes difference-drift {
  0% {
    transform: translate(0, 0);
  }

  35% {
    transform: translate(0.6px, -0.4px);
  }

  70% {
    transform: translate(-0.3px, 0.5px);
  }

  100% {
    transform: translate(0.4px, 0.2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .difference-drift {
    animation: none;
  }
}
</style>
