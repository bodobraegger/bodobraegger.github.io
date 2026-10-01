<script setup lang="ts">
import type { Language } from '~/logics/languages'
import type { AesKeys } from '~/lib/aes'
import { AES_BLOCK_BYTES, AES_KEY_BYTES, encryptCbc, encryptCtr, encryptEcb, importAesKeys, newCounterBlock } from '~/lib/aes'
import { bytesToHex, randomBytes } from '~/lib/bits'
import { useWebCrypto } from '~/composables/useWebCrypto'
import { usePageLanguage } from '~/composables/usePageLanguage'

/** A row of the image is 96 × 3 = 288 bytes, a whole number of AES blocks. */
const IMAGE_SIZE = 96
const RGB_CHANNELS = 3
const RGBA_CHANNELS = 4
const OPAQUE = 255
const BRUSH_WIDTH = 7
const BRUSH_COLOR = '#111111'

type Mode = 'ecb' | 'cbc' | 'ctr'
const MODES: Mode[] = ['ecb', 'cbc', 'ctr']

interface Text {
  title: string
  original: string
  originalNote: string
  modes: Record<Mode, { name: string, note: string }>
  footer: string
  key: string
  newKey: string
  resetImage: string
  busy: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Modes of operation on an image',
    original: 'Original',
    originalNote: 'Draw on it with a finger or the mouse.',
    modes: {
      ecb: { name: 'ECB', note: 'Equal blocks give equal ciphertext. The shape leaks.' },
      cbc: { name: 'CBC', note: 'Each block is XORed with the previous ciphertext. Random IV.' },
      ctr: { name: 'CTR', note: 'Each block is XORed with AES(counter). No pattern.' },
    },
    footer: 'Real AES-128 in your browser (WebCrypto), on the RGB bytes of the image. One block of 16 bytes covers 5⅓ pixels.',
    key: 'key',
    newKey: 'New key',
    resetImage: 'Reset image',
    busy: 'Encrypting',
  },
  pt: {
    title: 'Modos de operação em uma imagem',
    original: 'Original',
    originalNote: 'Desenhe nela com o dedo ou o mouse.',
    modes: {
      ecb: { name: 'ECB', note: 'Blocos iguais dão cifrados iguais. A forma vaza.' },
      cbc: { name: 'CBC', note: 'Cada bloco passa por XOR com o cifrado anterior. IV aleatório.' },
      ctr: { name: 'CTR', note: 'Cada bloco passa por XOR com AES(contador). Sem padrão.' },
    },
    footer: 'AES-128 real no seu navegador (WebCrypto), sobre os bytes RGB da imagem. Um bloco de 16 bytes cobre 5⅓ pixels.',
    key: 'chave',
    newKey: 'Nova chave',
    resetImage: 'Restaurar imagem',
    busy: 'Cifrando',
  },
}

const text = TEXT[usePageLanguage()]

const sourceCanvas = ref<HTMLCanvasElement>()
const modeCanvases = ref<Partial<Record<Mode, HTMLCanvasElement>>>({})
const keys = shallowRef<AesKeys>()
const isBusy = ref(false)
const isSupported = useWebCrypto()
const keyHex = computed(() => keys.value ? bytesToHex(keys.value.raw) : '')

let isEncryptionQueued = false
let lastPoint: { x: number, y: number } | undefined

function context2d(canvas: HTMLCanvasElement) {
  return canvas.getContext('2d', { willReadFrequently: true })!
}

/** A padlock in three flat colours: large flat areas are what ECB gives away. */
function drawPadlock() {
  const context = context2d(sourceCanvas.value!)
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)

  context.strokeStyle = '#111111'
  context.lineWidth = 10
  context.beginPath()
  context.moveTo(28, 46)
  context.lineTo(28, 34)
  context.arc(48, 34, 20, Math.PI, 0)
  context.lineTo(68, 46)
  context.stroke()

  context.fillStyle = '#1d4ed8'
  context.beginPath()
  context.roundRect(16, 44, 64, 44, 6)
  context.fill()

  context.fillStyle = '#facc15'
  context.beginPath()
  context.arc(48, 61, 7, 0, 2 * Math.PI)
  context.fill()
  context.fillRect(45, 64, 6, 14)
}

function readRgbBytes(): Uint8Array {
  const { data } = context2d(sourceCanvas.value!).getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)
  const pixelCount = IMAGE_SIZE * IMAGE_SIZE
  const bytes = new Uint8Array(pixelCount * RGB_CHANNELS)
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    for (let channel = 0; channel < RGB_CHANNELS; channel++)
      bytes[pixel * RGB_CHANNELS + channel] = data[pixel * RGBA_CHANNELS + channel]
  }
  return bytes
}

function paintRgbBytes(canvas: HTMLCanvasElement, bytes: Uint8Array) {
  const context = context2d(canvas)
  const image = context.createImageData(IMAGE_SIZE, IMAGE_SIZE)
  for (let pixel = 0; pixel < IMAGE_SIZE * IMAGE_SIZE; pixel++) {
    for (let channel = 0; channel < RGB_CHANNELS; channel++)
      image.data[pixel * RGBA_CHANNELS + channel] = bytes[pixel * RGB_CHANNELS + channel]
    image.data[pixel * RGBA_CHANNELS + RGB_CHANNELS] = OPAQUE
  }
  context.putImageData(image, 0, 0)
}

async function encryptImage() {
  if (!keys.value)
    return
  if (isBusy.value) {
    isEncryptionQueued = true
    return
  }
  isBusy.value = true
  try {
    const plaintext = readRgbBytes()
    const results: Record<Mode, Uint8Array> = {
      ecb: await encryptEcb(keys.value, plaintext),
      cbc: await encryptCbc(keys.value, randomBytes(AES_BLOCK_BYTES), plaintext),
      ctr: await encryptCtr(keys.value, newCounterBlock(), plaintext),
    }
    for (const mode of MODES)
      paintRgbBytes(modeCanvases.value[mode]!, results[mode])
  }
  finally {
    isBusy.value = false
  }
  if (isEncryptionQueued) {
    isEncryptionQueued = false
    await encryptImage()
  }
}

async function useNewKey() {
  keys.value = await importAesKeys(randomBytes(AES_KEY_BYTES))
  await encryptImage()
}

function resetImage() {
  drawPadlock()
  encryptImage()
}

function canvasPoint(event: PointerEvent) {
  const bounds = sourceCanvas.value!.getBoundingClientRect()
  return {
    x: (event.clientX - bounds.left) * IMAGE_SIZE / bounds.width,
    y: (event.clientY - bounds.top) * IMAGE_SIZE / bounds.height,
  }
}

function drawTo(point: { x: number, y: number }) {
  const context = context2d(sourceCanvas.value!)
  context.strokeStyle = BRUSH_COLOR
  context.lineWidth = BRUSH_WIDTH
  context.lineCap = 'round'
  context.beginPath()
  context.moveTo(lastPoint!.x, lastPoint!.y)
  context.lineTo(point.x, point.y)
  context.stroke()
  lastPoint = point
}

function startStroke(event: PointerEvent) {
  sourceCanvas.value!.setPointerCapture(event.pointerId)
  lastPoint = canvasPoint(event)
  drawTo(lastPoint)
}

function continueStroke(event: PointerEvent) {
  if (lastPoint)
    drawTo(canvasPoint(event))
}

function endStroke() {
  if (!lastPoint)
    return
  lastPoint = undefined
  encryptImage()
}

onMounted(() => {
  if (!isSupported.value)
    return
  drawPadlock()
  useNewKey()
})
</script>

<template>
  <StudyFigure :title="text.title" :unsupported="!isSupported">
    <div class="modes-grid">
      <div class="modes-cell">
        <canvas
          ref="sourceCanvas"
          class="modes-canvas is-drawable"
          :width="IMAGE_SIZE"
          :height="IMAGE_SIZE"
          role="img"
          :aria-label="text.original"
          @pointerdown="startStroke"
          @pointermove="continueStroke"
          @pointerup="endStroke"
          @pointercancel="endStroke"
        />
        <strong class="modes-name">{{ text.original }}</strong>
        <span class="study-label">{{ text.originalNote }}</span>
      </div>
      <div v-for="mode in MODES" :key="mode" class="modes-cell">
        <canvas
          :ref="element => modeCanvases[mode] = element as HTMLCanvasElement"
          class="modes-canvas"
          :width="IMAGE_SIZE"
          :height="IMAGE_SIZE"
          role="img"
          :aria-label="text.modes[mode].name"
        />
        <strong class="modes-name">{{ text.modes[mode].name }}</strong>
        <span class="study-label">{{ text.modes[mode].note }}</span>
      </div>
    </div>

    <p>{{ text.footer }}</p>

    <div class="study-controls">
      <button class="study-button" type="button" :disabled="!keys" @click="useNewKey">
        {{ text.newKey }}
      </button>
      <button class="study-button" type="button" :disabled="!keys" @click="resetImage">
        {{ text.resetImage }}
      </button>
      <span v-if="isBusy" class="study-label">{{ text.busy }}</span>
    </div>

    <p v-if="keyHex" class="study-label study-mono modes-key">
      {{ text.key }}: {{ keyHex }}
    </p>
  </StudyFigure>
</template>

<style scoped>
.modes-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 0.75rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.modes-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.modes-canvas {
  width: 100%;
  aspect-ratio: 1;
  image-rendering: pixelated;
  border: 1px solid var(--c-border-soft);
  background: var(--c-border-soft);

  &.is-drawable {
    cursor: crosshair;
    touch-action: none;
    border: 1px dashed var(--fg-muted);
  }
}

.modes-name {
  margin-top: 0.2rem;
  font-size: 0.85rem;
}

.modes-key {
  overflow-wrap: anywhere;
}
</style>
